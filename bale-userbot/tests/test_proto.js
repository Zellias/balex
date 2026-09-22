/**
 * Unit tests for Protobuf Wire Engine & Protocol Framing
 */

const assert = require('assert');
const { Proto, ProtoWriter, ProtoReader, PeerType } = require('../src/proto');

function runTests() {
  console.log('Testing Protobuf Wire & Framing...');

  // 1. Test Varint & basic primitives
  {
    const w = new ProtoWriter();
    w.writeUint32(1, 150);
    w.writeString(2, 'testing');
    w.writeBool(3, true);
    const buf = w.finish();

    const r = new ProtoReader(buf);
    const t1 = r.readTag();
    assert.strictEqual(t1.fieldNumber, 1);
    assert.strictEqual(Number(r.readVarint()), 150);

    const t2 = r.readTag();
    assert.strictEqual(t2.fieldNumber, 2);
    assert.strictEqual(r.readString(Number(r.readVarint())), 'testing');

    const t3 = r.readTag();
    assert.strictEqual(t3.fieldNumber, 3);
    assert.strictEqual(Number(r.readVarint()), 1);
    console.log('  ✅ Basic primitives encode/decode passed');
  }

  // 2. Test Handshake Request & Response
  {
    const hsReqBuf = Proto.encodeHandshakeRequest({ mkprotoVersion: 1, apiVersion: 171248 });
    const cmBuf = Proto.encodeClientMessage({ handshakeRequest: { mkprotoVersion: 1, apiVersion: 171248 } });
    assert(cmBuf.length > 0);

    const hsResBuf = new ProtoWriter();
    hsResBuf.writeInt32(1, 1);
    hsResBuf.writeInt64(2, 171248);
    hsResBuf.writeInt64(3, 1726910000000n);

    const smWriter = new ProtoWriter();
    smWriter.writeMessage(5, hsResBuf.finish());
    const smBuf = smWriter.finish();

    const smDecoded = Proto.decodeServerMessage(smBuf);
    assert(smDecoded.handshakeResponse !== null);
    assert.strictEqual(smDecoded.handshakeResponse.mkprotoVersion, 1);
    assert.strictEqual(smDecoded.handshakeResponse.apiVersion, 171248);
    assert.strictEqual(smDecoded.handshakeResponse.serverTime, 1726910000000n);
    console.log('  ✅ Handshake framing passed');
  }

  // 3. Test Ping & Pong
  {
    const pingBuf = Proto.encodeClientMessage({ ping: 12345n });
    assert(pingBuf.length > 0);

    const pongBuf = new ProtoWriter();
    pongBuf.writeInt64(1, 12345n);

    const smWriter = new ProtoWriter();
    smWriter.writeMessage(4, pongBuf.finish());
    const decoded = Proto.decodeServerMessage(smWriter.finish());
    assert(decoded.pong !== null);
    assert.strictEqual(decoded.pong.ID, 12345n);
    console.log('  ✅ Ping/Pong framing passed');
  }

  // 4. Test Metadata
  {
    const meta = {
      app_version: '171248',
      browser_type: '1',
      session_id: '99998888',
      is_bot: true
    };
    const metaBuf = Proto.encodeMetadata(meta);
    const decodedMeta = Proto.decodeMetadata(metaBuf);
    assert.strictEqual(decodedMeta.app_version, '171248');
    assert.strictEqual(decodedMeta.browser_type, '1');
    assert.strictEqual(decodedMeta.session_id, '99998888');
    assert.strictEqual(decodedMeta.is_bot, true);
    console.log('  ✅ Metadata serialization passed');
  }

  // 5. Test RPC Request & Response Framing
  {
    const reqBuf = Proto.encodeClientMessage({
      request: {
        index: 42,
        serviceName: 'bale.messaging.v2.Messaging',
        method: 'SendMessage',
        payload: Buffer.from([1, 2, 3, 4]),
        metadata: { app_version: '171248' }
      }
    });
    assert(reqBuf.length > 0);

    const resWriter = new ProtoWriter();
    resWriter.writeInt64(3, 42);
    resWriter.writeBytes(2, Buffer.from([9, 8, 7]));

    const smWriter = new ProtoWriter();
    smWriter.writeMessage(1, resWriter.finish());
    const decoded = Proto.decodeServerMessage(smWriter.finish());
    assert(decoded.response !== null);
    assert.strictEqual(decoded.response.index, 42);
    assert.deepStrictEqual(decoded.response.response, Buffer.from([9, 8, 7]));
    console.log('  ✅ RPC Request/Response framing passed');
  }

  // 6. Test SendMessage & TextMessage
  {
    const msgReq = Proto.encodeSendMessageRequest({
      peer: { type: PeerType.PRIVATE, id: 100200300 },
      rid: '987654321',
      message: {
        textMessage: {
          text: 'Hello from Bale Userbot!',
          mentions: [100200]
        }
      }
    });

    const r = new ProtoReader(msgReq);
    let peer = null;
    let rid = null;
    let text = null;
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) peer = Proto.decodePeer(r.readBytes(Number(r.readVarint())));
      else if (fieldNumber === 2) rid = r.readVarint().toString();
      else if (fieldNumber === 3) {
        const m = Proto.decodeMessage(r.readBytes(Number(r.readVarint())));
        text = m.textMessage.text;
      } else r.skip(wireType);
    }
    assert.strictEqual(peer.id, 100200300);
    assert.strictEqual(peer.type, PeerType.PRIVATE);
    assert.strictEqual(rid, '987654321');
    assert.strictEqual(text, 'Hello from Bale Userbot!');
    console.log('  ✅ SendMessage payload encoding passed');
  }

  // 7. Test Incoming Message Update Demuxing
  {
    const updateMsgWriter = new ProtoWriter();
    // Peer
    updateMsgWriter.writeMessage(1, Proto.encodePeer({ type: PeerType.GROUP, id: 5555 }));
    // SenderId
    updateMsgWriter.writeInt32(2, 7777);
    // Date
    updateMsgWriter.writeInt64(3, 1726900000000n);
    // RandomId
    updateMsgWriter.writeInt64(4, 123456789n);
    // Message
    updateMsgWriter.writeMessage(5, Proto.encodeMessage({
      textMessage: { text: 'Ping command received' }
    }));

    const updateContainer = new ProtoWriter();
    updateContainer.writeMessage(55, updateMsgWriter.finish()); // field 55 = message

    const decodedUpdate = Proto.decodeUpdateContainer(updateContainer.finish());
    assert.strictEqual(decodedUpdate.type, 'message');
    assert.strictEqual(decodedUpdate.data.senderId, 7777);
    assert.strictEqual(decodedUpdate.data.peer.id, 5555);
    assert.strictEqual(decodedUpdate.data.peer.type, PeerType.GROUP);
    assert.strictEqual(decodedUpdate.data.message.textMessage.text, 'Ping command received');
    console.log('  ✅ Incoming message update demuxing passed');
  }

  // 8. Test Stealth & Presence Encoders (Typing, Read Receipts, SetOnline)
  {
    const typingBuf = Proto.encodeTyping({
      peer: { type: PeerType.PRIVATE, id: 999 },
      typingType: 1
    });
    assert(typingBuf.length > 0);

    const readBuf = Proto.encodeMessageRead({
      peer: { type: PeerType.PRIVATE, id: 999 },
      date: 1726910000000n
    });
    assert(readBuf.length > 0);

    const onlineBuf = Proto.encodeSetOnline({
      isOnline: true,
      timeout: 90000,
      deviceType: 2
    });
    assert(onlineBuf.length > 0);
    console.log('  ✅ Stealth & Presence encoders passed');
  }

  console.log('\nAll Protobuf unit tests passed! ✨');
}

runTests();
