/**
 * Bale WebSocket Protocol Connection
 * Handles connection lifecycle, handshake, heartbeat, auto-reconnect, and request correlation.
 */

const EventEmitter = require('events');
const { Proto } = require('./proto');

// Resolve WebSocket implementation ('ws' package preferred if installed, native Node.js 22/24+ WebSocket as fallback)
function getWebSocketImpl() {
  try {
    return require('ws');
  } catch (e) {
    if (typeof globalThis.WebSocket !== 'undefined') {
      return globalThis.WebSocket;
    }
    throw new Error('No WebSocket implementation found. Please run on Node.js 22+ or install ws (`npm install ws`).');
  }
}

class BaleConnection extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = Object.assign({
      endpoint: 'wss://maviz-ws.bale.ai/ws/',
      apiVersion: 173855,
      protocolVersion: 1,
      pingInterval: 10000,
      pingTimeout: 5000,
      requestTimeout: 20000,
      autoReconnect: true,
      origin: 'https://web.bale.ai'
    }, options);

    this.ws = null;
    this.session = options.session || null;
    this.state = 'disconnected'; // disconnected, connecting, handshaking, connected
    this.reqIndex = 0;
    this.pendingRequests = new Map();

    this.pingTimer = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.closedExplicitly = false;
    // Consecutive 4401 (unauthenticated) closes. After the threshold we stop the
    // reconnect loop instead of hammering the gateway forever.
    this.unauthStreak = 0;
    // Guard so the fatal "re-authenticate" error is emitted only once per streak.
    this.unauthFatalEmitted = false;
  }

  /**
   * Build the credential cookies required by the Bale gateway.
   *
   * The official web client runs with `saveToken: false` and
   * `CrossBrowserHttpTransport({ withCredentials: true })`, i.e. it never sends
   * the JWT as a header - the gateway authenticates the `access_token` cookie.
   * Verified empirically: with `Cookie: access_token=<jwt>` every auth-gated
   * method returns HTTP 200 (GetAuthSessions -> 1127 bytes, grpc-status 0).
   * Without it the gateway answers HTTP 401 with an empty body.
   * @returns {string} Cookie header value, or '' when there is no credential.
   */
  _buildCookieHeader() {
    const cookies = [];
    const token = this.session && this.session.token;

    if (token) {
      cookies.push(`access_token=${token}`);
      // Mirrors of the credential used by some Bale gateway deployments.
      cookies.push(`token_bale=${token}`);
    }

    if (this.session && this.session.userId) {
      cookies.push(`uid=${this.session.userId}`);
    }

    return cookies.join('; ');
  }

  get isConnected() {
    return this.state === 'connected' && this.ws && this.ws.readyState === 1;
  }

  async connect() {
    if (this.state === 'connected' || this.state === 'connecting') return;

    if (!this.session || (!this.session.userId && !this.session.token)) {
      const authErr = new Error('Cannot connect WebSocket: Unauthenticated session. Please authenticate first using sendCode() and signIn(), or load an active session.');
      this.emit('error', authErr);
      throw authErr;
    }

    this.closedExplicitly = false;
    this.state = 'connecting';
    this.emit('status', 'connecting');

    const WS = getWebSocketImpl();
    let url = this.options.endpoint;
    if (this.session && this.session.userId) {
      url += (url.includes('?') ? '&' : '?') + `uid=${this.session.userId}`;
    }

    return new Promise((resolve, reject) => {
      let isResolved = false;

      try {
        // Handle options differences between native WebSocket and ws
        const headers = {
          'Origin': this.options.origin,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        };

        const cookie = this._buildCookieHeader();
        if (cookie) headers['Cookie'] = cookie;

        // Both `ws` (options as 2nd arg) and Node's native/undici WebSocket
        // (options as 3rd arg) support a `headers` bag, but the arity differs.
        this.ws = null;
        let lastErr = null;
        for (const args of [
          [url, { headers }],
          [url, [], { headers }],
          [url]
        ]) {
          try {
            this.ws = new WS(...args);
            if (this.ws) break;
          } catch (e) {
            lastErr = e;
          }
        }
        if (!this.ws) throw lastErr || new Error('Failed to create WebSocket');

        if (this.ws.binaryType !== undefined) {
          this.ws.binaryType = 'arraybuffer';
        }

        this.ws.onopen = () => {
          this._onOpen()
            .then(() => {
              if (!isResolved) {
                isResolved = true;
                resolve();
              }
            })
            .catch(err => {
              if (!isResolved) {
                isResolved = true;
                reject(err);
              }
            });
        };

        this.ws.onmessage = (event) => {
          this._onMessage(event.data);
        };

        this.ws.onerror = (err) => {
          this.emit('error', err);
          if (!isResolved) {
            isResolved = true;
            reject(err);
          }
        };

        this.ws.onclose = (event) => {
          this._onClose(event);
        };

      } catch (err) {
        this.state = 'disconnected';
        reject(err);
      }
    });
  }

  async _onOpen() {
    // Disable Nagle's algorithm for minimum frame latency if socket is accessible
    if (this.ws && this.ws._socket && typeof this.ws._socket.setNoDelay === 'function') {
      this.ws._socket.setNoDelay(true);
    }

    this.state = 'handshaking';
    this.emit('status', 'handshaking');

    // Send Handshake
    const handshakeFrame = Proto.encodeClientMessage({
      handshakeRequest: {
        mkprotoVersion: this.options.protocolVersion,
        apiVersion: this.options.apiVersion
      }
    });

    this._sendRaw(handshakeFrame);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Handshake timeout with Bale server'));
      }, 8000);

      // If the gateway rejects the credential it closes with 4401 straight
      // away. Surface that immediately instead of waiting out the full timeout.
      const onEarlyUnauth = () => {
        clearTimeout(timeout);
        const err = new Error(
          'Unauthenticated: Bale server rejected the WebSocket credential (close code 4401). ' +
          'Re-authenticate with sendCode()/signIn().'
        );
        err.code = 4401;
        reject(err);
      };
      this.once('unauthenticated', onEarlyUnauth);

      this.once('_handshake_done', (res) => {
        clearTimeout(timeout);
        this.removeListener('unauthenticated', onEarlyUnauth);
        this.state = 'connected';
        this.reconnectAttempts = 0;
        this.unauthStreak = 0;
        this.unauthFatalEmitted = false;
        this.emit('status', 'connected');
        this.emit('connected', res);
        this._startHeartbeat();
        resolve(res);
      });
    });
  }

  _onMessage(raw) {
    let buf;
    if (Buffer.isBuffer(raw)) {
      buf = raw;
    } else if (raw instanceof ArrayBuffer) {
      buf = Buffer.from(raw);
    } else {
      buf = Buffer.from(raw);
    }

    try {
      const serverMsg = Proto.decodeServerMessage(buf);

      // 1. Handshake response
      if (serverMsg.handshakeResponse) {
        this.emit('_handshake_done', serverMsg.handshakeResponse);
      }

      // 2. Pong response
      if (serverMsg.pong) {
        this.emit('pong', serverMsg.pong);
      }

      // 3. RPC response
      if (serverMsg.response) {
        const { index, response, error } = serverMsg.response;
        if (this.pendingRequests.has(index)) {
          const { resolve, reject, timer } = this.pendingRequests.get(index);
          clearTimeout(timer);
          this.pendingRequests.delete(index);

          if (error) {
            const errStatus = Proto.decodeErrorStatus(error);
            const err = new Error(errStatus.message || `RPC Error code ${errStatus.code}`);
            err.code = errStatus.code;
            err.details = errStatus.details;
            reject(err);
          } else {
            resolve(response);
          }
        }
      }

      // 4. Update packet
      if (serverMsg.update) {
        const updateContainer = Proto.decodeUpdateContainer(serverMsg.update);
        if (updateContainer) {
          this.emit('update', updateContainer);
        }
      }

      // 5. Terminate session
      if (serverMsg.terminateSession) {
        this.emit('unauthenticated');
        this.close();
      }

    } catch (e) {
      this.emit('error', new Error(`Failed to decode server packet: ${e.message}`));
    }
  }

  _onClose(event) {
    this._stopHeartbeat();
    const wasConnected = this.state === 'connected';
    this.state = 'disconnected';

    // WebSocket close code 4401 == unauthenticated (gateway rejected our
    // credential on the upgrade request). This is not a transient failure, so
    // reconnecting blindly just loops forever behind the 8 s handshake timeout.
    const closeCode = event && (event.code !== undefined ? event.code : undefined);
    const isUnauthenticated = closeCode === 4401 || (event && event.reason && /4401|unauthenticated/i.test(String(event.reason)));

    if (isUnauthenticated) {
      this.unauthStreak++;
      this.emit('status', 'disconnected');
      this.emit('disconnected', event);
      this.emit('unauthenticated', {
        code: 4401,
        message: 'Bale server rejected the session credential (close code 4401)'
      });

      // Reject every in-flight request right away - none of them can be answered
      // now that the gateway has rejected our credential.
      for (const [idx, { reject, timer }] of this.pendingRequests.entries()) {
        clearTimeout(timer);
        reject(new Error('Connection closed before response was received (unauthenticated, close code 4401)'));
      }
      this.pendingRequests.clear();

      const threshold = this.options.maxUnauthenticatedRetries !== undefined
        ? this.options.maxUnauthenticatedRetries
        : 3;

      // A 4401 is not a transient network fault: reconnecting blindly just loops
      // forever behind the 8 s handshake timeout. We allow a bounded number of
      // retries (the token may simply have expired mid-flight), then stop and
      // surface one actionable error.
      if (this.unauthStreak >= threshold) {
        this.closedExplicitly = true;
        this.reconnectTimer = null;

        if (!this.unauthFatalEmitted) {
          this.unauthFatalEmitted = true;
          const err = new Error(
            `Unauthenticated: Bale server closed the connection with code 4401 ${this.unauthStreak} time(s). ` +
            'The session token is missing, expired or not accepted. Re-authenticate with sendCode()/signIn().'
          );
          err.code = 4401;
          this.emit('error', err);
        }
        return;
      }

      // Still under the threshold - a single bounded retry is worth trying.
      if (this.options.autoReconnect && !this.closedExplicitly) {
        this._scheduleReconnect();
      }
      return;
    }

    this.emit('status', 'disconnected');
    this.emit('disconnected', event);

    // Reject all pending requests
    for (const [idx, { reject, timer }] of this.pendingRequests.entries()) {
      clearTimeout(timer);
      reject(new Error('Connection closed before response was received'));
    }
    this.pendingRequests.clear();

    if (!this.closedExplicitly && this.options.autoReconnect) {
      this._scheduleReconnect();
    }
  }

  _scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(100 * Math.pow(2, this.reconnectAttempts++), 5000);
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {});
    }, delay);
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    let pingId = 1n;
    this.pingTimer = setInterval(() => {
      if (this.isConnected) {
        const pingFrame = Proto.encodeClientMessage({ ping: pingId++ });
        this._sendRaw(pingFrame);
      }
    }, this.options.pingInterval);
  }

  _stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  _sendRaw(data) {
    if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === this.ws.OPEN)) {
      this.ws.send(data);
    } else {
      throw new Error('WebSocket is not open');
    }
  }

  async sendRequest(serviceName, method, payloadBytes, customMetadata = {}) {
    if (!this.isConnected && this.state !== 'handshaking') {
      await this.connect();
    }

    const index = ++this.reqIndex;

    // Construct headers identical to official Bale Web Client.
    // Note: no `token`/`mt_token` here - the official client sends none; the
    // credential travels as the `access_token` cookie on the upgrade request.
    const nowStr = String(Date.now());
    const apiVer = String(this.options.apiVersion || 173855);

    const metadata = {
      app_version: apiVer,
      browser_type: '1',
      browser_version: '131.0.0.0',
      os_type: '5',
      session_id: nowStr,
      language: 'fa',
      mt_app_version: apiVer,
      mt_browser_type: '1',
      mt_browser_version: '131.0.0.0',
      mt_os_type: '5',
      mt_session_id: nowStr,
      ...customMetadata
    };

    const reqFrame = Proto.encodeClientMessage({
      request: {
        index,
        serviceName,
        method,
        payload: payloadBytes,
        metadata
      }
    });

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(index)) {
          this.pendingRequests.delete(index);
          reject(new Error(`RPC Timeout: ${serviceName}.${method} (id=${index})`));
        }
      }, this.options.requestTimeout);

      this.pendingRequests.set(index, { resolve, reject, timer });

      try {
        this._sendRaw(reqFrame);
      } catch (err) {
        clearTimeout(timer);
        this.pendingRequests.delete(index);
        reject(err);
      }
    });
  }

  close() {
    this.closedExplicitly = true;
    this._stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }
    this.state = 'disconnected';
  }
}

module.exports = { BaleConnection };
