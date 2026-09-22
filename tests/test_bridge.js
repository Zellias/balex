const assert = require('assert');
const { handleCommand, executeMethod } = require('../src/bridge');

async function runBridgeTests() {
  console.log('Testing BaleX Bridge & Go IPC Protocol...');

  // 1. Ping
  const pingRes = await handleCommand({ id: 101, action: 'ping' });
  assert.strictEqual(pingRes.id, 101);
  assert.strictEqual(pingRes.success, true);
  assert.strictEqual(pingRes.result, 'pong');
  console.log('  ✅ Ping/Pong passed');

  // 2. Status
  const statusRes = await handleCommand({ id: 102, action: 'status' });
  assert.strictEqual(statusRes.id, 102);
  assert.strictEqual(statusRes.success, true);
  assert.strictEqual(typeof statusRes.result.uptime, 'number');
  console.log('  ✅ Status check passed');

  // 3. Init bot with token
  const botInitRes = await handleCommand({
    id: 103,
    action: 'init_bot',
    token: '123456:TEST-TOKEN',
    options: { polling: false }
  });
  assert.strictEqual(botInitRes.id, 103);
  assert.strictEqual(botInitRes.success, true);
  console.log('  ✅ Bot initialization over bridge passed');

  // 4. Unknown action handling
  const unknownRes = await handleCommand({ id: 104, action: 'non_existent_action' });
  assert.strictEqual(unknownRes.id, 104);
  assert.strictEqual(unknownRes.success, false);
  assert(unknownRes.error.includes('Unknown action'));
  console.log('  ✅ Error handling and rejection passed');

  console.log('All Bridge & Go IPC tests passed! 🚀\n');
}

runBridgeTests().catch(err => {
  console.error('Bridge test failed:', err);
  process.exit(1);
});
