/**
 * Bale Protobuf & Wire Protocol Framing Engine
 * Self-contained, high-performance binary encoder/decoder.
 * Zero external dependencies.
 */

// Wire Types
const WIRE_VARINT = 0;
const WIRE_FIXED64 = 1;
const WIRE_BYTES = 2;
const WIRE_START_GROUP = 3;
const WIRE_END_GROUP = 4;
const WIRE_FIXED32 = 5;

// Peer Types
const PeerType = {
  UNKNOWN: 0,
  PRIVATE: 1,
  GROUP: 2,
  ENCRYPTED_PRIVATE: 3
};

const ExPeerType = {
  UNKNOWN: 0,
  PRIVATE: 1,
  GROUP: 2,
  CHANNEL: 3,
  BOT: 4,
  SUPERGROUP: 5,
  THREAD: 6
};

const TypingType = {
  UNKNOWN: 0,
  TEXT: 1,
  VOICE_RECORDING: 2,
  SENDING_VOICE: 3,
  SENDING_FILE: 4,
  SENDING_PHOTO: 5,
  SENDING_VIDEO: 6,
  SENDING_MUSIC: 7,
  CHOOSING_STICKER: 8,
  CHOOSING_GIF: 9,
  CREATING_GIFT_PACKET: 10,
  SENDING_ALBUM: 11,
  CHOOSING_EMOJI: 12
};

const DeviceType = {
  UNKNOWN: 0,
  GENERIC: 1,
  PC: 2,
  MOBILE: 3,
  TABLET: 4
};

// ==========================================
// Low-Level Protobuf Writer & Reader
// ==========================================

class ProtoWriter {
  constructor() {
    this.chunks = [];
  }

  writeTag(fieldNumber, wireType) {
    this.writeVarint((fieldNumber << 3) | wireType);
  }

  writeVarint(val) {
    if (val === undefined || val === null) return;
    if (typeof val === 'number') {
      if (isNaN(val) || !isFinite(val)) return;
      val = BigInt(Math.floor(val));
    } else if (typeof val === 'string') {
      try {
        val = BigInt(val);
      } catch (_) {
        return;
      }
    } else if (typeof val === 'boolean') {
      val = val ? 1n : 0n;
    } else if (typeof val === 'bigint') {
      // keep bigint
    } else if (typeof val === 'object') {
      if ('id' in val && typeof val.id === 'number') {
        return this.writeVarint(val.id);
      }
      return;
    } else {
      return;
    }

    if (val < 0n) {
      // 64-bit two's complement for negative integers
      val = BigInt.asUintN(64, val);
    }

    const bytes = [];
    while (val >= 0x80n) {
      bytes.push(Number((val & 0x7fn) | 0x80n));
      val >>= 7n;
    }
    bytes.push(Number(val & 0x7fn));
    this.chunks.push(Buffer.from(bytes));
  }

  writeUint32(fieldNumber, val) {
    if (val === undefined || val === null || val === 0) return;
    this.writeTag(fieldNumber, WIRE_VARINT);
    this.writeVarint(val);
  }

  writeInt32(fieldNumber, val) {
    if (val === undefined || val === null || val === 0) return;
    this.writeTag(fieldNumber, WIRE_VARINT);
    this.writeVarint(val);
  }

  writeInt64(fieldNumber, val) {
    if (val === undefined || val === null || val === 0 || val === '0' || val === 0n) return;
    this.writeTag(fieldNumber, WIRE_VARINT);
    this.writeVarint(val);
  }

  writeBool(fieldNumber, val) {
    if (val === undefined || val === null || val === false) return;
    this.writeTag(fieldNumber, WIRE_VARINT);
    this.writeVarint(val ? 1 : 0);
  }

  writeString(fieldNumber, str) {
    if (!str) return;
    const buf = Buffer.from(str, 'utf8');
    this.writeTag(fieldNumber, WIRE_BYTES);
    this.writeVarint(buf.length);
    this.chunks.push(buf);
  }

  writeBytes(fieldNumber, buf) {
    if (!buf || buf.length === 0) return;
    const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
    this.writeTag(fieldNumber, WIRE_BYTES);
    this.writeVarint(b.length);
    this.chunks.push(b);
  }

  writeMessage(fieldNumber, subMsgBuf) {
    if (!subMsgBuf || subMsgBuf.length === 0) return;
    this.writeBytes(fieldNumber, subMsgBuf);
  }

  finish() {
    return Buffer.concat(this.chunks);
  }
}

class ProtoReader {
  constructor(buffer) {
    this.buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    this.pos = 0;
    this.len = this.buf.length;
  }

  hasMore() {
    return this.pos < this.len;
  }

  readVarint() {
    let result = 0n;
    let shift = 0n;
    while (this.pos < this.len) {
      const byte = this.buf[this.pos++];
      result |= BigInt(byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) {
        return result;
      }
      shift += 7n;
    }
    return result;
  }

  readTag() {
    const v = Number(this.readVarint());
    return {
      fieldNumber: v >>> 3,
      wireType: v & 0x7
    };
  }

  readString(length) {
    const end = this.pos + length;
    if (end > this.len) throw new Error('Buffer overflow reading string');
    const str = this.buf.toString('utf8', this.pos, end);
    this.pos = end;
    return str;
  }

  readBytes(length) {
    const end = this.pos + length;
    if (end > this.len) throw new Error('Buffer overflow reading bytes');
    const b = this.buf.subarray(this.pos, end);
    this.pos = end;
    return b;
  }

  readSubReader(length) {
    const bytes = this.readBytes(length);
    return new ProtoReader(bytes);
  }

  skip(wireType) {
    switch (wireType) {
      case WIRE_VARINT:
        this.readVarint();
        break;
      case WIRE_FIXED64:
        this.pos += 8;
        break;
      case WIRE_BYTES:
        const len = Number(this.readVarint());
        this.pos += len;
        break;
      case WIRE_FIXED32:
        this.pos += 4;
        break;
      default:
        throw new Error(`Unsupported wireType: ${wireType}`);
    }
  }
}

// ==========================================
// Protocol Framing Models
// ==========================================

