/**
 * BaleX IPC & HTTP Bridge for Go (Golang) and External Runtimes
 * 
 * Provides both:
 * 1. STDIO streaming JSON-RPC for zero-latency child process execution from Go (os/exec).
 * 2. HTTP / JSON-RPC server with Server-Sent Events (SSE) for distributed Go microservices.
 */

const http = require('http');
const readline = require('readline');
const { BaleClient } = require('./client');
const { BaleBot } = require('./bot');

let activeClient = null;
let activeBot = null;
const eventSubscribers = new Set(); // SSE clients

/**
 * Broadcast event to all listeners (STDIO and HTTP SSE)
 * @param {string} eventName 
 * @param {any} data 
 */
function broadcastEvent(eventName, data) {
  const payload = JSON.stringify({ event: eventName, data, timestamp: Date.now() });
  
  // 1. Write to stdout for STDIO mode
  if (process.env.BRIDGE_STDIO === '1' || process.argv.includes('--stdio')) {
    process.stdout.write(payload + '\n');
  }

  // 2. Stream to SSE HTTP clients
  for (const res of eventSubscribers) {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (_) {
      eventSubscribers.delete(res);
    }
  }
}

/**
 * Execute dynamic method on client or bot
 * @param {string} method 
 * @param {Array|Object} params 
 * @returns {Promise<any>}
 */
async function executeMethod(method, params = []) {
  const target = activeClient || activeBot;
  if (!target) {
    throw new Error('No active client or bot initialized. Call init_client or init_bot first.');
  }

  if (typeof target[method] !== 'function') {
    throw new Error(`Method '${method}' does not exist on active instance.`);
  }

  let args = [];
  if (Array.isArray(params)) {
    args = params;
  } else if (params && typeof params === 'object') {
    args = [params];
  }

  return await target[method](...args);
}

/**
 * Initialize Userbot Client
 * @param {Object} config 
 */
async function initClient(config = {}) {
  if (activeClient) {
    try { activeClient.close(); } catch (_) {}
  }

  activeClient = new BaleClient(config);

  // Hook all events to bridge
  activeClient.on('message', (msg) => broadcastEvent('message', msg));
  activeClient.on('banking_card_transfer', (card) => broadcastEvent('banking_card_transfer', card));
  activeClient.on('gift_packet_received', (pkt) => broadcastEvent('gift_packet_received', pkt));
  activeClient.on('ready', (user) => broadcastEvent('ready', user));
  activeClient.on('error', (err) => broadcastEvent('error', { message: err.message }));

  if (config.autoConnect !== false) {
    await activeClient.connect();
  }

  return { success: true, message: 'Client initialized and connected' };
}

/**
 * Initialize Official Bot
 * @param {string} token 
 * @param {Object} options 
 */
async function initBot(token, options = {}) {
  if (activeBot) {
    try { activeBot.stopPolling(); } catch (_) {}
  }

  activeBot = new BaleBot(token, options);

  // Hook bot events
  activeBot.on('message', (msg) => broadcastEvent('message', msg));
  activeBot.on('callback_query', (cq) => broadcastEvent('callback_query', cq));
  activeBot.on('pre_checkout_query', (pcq) => broadcastEvent('pre_checkout_query', pcq));
  activeBot.on('error', (err) => broadcastEvent('error', { message: err.message }));

  if (options.polling !== false) {
    activeBot.startPolling();
  }

  return { success: true, message: 'Bot initialized with token' };
}

/**
 * Handle incoming JSON command
 * @param {Object} req 
 * @returns {Promise<Object>}
 */
async function handleCommand(req) {
  const id = req.id || null;
  try {
    const action = req.action || req.method;
    switch (action) {
      case 'init_client':
        const clientRes = await initClient(req.config || {});
        return { id, success: true, result: clientRes };

      case 'init_bot':
        const botRes = await initBot(req.token, req.options || {});
        return { id, success: true, result: botRes };

      case 'call':
        const callRes = await executeMethod(req.method, req.params);
        return { id, success: true, result: callRes };

      case 'ping':
        return { id, success: true, result: 'pong' };

      case 'status':
        return {
          id,
          success: true,
          result: {
            clientReady: !!(activeClient?.isConnected || activeClient?.connected),
            botReady: !!activeBot,
            uptime: process.uptime()
          }
        };

      default:
        // Direct method call fallback
        if (req.method) {
          const directRes = await executeMethod(req.method, req.params);
          return { id, success: true, result: directRes };
        }
        throw new Error(`Unknown action or method: ${action}`);
    }
  } catch (err) {
    return { id, success: false, error: err.message || String(err) };
  }
}

/**
 * Start STDIO JSON-RPC Bridge Mode
 */
function startStdioMode() {
  process.env.BRIDGE_STDIO = '1';
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const parsed = JSON.parse(trimmed);
      const res = await handleCommand(parsed);
      process.stdout.write(JSON.stringify(res) + '\n');
    } catch (e) {
      process.stdout.write(JSON.stringify({ success: false, error: 'JSON parse error: ' + e.message }) + '\n');
    }
  });

  // Ready signal
  process.stdout.write(JSON.stringify({ event: 'bridge_ready', mode: 'stdio' }) + '\n');
}

/**
 * Start HTTP Bridge Mode
 * @param {number} port 
 */
function startHttpMode(port = 8765) {
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const url = new URL(req.url, `http://localhost:${port}`);

    // SSE Events Stream endpoint: GET /api/events
    if (url.pathname === '/api/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write(`data: ${JSON.stringify({ event: 'connected' })}\n\n`);
      eventSubscribers.add(res);

      req.on('close', () => {
        eventSubscribers.delete(res);
      });
      return;
    }

    // Health check: GET /api/status or GET /
    if (url.pathname === '/api/status' || url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: 'ok',
        clientReady: !!activeClient?.connected,
        botReady: !!activeBot,
        uptime: process.uptime()
      }));
    }

    // Command execution: POST /api/call or POST /api/init
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (url.pathname === '/api/init') {
            if (parsed.botToken || parsed.token) {
              parsed.action = 'init_bot';
              parsed.token = parsed.botToken || parsed.token;
            } else {
              parsed.action = 'init_client';
            }
          }
          const response = await handleCommand(parsed);
          res.writeHead(response.success ? 200 : 400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  });

  server.listen(port, () => {
    console.log(`[BaleX Bridge] HTTP Server listening on http://127.0.0.1:${port}`);
    console.log(`[BaleX Bridge] Ready to accept requests from Go, Python, or curl.`);
  });
}

// Auto-start if invoked directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const isStdio = args.includes('--stdio');
  const portIndex = args.indexOf('--port');
  const port = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : (process.env.PORT ? parseInt(process.env.PORT, 10) : 8765);

  if (isStdio) {
    startStdioMode();
  } else {
    startHttpMode(port);
  }
}

module.exports = {
  handleCommand,
  executeMethod,
  initClient,
  initBot,
  startStdioMode,
  startHttpMode
};
