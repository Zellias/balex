#!/usr/bin/env node

/**
 * BaleX CLI Tool
 * Command-line runner for BaleX Userbot, Bot API, and Go Bridge
 */

const { startHttpMode, startStdioMode } = require('../src/bridge');
const { BaleBot } = require('../src/bot');
const { BaleClient } = require('../src/client');

const args = process.argv.slice(2);
const command = args[0] || 'help';

function showHelp() {
  console.log(`
🚀 BaleX CLI — Node.js & Go Runtime Tool for Bale Messenger

Usage:
  balex bridge [--port <number>] [--stdio]   Run IPC/HTTP Bridge for Go/External apps
  balex bot --token <TOKEN>                  Run Official Bale Bot with polling
  balex version                              Show version
  balex help                                 Show this help message

Options:
  --port <number>    HTTP port for bridge (default: 8765)
  --stdio            Use STDIN/STDOUT JSON-RPC streaming (ideal for Go os/exec)
  --token <string>   Bale Bot Token (from @BotFather)
`);
}

switch (command) {
  case 'bridge': {
    const isStdio = args.includes('--stdio');
    const portIdx = args.indexOf('--port');
    const port = portIdx !== -1 ? parseInt(args[portIdx + 1], 10) : 8765;
    if (isStdio) {
      startStdioMode();
    } else {
      startHttpMode(port);
    }
    break;
  }

  case 'bot': {
    const tokenIdx = args.indexOf('--token');
    const token = tokenIdx !== -1 ? args[tokenIdx + 1] : process.env.BALE_BOT_TOKEN;
    if (!token) {
      console.error('❌ Error: --token is required. Example: balex bot --token 123456:ABC-DEF');
      process.exit(1);
    }
    const bot = new BaleBot(token);
    console.log('🤖 Bale Bot started with token. Listening for incoming messages...');
    bot.on('message', (msg) => {
      console.log(`[Bot Message] from: ${msg.from?.id} text: "${msg.text}"`);
    });
    bot.startPolling();
    break;
  }

  case 'version':
  case '-v':
  case '--version': {
    const pkg = require('../package.json');
    console.log(`BaleX v${pkg.version}`);
    break;
  }

  case 'help':
  case '--help':
  case '-h':
  default:
    showHelp();
    break;
}