const Proto = {
  // Handshake
  encodeHandshakeRequest(req = {}) {
    const w = new ProtoWriter();
    w.writeInt32(1, req.mkprotoVersion || 1);
    w.writeInt64(2, req.apiVersion || 171248);
    return w.finish();
  },

  decodeHandshakeResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { mkprotoVersion: 0, apiVersion: 0, serverTime: 0n };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.mkprotoVersion = Number(r.readVarint());
      else if (fieldNumber === 2) res.apiVersion = Number(r.readVarint());
      else if (fieldNumber === 3) res.serverTime = r.readVarint();
      else r.skip(wireType);
    }
    return res;
  },

  // Ping / Pong
  encodePing(id) {
    const w = new ProtoWriter();
    w.writeInt64(1, id);
    return w.finish();
  },

  decodePong(buf) {
    const r = new ProtoReader(buf);
    let id = 0n;
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) id = r.readVarint();
      else r.skip(wireType);
    }
    return { ID: id };
  },

  // Metadata
  encodeMetadata(metaMap = {}) {
    const w = new ProtoWriter();
    for (const [k, v] of Object.entries(metaMap)) {
      if (v === undefined || v === null) continue;
      const itemWriter = new ProtoWriter();
      itemWriter.writeString(1, String(k));

      // Value wrapper
      const valWriter = new ProtoWriter();
      if (typeof v === 'boolean') {
        valWriter.writeBool(2, v);
      } else if (typeof v === 'number') {
        valWriter.writeInt32(3, v);
      } else {
        valWriter.writeString(1, String(v));
      }
      itemWriter.writeMessage(2, valWriter.finish());

      w.writeMessage(1, itemWriter.finish());
    }
    return w.finish();
  },

  decodeMetadata(buf) {
    const r = new ProtoReader(buf);
    const result = {};
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1 && wireType === WIRE_BYTES) {
        const itemLen = Number(r.readVarint());
        const itemReader = r.readSubReader(itemLen);
        let key = '';
        let strVal = '';
        while (itemReader.hasMore()) {
          const t = itemReader.readTag();
          if (t.fieldNumber === 1) key = itemReader.readString(Number(itemReader.readVarint()));
          else if (t.fieldNumber === 2) {
            const vLen = Number(itemReader.readVarint());
            const vReader = itemReader.readSubReader(vLen);
            while (vReader.hasMore()) {
              const vt = vReader.readTag();
              if (vt.fieldNumber === 1) strVal = vReader.readString(Number(vReader.readVarint()));
              else if (vt.fieldNumber === 2) strVal = vReader.readVarint() !== 0n;
              else if (vt.fieldNumber === 3) strVal = Number(vReader.readVarint());
              else vReader.skip(vt.wireType);
            }
          } else itemReader.skip(t.wireType);
        }
        if (key) result[key] = strVal;
      } else r.skip(wireType);
    }
    return result;
  },

  // RPC Request & Response
  encodeRequest({ index, serviceName, method, payload, metadata }) {
    const w = new ProtoWriter();
    w.writeString(1, serviceName);
    w.writeString(2, method);
    if (payload) w.writeBytes(3, payload);
    if (metadata) {
      const metaBuf = Buffer.isBuffer(metadata) ? metadata : Proto.encodeMetadata(metadata);
      w.writeMessage(4, metaBuf);
    }
    w.writeInt64(5, index);
    return w.finish();
  },

  decodeResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { error: null, response: null, index: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        res.error = r.readBytes(len);
      } else if (fieldNumber === 2) {
        const len = Number(r.readVarint());
        res.response = r.readBytes(len);
      } else if (fieldNumber === 3) {
        res.index = Number(r.readVarint());
      } else {
        r.skip(wireType);
      }
    }
    return res;
  },

  decodeErrorStatus(buf) {
    if (!buf || buf.length === 0) return null;
    const r = new ProtoReader(buf);
    const err = { code: 0, message: '', details: null };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) err.code = Number(r.readVarint());
      else if (fieldNumber === 2) err.message = r.readString(Number(r.readVarint()));
      else if (fieldNumber === 3) {
        const len = Number(r.readVarint());
        err.details = Proto.decodeMetadata(r.readBytes(len));
      } else r.skip(wireType);
    }
    return err;
  },

  // Top-Level WebSocket Frames
  encodeClientMessage({ request, ping, handshakeRequest }) {
    const w = new ProtoWriter();
    if (request) {
      const reqBuf = Proto.encodeRequest(request);
      w.writeMessage(1, reqBuf);
    }
    if (ping !== undefined) {
      const pingBuf = Proto.encodePing(ping);
      w.writeMessage(2, pingBuf);
    }
    if (handshakeRequest) {
      const hsBuf = Proto.encodeHandshakeRequest(handshakeRequest);
      w.writeMessage(3, hsBuf);
    }
    return w.finish();
  },

  decodeServerMessage(buf) {
    const r = new ProtoReader(buf);
    const msg = {
      response: null,
      update: null,
      terminateSession: false,
      pong: null,
      handshakeResponse: null
    };

    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        msg.response = Proto.decodeResponse(r.readBytes(len));
      } else if (fieldNumber === 2) {
        const len = Number(r.readVarint());
        const updateReader = r.readSubReader(len);
        let updateBytes = null;
        while (updateReader.hasMore()) {
          const ut = updateReader.readTag();
          if (ut.fieldNumber === 1) {
            const ulen = Number(updateReader.readVarint());
            updateBytes = updateReader.readBytes(ulen);
          } else updateReader.skip(ut.wireType);
        }
        msg.update = updateBytes;
      } else if (fieldNumber === 3) {
        msg.terminateSession = true;
        const len = Number(r.readVarint());
        r.readBytes(len);
      } else if (fieldNumber === 4) {
        const len = Number(r.readVarint());
        msg.pong = Proto.decodePong(r.readBytes(len));
      } else if (fieldNumber === 5) {
        const len = Number(r.readVarint());
        msg.handshakeResponse = Proto.decodeHandshakeResponse(r.readBytes(len));
      } else {
        r.skip(wireType);
      }
    }

    return msg;
  },

  // ==========================================
  // Domain Protobuf Models (Bale Messaging & Auth)
  // ==========================================

  encodePeer({ type = PeerType.PRIVATE, id = 0 }) {
    const w = new ProtoWriter();
    w.writeInt32(1, type);
    w.writeInt32(2, id);
    return w.finish();
  },

  decodePeer(buf) {
    const r = new ProtoReader(buf);
    const p = { type: 0, id: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) p.type = Number(r.readVarint());
      else if (fieldNumber === 2) p.id = Number(r.readVarint());
      else r.skip(wireType);
    }
    return p;
  },

  encodeTextMessage({ text, mentions = [] }) {
    const w = new ProtoWriter();
    w.writeString(1, text);
    for (const m of mentions) {
      w.writeInt32(2, m);
    }
    return w.finish();
  },

  decodeTextMessage(buf) {
    const r = new ProtoReader(buf);
    const m = { text: '', mentions: [] };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) m.text = r.readString(Number(r.readVarint()));
      else if (fieldNumber === 2) {
        if (wireType === WIRE_VARINT) {
          m.mentions.push(Number(r.readVarint()));
        } else if (wireType === WIRE_BYTES) {
          // packed repeated
          const end = r.pos + Number(r.readVarint());
          while (r.pos < end) m.mentions.push(Number(r.readVarint()));
        }
      } else r.skip(wireType);
    }
    return m;
  },

  encodeDocumentEx({ photo, video, voice, audio, gif }) {
    const w = new ProtoWriter();
    if (photo) {
      const pw = new ProtoWriter();
      if (photo.w) pw.writeInt32(1, photo.w);
      if (photo.h) pw.writeInt32(2, photo.h);
      w.writeMessage(1, pw.finish());
    } else if (video) {
      const vw = new ProtoWriter();
      if (video.w) vw.writeInt32(1, video.w);
      if (video.h) vw.writeInt32(2, video.h);
      if (video.duration) vw.writeInt32(3, video.duration);
      w.writeMessage(2, vw.finish());
    } else if (voice) {
      const vcw = new ProtoWriter();
      if (voice.duration) vcw.writeInt32(1, voice.duration);
      if (voice.waveForm) vcw.writeBytes(2, voice.waveForm);
      w.writeMessage(3, vcw.finish());
    } else if (gif) {
      const gw = new ProtoWriter();
      if (gif.w) gw.writeInt32(1, gif.w);
      if (gif.h) gw.writeInt32(2, gif.h);
      w.writeMessage(4, gw.finish());
    } else if (audio) {
      const aw = new ProtoWriter();
      if (audio.duration) aw.writeInt32(1, audio.duration);
      if (audio.title) aw.writeString(2, audio.title);
      if (audio.performer) aw.writeString(3, audio.performer);
      w.writeMessage(5, aw.finish());
    }
    return w.finish();
  },

  encodeDocumentMessage({ fileId, accessHash, fileSize, name, mimeType, ext, caption, thumb }) {
    const w = new ProtoWriter();
    if (fileId) w.writeInt64(1, fileId);
    if (accessHash) w.writeInt64(2, accessHash);
    if (fileSize) w.writeInt32(3, fileSize);
    if (name) w.writeString(4, name);
    if (mimeType) w.writeString(5, mimeType);
    if (thumb) w.writeMessage(6, thumb);
    if (ext) w.writeMessage(7, Proto.encodeDocumentEx(ext));
    if (caption) {
      const cw = new ProtoWriter();
      cw.writeString(1, typeof caption === 'string' ? caption : (caption.text || ''));
      w.writeMessage(8, cw.finish());
    }
    return w.finish();
  },

  encodeStickerMessage({ stickerId, accessHash, stickerPackId }) {
    const w = new ProtoWriter();
    if (stickerId) w.writeInt64(1, stickerId);
    if (accessHash) w.writeInt64(2, accessHash);
    if (stickerPackId) w.writeInt64(3, stickerPackId);
    return w.finish();
  },

  encodeGoldGiftPacketMessage({ packetId }) {
    const w = new ProtoWriter();
    if (packetId) w.writeString(1, String(packetId));
    return w.finish();
  },

  encodeMessage({ textMessage, documentMessage, stickerMessage, giftPacketMessage, goldGiftPacketMessage, pollMessage, templateMessage, templateMessageResponse }) {
    const w = new ProtoWriter();
    if (documentMessage) {
      w.writeMessage(4, Proto.encodeDocumentMessage(documentMessage));
    }
    if (stickerMessage) {
      w.writeMessage(12, Proto.encodeStickerMessage(stickerMessage));
    }
    if (templateMessage) {
      w.writeMessage(13, Buffer.isBuffer(templateMessage) ? templateMessage : Proto.encodeTemplateMessage(templateMessage));
    }
    if (templateMessageResponse) {
      w.writeMessage(14, Buffer.isBuffer(templateMessageResponse) ? templateMessageResponse : Proto.encodeTemplateMessageResponse(templateMessageResponse));
    }
    if (textMessage) {
      w.writeMessage(15, Proto.encodeTextMessage(textMessage));
    }
    if (giftPacketMessage) {
      w.writeMessage(17, Buffer.isBuffer(giftPacketMessage) ? giftPacketMessage : Proto.encodeGiftPacketMessage(giftPacketMessage));
    }
    if (goldGiftPacketMessage) {
      w.writeMessage(28, Buffer.isBuffer(goldGiftPacketMessage) ? goldGiftPacketMessage : Proto.encodeGoldGiftPacketMessage(goldGiftPacketMessage));
    }
    if (pollMessage) {
      w.writeMessage(29, Buffer.isBuffer(pollMessage) ? pollMessage : Proto.encodeCreatePoll(pollMessage));
    }
    return w.finish();
  },

  encodeTemplateMessageResponse({ tmrMessage, templateMessageResponseId = 0n, message }) {
    const w = new ProtoWriter();
    if (tmrMessage) w.writeString(1, String(tmrMessage));
    if (templateMessageResponseId) w.writeInt64(2, templateMessageResponseId);
    if (message) w.writeMessage(3, Proto.encodeMessage(message));
    return w.finish();
  },

  encodeTemplateMessage({ templateMessageId = 0n, text, buttons = [] }) {
    const w = new ProtoWriter();
    if (templateMessageId) w.writeInt64(1, templateMessageId);
    if (text) {
      const tw = new ProtoWriter();
      tw.writeString(1, String(text));
      w.writeMessage(2, tw.finish());
    }
    return w.finish();
  },

  decodeMessage(buf) {
    const r = new ProtoReader(buf);
    const res = {};
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 15) { // textMessage
        const len = Number(r.readVarint());
        res.textMessage = Proto.decodeTextMessage(r.readBytes(len));
      } else if (fieldNumber === 4) { // documentMessage
        const len = Number(r.readVarint());
        res.documentMessage = r.readBytes(len);
      } else if (fieldNumber === 11) { // serviceMessage
        const len = Number(r.readVarint());
        res.serviceMessage = Proto.decodeServiceMessage(r.readBytes(len));
      } else if (fieldNumber === 12) { // stickerMessage
        const len = Number(r.readVarint());
        res.stickerMessage = r.readBytes(len);
      } else if (fieldNumber === 17) { // giftPacketMessage
        const len = Number(r.readVarint());
        res.giftPacketMessage = Proto.decodeGiftPacketMessage(r.readBytes(len));
      } else if (fieldNumber === 27 || fieldNumber === 28) { // goldGiftPacketMessage
        const len = Number(r.readVarint());
        res.goldGiftPacketMessage = Proto.decodeGoldGiftPacketMessage(r.readBytes(len));
      } else if (fieldNumber === 29) { // pollMessage
        const len = Number(r.readVarint());
        res.pollMessage = r.readBytes(len);
      } else {
        r.skip(wireType);
      }
    }
    return res;
  },

  decodeServiceMessage(buf) {
    const r = new ProtoReader(buf);
    const res = { text: '', userIds: [], ext: {} };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        res.text = r.readString(Number(r.readVarint()));
      } else if (fieldNumber === 2) {
        res.userIds.push(Number(r.readVarint()));
      } else if (fieldNumber === 3) {
        const len = Number(r.readVarint());
        res.ext = Proto.decodeServiceEx(r.readBytes(len));
      } else {
        r.skip(wireType);
      }
    }
    return res;
  },

  decodeServiceEx(buf) {
    const r = new ProtoReader(buf);
    const ext = {};
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      const len = Number(r.readVarint());
      const subBuf = r.readBytes(len);
      if (fieldNumber === 17) { // serviceExGiftPacketOpened
        const sr = new ProtoReader(subBuf);
        ext.serviceExGiftPacketOpened = { userId: 0, msgRid: 0n, msgDate: 0n };
        while (sr.hasMore()) {
          const t = sr.readTag();
          if (t.fieldNumber === 1) ext.serviceExGiftPacketOpened.userId = Number(sr.readVarint());
          else if (t.fieldNumber === 2) ext.serviceExGiftPacketOpened.msgRid = sr.readVarint();
          else if (t.fieldNumber === 3) ext.serviceExGiftPacketOpened.msgDate = sr.readVarint();
          else sr.skip(t.wireType);
        }
      } else if (fieldNumber === 18) { // serviceExGiftPacketOpenedCompact
        const sr = new ProtoReader(subBuf);
        ext.serviceExGiftPacketOpenedCompact = { lastUserId: 0, othersCount: 0, msgRid: 0n, msgDate: 0n };
        while (sr.hasMore()) {
          const t = sr.readTag();
          if (t.fieldNumber === 1) ext.serviceExGiftPacketOpenedCompact.lastUserId = Number(sr.readVarint());
          else if (t.fieldNumber === 2) ext.serviceExGiftPacketOpenedCompact.othersCount = Number(sr.readVarint());
          else if (t.fieldNumber === 3) ext.serviceExGiftPacketOpenedCompact.msgRid = sr.readVarint();
          else if (t.fieldNumber === 4) ext.serviceExGiftPacketOpenedCompact.msgDate = sr.readVarint();
          else sr.skip(t.wireType);
        }
      } else if (fieldNumber === 23) { // serviceExMiniAppDataSent
        ext.serviceExMiniAppDataSent = { dataSent: true };
      } else if (fieldNumber === 10) { // serviceExGroupCreated
        ext.serviceExGroupCreated = { created: true };
      } else if (fieldNumber === 13) { // serviceExUserInvited
        const sr = new ProtoReader(subBuf);
        ext.serviceExUserInvited = { invitedUid: 0 };
        while (sr.hasMore()) {
          const t = sr.readTag();
          if (t.fieldNumber === 1) ext.serviceExUserInvited.invitedUid = Number(sr.readVarint());
          else sr.skip(t.wireType);
        }
      } else if (fieldNumber === 14) { // serviceExUserJoined
        ext.serviceExUserJoined = { joined: true };
      } else if (fieldNumber === 15) { // serviceExUserKicked
        const sr = new ProtoReader(subBuf);
        ext.serviceExUserKicked = { kickedUid: 0 };
        while (sr.hasMore()) {
          const t = sr.readTag();
          if (t.fieldNumber === 1) ext.serviceExUserKicked.kickedUid = Number(sr.readVarint());
          else sr.skip(t.wireType);
        }
      } else if (fieldNumber === 16) { // serviceExUserLeft
        ext.serviceExUserLeft = { left: true };
      } else if (fieldNumber === 20) { // serviceExGroupCallStarted
        ext.serviceExGroupCallStarted = { started: true };
      } else if (fieldNumber === 21) { // serviceExGroupCallEnded
        ext.serviceExGroupCallEnded = { ended: true };
      } else if (fieldNumber === 26) { // serviceExTopicCreated
        ext.serviceExTopicCreated = { created: true };
      } else {
        ext[`ext_${fieldNumber}`] = subBuf;
      }
    }
    return ext;
  },

  encodeSendMessageRequest({ peer, rid, message, isSilent = false }) {
    const w = new ProtoWriter();
    if (peer) {
      w.writeMessage(1, Proto.encodePeer(peer));
    }
    if (rid) {
      w.writeInt64(2, rid);
    }
    if (message) {
      w.writeMessage(3, Proto.encodeMessage(message));
    }
    if (isSilent) {
      w.writeBool(7, isSilent);
    }
    return w.finish();
  },

  decodeSendMessageResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { date: 0n, rid: 0n };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.date = r.readVarint();
      else if (fieldNumber === 2) res.rid = r.readVarint();
      else r.skip(wireType);
    }
    return res;
  },

  encodeUpdateMessage({ peer, rid, updatedMessage }) {
    const w = new ProtoWriter();
    if (peer) {
      w.writeMessage(1, Proto.encodePeer(peer));
    }
    if (rid) {
      w.writeInt64(2, rid);
    }
    if (updatedMessage) {
      w.writeMessage(3, Proto.encodeMessage(updatedMessage));
    }
    return w.finish();
  },

  encodeForwardMessages({ peer, rid = [], forwardedMessages = [], hideSender = false }) {
    const w = new ProtoWriter();
    if (peer) {
      w.writeMessage(1, Proto.encodePeer(peer));
    }
    const rids = Array.isArray(rid) ? rid : [rid];
    for (const r of rids) {
      w.writeInt64(2, r);
    }
    for (const fm of forwardedMessages) {
      const fmw = new ProtoWriter();
      if (fm.peer) fmw.writeMessage(1, Proto.encodePeer(fm.peer));
      if (fm.rid) fmw.writeInt64(2, fm.rid);
      if (fm.date) {
        const dw = new ProtoWriter();
        dw.writeInt64(1, fm.date);
        fmw.writeMessage(3, dw.finish());
      }
      w.writeMessage(3, fmw.finish());
    }
    if (hideSender) {
      w.writeBool(5, hideSender);
    }
    return w.finish();
  },

  // Auth RPC Models
  encodeStartPhoneAuth({ phoneNumber, deviceTitle = 'Node.js Userbot', appId = 4, apiKey = 'C28D46DC4C3A7A26564BFCC48B929086A95C93C98E789A19847BEE8627DE4E7D', deviceHash = '' }) {
    const w = new ProtoWriter();
    w.writeString(1, phoneNumber);
    w.writeString(2, deviceTitle);
    w.writeInt32(4, appId);
    w.writeString(5, apiKey);
    if (deviceHash) w.writeString(6, deviceHash);
    return w.finish();
  },

  decodeStartPhoneAuthResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { transactionHash: '' };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.transactionHash = r.readString(Number(r.readVarint()));
      else r.skip(wireType);
    }
    return res;
  },

  encodeValidateCode({ code, transactionHash, isJwt = true }) {
    const w = new ProtoWriter();
    w.writeString(1, String(code));
    w.writeString(2, String(transactionHash));
    w.writeBool(3, isJwt);
    return w.finish();
  },

  decodeValidateCodeResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { user: null, config: null, jwt: null };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 2) {
        // user
        const len = Number(r.readVarint());
        res.user = Proto.decodeUser(r.readBytes(len));
      } else if (fieldNumber === 3) {
        const len = Number(r.readVarint());
        r.readBytes(len); // config
      } else if (fieldNumber === 4) {
        // StringValue wrapper { value: jwt }
        const len = Number(r.readVarint());
        const sub = r.readSubReader(len);
        while (sub.hasMore()) {
          const st = sub.readTag();
          if (st.fieldNumber === 1) res.jwt = sub.readString(Number(sub.readVarint()));
          else sub.skip(st.wireType);
        }
      } else r.skip(wireType);
    }
    return res;
  },

  encodeValidatePassword({ password, transactionHash, isJwt = true }) {
    const w = new ProtoWriter();
    w.writeString(1, password);
    w.writeString(2, transactionHash);
    w.writeBool(3, isJwt);
    return w.finish();
  },

  decodeUser(buf) {
    const r = new ProtoReader(buf);
    const u = { id: 0, name: '', username: '', sex: 0, phone: '' };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) u.id = Number(r.readVarint());
      else if (fieldNumber === 2) u.name = r.readString(Number(r.readVarint()));
      else if (fieldNumber === 3) u.username = r.readString(Number(r.readVarint()));
      else if (fieldNumber === 4) u.sex = Number(r.readVarint());
      else if (fieldNumber === 5) u.phone = r.readString(Number(r.readVarint()));
      else r.skip(wireType);
    }
    return u;
  },

  normalizePhoneNumber(rawPhone) {
    if (!rawPhone) return 0n;
    const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let converted = String(rawPhone);
    for (let i = 0; i < 10; i++) {
      converted = converted.split(persian[i]).join(String(i)).split(arabic[i]).join(String(i));
    }
    let digits = converted.replace(/[^0-9]/g, '');
    if (digits.startsWith('0098')) {
      digits = '98' + digits.substring(4);
    } else if (digits.startsWith('0')) {
      digits = '98' + digits.substring(1);
    } else if (!digits.startsWith('98')) {
      digits = '98' + digits;
    }
    try {
      return BigInt(digits);
    } catch (_) {
      return 0n;
    }
  },

  normalizeCode(rawCode) {
    if (!rawCode) return '';
    const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let str = String(rawCode).trim();
    for (let i = 0; i < 10; i++) {
      str = str.split(persian[i]).join(String(i)).split(arabic[i]).join(String(i));
    }
    return str.replace(/[^0-9]/g, '');
  },

  // Contact Models
  encodeImportContacts(contacts = []) {
    const w = new ProtoWriter();
    for (const c of contacts) {
      const cw = new ProtoWriter();
      const phoneBigInt = typeof c.phoneNumber === 'bigint' ? c.phoneNumber : Proto.normalizePhoneNumber(c.phone || c.phoneNumber);
      cw.writeInt64(1, phoneBigInt);
      if (c.name) {
        const nw = new ProtoWriter();
        nw.writeString(1, String(c.name));
        cw.writeMessage(2, nw.finish());
      }
      w.writeMessage(1, cw.finish());
    }
    return w.finish();
  },

  decodeImportContactsResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { users: [], userPeers: [], seq: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) { // users
        const len = Number(r.readVarint());
        res.users.push(Proto.decodeUser(r.readBytes(len)));
      } else if (fieldNumber === 2) {
        res.seq = Number(r.readVarint());
      } else if (fieldNumber === 4) { // userPeers
        const len = Number(r.readVarint());
        res.userPeers.push(Proto.decodePeer(r.readBytes(len)));
      } else {
        r.skip(wireType);
      }
    }
    return res;
  },

  encodeAddContact({ uid, accessHash = 0n }) {
    const w = new ProtoWriter();
    w.writeInt32(1, Number(uid));
    w.writeInt64(2, accessHash);
    return w.finish();
  },

  encodeRemoveContact({ uid, accessHash = 0n }) {
    const w = new ProtoWriter();
    w.writeInt32(1, Number(uid));
    w.writeInt64(2, accessHash);
    return w.finish();
  },

  encodeSearchContacts(query) {
    const w = new ProtoWriter();
    w.writeString(1, String(query));
    return w.finish();
  },

  encodeEditName(name) {
    const w = new ProtoWriter();
    w.writeString(1, String(name));
    return w.finish();
  },

  encodeEditAbout(about) {
    const w = new ProtoWriter();
    const sub = new ProtoWriter();
    sub.writeString(1, String(about));
    w.writeMessage(1, sub.finish());
    return w.finish();
  },

  encodeEditNickName(nick) {
    const w = new ProtoWriter();
    const sub = new ProtoWriter();
    sub.writeString(1, String(nick));
    w.writeMessage(1, sub.finish());
    return w.finish();
  },

  encodeCheckNickName(nick) {
    const w = new ProtoWriter();
    w.writeString(1, String(nick));
    return w.finish();
  },

  encodeBlockUser(userId) {
    const w = new ProtoWriter();
    w.writeMessage(1, Proto.encodePeer({ type: PeerType.PRIVATE, id: Number(userId) }));
    return w.finish();
  },

  encodeUnblockUser(userId) {
    const w = new ProtoWriter();
    w.writeMessage(1, Proto.encodePeer({ type: PeerType.PRIVATE, id: Number(userId) }));
    return w.finish();
  },

  // Reaction Models
  encodeMessageSetReaction({ peer, rid, code, date = 0 }) {
    const w = new ProtoWriter();
    if (peer) w.writeMessage(1, Proto.encodePeer(peer));
    if (rid) w.writeInt64(2, rid);
    if (code) w.writeString(3, String(code));
    if (date) w.writeInt64(4, date);
    return w.finish();
  },

  encodeMessageRemoveReaction({ peer, rid, code, date = 0 }) {
    const w = new ProtoWriter();
    if (peer) w.writeMessage(1, Proto.encodePeer(peer));
    if (rid) w.writeInt64(2, rid);
    if (code) w.writeString(3, String(code));
    if (date) w.writeInt64(4, date);
    return w.finish();
  },

  // Folder Models
  encodeCreateFolder({ title, peerIds = [] }) {
    const w = new ProtoWriter();
    if (title) w.writeString(1, String(title));
    for (const id of peerIds) {
      w.writeMessage(2, Proto.encodePeer(typeof id === 'object' ? id : { type: PeerType.PRIVATE, id: Number(id) }));
    }
    return w.finish();
  },

  encodeDeleteFolder(id) {
    const w = new ProtoWriter();
    w.writeInt32(1, Number(id));
    return w.finish();
  },

  // Poll Models
  encodeCreatePoll({ question, options = [], isAnonymous = true, isMultipleChoice = false, isQuiz = false }) {
    const w = new ProtoWriter();
    w.writeString(1, String(question));
    for (const opt of options) {
      const ow = new ProtoWriter();
      ow.writeString(1, typeof opt === 'string' ? opt : (opt.text || ''));
      w.writeMessage(2, ow.finish());
    }
    w.writeBool(3, Boolean(isAnonymous));
    w.writeBool(4, Boolean(isMultipleChoice));
    w.writeBool(5, Boolean(isQuiz));
    return w.finish();
  },

  // ==========================================
  // Gift Packet Models (Cash & Gold)
  // ==========================================

  encodeGiftPacketMessage({ giftCount, totalAmount, givingType = 0, walletId, regarding, ownerUserId = 0, coverId = 1, showTotalAmount = true }) {
    const w = new ProtoWriter();
    if (giftCount) w.writeInt32(1, giftCount);
    if (totalAmount) w.writeInt64(2, totalAmount);
    if (givingType) w.writeInt32(3, givingType);
    if (walletId) {
      const sw = new ProtoWriter();
      sw.writeString(1, String(walletId));
      w.writeMessage(4, sw.finish());
    }
    if (regarding) {
      const sw = new ProtoWriter();
      sw.writeString(1, String(regarding));
      w.writeMessage(5, sw.finish());
    }
    if (ownerUserId) w.writeInt32(6, Number(ownerUserId));
    if (coverId) {
      const cw = new ProtoWriter();
      cw.writeInt32(1, Number(coverId));
      w.writeMessage(7, cw.finish());
    }
    if (showTotalAmount !== undefined) {
      const bw = new ProtoWriter();
      bw.writeBool(1, Boolean(showTotalAmount));
      w.writeMessage(8, bw.finish());
    }
    return w.finish();
  },

  decodeGiftPacketMessage(buf) {
    const r = new ProtoReader(buf);
    const res = { giftCount: 0, totalAmount: 0n, givingType: 0, walletId: '', regarding: '', ownerUserId: 0, coverId: 1, showTotalAmount: true };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.giftCount = Number(r.readVarint());
      else if (fieldNumber === 2) res.totalAmount = r.readVarint();
      else if (fieldNumber === 3) res.givingType = Number(r.readVarint());
      else if (fieldNumber === 4) {
        const len = Number(r.readVarint());
        res.walletId = Proto.decodeStringValue(r.readBytes(len));
      } else if (fieldNumber === 5) {
        const len = Number(r.readVarint());
        res.regarding = Proto.decodeStringValue(r.readBytes(len));
      } else if (fieldNumber === 6) res.ownerUserId = Number(r.readVarint());
      else if (fieldNumber === 7) {
        const len = Number(r.readVarint());
        res.coverId = Proto.decodeInt32Value(r.readBytes(len));
      } else if (fieldNumber === 8) {
        const len = Number(r.readVarint());
        res.showTotalAmount = Proto.decodeBoolValue(r.readBytes(len));
      } else {
        r.skip(wireType);
      }
    }
    return res;
  },

  decodeGoldGiftPacketMessage(buf) {
    const r = new ProtoReader(buf);
    const res = { packetId: '' };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.packetId = r.readString(Number(r.readVarint()));
      else r.skip(wireType);
    }
    return res;
  },

  encodeOpenGiftPacket({ msgIdentifier, receiverWalletId = '', pageNo = 1, orderType = 0 }) {
    const w = new ProtoWriter();
    if (msgIdentifier) {
      const mw = new ProtoWriter();
      if (msgIdentifier.peer) mw.writeMessage(1, Proto.encodePeer(msgIdentifier.peer));
      if (msgIdentifier.date) mw.writeInt64(2, BigInt(msgIdentifier.date));
      if (msgIdentifier.randomId) mw.writeInt64(3, BigInt(msgIdentifier.randomId));
      w.writeMessage(1, mw.finish());
    }
    if (receiverWalletId) w.writeString(2, String(receiverWalletId));
    if (pageNo) w.writeInt32(3, Number(pageNo));
    if (orderType) w.writeInt32(4, Number(orderType));
    return w.finish();
  },

  decodeGiftReceiver(buf) {
    const r = new ProtoReader(buf);
    const rec = { userId: 0, amount: 0n, date: 0n, rank: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) rec.userId = Number(r.readVarint());
      else if (fieldNumber === 2) rec.amount = r.readVarint();
      else if (fieldNumber === 3) rec.date = r.readVarint();
      else if (fieldNumber === 4) rec.rank = Number(r.readVarint());
      else r.skip(wireType);
    }
    return rec;
  },

  decodeOpenGiftPacketResponse(buf) {
    const r = new ProtoReader(buf);
    const res = {
      giftReceivers: [],
      receivers: [],
      status: 0,
      openedCount: 0,
      winnerCount: 0,
      selfWinAmount: 0n,
      amount: 0n,
      rank: 0,
      isCurrentWinner: false,
      userOutPeers: [],
      description: '',
      message: ''
    };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) { // giftReceivers
        if (wireType === 2) {
          const len = Number(r.readVarint());
          const rec = Proto.decodeGiftReceiver(r.readBytes(len));
          res.giftReceivers.push(rec);
          res.receivers.push(rec);
        } else {
          r.skip(wireType);
        }
      } else if (fieldNumber === 2) {
        res.status = Number(r.readVarint());
      } else if (fieldNumber === 3) {
        res.openedCount = Number(r.readVarint());
        res.winnerCount = res.openedCount;
      } else if (fieldNumber === 4) {
        if (wireType === 0) {
          res.selfWinAmount = r.readVarint();
        } else if (wireType === 2) {
          const len = Number(r.readVarint());
          const sub = new ProtoReader(r.readBytes(len));
          if (sub.hasMore()) {
            sub.readTag();
            res.selfWinAmount = sub.readVarint();
          }
        } else {
          r.skip(wireType);
        }
        res.amount = res.selfWinAmount;
        res.isCurrentWinner = Boolean(res.selfWinAmount > 0n);
      } else if (fieldNumber === 5) {
        res.rank = Number(r.readVarint());
      } else if (fieldNumber === 6) { // userOutPeers
        if (wireType === 2) {
          const len = Number(r.readVarint());
          res.userOutPeers.push(Proto.decodePeer(r.readBytes(len)));
        } else {
          r.skip(wireType);
        }
      } else if (fieldNumber === 7) {
        if (wireType === 2) res.description = r.readString(Number(r.readVarint()));
        else r.skip(wireType);
      } else if (fieldNumber === 15) {
        if (wireType === 2) res.message = r.readString(Number(r.readVarint()));
        else r.skip(wireType);
      } else {
        r.skip(wireType);
      }
    }
    return res;
  },

  encodeSendGiftPacketWithWallet({ peer, randomId = 0n, message, sourceWalletId = '' }) {
    const w = new ProtoWriter();
    if (peer) w.writeMessage(1, Proto.encodePeer(peer));
    if (randomId) w.writeInt64(2, BigInt(randomId));
    if (message) {
      w.writeMessage(3, Buffer.isBuffer(message) ? message : Proto.encodeMessage(message));
    }
    if (sourceWalletId) w.writeString(4, String(sourceWalletId));
    return w.finish();
  },

  decodeSendGiftPacketWithWalletResponse(buf) {
    return { success: true };
  },

  encodeGetGiftPacketPaymentToken({ token = '', amount = 0n, peer, message }) {
    const w = new ProtoWriter();
    if (token) w.writeString(1, String(token));
    if (amount) w.writeInt64(2, BigInt(amount));
    if (peer) w.writeMessage(3, Proto.encodePeer(peer));
    if (message) {
      w.writeMessage(4, Buffer.isBuffer(message) ? message : Proto.encodeMessage(message));
    }
    return w.finish();
  },

  decodeGetGiftPacketPaymentTokenResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { paymentToken: '' };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.paymentToken = r.readString(Number(r.readVarint()));
      else r.skip(wireType);
    }
    return res;
  },

  encodeOpenGoldGiftPacket({ giftPacketId }) {
    const w = new ProtoWriter();
    if (giftPacketId) w.writeInt64(1, BigInt(giftPacketId));
    return w.finish();
  },

  decodeOpenGoldGiftPacketResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { openedCount: 0, selfWinAmount: 0n, amount: 0n, rank: 0, giftReceivers: [], receivers: [], status: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.openedCount = Number(r.readVarint());
      else if (fieldNumber === 2) {
        res.selfWinAmount = r.readVarint();
        res.amount = res.selfWinAmount;
      } else if (fieldNumber === 3) res.rank = Number(r.readVarint());
      else if (fieldNumber === 4) {
        if (wireType === 2) {
          const len = Number(r.readVarint());
          const rec = Proto.decodeGiftReceiver(r.readBytes(len));
          res.giftReceivers.push(rec);
          res.receivers.push(rec);
        } else {
          r.skip(wireType);
        }
      } else if (fieldNumber === 5) res.status = Number(r.readVarint());
      else r.skip(wireType);
    }
    return res;
  },

  encodeSendGoldGiftPacket({ amount, count, description = '', givingType = 0, randomId = 0n, peer }) {
    const w = new ProtoWriter();
    if (amount) w.writeInt64(2, BigInt(amount));
    if (count) w.writeInt64(3, BigInt(count));
    if (description) w.writeString(4, String(description));
    if (givingType) w.writeInt32(5, Number(givingType));
    if (randomId) w.writeInt64(6, BigInt(randomId));
    if (peer) w.writeMessage(7, Proto.encodePeer(peer));
    return w.finish();
  },

  decodeSendGoldGiftPacketResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { giftPacketId: 0n };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.giftPacketId = r.readVarint();
      else r.skip(wireType);
    }
    return res;
  },

  encodeGetWinnerIDs({ giftPacketId }) {
    const w = new ProtoWriter();
    if (giftPacketId) w.writeInt64(1, BigInt(giftPacketId));
    return w.finish();
  },

  decodeGetWinnerIDsResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { winnerIds: [], totalCount: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        if (wireType === WIRE_BYTES) {
          const len = Number(r.readVarint());
          const sub = new ProtoReader(r.readBytes(len));
          while (sub.hasMore()) res.winnerIds.push(Number(sub.readVarint()));
        } else {
          res.winnerIds.push(Number(r.readVarint()));
        }
      } else if (fieldNumber === 2) {
        res.totalCount = Number(r.readVarint());
      } else {
        r.skip(wireType);
      }
    }
    return res;
  },

  // ==========================================
  // Mini App / WebApp Models (Appzar & Ketf)
  // ==========================================

  encodeGetWebappHash({ botUserId, data = '' }) {
    const w = new ProtoWriter();
    if (botUserId) w.writeInt32(1, Number(botUserId));
    if (data) w.writeString(2, String(data));
    return w.finish();
  },

  decodeGetWebappHashResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { hash: '', queryId: '', authDate: 0n };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.hash = r.readString(Number(r.readVarint()));
      else if (fieldNumber === 2) res.queryId = r.readString(Number(r.readVarint()));
      else if (fieldNumber === 3) res.authDate = r.readVarint();
      else r.skip(wireType);
    }
    return res;
  },

  encodeSendMiniAppData({ botUserId, queryId, data, buttonText }) {
    const w = new ProtoWriter();
    if (botUserId) w.writeInt32(1, Number(botUserId));
    if (queryId) {
      const qw = new ProtoWriter();
      qw.writeString(1, String(queryId));
      w.writeMessage(2, qw.finish());
    }
    if (data) {
      const dw = new ProtoWriter();
      dw.writeString(1, typeof data === 'string' ? data : JSON.stringify(data));
      w.writeMessage(3, dw.finish());
    }
    if (buttonText) {
      const bw = new ProtoWriter();
      bw.writeString(1, String(buttonText));
      w.writeMessage(4, bw.finish());
    }
    return w.finish();
  },

  decodeSendMiniAppDataResponse(buf) {
    return { success: true };
  },

  encodeGetMiniAppUrl({ botUserId, screenMode = 0, themeParams, main, menuButton, keyboardButton, directLink }) {
    const w = new ProtoWriter();
    if (botUserId) w.writeInt32(1, Number(botUserId));
    if (screenMode) w.writeInt32(2, Number(screenMode));
    if (themeParams) {
      w.writeMessage(3, Proto.encodeBySchema(themeParams, null));
    }
    if (main) w.writeMessage(4, Proto.encodeBySchema(main, null));
    if (menuButton) w.writeMessage(5, Proto.encodeBySchema(menuButton, null));
    if (keyboardButton) w.writeMessage(6, Proto.encodeBySchema(keyboardButton, null));
    if (directLink) {
      const lw = new ProtoWriter();
      lw.writeString(1, String(directLink));
      w.writeMessage(7, lw.finish());
    }
    return w.finish();
  },

  decodeGetMiniAppUrlResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { url: '', screenMode: 0, queryId: '' };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) res.url = r.readString(Number(r.readVarint()));
      else if (fieldNumber === 2) res.screenMode = Number(r.readVarint());
      else if (fieldNumber === 3) res.queryId = r.readString(Number(r.readVarint()));
      else r.skip(wireType);
    }
    return res;
  },

  encodeGetMenuButton({ botUserId }) {
    const w = new ProtoWriter();
    if (botUserId) w.writeInt32(1, Number(botUserId));
    return w.finish();
  },

  decodeGetMenuButtonResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { menuButton: null };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        const sub = new ProtoReader(r.readBytes(len));
        const btn = { commands: null, miniApp: null };
        while (sub.hasMore()) {
          const t = sub.readTag();
          if (t.fieldNumber === 1) btn.commands = {};
          else if (t.fieldNumber === 2) {
            const mLen = Number(sub.readVarint());
            const mr = new ProtoReader(sub.readBytes(mLen));
            btn.miniApp = { text: '', url: '' };
            while (mr.hasMore()) {
              const mt = mr.readTag();
              if (mt.fieldNumber === 1) btn.miniApp.text = mr.readString(Number(mr.readVarint()));
              else if (mt.fieldNumber === 2) btn.miniApp.url = mr.readString(Number(mr.readVarint()));
              else mr.skip(mt.wireType);
            }
          } else sub.skip(t.wireType);
        }
        res.menuButton = btn;
      } else {
        r.skip(wireType);
      }
    }
    return res;
  },

  encodeInvokeCustomMethod({ botUserId, method, params = '' }) {
    const w = new ProtoWriter();
    if (botUserId) w.writeInt32(1, Number(botUserId));
    if (method) w.writeString(2, String(method));
    if (params) w.writeString(3, typeof params === 'object' ? JSON.stringify(params) : String(params));
    return w.finish();
  },

  decodeInvokeCustomMethodResponse(buf) {
    const r = new ProtoReader(buf);
    const res = { data: '' };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 4) res.data = r.readString(Number(r.readVarint()));
      else r.skip(wireType);
    }
    return res;
  },

  // Generic Update decoder helper
  decodeGenericUpdate(buf) {
    if (!buf) return {};
    const r = new ProtoReader(buf);
    const res = {};
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (wireType === WIRE_VARINT) {
        res[`f${fieldNumber}`] = r.readVarint();
      } else if (wireType === WIRE_BYTES) {
        const len = Number(r.readVarint());
        const b = r.readBytes(len);
        try {
          // Attempt peer decoding for field 1 if matching peer size
          if (fieldNumber === 1 && (b.length === 3 || b.length === 4 || b.length === 5)) {
            res.peer = Proto.decodePeer(b);
          } else {
            res[`f${fieldNumber}`] = b.toString('utf8');
          }
        } catch {
          res[`f${fieldNumber}`] = b;
        }
      } else {
        r.skip(wireType);
      }
    }
    return res;
  },

  // Incoming Complete Update Decoder (All 60+ official Bale WebSocket events)
  decodeUpdateContainer(buf) {
    if (!buf || buf.length === 0) return null;
    const r = new ProtoReader(buf);
    const result = { type: 'unknown', data: null, raw: buf };

    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      const len = (wireType === WIRE_BYTES) ? Number(r.readVarint()) : 0;
      const subBuf = len > 0 ? r.readBytes(len) : null;

      switch (fieldNumber) {
        // ==========================================
        // Messaging Events
        // ==========================================
        case 55:
          result.type = 'message';
          result.data = Proto.decodeUpdateMessage(subBuf);
          break;
        case 162:
          result.type = 'messageEdit';
          result.data = Proto.decodeUpdateMessageContentChanged(subBuf);
          break;
        case 46:
          result.type = 'messageDelete';
          result.data = Proto.decodeUpdateMessageDelete(subBuf);
          break;
        case 47:
          result.type = 'chatClear';
          result.data = Proto.decodeUpdateChatClear(subBuf);
          break;
        case 48:
          result.type = 'chatDelete';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54:
          result.type = 'messageReceived';
          result.data = Proto.decodeUpdateMessageReceived(subBuf);
          break;
        case 19:
          result.type = 'messageRead';
          result.data = Proto.decodeUpdateMessageRead(subBuf);
          break;
        case 50:
          result.type = 'messageReadByMe';
          result.data = Proto.decodeUpdateMessageRead(subBuf);
          break;
        case 93:
          result.type = 'chatShow';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 94:
          result.type = 'chatArchive';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 95:
          result.type = 'chatFavourite';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 163:
          result.type = 'messageDateChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 164:
          result.type = 'stickerCollectionsChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 169:
          result.type = 'messageQuotedChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52829:
          result.type = 'mentionReadByMe';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52830:
          result.type = 'pinnedDialogsChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54335:
          result.type = 'dialogsMarkedAsRead';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54336:
          result.type = 'dialogsMarkedAsUnread';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54339:
          result.type = 'dialogsUnpinned';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54340:
          result.type = 'messagePinned';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54341:
          result.type = 'messagesUnPinned';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54345:
          result.type = 'dialogArchiveStatus';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54351:
          result.type = 'messageStreamChunks';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;

        // ==========================================
        // Reactions
        // ==========================================
        case 222:
        case 52825:
          result.type = 'reaction';
          result.data = Proto.decodeUpdateReactions(subBuf);
          break;
        case 52832:
          result.type = 'messageReactionsReadByMe';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54323:
          result.type = 'messageNewReaction';
          result.data = Proto.decodeUpdateReactions(subBuf);
          break;

        // ==========================================
        // Typing & Presence
        // ==========================================
        case 6:
          result.type = 'typing';
          result.data = Proto.decodeUpdateTyping(subBuf);
          break;
        case 81:
          result.type = 'typingStop';
          result.data = Proto.decodeUpdateTypingStop(subBuf);
          break;
        case 7:
          result.type = 'userOnline';
          result.data = Proto.decodeUpdateUserOnline(subBuf);
          break;
        case 8:
          result.type = 'userOffline';
          result.data = Proto.decodeUpdateUserOffline(subBuf);
          break;
        case 9:
          result.type = 'userLastSeen';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;

        // ==========================================
        // Users & Contacts
        // ==========================================
        case 16:
          result.type = 'userAvatarChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 32:
          result.type = 'userNameChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 51:
          result.type = 'userLocalNameChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 134:
          result.type = 'userContactsChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 209:
          result.type = 'userNickChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 210:
          result.type = 'userAboutChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 212:
          result.type = 'userPreferredLanguagesChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 216:
          result.type = 'userTimeZoneChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 217:
          result.type = 'userBotCommandsChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2629:
          result.type = 'userBlocked';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2630:
          result.type = 'userUnblocked';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52803:
          result.type = 'phoneNumberChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 40:
          result.type = 'contactsAdded';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 41:
          result.type = 'contactsRemoved';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54353:
          result.type = 'allContactsRemoved';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;

        // ==========================================
        // Groups & Channels
        // ==========================================
        case 33:
          result.type = 'groupOnline';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 57:
          result.type = 'groupNicknameChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 721:
          result.type = 'groupMessagePinned';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 722:
          result.type = 'groupPinRemoved';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 723:
          result.type = 'groupRestrictionChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2609:
          result.type = 'groupTitleChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2610:
          result.type = 'groupAvatarChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2612:
          result.type = 'groupMemberChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2613:
          result.type = 'groupExtChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2614:
          result.type = 'groupMembersUpdated';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2616:
          result.type = 'groupTopicChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2617:
          result.type = 'groupAboutChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2619:
          result.type = 'groupOwnerChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2620:
          result.type = 'groupHistoryShared';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2622:
          result.type = 'groupMembersCountChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2623:
          result.type = 'groupMemberDiff';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2624:
          result.type = 'groupCanSendMessagesChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2625:
          result.type = 'groupCanViewMembersChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2626:
          result.type = 'groupCanInviteMembersChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2627:
          result.type = 'groupMemberAdminChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2628:
          result.type = 'groupBecameOrphaned';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52804:
          result.type = 'groupMemberPermissionsChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52805:
          result.type = 'groupDefaultPermissionsChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 2880:
          result.type = 'channelNickChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52801:
          result.type = 'channelAdvertisementTypeChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52802:
          result.type = 'channelAdTagIdChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54354:
          result.type = 'channelSignMessagesChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54355:
          result.type = 'slowModeChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;

        // ==========================================
        // Calls
        // ==========================================
        case 52807:
          result.type = 'callStarted';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52808:
          result.type = 'callAccepted';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52809:
          result.type = 'callDiscarded';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52810:
          result.type = 'callReceived';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52811:
          result.type = 'groupCallStarted';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52812:
          result.type = 'groupCallEnded';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52813:
          result.type = 'callReactionSent';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52816:
          result.type = 'callUpgraded';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52817:
          result.type = 'peersInvited';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52818:
          result.type = 'multiPeerCallStarted';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52819:
          result.type = 'peersStateChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52826:
          result.type = 'callLinkGenerated';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52827:
          result.type = 'callJoinRequestReceived';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52828:
          result.type = 'callJoinRequestAnswered';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54324:
          result.type = 'callEvent';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54338:
          result.type = 'callAction';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;

        // ==========================================
        // Wallet & Banking
        // ==========================================
        case 62732:
          result.type = 'walletUpdated';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 62753:
          result.type = 'walletBalanceUpdated';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 62398:
          result.type = 'requestBankiAccessFor';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;

        // ==========================================
        // Folders & Topics
        // ==========================================
        case 54332:
          result.type = 'folderCreated';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54333:
          result.type = 'folderDeleted';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54334:
          result.type = 'foldersReordered';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54337:
          result.type = 'folderEdited';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54348:
          result.type = 'topicCreated';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54349:
          result.type = 'topicEdited';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54350:
          result.type = 'topicDeleted';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;

        // ==========================================
        // Live & Media
        // ==========================================
        case 54328:
          result.type = 'startLive';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54329:
          result.type = 'endLive';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52820:
          result.type = 'savedGifsChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 52814:
          result.type = 'stickerPacksChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;

        // ==========================================
        // Bot & Misc
        // ==========================================
        case 54342:
          result.type = 'transcriptReady';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54343:
          result.type = 'generalNotificationMessage';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54344:
          result.type = 'askBotReview';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54346:
          result.type = 'premiumPurchaseStatus';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54347:
          result.type = 'endpointChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;
        case 54356:
          result.type = 'aiEnableChanged';
          result.data = Proto.decodeGenericUpdate(subBuf);
          break;

        default:
          if (subBuf) {
            result.data = Proto.decodeGenericUpdate(subBuf);
          } else {
            r.skip(wireType);
          }
          break;
      }
    }

    return result;
  },

  decodeUpdateMessageContentChanged(buf) {
    const r = new ProtoReader(buf);
    const m = { peer: null, rid: 0n, message: null, date: 0n, updaterUserId: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        m.peer = Proto.decodePeer(r.readBytes(len));
      } else if (fieldNumber === 2) {
        m.rid = r.readVarint();
      } else if (fieldNumber === 3) {
        const len = Number(r.readVarint());
        m.message = Proto.decodeMessage(r.readBytes(len));
      } else if (fieldNumber === 4) {
        m.date = r.readVarint();
      } else if (fieldNumber === 5) {
        m.updaterUserId = Number(r.readVarint());
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateMessageDelete(buf) {
    const r = new ProtoReader(buf);
    const m = { peer: null, rids: [] };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        m.peer = Proto.decodePeer(r.readBytes(len));
      } else if (fieldNumber === 2) {
        if (wireType === WIRE_BYTES) {
          const len = Number(r.readVarint());
          const subR = new ProtoReader(r.readBytes(len));
          while (subR.hasMore()) m.rids.push(subR.readVarint());
        } else {
          m.rids.push(r.readVarint());
        }
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateChatClear(buf) {
    const r = new ProtoReader(buf);
    const m = { peer: null };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        m.peer = Proto.decodePeer(r.readBytes(len));
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateReactions(buf) {
    const r = new ProtoReader(buf);
    const m = { peer: null, rid: 0n, reactions: [], reactionByMe: false };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        m.peer = Proto.decodePeer(r.readBytes(len));
      } else if (fieldNumber === 2) {
        m.rid = r.readVarint();
      } else if (fieldNumber === 3) {
        const len = Number(r.readVarint());
        const sub = new ProtoReader(r.readBytes(len));
        let code = '', count = 0, isSelf = false;
        while (sub.hasMore()) {
          const t = sub.readTag();
          if (t.fieldNumber === 1) code = sub.readString(Number(sub.readVarint()));
          else if (t.fieldNumber === 2) count = Number(sub.readVarint());
          else if (t.fieldNumber === 3) isSelf = sub.readVarint() !== 0n;
          else sub.skip(t.wireType);
        }
        m.reactions.push({ code, count, isSelf });
      } else if (fieldNumber === 4) {
        m.reactionByMe = r.readVarint() !== 0n;
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateTypingStop(buf) {
    const r = new ProtoReader(buf);
    const m = { peer: null, userId: 0, typingType: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        m.peer = Proto.decodePeer(r.readBytes(len));
      } else if (fieldNumber === 2) {
        m.userId = Number(r.readVarint());
      } else if (fieldNumber === 3) {
        m.typingType = Number(r.readVarint());
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateTyping(buf) {
    const r = new ProtoReader(buf);
    const m = { peer: null, userId: 0, typingType: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        m.peer = Proto.decodePeer(r.readBytes(len));
      } else if (fieldNumber === 2) {
        m.userId = Number(r.readVarint());
      } else if (fieldNumber === 3) {
        m.typingType = Number(r.readVarint());
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateMessageReceived(buf) {
    const r = new ProtoReader(buf);
    const m = { peer: null, startDate: 0n, date: 0n };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        m.peer = Proto.decodePeer(r.readBytes(len));
      } else if (fieldNumber === 2) {
        m.startDate = r.readVarint();
        m.date = m.startDate;
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateMessageRead(buf) {
    const r = new ProtoReader(buf);
    const m = { peer: null, startDate: 0n, date: 0n };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        const len = Number(r.readVarint());
        m.peer = Proto.decodePeer(r.readBytes(len));
      } else if (fieldNumber === 2) {
        m.startDate = r.readVarint();
        m.date = m.startDate;
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateUserOnline(buf) {
    const r = new ProtoReader(buf);
    const m = { userId: 0, deviceType: 0 };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        m.userId = Number(r.readVarint());
      } else if (fieldNumber === 2) {
        m.deviceType = Number(r.readVarint());
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateUserOffline(buf) {
    const r = new ProtoReader(buf);
    const m = { userId: 0, lastSeen: 0n };
    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) {
        m.userId = Number(r.readVarint());
      } else if (fieldNumber === 2) {
        m.lastSeen = r.readVarint();
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  decodeUpdateMessage(buf) {
    const r = new ProtoReader(buf);
    const m = {
      peer: null,
      senderId: 0,
      date: 0n,
      randomId: 0n,
      message: null
    };

    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      if (fieldNumber === 1) { // peer
        const len = Number(r.readVarint());
        m.peer = Proto.decodePeer(r.readBytes(len));
      } else if (fieldNumber === 2) { // senderId
        m.senderId = Number(r.readVarint());
      } else if (fieldNumber === 3) { // date
        m.date = r.readVarint();
      } else if (fieldNumber === 4) { // randomId
        m.randomId = r.readVarint();
      } else if (fieldNumber === 5) { // message
        const len = Number(r.readVarint());
        m.message = Proto.decodeMessage(r.readBytes(len));
      } else {
        r.skip(wireType);
      }
    }
    return m;
  },

  encodeTyping(req = {}) {
    const w = new ProtoWriter();
    if (req.peer) {
      w.writeMessage(1, Proto.encodePeer(req.peer));
    }
    w.writeInt32(2, req.typingType !== undefined ? req.typingType : TypingType.TEXT);
    return w.finish();
  },

  encodeStopTyping(req = {}) {
    const w = new ProtoWriter();
    if (req.peer) {
      w.writeMessage(1, Proto.encodePeer(req.peer));
    }
    w.writeInt32(2, req.typingType !== undefined ? req.typingType : TypingType.TEXT);
    return w.finish();
  },

  encodeMessageRead(req = {}) {
    const w = new ProtoWriter();
    if (req.peer) {
      w.writeMessage(1, Proto.encodePeer(req.peer));
    }
    if (req.date !== undefined && req.date !== null) {
      w.writeInt64(2, BigInt(req.date));
    }
    if (req.exPeer) {
      w.writeMessage(3, Proto.encodeExPeer(req.exPeer));
    }
    return w.finish();
  },

  encodeMessageReceived(req = {}) {
    const w = new ProtoWriter();
    if (req.peer) {
      w.writeMessage(1, Proto.encodePeer(req.peer));
    }
    if (req.date !== undefined && req.date !== null) {
      w.writeInt64(2, BigInt(req.date));
    }
    return w.finish();
  },

  encodeSetOnline(req = {}) {
    const w = new ProtoWriter();
    w.writeBool(1, req.isOnline !== undefined ? Boolean(req.isOnline) : true);
    w.writeInt64(2, BigInt(req.timeout || 90000));
    w.writeInt32(3, req.deviceType || 0);
    return w.finish();
  },

  encodeBySchema(obj, schema) {
    if (!obj) return Buffer.alloc(0);
    if (Buffer.isBuffer(obj)) return obj;
    if (typeof obj !== 'object') return Buffer.alloc(0);

    const w = new ProtoWriter();
    const fields = (schema && schema.fields) ? schema.fields : [];
    const fieldMap = new Map();
    for (const f of fields) fieldMap.set(f.name, f);

    for (const f of fields) {
      const val = obj[f.name];
      if (val === undefined || val === null) continue;

      if (f.isRepeated && Array.isArray(val)) {
        for (const item of val) {
          Proto._writeFieldVal(w, f.tag, f.type, item);
        }
      } else {
        Proto._writeFieldVal(w, f.tag, f.type, val);
      }
    }

    for (const [k, val] of Object.entries(obj)) {
      if (fieldMap.has(k) || val === undefined || val === null) continue;
      if (k.startsWith('_') && !isNaN(k.slice(1))) {
        const tag = parseInt(k.slice(1));
        Proto._writeAutoVal(w, tag, val);
      }
    }

    return w.finish();
  },

  _writeFieldVal(w, tag, type, val) {
    if (val === undefined || val === null) return;
    if (type === 'string') {
      w.writeString(tag, String(val));
    } else if (type === 'int64') {
      w.writeInt64(tag, val);
    } else if (type === 'int32' || type === 'uint32') {
      w.writeInt32(tag, Number(val));
    } else if (type === 'bool') {
      w.writeBool(tag, Boolean(val));
    } else if (type === 'bytes') {
      w.writeBytes(tag, val);
    } else if (type === 'message') {
      if (Buffer.isBuffer(val)) {
        w.writeMessage(tag, val);
      } else if (val && typeof val === 'object') {
        if ('type' in val && 'id' in val && Object.keys(val).length <= 3) {
          w.writeMessage(tag, Proto.encodePeer(val));
        } else {
          w.writeMessage(tag, Proto.encodeBySchema(val, null));
        }
      }
    } else {
      Proto._writeAutoVal(w, tag, val);
    }
  },

  _writeAutoVal(w, tag, val) {
    if (typeof val === 'string') {
      w.writeString(tag, val);
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) w.writeInt32(tag, val);
      else w.writeVarint(Math.floor(val));
    } else if (typeof val === 'bigint') {
      w.writeInt64(tag, val);
    } else if (typeof val === 'boolean') {
      w.writeBool(tag, val);
    } else if (Buffer.isBuffer(val)) {
      w.writeBytes(tag, val);
    } else if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        for (const item of val) Proto._writeAutoVal(w, tag, item);
      } else {
        w.writeMessage(tag, Proto.encodeBySchema(val, null));
      }
    }
  },

  decodeBySchema(buf, schema) {
    if (!buf || buf.length === 0) return {};
    const r = new ProtoReader(buf);
    const result = {};
    const tagMap = new Map();
    if (schema && schema.fields) {
      for (const f of schema.fields) {
        tagMap.set(f.tag, f);
      }
    }

    while (r.hasMore()) {
      const { fieldNumber, wireType } = r.readTag();
      const fieldDef = tagMap.get(fieldNumber);

      let decodedVal;
      if (wireType === WIRE_VARINT) {
        const v = r.readVarint();
        if (fieldDef && (fieldDef.type === 'bool' || fieldDef.name.startsWith('is') || fieldDef.name.startsWith('has'))) {
          decodedVal = v !== 0n;
        } else if (fieldDef && (fieldDef.type === 'int32' || fieldDef.type === 'uint32' || fieldDef.type === 'sint32')) {
          decodedVal = Number(v);
        } else if (fieldDef && (fieldDef.type === 'int64' || fieldDef.type === 'uint64' || fieldDef.type === 'sint64')) {
          decodedVal = (v >= BigInt(Number.MIN_SAFE_INTEGER) && v <= BigInt(Number.MAX_SAFE_INTEGER)) ? Number(v) : v.toString();
        } else if (fieldDef && (fieldDef.name.endsWith('Id') || fieldDef.name === 'rid' || fieldDef.name === 'date')) {
          decodedVal = (v >= BigInt(Number.MIN_SAFE_INTEGER) && v <= BigInt(Number.MAX_SAFE_INTEGER)) ? Number(v) : v.toString();
        } else {
          decodedVal = (v >= BigInt(Number.MIN_SAFE_INTEGER) && v <= BigInt(Number.MAX_SAFE_INTEGER)) ? Number(v) : v.toString();
        }
      } else if (wireType === WIRE_BYTES) {
        const len = Number(r.readVarint());
        const rawBytes = r.readBytes(len);

        if (fieldDef && fieldDef.type === 'string') {
          decodedVal = rawBytes.toString('utf8');
        } else if (fieldDef && fieldDef.type === 'bytes') {
          decodedVal = rawBytes;
        } else {
          try {
            const str = rawBytes.toString('utf8');
            let isPrintable = true;
            for (let i = 0; i < str.length; i++) {
              const code = str.charCodeAt(i);
              if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
                isPrintable = false;
                break;
              }
            }
            if (isPrintable && str.length > 0) {
              decodedVal = str;
            } else {
              try {
                const subObj = Proto.decodeBySchema(rawBytes, null);
                if (Object.keys(subObj).length > 0) {
                  decodedVal = subObj;
                } else {
                  decodedVal = rawBytes;
                }
              } catch (_) {
                decodedVal = rawBytes;
              }
            }
          } catch (_) {
            decodedVal = rawBytes;
          }
        }
      } else if (wireType === WIRE_FIXED32) {
        decodedVal = r.buf.readInt32LE(r.pos);
        r.pos += 4;
      } else if (wireType === WIRE_FIXED64) {
        decodedVal = r.buf.readBigInt64LE(r.pos).toString();
        r.pos += 8;
      } else {
        r.skip(wireType);
        continue;
      }

      const key = fieldDef ? fieldDef.name : `field_${fieldNumber}`;
      if (fieldDef && fieldDef.isRepeated) {
        if (!result[key]) result[key] = [];
        result[key].push(decodedVal);
      } else {
        result[key] = decodedVal;
      }
    }

    return result;
  }
};

Proto.ProtoWriter = ProtoWriter;
Proto.ProtoReader = ProtoReader;
Proto.TypingType = TypingType;
Proto.DeviceType = DeviceType;

module.exports = {
  Proto,
  ProtoWriter,
  ProtoReader,
  PeerType,
  ExPeerType,
  TypingType,
  DeviceType
};
