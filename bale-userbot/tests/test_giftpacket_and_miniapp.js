/**
 * Test Gift Packets (Cash & Gold), Mini App parameter engine, and comprehensive events dispatching.
 */

const assert = require('assert');
const {
  BaleClient,
  Proto,
  PeerType,
  MiniAppUtils,
  ScreenMode,
  MiniAppEvent,
  DefaultThemeParams
} = require('../index');

console.log('Testing Gift Packets, Mini Apps, and 60+ Event Catalog...');

// 1. Mini App Parameter Generation & Cryptographic Signatures
{
  const botToken = '123456789:ABCdefGhIJKlmNoPQRstuVWXyz';
  const user = {
    id: 987654321,
    first_name: 'Reza',
    last_name: 'BaleX',
    username: 'rezabalex',
    language_code: 'fa'
  };

  // Create initData
  const initData = MiniAppUtils.createInitData({
    user,
    queryId: 'AAH_test123',
    authDate: Math.floor(Date.now() / 1000),
    startParam: 'ref_user_100',
    botToken
  });

  assert(initData.includes('query_id=AAH_test123'));
  assert(initData.includes('hash='));
  assert(initData.includes('start_param=ref_user_100'));

  // Validate valid initData
  const validation = MiniAppUtils.validateInitData(initData, botToken);
  assert.strictEqual(validation.valid, true, 'initData should be cryptographically valid');

  // Parse initData
  const parsed = MiniAppUtils.parseInitData(initData);
  assert.strictEqual(parsed.query_id, 'AAH_test123');
  assert.strictEqual(parsed.start_param, 'ref_user_100');
  assert.strictEqual(parsed.user.id, 987654321);
  assert.strictEqual(parsed.user.first_name, 'Reza');

  // Tampered initData validation should fail
  const tamperedInitData = initData.replace('ref_user_100', 'ref_user_999');
  const tamperedValidation = MiniAppUtils.validateInitData(tamperedInitData, botToken);
  assert.strictEqual(tamperedValidation.valid, false, 'Tampered initData should fail validation');

  // Build Launch URL
  const launchUrl = MiniAppUtils.buildMiniAppUrl({
    webAppUrl: 'https://example-miniapp.bale.ai',
    initData,
    themeParams: { bg_color: '#1a1a1a', text_color: '#ffffff' }
  });

  assert(launchUrl.startsWith('https://example-miniapp.bale.ai/#'));
  assert(launchUrl.includes('tgWebAppData='));
  assert(launchUrl.includes('tgWebAppVersion=7.0'));
  assert(launchUrl.includes('tgWebAppPlatform=weba'));
  assert(launchUrl.includes('tgWebAppThemeParams='));

  console.log('  ✅ Mini App initData creation, HMAC-SHA256 signing, validation & launch URL passed');
}

// 2. BaleClient Mini App Integration
{
  const client = new BaleClient();
  assert(client.miniapp === MiniAppUtils);

  const initData = client.createInitData({
    queryId: 'AAH_client_test',
    startParam: 'bonus'
  });
  assert(initData.includes('query_id=AAH_client_test'));
  assert(initData.includes('start_param=bonus'));

  const parsed = client.parseInitData(initData);
  assert.strictEqual(parsed.query_id, 'AAH_client_test');
  assert.strictEqual(parsed.start_param, 'bonus');

  console.log('  ✅ BaleClient Mini App helper methods passed');
}

