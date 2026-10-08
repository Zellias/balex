/**
 * Send a message — minimal Bale example
 * Run:  node examples/send_message.js <peerId|username> <text>
 *
 * `peerId` may be a numeric user id or a public username (e.g. `some_username`).
 *
 * Requires a logged-in session. Create one first with: node examples/login.js
 */

const { BaleClient, FileSession } = require('../index');

async function main() {
  const target = process.argv[2];
  const text = process.argv[3];

  if (!target || !text) {
    console.error('Usage: node examples/send_message.js <peerId|username> "your text"');
    process.exit(1);
  }

  // FileSession loads the token/uid saved by examples/login.js
  const session = new FileSession('./session.json');
  const client = new BaleClient({ session });

  try {
    await client.connect();

    // numeric id → used as-is, username → looked up via SearchContacts
    const peer = await client.resolvePeer(target);
    console.log(`Resolved "${target}" -> peer ${peer.id}`);

    const sent = await client.sendMessage(peer, text);
    console.log(`Sent #${sent.rid} to ${sent.peer.id} at ${new Date(sent.date).toISOString()}`);
  } catch (err) {
      console.error('Failed:', err.message);
      process.exitCode = 1;
  } finally {
    client.disconnect();
  }
}

main().catch(console.error);