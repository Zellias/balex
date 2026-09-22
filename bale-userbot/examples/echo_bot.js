/**
 * Echo / Auto-Responder Userbot Example
 * Run: node examples/echo_bot.js
 */

const { BaleClient, FileSession } = require('../index');

async function main() {
  const session = new FileSession('./session.json');

  if (!session.isLoggedIn()) {
    console.log('⚠️  No active session found! Please run `node examples/login.js` first.');
    process.exit(1);
  }

  const client = new BaleClient({
    session,
    stealth: true // Human-like stealth mode: seen checks, typing indicators, and natural delays
  });

  client.on('status', (st) => console.log(`[Status] ${st}`));
  client.on('connected', () => console.log('🚀 Userbot is online in Stealth Mode (mimicking official Bale Web client)!'));
  client.on('error', (err) => console.error('[Error]', err.message));

  // Listen for incoming messages
  client.on('message', async (msg) => {
    console.log(`[Incoming Message] From ${msg.senderId}: "${msg.text}"`);

    // Command: .ping
    if (msg.text === '.ping') {
      console.log(`Responding to .ping from ${msg.senderId}`);
      await msg.reply('Pong! 🏓 (Bale Userbot Node.js)');
    }

    // Command: .echo <text>
    else if (msg.text && msg.text.startsWith('.echo ')) {
      const replyContent = msg.text.slice(6);
      console.log(`Echoing "${replyContent}" to ${msg.senderId}`);
      await msg.reply(replyContent);
    }

    // Command: .humanize on / off
    else if (msg.text === '.humanize on') {
      client.enableHumanize();
      await msg.reply('✅ Humanize mode ENABLED: Simulating natural reading seen marks and typing indicators.');
    } else if (msg.text === '.humanize off') {
      client.disableHumanize();
      await msg.reply('⚡ Humanize mode DISABLED: High-speed instant response bot mode.', { humanize: false });
    }

    // Command: .info
    else if (msg.text === '.info') {
      const info = `🤖 Bale Userbot Node.js\n` +
                   `• API Version: 171248\n` +
                   `• Protocol: mkproto v1\n` +
                   `• Humanize Mode: ${client.isHumanized ? 'Enabled ✅ (Human Simulation)' : 'Disabled ⚡ (High-Speed Bot)'}\n` +
                   `• Available Services: 53\n` +
                   `• RPC Methods: 636`;
      await msg.reply(info);
    }
  });

  await client.connect();
}

main().catch(console.error);
