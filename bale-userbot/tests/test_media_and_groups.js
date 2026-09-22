/**
 * Unit tests for media methods, group operations, and message manipulation
 */

const assert = require('assert');
const { BaleClient, StringSession, Proto, PeerType, TypingType } = require('../index');

async function testMediaAndGroups() {
  console.log('Testing Media, Group, and Messaging API methods...');

  const client = new BaleClient({
    session: new StringSession(),
    humanize: false // instant for testing
  });

  // Track dispatched RPC calls
  const dispatched = [];
  client.connection.sendRequest = async (service, method, payload, metadata) => {
    dispatched.push({ service, method, payload, metadata });
    // Mock successful responses
    if (service === 'bale.messaging.v2.Messaging' && method === 'SendMessage') {
      const w = new Proto.ProtoWriter();
      w.writeInt64(1, BigInt(Date.now()));
      w.writeInt64(2, 12345n);
      return w.finish();
    }
    return Buffer.alloc(0);
  };

  // 1. sendPhoto
  await client.sendPhoto(12345, {
    fileId: 1001,
    accessHash: 2002n,
    fileSize: 50000,
    name: 'photo.jpg',
    width: 800,
    height: 600,
    caption: 'Test photo'
  });
  assert.strictEqual(dispatched[dispatched.length - 1].service, 'bale.messaging.v2.Messaging');
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'SendMessage');
  console.log('  ✅ sendPhoto call framing passed');

  // 2. sendVoice
  await client.sendVoice(12345, {
    fileId: 1002,
    accessHash: 2003n,
    fileSize: 25000,
    duration: 10,
    caption: 'Test voice'
  });
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'SendMessage');
  console.log('  ✅ sendVoice call framing passed');

  // 3. sendAudio (Music)
  await client.sendAudio(12345, {
    fileId: 1003,
    accessHash: 2004n,
    fileSize: 3500000,
    name: 'song.mp3',
    duration: 180,
    title: 'Song Title',
    performer: 'Artist',
    caption: 'Music'
  });
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'SendMessage');
  console.log('  ✅ sendAudio call framing passed');

  // 4. sendVideo
  await client.sendVideo(12345, {
    fileId: 1004,
    accessHash: 2005n,
    fileSize: 12000000,
    name: 'clip.mp4',
    width: 1280,
    height: 720,
    duration: 30,
    caption: 'Video'
  });
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'SendMessage');
  console.log('  ✅ sendVideo call framing passed');

  // 5. sendDocument
  await client.sendDocument(12345, {
    fileId: 1005,
    accessHash: 2006n,
    fileSize: 1024000,
    name: 'document.pdf',
    mimeType: 'application/pdf',
    caption: 'PDF Doc'
  });
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'SendMessage');
  console.log('  ✅ sendDocument call framing passed');

  // 6. sendSticker
  await client.sendSticker(12345, 999, 888n, 777);
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'SendMessage');
  console.log('  ✅ sendSticker call framing passed');

  // 7. editMessage
  await client.editMessage(12345, 'mid_123', 'Updated text');
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'UpdateMessage');
  console.log('  ✅ editMessage call framing passed');

  // 8. forwardMessages
  await client.forwardMessages(54321, 12345, ['mid_1', 'mid_2']);
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'ForwardMessages');
  console.log('  ✅ forwardMessages call framing passed');

  // 9. pinMessage
  await client.pinMessage(12345, 'mid_123');
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'PinMessage');
  console.log('  ✅ pinMessage call framing passed');

  // 10. deleteMessages
  await client.deleteMessages(12345, ['mid_1', 'mid_2']);
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'DeleteMessage');
  console.log('  ✅ deleteMessages call framing passed');

  // 11. clearChat
  await client.clearChat(12345);
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'ClearChat');
  console.log('  ✅ clearChat call framing passed');

  // 12. Group methods
  await client.inviteMembers(99999, [111, 222]);
  assert.strictEqual(dispatched[dispatched.length - 1].service, 'bale.groups.v1.Groups');
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'InviteUser');
  console.log('  ✅ inviteMembers call framing passed');

  await client.kickMember(99999, 111);
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'KickUser');
  console.log('  ✅ kickMember call framing passed');

  await client.setGroupTitle(99999, 'New Group Name');
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'EditGroupTitle');
  console.log('  ✅ setGroupTitle call framing passed');

  await client.leaveGroup(99999);
  assert.strictEqual(dispatched[dispatched.length - 1].method, 'LeaveGroup');
  console.log('  ✅ leaveGroup call framing passed');

  console.log('\nAll Media, Group, and Messaging API tests passed! 🚀');
}

testMediaAndGroups().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
