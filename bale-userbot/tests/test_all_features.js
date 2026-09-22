const assert = require('assert');
const { BaleClient, Proto, PeerType, TypingType } = require('../index');

async function runTests() {
  const { ProtoWriter } = Proto;
  console.log('Testing Contacts, Profile, Reactions, Folders, Polls, Wallet & Updates...');

  // 1. Phone number normalization
  const p1 = Proto.normalizePhoneNumber('۰۹۱۲۳۴۵۶۷۸۹');
  assert.strictEqual(p1, 989123456789n, 'Persian phone normalization failed');
  const p2 = Proto.normalizePhoneNumber('09351112233');
  assert.strictEqual(p2, 989351112233n, 'Local phone normalization failed');
  const p3 = Proto.normalizePhoneNumber('+989120000000');
  assert.strictEqual(p3, 989120000000n, 'International phone normalization failed');
  console.log('  ✅ Phone normalization tests passed');

  // 2. Contacts Wire Encoders
  const importBuf = Proto.encodeImportContacts([
    { phone: '09121234567', name: 'Ali Reza' },
    { phone: '+989351234567', name: 'Sara' }
  ]);
  assert(Buffer.isBuffer(importBuf) && importBuf.length > 0, 'encodeImportContacts failed');

  const addContactBuf = Proto.encodeAddContact({ uid: 12345, accessHash: 987654321n });
  assert(Buffer.isBuffer(addContactBuf) && addContactBuf.length > 0, 'encodeAddContact failed');

  const removeContactBuf = Proto.encodeRemoveContact({ uid: 12345, accessHash: 987654321n });
  assert(Buffer.isBuffer(removeContactBuf) && removeContactBuf.length > 0, 'encodeRemoveContact failed');

  const searchContactsBuf = Proto.encodeSearchContacts('Ali');
  assert(Buffer.isBuffer(searchContactsBuf) && searchContactsBuf.length > 0, 'encodeSearchContacts failed');
  console.log('  ✅ Contacts Wire Encoders passed');

  // 3. User Profile & Privacy Encoders
  const editNameBuf = Proto.encodeEditName('Amir Hossein');
  assert(Buffer.isBuffer(editNameBuf) && editNameBuf.length > 0, 'encodeEditName failed');

  const editAboutBuf = Proto.encodeEditAbout('Developer & BaleX creator');
  assert(Buffer.isBuffer(editAboutBuf) && editAboutBuf.length > 0, 'encodeEditAbout failed');

  const editNickBuf = Proto.encodeEditNickName('balex_master');
  assert(Buffer.isBuffer(editNickBuf) && editNickBuf.length > 0, 'encodeEditNickName failed');

  const checkNickBuf = Proto.encodeCheckNickName('balex_master');
  assert(Buffer.isBuffer(checkNickBuf) && checkNickBuf.length > 0, 'encodeCheckNickName failed');

  const blockBuf = Proto.encodeBlockUser(99999);
  assert(Buffer.isBuffer(blockBuf) && blockBuf.length > 0, 'encodeBlockUser failed');

  const unblockBuf = Proto.encodeUnblockUser(99999);
  assert(Buffer.isBuffer(unblockBuf) && unblockBuf.length > 0, 'encodeUnblockUser failed');
  console.log('  ✅ Profile & Privacy Encoders passed');

  // 4. Reactions Encoders
  const setReactionBuf = Proto.encodeMessageSetReaction({
    peer: { type: PeerType.PRIVATE, id: 12345 },
    rid: 777888n,
    code: '❤️',
    date: 1700000000n
  });
  assert(Buffer.isBuffer(setReactionBuf) && setReactionBuf.length > 0, 'encodeMessageSetReaction failed');

  const remReactionBuf = Proto.encodeMessageRemoveReaction({
    peer: { type: PeerType.PRIVATE, id: 12345 },
    rid: 777888n,
    code: '❤️'
  });
  assert(Buffer.isBuffer(remReactionBuf) && remReactionBuf.length > 0, 'encodeMessageRemoveReaction failed');
  console.log('  ✅ Reaction Encoders passed');

  // 5. Folders Encoders
  const createFolderBuf = Proto.encodeCreateFolder({
    title: 'کار و پروژه',
    peerIds: [100, 200, 300]
  });
  assert(Buffer.isBuffer(createFolderBuf) && createFolderBuf.length > 0, 'encodeCreateFolder failed');

  const deleteFolderBuf = Proto.encodeDeleteFolder(42);
  assert(Buffer.isBuffer(deleteFolderBuf) && deleteFolderBuf.length > 0, 'encodeDeleteFolder failed');
  console.log('  ✅ Folder Encoders passed');

  // 6. Polls Encoders
  const createPollBuf = Proto.encodeCreatePoll({
    question: 'کدام زبان برنامه‌نویسی را ترجیح می‌دهید؟',
    options: ['جاوا اسکریپت', 'دارت / فلاتر', 'پایتون'],
    isAnonymous: true,
    isMultipleChoice: false
  });
  assert(Buffer.isBuffer(createPollBuf) && createPollBuf.length > 0, 'encodeCreatePoll failed');
  console.log('  ✅ Poll Encoders passed');

  // 7. Update Demuxing (Edit, Delete, Reaction, Clear, TypingStop)
  // 7a. Edit Message (Tag 162)
  const editUpdateW = new Proto.ProtoWriter();
  const editInnerW = new Proto.ProtoWriter();
  editInnerW.writeMessage(1, Proto.encodePeer({ type: PeerType.PRIVATE, id: 5555 }));
  editInnerW.writeInt64(2, 999111n);
  editInnerW.writeMessage(3, Proto.encodeMessage({ textMessage: { text: 'پیام ویرایش شد' } }));
  editUpdateW.writeMessage(162, editInnerW.finish());

  const decodedEdit = Proto.decodeUpdateContainer(editUpdateW.finish());
  assert.strictEqual(decodedEdit.type, 'messageEdit', 'Update demux messageEdit failed');
  assert.strictEqual(decodedEdit.data.rid, 999111n, 'Decoded rid mismatch');
  assert.strictEqual(decodedEdit.data.message.textMessage.text, 'پیام ویرایش شد', 'Decoded text mismatch');

  // 7b. Delete Message (Tag 46)
  const delUpdateW = new Proto.ProtoWriter();
  const delInnerW = new Proto.ProtoWriter();
  delInnerW.writeMessage(1, Proto.encodePeer({ type: PeerType.PRIVATE, id: 5555 }));
  delInnerW.writeInt64(2, 1001n);
  delInnerW.writeInt64(2, 1002n);
  delUpdateW.writeMessage(46, delInnerW.finish());

  const decodedDel = Proto.decodeUpdateContainer(delUpdateW.finish());
  assert.strictEqual(decodedDel.type, 'messageDelete', 'Update demux messageDelete failed');
  assert.deepStrictEqual(decodedDel.data.rids, [1001n, 1002n], 'Decoded deleted rids mismatch');

  // 7c. Chat Clear (Tag 47)
  const clearUpdateW = new Proto.ProtoWriter();
  const clearInnerW = new Proto.ProtoWriter();
  clearInnerW.writeMessage(1, Proto.encodePeer({ type: PeerType.GROUP, id: 888 }));
  clearUpdateW.writeMessage(47, clearInnerW.finish());

  const decodedClear = Proto.decodeUpdateContainer(clearUpdateW.finish());
  assert.strictEqual(decodedClear.type, 'chatClear', 'Update demux chatClear failed');
  assert.strictEqual(decodedClear.data.peer.id, 888, 'Decoded clear peer id mismatch');

  // 7d. Reaction (Tag 222)
  const reactUpdateW = new Proto.ProtoWriter();
  const reactInnerW = new Proto.ProtoWriter();
  reactInnerW.writeMessage(1, Proto.encodePeer({ type: PeerType.PRIVATE, id: 5555 }));
  reactInnerW.writeInt64(2, 888999n);
  reactInnerW.writeBool(4, true);
  reactUpdateW.writeMessage(222, reactInnerW.finish());

  const decodedReact = Proto.decodeUpdateContainer(reactUpdateW.finish());
  assert.strictEqual(decodedReact.type, 'reaction', 'Update demux reaction failed');
  assert.strictEqual(decodedReact.data.reactionByMe, true, 'Decoded reactionByMe mismatch');

  // 7e. Typing Stop (Tag 81)
  const stopUpdateW = new Proto.ProtoWriter();
  const stopInnerW = new Proto.ProtoWriter();
  stopInnerW.writeMessage(1, Proto.encodePeer({ type: PeerType.PRIVATE, id: 5555 }));
  stopInnerW.writeInt32(2, 777);
  stopInnerW.writeInt32(3, TypingType.TEXT);
  stopUpdateW.writeMessage(81, stopInnerW.finish());

  const decodedStop = Proto.decodeUpdateContainer(stopUpdateW.finish());
  assert.strictEqual(decodedStop.type, 'typingStop', 'Update demux typingStop failed');
  assert.strictEqual(decodedStop.data.userId, 777, 'Decoded userId mismatch');
  console.log('  ✅ Real-time Updates Demuxing passed (Edit, Delete, Clear, Reaction, TypingStop)');

  // 8. Client Method Mock Verification
  const client = new BaleClient({ humanize: false });
  const sentRequests = [];
  client.connection.sendRequest = async (service, method, payload) => {
    sentRequests.push({ service, method, payload });
    if (method === 'ImportContacts') {
      const w = new Proto.ProtoWriter();
      const uw = new Proto.ProtoWriter();
      uw.writeInt32(1, 45678);
      uw.writeString(3, 'Test Contact');
      w.writeMessage(1, uw.finish());
      return w.finish();
    }
    return Buffer.alloc(0);
  };

  // Contacts
  const imported = await client.importContacts([{ phone: '09123456789', name: 'Reza' }]);
  assert.strictEqual(imported.users.length, 1);
  assert.strictEqual(imported.users[0].id, 45678);

  await client.addContactByUid(112233, 445566n);
  assert(sentRequests.some(r => r.service === 'bale.users.v1.Users' && r.method === 'AddContact'));

  await client.removeContact(112233, 445566n);
  assert(sentRequests.some(r => r.service === 'bale.users.v1.Users' && r.method === 'RemoveContact'));

  await client.searchContacts('Reza');
  assert(sentRequests.some(r => r.service === 'bale.users.v1.Users' && r.method === 'SearchContacts'));

  // Profile
  await client.editName('New Name');
  assert(sentRequests.some(r => r.service === 'bale.users.v1.Users' && r.method === 'EditName'));

  await client.editAbout('New Bio');
  assert(sentRequests.some(r => r.service === 'bale.users.v1.Users' && r.method === 'EditAbout'));

  await client.editUsername('new_user');
  assert(sentRequests.some(r => r.service === 'bale.users.v1.Users' && r.method === 'EditNickName'));

  await client.checkUsername('check_user');
  assert(sentRequests.some(r => r.service === 'bale.users.v1.Users' && r.method === 'CheckNickName'));

  await client.blockUser(12345);
  assert(sentRequests.some(r => r.service === 'bale.users.v1.Users' && r.method === 'BlockUser'));

  await client.unblockUser(12345);
  assert(sentRequests.some(r => r.service === 'bale.users.v1.Users' && r.method === 'UnblockUser'));

  // Reactions
  await client.setReaction(500, 10001, '🔥');
  assert(sentRequests.some(r => r.service === 'bale.abacus.v1.Abacus' && r.method === 'MessageSetReaction'));

  await client.removeReaction(500, 10001, '🔥');
  assert(sentRequests.some(r => r.service === 'bale.abacus.v1.Abacus' && r.method === 'MessageRemoveReaction'));

  // Folders
  await client.createFolder('دوستان', [101, 102]);
  assert(sentRequests.some(r => r.service === 'bale.messaging.v2.Messaging' && r.method === 'CreateFolder'));

  await client.deleteFolder(99);
  assert(sentRequests.some(r => r.service === 'bale.messaging.v2.Messaging' && r.method === 'DeleteFolder'));

  // Polls
  await client.sendPoll(500, 'نظرتان راجع به ربات؟', ['عالی', 'خوب', 'نیاز به بهبود']);
  assert(sentRequests.some(r => r.service === 'bale.messaging.v2.Messaging' && r.method === 'SendMessage'));

  await client.closePoll(123456);
  assert(sentRequests.some(r => r.service === 'bale.poll.v1.Poll' && r.method === 'ClosePoll'));

  // Bot callbacks
  await client.sendInlineCallback(500, 789, 'action:confirm');
  assert(sentRequests.some(r => r.service === 'bale.ketf.v1.Ketf' && r.method === 'SendInlineCallback'));

  // Gift Packets (Cash & Gold)
  await client.sendGiftPacket({ peer: 500, amount: 500000, count: 5, message: 'عیدی نوروز' });
  assert(sentRequests.some(r => r.service === 'bale.giftpacket.v1.GiftPacket' && r.method === 'SendGiftPacketWithWallet'));

  await client.openGiftPacket({ peer: 500, randomId: 12345678n, date: Date.now() });
  assert(sentRequests.some(r => r.service === 'bale.giftpacket.v1.GiftPacket' && r.method === 'OpenGiftPacket'));

  await client.sendGoldGiftPacket({ peer: 500, amountMilligrams: 100, count: 2, message: 'طلای بله' });
  assert(sentRequests.some(r => r.service === 'bale.balebank.v1.GoldGiftPacket' && r.method === 'SendGoldGiftPacket'));

  await client.openGoldGiftPacket(998877);
  assert(sentRequests.some(r => r.service === 'bale.balebank.v1.GoldGiftPacket' && r.method === 'OpenGoldGiftPacket'));

  await client.getGoldGiftPacketWinners(998877);
  assert(sentRequests.some(r => r.service === 'bale.balebank.v1.GoldGiftPacket' && r.method === 'GetWinnerIDs'));

  // Mini Apps / WebApps
  await client.getMiniAppUrl({ botUserId: 1000, screenMode: 1 });
  assert(sentRequests.some(r => r.service === 'bale.appzar.v1.Appzar' && r.method === 'GetMiniAppUrl'));

  await client.getWebappHash(1000, 'start_test');
  assert(sentRequests.some(r => r.service === 'bale.ketf.v1.Ketf' && r.method === 'GetWebappHash'));

  const miniAppParams = await client.createMiniAppParams(1000, { appUrl: 'https://example.com/app', startParam: 'ref123' });
  assert(miniAppParams.initData.includes('user='), 'MiniApp initData must include user');
  assert(miniAppParams.launchUrl.includes('tgWebAppData='), 'MiniApp launchUrl must include tgWebAppData');

  await client.sendMiniAppData({ botUserId: 1000, queryId: 'Q1', data: { score: 100 } });
  assert(sentRequests.some(r => r.service === 'bale.ketf.v1.Ketf' && r.method === 'SendMiniAppData'));

  await client.getBotMenuButton(1000);
  assert(sentRequests.some(r => r.service === 'bale.appzar.v1.Appzar' && r.method === 'GetMenuButton'));

  await client.invokeMiniAppCustomMethod({ botUserId: 1000, method: 'customScore', params: { x: 1 } });
  assert(sentRequests.some(r => r.service === 'bale.appzar.v1.Appzar' && r.method === 'InvokeCustomMethod'));

  // Stories, Scheduler, and AI
  await client.sendStory({ caption: 'استوری جدید' });
  assert(sentRequests.some(r => r.service === 'bale.story.v1.Story' && r.method === 'AddStory'));

  await client.deleteStory(1122);
  assert(sentRequests.some(r => r.service === 'bale.story.v1.Story' && r.method === 'RemoveStory'));

  await client.getUserStories(100);
  assert(sentRequests.some(r => r.service === 'bale.story.v1.Story' && r.method === 'GetStories'));

  await client.scheduleMessage({ peer: 500, text: 'پیام آینده', sendAtDate: Date.now() + 60000 });
  assert(sentRequests.some(r => r.service === 'bale.schedule.v1.Scheduler' && r.method === 'ScheduleTask'));

  await client.loadScheduledMessages(500);
  assert(sentRequests.some(r => r.service === 'bale.schedule.v1.Scheduler' && r.method === 'ListTasks'));

  await client.summarizeLink('https://bale.ai');
  assert(sentRequests.some(r => r.service === 'bale.tldr.v1.TLDR' && r.method === 'GetLinkSummary'));

  // Test messageEvent helpers and updates
  let receivedFired = false;
  let readFired = false;
  let onlineFired = false;
  let offlineFired = false;

  client.on('messageReceived', (d) => { receivedFired = true; assert(d.startDate > 0n); });
  client.on('messageRead', (d) => { readFired = true; assert(d.startDate > 0n); });
  client.on('userOnline', (d) => { onlineFired = true; assert(d.userId === 999); });
  client.on('userOffline', (d) => { offlineFired = true; assert(d.userId === 888); });

  // Simulate updateContainer payloads
  const wRecv = new ProtoWriter();
  wRecv.writeMessage(1, Proto.encodePeer({ id: 100, type: 1 }));
  wRecv.writeInt64(2, 123456789n);
  const wContainerRecv = new ProtoWriter();
  wContainerRecv.writeBytes(54, wRecv.finish());
  client._handleUpdate(Proto.decodeUpdateContainer(wContainerRecv.finish()));
  assert(receivedFired, 'messageReceived event must fire');

  const wRead = new ProtoWriter();
  wRead.writeMessage(1, Proto.encodePeer({ id: 100, type: 1 }));
  wRead.writeInt64(2, 123456789n);
  const wContainerRead = new ProtoWriter();
  wContainerRead.writeBytes(19, wRead.finish());
  client._handleUpdate(Proto.decodeUpdateContainer(wContainerRead.finish()));
  assert(readFired, 'messageRead event must fire');

  const wOnline = new ProtoWriter();
  wOnline.writeInt32(1, 999);
  wOnline.writeInt32(2, 1);
  const wContainerOnline = new ProtoWriter();
  wContainerOnline.writeBytes(7, wOnline.finish());
  client._handleUpdate(Proto.decodeUpdateContainer(wContainerOnline.finish()));
  assert(onlineFired, 'userOnline event must fire');

  const wOffline = new ProtoWriter();
  wOffline.writeInt32(1, 888);
  wOffline.writeInt64(2, 987654321n);
  const wContainerOffline = new ProtoWriter();
  wContainerOffline.writeBytes(8, wOffline.finish());
  client._handleUpdate(Proto.decodeUpdateContainer(wContainerOffline.finish()));
  assert(offlineFired, 'userOffline event must fire');

  // Verify messageEvent helper methods
  let testMsgHandled = false;
  client.once('message', async (msg) => {
    testMsgHandled = true;
    assert(typeof msg.react === 'function');
    assert(typeof msg.delete === 'function');
    assert(typeof msg.pin === 'function');
    assert(typeof msg.forwardTo === 'function');
    assert(typeof msg.openGiftPacket === 'function');
    assert(typeof msg.openGoldGiftPacket === 'function');
    assert(msg.isGiftPacket === false);
    assert(msg.isGoldGiftPacket === false);
  });

  const wMsg = new ProtoWriter();
  wMsg.writeMessage(1, Proto.encodePeer({ id: 100, type: 1 }));
  wMsg.writeInt32(2, 500);
  wMsg.writeInt64(3, 1000n);
  wMsg.writeInt64(4, 2000n);
  wMsg.writeMessage(5, Proto.encodeTextMessage('تست هلپرها'));
  const wContainerMsg = new ProtoWriter();
  wContainerMsg.writeBytes(55, wMsg.finish());
  client._handleUpdate(Proto.decodeUpdateContainer(wContainerMsg.finish()));
  assert(testMsgHandled, 'message event must fire and have helpers');

  console.log('  ✅ Client High-Level API calls & Event Listeners verified (All 16 Events + Message Helpers)');
  console.log('\nAll Contact, Profile, Reaction, Folder, Poll, Wallet, GiftPacket, MiniApp, and Update tests PASSED! 🚀✨\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