// 3. Cash Gift Packet & Gold Gift Packet Client Methods
{
  const client = new BaleClient();
  let lastRpc = null;

  // Mock connection.sendRequest
  client.connection.sendRequest = async (service, method, payload) => {
    lastRpc = { service, method, payload };
    if (service === 'bale.giftpacket.v1.GiftPacket' && method === 'OpenGiftPacket') {
      // Return dummy encoded OpenGiftPacketResponse
      const w = new (require('../src/proto').ProtoWriter)();
      w.writeInt32(2, 1); // status: ACTIVE
      w.writeInt32(3, 10); // winnerCount
      w.writeInt64(4, BigInt(50000)); // selfWinAmount / amount won: 50,000 Rials
      w.writeString(7, 'مبارک باشه!'); // description
      w.writeInt64(11, BigInt(500000)); // totalAmount
      w.writeString(15, 'هدیه نوروزی'); // message
      return w.finish();
    }
    if (service === 'bale.balebank.v1.GoldGiftPacket' && method === 'OpenGoldGiftPacket') {
      const w = new (require('../src/proto').ProtoWriter)();
      w.writeInt32(1, 1); // status
      w.writeInt64(2, BigInt(150)); // milligrams won: 150 mg
      return w.finish();
    }
    if (service === 'bale.balebank.v1.GoldGiftPacket' && method === 'GetWinnerIDs') {
      const w = new (require('../src/proto').ProtoWriter)();
      w.writeInt64(1, BigInt(111));
      w.writeInt64(1, BigInt(222));
      return w.finish();
    }
    return Buffer.alloc(0);
  };

  // Open & Claim Cash Gift Packet
  (async () => {
    const claimRes = await client.claimGiftPacket({
      peer: 12345,
      randomId: '987654321',
      date: 1700000000,
      walletId: 'WAL-123'
    });
    assert.strictEqual(lastRpc.service, 'bale.giftpacket.v1.GiftPacket');
    assert.strictEqual(lastRpc.method, 'OpenGiftPacket');
    assert.strictEqual(claimRes.isCurrentWinner, true);
    assert.strictEqual(claimRes.amount, 50000n);

    // getGiftPacket details
    const packetDetails = await client.getGiftPacket({
      peer: 12345,
      randomId: '987654321'
    });
    assert.strictEqual(packetDetails.status, 1);
    assert.strictEqual(packetDetails.description, 'مبارک باشه!');

    // getGiftPacketReceivers
    const receivers = await client.getGiftPacketReceivers({
      peer: 12345,
      randomId: '987654321'
    });
    assert(Array.isArray(receivers));

    // Open & Claim Gold Gift Packet
    const goldClaim = await client.claimGoldGiftPacket(55555n);
    assert.strictEqual(lastRpc.service, 'bale.balebank.v1.GoldGiftPacket');
    assert.strictEqual(lastRpc.method, 'OpenGoldGiftPacket');
    assert.strictEqual(goldClaim.amount, 150n);

    // Get Gold Winners
    const goldWinners = await client.getGoldWinners(55555n);
    assert.strictEqual(lastRpc.service, 'bale.balebank.v1.GoldGiftPacket');
    assert.strictEqual(lastRpc.method, 'GetWinnerIDs');
    assert.deepStrictEqual(goldWinners.winnerIds, [111, 222]);

    console.log('  ✅ Cash & Gold Gift Packet client methods (open, claim, receivers, winners) passed');
  })().catch(err => {
    console.error('Gift packet test failed:', err);
    process.exit(1);
  });
}

// 4. Message Event Gift Packet & Service Extensions
{
  const client = new BaleClient();
  let packetOpenedEventFired = false;
  let miniAppDataEventFired = false;
  let giftPacketEventFired = false;

  client.on('giftPacketOpened', (evt) => {
    packetOpenedEventFired = true;
    assert.strictEqual(evt.giftPacketId, 8888n);
    assert.strictEqual(evt.receiverUserId, 9999);
  });

  client.on('miniAppData', (evt) => {
    miniAppDataEventFired = true;
    assert.strictEqual(evt.data, 'cart_checked_out');
  });

  client.on('giftPacket', (msg) => {
    giftPacketEventFired = true;
    assert.strictEqual(msg.isGiftPacket, true);
    assert.strictEqual(msg.giftPacket.totalAmount, 1000000n);
    assert(typeof msg.claimGiftPacket === 'function');
    assert(typeof msg.getGiftPacketReceivers === 'function');
  });

  // Simulate incoming regular cash gift packet message
  client._handleUpdate({
    type: 'message',
    data: {
      senderId: 1001,
      peer: { type: PeerType.GROUP, id: 2002 },
      date: 1710000000,
      randomId: 3003,
      message: {
        giftPacketMessage: {
          giftCount: 5,
          totalAmount: 1000000n,
          regarding: 'شیرینی عید'
        }
      }
    }
  });

  assert.strictEqual(giftPacketEventFired, true);

  // Simulate incoming service message with gift packet opened extension
  client._handleUpdate({
    type: 'message',
    data: {
      senderId: 1001,
      peer: { type: PeerType.GROUP, id: 2002 },
      date: 1710000001,
      randomId: 3004,
      message: {
        serviceMessage: {
          text: 'یک پاکت هدیه باز شد',
          ext: {
            giftPacketOpened: {
              giftPacketId: 8888n,
              receiverUserId: 9999,
              amount: 200000n
            }
          }
        }
      }
    }
  });

  assert.strictEqual(packetOpenedEventFired, true);

  // Simulate incoming service message with mini app data sent
  client._handleUpdate({
    type: 'message',
    data: {
      senderId: 1001,
      peer: { type: PeerType.PRIVATE, id: 1001 },
      date: 1710000002,
      randomId: 3005,
      message: {
        serviceMessage: {
          text: 'Mini App Data',
          ext: {
            miniAppDataSent: {
              data: 'cart_checked_out',
              buttonText: 'تکمیل سفارش'
            }
          }
        }
      }
    }
  });

  assert.strictEqual(miniAppDataEventFired, true);

  console.log('  ✅ Gift packet messages, messageEvent actions & service extensions passed');
}

