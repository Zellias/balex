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
      endpoint: 'wss://next-ws.bale.ai/ws/',
      apiVersion: 171248,
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
        const wsOpts = {
          headers: {
            'Origin': this.options.origin,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
          }
        };

        // If native WebSocket accepts 2nd arg as protocols
        try {
          this.ws = new WS(url, wsOpts);
        } catch (_) {
          this.ws = new WS(url);
        }

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

      this.once('_handshake_done', (res) => {
        clearTimeout(timeout);
        this.state = 'connected';
        this.reconnectAttempts = 0;
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

    // Construct headers identical to official Bale Web Client
    const nowStr = String(Date.now());
    const apiVer = String(this.options.apiVersion || 171248);

    const metadata = {
      app_version: apiVer,
      browser_type: '1',
      browser_version: '128.0.0.0',
      os_type: '5',
      session_id: nowStr,
      language: 'fa',
      mt_app_version: apiVer,
      mt_browser_type: '1',
      mt_browser_version: '128.0.0.0',
      mt_os_type: '5',
      mt_session_id: nowStr,
      ...customMetadata
    };

    if (this.session && this.session.token) {
      metadata.token = this.session.token;
      metadata.mt_token = this.session.token;
    }

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
