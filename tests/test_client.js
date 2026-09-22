/**
 * Unit tests for BaleClient, Dynamic Namespaces, Sessions, and Event Dispatching
 */

const assert = require('assert');
const { BaleClient, StringSession, FileSession, PeerType, Proto } = require('../index');

async function testClient() {
  console.log('Testing BaleClient & Features...');

  // 1. StringSession test
  {
    const session = new StringSession();
    session.setAuth({
      token: 'test-jwt-token-123',
      user: { id: 98765, name: 'Bale User' },
      phone: '+989120000000'
    });

    assert.strictEqual(session.token, 'test-jwt-token-123');
    assert.strictEqual(session.userId, 98765);
    assert.strictEqual(session.isLoggedIn(), true);

    const exported = session.exportString();
    assert(exported.length > 20);

    const restored = new StringSession(exported);
    assert.strictEqual(restored.token, 'test-jwt-token-123');
    assert.strictEqual(restored.userId, 98765);
    assert.strictEqual(restored.user.name, 'Bale User');
    console.log('  ✅ StringSession persistence & restore passed');
  }

  // 2. Client Initialization & Dynamic Namespaces
  {
    const client = new BaleClient({
      session: new StringSession()
    });

    // Check namespaces
    assert(typeof client.messaging === 'object', 'client.messaging namespace missing');
    assert(typeof client.messaging.sendMessage === 'function', 'messaging.sendMessage missing');
    assert(typeof client.messaging.SendMessage === 'function', 'messaging.SendMessage alias missing');
    assert(typeof client.messaging.loadHistory === 'function', 'messaging.loadHistory missing');

    assert(typeof client.auth === 'object', 'client.auth namespace missing');
    assert(typeof client.auth.startPhoneAuth === 'function', 'auth.startPhoneAuth missing');
    assert(typeof client.auth.validateCode === 'function', 'auth.validateCode missing');

    assert(typeof client.users === 'object', 'client.users namespace missing');
    assert(typeof client.users.loadFullUsers === 'function', 'users.loadFullUsers missing');

    assert(typeof client.groups === 'object', 'client.groups namespace missing');
    assert(typeof client.groups.loadFullGroups === 'function', 'groups.loadFullGroups missing');

    assert(typeof client.meet === 'object', 'client.meet namespace missing');
    assert(typeof client.kifpool === 'object', 'client.kifpool namespace missing');
    assert(typeof client.story === 'object', 'client.story namespace missing');
    assert(typeof client.services['bale.messaging.v2.Messaging'] === 'object', 'services map missing');
    assert(typeof client.ai === 'object', 'lowercase alias client.ai missing');
    assert(typeof client.invoke === 'function', 'client.invoke function missing');

    console.log('  ✅ Dynamic service namespaces registered for all services');
  }

  // 3. Event Handling simulation
  {
    const client = new BaleClient();
    let messageReceived = null;

    client.on('message', (msg) => {
      messageReceived = msg;
    });

    // Simulate incoming update container from connection
    const fakeUpdate = {
      type: 'message',
      data: {
        senderId: 112233,
        peer: { type: PeerType.PRIVATE, id: 112233 },
        date: 1726910000000n,
        randomId: 556677n,
        message: {
          textMessage: { text: 'Hello Userbot' }
        }
      }
    };

    client.connection.emit('update', fakeUpdate);

    assert(messageReceived !== null, 'Message event was not fired');
    assert.strictEqual(messageReceived.senderId, 112233);
    assert.strictEqual(messageReceived.text, 'Hello Userbot');
    assert.strictEqual(messageReceived.isGroup, false);
    assert.strictEqual(typeof messageReceived.reply, 'function');
    console.log('  ✅ Message event handler and helper functions verified');
  }

  // 4. Test Schema Auto-Serialization & Auto-Deserialization
  {
    const client = new BaleClient();
    let sentReq = null;
    client.connection.sendRequest = async (serviceName, method, payloadBytes, metadata) => {
      sentReq = { serviceName, method, payloadBytes, metadata };
      const writer = new Proto.ProtoWriter();
      writer.writeInt32(1, 42); // folderId = 42
      return writer.finish();
    };

    const res = await client.messaging.createFolder({
      name: 'Work Chats',
      peers: [{ type: PeerType.PRIVATE, id: 1234 }]
    });

    assert(sentReq !== null);
    assert.strictEqual(sentReq.serviceName, 'bale.messaging.v2.Messaging');
    assert.strictEqual(sentReq.method, 'CreateFolder');
    assert(sentReq.payloadBytes.length > 0);
    assert.strictEqual(res.folderId, 42);

    // Test client.invoke directly
    const invokeRes = await client.invoke('bale.messaging.v2.Messaging', 'CreateFolder', {
      name: 'Archive',
      peers: []
    });
    assert.strictEqual(invokeRes.folderId, 42);
    console.log('  ✅ Schema auto-serialization and auto-deserialization verified');
  }

  // 5. Test Stealth Humanized Reply Flow & Presence Helpers
  {
    const client = new BaleClient({
      humanize: {
        readDelay: [5, 10],
        minTypingDelay: 10,
        maxTypingDelay: 20,
        typingDurationPerChar: 1
      }
    });

    const calls = [];
    client.connection.sendRequest = async (serviceName, method, payloadBytes) => {
      calls.push({ serviceName, method });
      const w = new Proto.ProtoWriter();
      if (method === 'SendMessage') {
        w.writeInt64(1, 1726910000000n); // date
      }
      return w.finish();
    };

    // Test explicit helpers
    await client.setOnline(true);
    await client.sendTyping({ type: PeerType.PRIVATE, id: 123 }, 0);
    await client.stopTyping({ type: PeerType.PRIVATE, id: 123 });
    await client.markAsReceived({ type: PeerType.PRIVATE, id: 123 }, 1726910000000n);
    await client.markAsRead({ type: PeerType.PRIVATE, id: 123 }, 1726910000000n);

    assert.strictEqual(calls[0].method, 'SetOnline');
    assert.strictEqual(calls[1].method, 'Typing');
    assert.strictEqual(calls[2].method, 'StopTyping');
    assert.strictEqual(calls[3].method, 'MessageReceived');
    assert.strictEqual(calls[4].method, 'MessageRead');

    // Test humanized msg.reply flow
    calls.length = 0;
    let receivedMsg = null;
    client.on('message', (m) => { receivedMsg = m; });

    client.connection.emit('update', {
      type: 'message',
      data: {
        senderId: 8888,
        peer: { type: PeerType.PRIVATE, id: 8888 },
        date: 1726910000000n,
        randomId: 1111n,
        message: { textMessage: { text: 'Hello human!' } }
      }
    });

    assert(receivedMsg !== null);
    await receivedMsg.reply('I am totally human!');

    // Expected sequence: MessageReceived -> MessageRead -> Typing -> StopTyping -> SendMessage
    assert.strictEqual(calls[0].method, 'MessageReceived');
    assert.strictEqual(calls[1].method, 'MessageRead');
    assert.strictEqual(calls[2].method, 'Typing');
    assert.strictEqual(calls[3].method, 'StopTyping');
    assert.strictEqual(calls[4].method, 'SendMessage');
    console.log('  ✅ Stealth humanized reply sequence (seen + typing + stop + reply) verified');

    // Test disabling humanize (instant bot mode)
    assert.strictEqual(client.isHumanized, true);
    client.disableHumanize();
    assert.strictEqual(client.isHumanized, false);

    calls.length = 0;
    await receivedMsg.reply('Instant reply mode!');
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, 'SendMessage');
    console.log('  ✅ Instant bot mode verified (humanize disabled: 0 delay, direct SendMessage)');

    // Test re-enabling humanize & per-call override
    client.enableHumanize();
    assert.strictEqual(client.isHumanized, true);

    calls.length = 0;
    await receivedMsg.reply('Fast reply via override!', { humanize: false });
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, 'SendMessage');
    console.log('  ✅ Per-message humanize override verified ({ humanize: false })');
  }

  console.log('\nAll Client tests passed! ✨');
}

testClient();