// 5. Exhaustive WebSocket Events Dispatching (60+ events)
{
  const client = new BaleClient();
  const receivedEvents = [];

  const testEventTypes = [
    'message', 'messageEdit', 'messageDelete', 'chatClear', 'chatDelete',
    'messageReceived', 'messageRead', 'messageReadByMe', 'chatShow', 'chatArchive',
    'chatFavourite', 'messageDateChanged', 'stickerCollectionsChanged', 'messageQuotedChanged',
    'mentionReadByMe', 'pinnedDialogsChanged', 'dialogsMarkedAsRead', 'dialogsMarkedAsUnread',
    'dialogsUnpinned', 'messagePinned', 'messagesUnPinned', 'dialogArchiveStatus',
    'messageStreamChunks', 'reaction', 'messageReactionsReadByMe', 'messageNewReaction',
    'typing', 'typingStop', 'userOnline', 'userOffline', 'userLastSeen',
    'userAvatarChanged', 'userNameChanged', 'userLocalNameChanged', 'userContactsChanged',
    'userNickChanged', 'userAboutChanged', 'userPreferredLanguagesChanged', 'userTimeZoneChanged',
    'userBotCommandsChanged', 'userBlocked', 'userUnblocked', 'phoneNumberChanged',
    'contactsAdded', 'contactsRemoved', 'allContactsRemoved', 'groupOnline',
    'groupNicknameChanged', 'groupMessagePinned', 'groupPinRemoved', 'groupRestrictionChanged',
    'groupTitleChanged', 'groupAvatarChanged', 'groupMemberChanged', 'groupExtChanged',
    'groupMembersUpdated', 'groupTopicChanged', 'groupAboutChanged', 'groupOwnerChanged',
    'groupHistoryShared', 'groupMembersCountChanged', 'groupMemberDiff', 'groupCanSendMessagesChanged',
    'groupCanViewMembersChanged', 'groupCanInviteMembersChanged', 'groupMemberAdminChanged',
    'groupBecameOrphaned', 'groupMemberPermissionsChanged', 'groupDefaultPermissionsChanged',
    'channelNickChanged', 'channelAdvertisementTypeChanged', 'channelAdTagIdChanged',
    'channelSignMessagesChanged', 'slowModeChanged', 'callStarted', 'callAccepted',
    'callDiscarded', 'callReceived', 'groupCallStarted', 'groupCallEnded', 'callReactionSent',
    'callUpgraded', 'peersInvited', 'multiPeerCallStarted', 'peersStateChanged'
  ];

  for (const evt of testEventTypes) {
    client.on(evt, (d) => receivedEvents.push(evt));
  }

  // Dispatch all updates through _handleUpdate
  for (const evt of testEventTypes) {
    if (evt === 'message') {
      client._handleUpdate({ type: 'message', data: { senderId: 1, peer: { type: 1, id: 1 }, date: 1, randomId: 1, message: {} } });
    } else {
      client._handleUpdate({ type: evt, data: { test: evt } });
    }
  }

  const receivedSet = new Set(receivedEvents);
  for (const evt of testEventTypes) {
    assert(receivedSet.has(evt), `Missing event: ${evt}`);
  }
  console.log(`  ✅ Exhaustive WebSocket event catalog verified (${receivedEvents.length} events received)`);
}

console.log('All Gift Packet, Mini App, and Event Catalog tests PASSED! 🚀✨');
