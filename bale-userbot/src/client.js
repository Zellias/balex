/**
 * Bale Userbot High-Level Client
 * Provides easy authentication, messaging, event listeners, and dynamic RPC proxies for all 53 services.
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const { Proto, PeerType, ExPeerType, TypingType, DeviceType } = require('./proto');
const { BaleConnection } = require('./connection');
const { Session, StringSession, FileSession } = require('./session');
const { MiniAppUtils, ScreenMode, MiniAppEvent, DefaultThemeParams } = require('./miniapp');
const servicesCatalog = require('./generated/services.json');

class BaleClient extends EventEmitter {
  constructor(options = {}) {
    super();
    this.miniapp = MiniAppUtils;
    this.options = Object.assign({
      endpoint: 'wss://next-ws.bale.ai/ws/',
      session: null,
      autoReconnect: true,
      stealth: true
    }, options);

    // Human-like stealth configuration
    const defaultHumanize = {
      enabled: true,
      keepOnline: true,             // Periodic presence heartbeat (every 60s)
      autoMarkAsRead: true,         // Send MessageReceived + MessageRead before replying
      readDelay: [600, 1400],       // Delay (ms) before marking as read
      typingDurationPerChar: 45,    // ms per character of reply
      minTypingDelay: 1200,         // Minimum 1.2s typing
      maxTypingDelay: 5000,         // Maximum 5.0s typing
      typingType: TypingType.TEXT
    };

    let humanizeConfig = Object.assign({}, defaultHumanize);
    if (options.humanize === false || options.stealth === false) {
      humanizeConfig.enabled = false;
      humanizeConfig.keepOnline = false;
    } else if (typeof options.humanize === 'object' && options.humanize !== null) {
      Object.assign(humanizeConfig, options.humanize);
    } else if (options.humanize === true || options.stealth === true) {
      humanizeConfig.enabled = true;
    }

    this.humanize = humanizeConfig;
    this.onlineTimer = null;

    // Setup session
    if (this.options.session instanceof Session) {
      this.session = this.options.session;
    } else if (typeof this.options.session === 'string') {
      this.session = new StringSession(this.options.session);
    } else {
      this.session = new StringSession();
    }

    // Setup connection
    this.connection = new BaleConnection({
      endpoint: this.options.endpoint,
      session: this.session,
      autoReconnect: this.options.autoReconnect
    });

    this.lastTransactionHash = null;

    // Relay connection events
    this.connection.on('connected', (info) => {
      if (this.humanize.enabled && this.humanize.keepOnline) {
        this._startOnlineHeartbeat();
      }
      this.emit('connected', info);
    });
    this.connection.on('disconnected', (evt) => {
      this._stopOnlineHeartbeat();
      this.emit('disconnected', evt);
    });
    this.connection.on('status', (st) => this.emit('status', st));
    this.connection.on('error', (err) => this.emit('error', err));
    this.connection.on('update', (update) => this._handleUpdate(update));

    // Register all 53 dynamic service namespaces
    this._initServiceNamespaces();
  }

  get isConnected() {
    return this.connection.isConnected;
  }

  get me() {
    return this.session.user;
  }

  async connect() {
    return this.connection.connect();
  }

  disconnect() {
    this._stopOnlineHeartbeat();
    this.connection.close();
  }

  // ==========================================
  // Authentication Flow
  // ==========================================

  /**
   * Request an SMS verification code for a phone number.
   * @param {string} phoneNumber - e.g. "+989123456789"
   */
  async sendCode(phoneNumber) {
    const payload = Proto.encodeStartPhoneAuth({
      phoneNumber,
      deviceHash: this.session.deviceHash
    });

    const resBytes = await this.connection.sendRequest(
      'bale.auth.v1.Auth',
      'StartPhoneAuth',
      payload
    );

    const res = Proto.decodeStartPhoneAuthResponse(resBytes);
    this.lastTransactionHash = res.transactionHash;
    this.session.phone = phoneNumber;
    return res;
  }

  /**
   * Validate SMS code and sign in.
   * @param {string|number} code - The received SMS code.
   * @param {string} [transactionHash] - Transaction hash from sendCode.
   */
  async signIn(code, transactionHash = this.lastTransactionHash) {
    if (!transactionHash) {
      throw new Error('Transaction hash is required for signIn');
    }

    const payload = Proto.encodeValidateCode({
      code,
      transactionHash,
      isJwt: true
    });

    const resBytes = await this.connection.sendRequest(
      'bale.auth.v1.Auth',
      'ValidateCode',
      payload
    );

    const res = Proto.decodeValidateCodeResponse(resBytes);
    if (res.user || res.jwt) {
      this.session.setAuth({
        token: res.jwt,
        user: res.user,
        phone: this.session.phone
      });
    }

    return res;
  }

  /**
   * Complete 2FA password login if enabled.
   * @param {string} password - 2FA password.
   * @param {string} [transactionHash] - Transaction hash.
   */
  async signInWithPassword(password, transactionHash = this.lastTransactionHash) {
    if (!transactionHash) {
      throw new Error('Transaction hash is required for signInWithPassword');
    }

    const payload = Proto.encodeValidatePassword({
      password,
      transactionHash,
      isJwt: true
    });

    const resBytes = await this.connection.sendRequest(
      'bale.auth.v1.Auth',
      'ValidatePassword',
      payload
    );

    const res = Proto.decodeValidateCodeResponse(resBytes);
    if (res.user || res.jwt) {
      this.session.setAuth({
        token: res.jwt,
        user: res.user,
        phone: this.session.phone
      });
    }

    return res;
  }

  /**
   * Sign out and clear stored session.
   */
  async logout() {
    try {
      await this.connection.sendRequest('bale.auth.v1.Auth', 'SignOut', Buffer.alloc(0));
    } catch (_) {}
    this.session.clear();
    this.disconnect();
  }

  // ==========================================
  // High-Level Messaging & Chat Operations
  // ==========================================

  /**
   * Send a text message to a user or group.
   * @param {number|Object} peer - User/Group ID or { type, id }
   * @param {string} text - Message text
   * @param {Object} [options]
   */
  async sendMessage(peer, text, options = {}) {
    let peerObj;
    if (typeof peer === 'number' || typeof peer === 'string') {
      peerObj = {
        type: options.isGroup ? PeerType.GROUP : PeerType.PRIVATE,
        id: Number(peer)
      };
    } else {
      peerObj = peer;
    }

    if (options.simulateTyping || (options.humanize && this.humanize.enabled)) {
      const textLen = (text || '').length;
      const cpsMs = this.humanize.typingDurationPerChar || 45;
      let typingDuration = Math.round(textLen * cpsMs + Math.random() * 300);
      typingDuration = Math.max(this.humanize.minTypingDelay, Math.min(this.humanize.maxTypingDelay, typingDuration));
      await this.sendTyping(peerObj, typingDuration, options.typingType || this.humanize.typingType).catch(() => {});
      await this.sleep(typingDuration);
    }

    const rid = String(Date.now()) + Math.floor(Math.random() * 10000).toString();

    const payload = Proto.encodeSendMessageRequest({
      peer: peerObj,
      rid,
      message: {
        textMessage: {
          text,
          mentions: options.mentions || []
        }
      },
      isSilent: Boolean(options.isSilent)
    });

    const resBytes = await this.connection.sendRequest(
      'bale.messaging.v2.Messaging',
      'SendMessage',
      payload
    );

    const res = Proto.decodeSendMessageResponse(resBytes);
    return {
      rid,
      date: res.date,
      peer: peerObj,
      text
    };
  }

  /**
   * Quick shortcut to send a text message.
   */
  async sendTextMessage(peerId, text, isGroup = false) {
    return this.sendMessage(peerId, text, { isGroup });
  }

  /**
   * Load dialogs / chat list.
   * @param {number} [limit=20]
   * @param {number|string} [endDate=0]
   */
  async loadDialogs(limit = 20, endDate = '0') {
    return this.messaging.loadDialogs({ limit, endDate });
  }

  /**
   * Load message history for a peer.
   * @param {number|Object} peer - Peer ID or { type, id }
   * @param {number} [limit=20]
   * @param {number|string} [date=0]
   */
  async loadHistory(peer, limit = 20, date = '0') {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    return this.messaging.loadHistory({ peer: peerObj, limit, date });
  }

  /**
   * Fetch full user profile.
   * @param {number} userId
   */
  async getUser(userId) {
    return this.users.loadFullUsers({ userIds: [Number(userId)] });
  }

  /**
   * Fetch full group profile.
   * @param {number} groupId
   */
  async getGroup(groupId) {
    return this.groups.loadFullGroups({ groupIds: [Number(groupId)] });
  }

  /**
   * Create a new group chat.
   * @param {string} title
   * @param {number[]} [userIds=[]]
   */
  async createGroup(title, userIds = []) {
    const rid = String(Date.now());
    const users = userIds.map(id => ({ type: PeerType.PRIVATE, id }));
    return this.groups.createGroup({ title, users, rid });
  }

  /**
   * Pin a message in chat.
   * @param {number|Object} peer
   * @param {string|number} messageId
   */
  async pinMessage(peer, messageId) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    return this.messaging.pinMessage({ peer: peerObj, mid: String(messageId) });
  }

  /**
   * Delete message(s).
   * @param {number|Object} peer
   * @param {Array<string|number>} mids
   */
  async deleteMessages(peer, mids = []) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    return this.messaging.deleteMessage({ peer: peerObj, mids: mids.map(String) });
  }

  /**
   * Get contacts list.
   */
  async getContacts() {
    return this.users.getContacts({});
  }

  // ==========================================
  // Media Messaging (Photo, Voice, Audio, Video, Document, Sticker)
  // ==========================================

  /**
   * Send a Photo to a user or group.
   * @param {number|Object} peer
   * @param {Object} photo - { fileId, accessHash, fileSize, name, width, height, caption }
   * @param {Object} [options]
   */
  async sendPhoto(peer, photo, options = {}) {
    return this._sendDocumentMessage(peer, {
      fileId: photo.fileId,
      accessHash: photo.accessHash,
      fileSize: photo.fileSize || 0,
      name: photo.name || 'photo.jpg',
      mimeType: photo.mimeType || 'image/jpeg',
      ext: { photo: { w: photo.width || 800, h: photo.height || 600 } },
      caption: photo.caption
    }, { ...options, typingType: TypingType.PHOTO });
  }

  /**
   * Send a Voice note to a user or group.
   * @param {number|Object} peer
   * @param {Object} voice - { fileId, accessHash, fileSize, duration, waveForm, caption }
   * @param {Object} [options]
   */
  async sendVoice(peer, voice, options = {}) {
    return this._sendDocumentMessage(peer, {
      fileId: voice.fileId,
      accessHash: voice.accessHash,
      fileSize: voice.fileSize || 0,
      name: voice.name || 'voice.ogg',
      mimeType: voice.mimeType || 'audio/ogg',
      ext: { voice: { duration: voice.duration || 1, waveForm: voice.waveForm || Buffer.alloc(0) } },
      caption: voice.caption
    }, { ...options, typingType: TypingType.RECORD_VOICE });
  }

  /**
   * Send Audio / Music to a user or group.
   * @param {number|Object} peer
   * @param {Object} audio - { fileId, accessHash, fileSize, name, duration, title, performer, caption }
   * @param {Object} [options]
   */
  async sendAudio(peer, audio, options = {}) {
    return this._sendDocumentMessage(peer, {
      fileId: audio.fileId,
      accessHash: audio.accessHash,
      fileSize: audio.fileSize || 0,
      name: audio.name || 'music.mp3',
      mimeType: audio.mimeType || 'audio/mpeg',
      ext: { audio: { duration: audio.duration || 0, title: audio.title || '', performer: audio.performer || '' } },
      caption: audio.caption
    }, { ...options, typingType: TypingType.RECORD_AUDIO });
  }

  /**
   * Send Video to a user or group.
   * @param {number|Object} peer
   * @param {Object} video - { fileId, accessHash, fileSize, name, width, height, duration, caption }
   * @param {Object} [options]
   */
  async sendVideo(peer, video, options = {}) {
    return this._sendDocumentMessage(peer, {
      fileId: video.fileId,
      accessHash: video.accessHash,
      fileSize: video.fileSize || 0,
      name: video.name || 'video.mp4',
      mimeType: video.mimeType || 'video/mp4',
      ext: { video: { w: video.width || 1280, h: video.height || 720, duration: video.duration || 0 } },
      caption: video.caption
    }, { ...options, typingType: TypingType.RECORD_VIDEO });
  }

  /**
   * Send Document / File to a user or group.
   * @param {number|Object} peer
   * @param {Object} doc - { fileId, accessHash, fileSize, name, mimeType, caption }
   * @param {Object} [options]
   */
  async sendDocument(peer, doc, options = {}) {
    return this._sendDocumentMessage(peer, {
      fileId: doc.fileId,
      accessHash: doc.accessHash,
      fileSize: doc.fileSize || 0,
      name: doc.name || 'document.bin',
      mimeType: doc.mimeType || 'application/octet-stream',
      caption: doc.caption
    }, { ...options, typingType: TypingType.UPLOAD_DOCUMENT });
  }

  /**
   * Send a Sticker to a user or group.
   * @param {number|Object} peer
   * @param {string|number} stickerId
   * @param {string|number} [accessHash=0]
   * @param {string|number} [stickerPackId=0]
   */
  async sendSticker(peer, stickerId, accessHash = 0, stickerPackId = 0) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const rid = String(Date.now()) + Math.floor(Math.random() * 10000).toString();
    const payload = Proto.encodeSendMessageRequest({
      peer: peerObj,
      rid,
      message: {
        stickerMessage: {
          stickerId: String(stickerId),
          accessHash: String(accessHash),
          stickerPackId: String(stickerPackId)
        }
      }
    });
    return this.connection.sendRequest('bale.messaging.v2.Messaging', 'SendMessage', payload);
  }

  async _sendDocumentMessage(peer, docFields, options = {}) {
    const peerObj = typeof peer === 'object' ? peer : { type: options.isGroup ? PeerType.GROUP : PeerType.PRIVATE, id: Number(peer) };
    if (options.simulateTyping || (options.humanize && this.humanize.enabled)) {
      const duration = 2000;
      await this.sendTyping(peerObj, duration, options.typingType || TypingType.UPLOAD_DOCUMENT).catch(() => {});
      await this.sleep(duration);
    }
    const rid = String(Date.now()) + Math.floor(Math.random() * 10000).toString();
    const payload = Proto.encodeSendMessageRequest({
      peer: peerObj,
      rid,
      message: {
        documentMessage: docFields
      },
      isSilent: Boolean(options.isSilent)
    });
    return this.connection.sendRequest('bale.messaging.v2.Messaging', 'SendMessage', payload);
  }

  // ==========================================
  // Banking & Financial Operations (Shetab)
  // ==========================================

  /**
   * Inquire destination cardholder name from Shetab.
   * Supports both object options `{ sourceCardNumber, destinationCardNumber, amountRials }`
   * and positional arguments `(sourcePan, destinationPan, amountRials)`.
   */
  async inquireDestinationPan(arg1, arg2, arg3) {
    let sourcePan, destinationPan, amount;
    if (typeof arg1 === 'object' && arg1 !== null) {
      sourcePan = arg1.sourceCardNumber || arg1.sourcePan;
      destinationPan = arg1.destinationCardNumber || arg1.destinationPan;
      amount = arg1.amountRials || arg1.amount;
    } else {
      sourcePan = arg1;
      destinationPan = arg2;
      amount = arg3;
    }
    return this.banking.inquireDestinationPan({
      sourcePan: String(sourcePan || ''),
      destinationPan: String(destinationPan || ''),
      amount: String(amount || '0')
    });
  }

  /**
   * Transfer money by card (Card to Card Shetab).
   */
  async transferMoneyByCard({ sourcePan, destinationPan, amountRials, cvv2, expireDate, pin2, inquiryToken, description = '' }) {
    return this.banking.transferMoneyByCard({
      sourcePan,
      destinationPan,
      amount: String(amountRials),
      cvv2,
      expireDate,
      pin2,
      inquiryToken,
      description
    });
  }

  /**
   * Inquire card balance.
   */
  async getCardBalance({ sourcePan, pin2, cvv2, expireDate }) {
    return this.banking.getCardBalance({
      sourcePan,
      pin2,
      cvv2,
      expireDate
    });
  }

  /**
   * Send regular Cash Gift Packet using wallet balance.
   * @param {Object} options
   * @param {number|Object} options.peer - Destination chat or group
   * @param {number|string|bigint} options.amount - Total amount in Rials
   * @param {number} [options.count=1] - Number of recipients
   * @param {string} [options.message=''] - Regarding / Greeting message
   * @param {string} [options.sourceWalletId=''] - Source wallet ID
   * @param {number} [options.givingType=0] - 0: Random (شانسی), 1: Equal (مساوی)
   * @param {number} [options.coverId=1] - Gift packet theme cover ID
   * @param {boolean} [options.showTotalAmount=true] - Whether to show total amount to chat
   */
  async sendGiftPacket({ peer, amount, count = 1, message = '', sourceWalletId = '', givingType = 0, coverId = 1, showTotalAmount = true }) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const rid = String(Date.now()) + Math.floor(Math.random() * 10000).toString();
    const myUid = this.session && this.session.uid ? this.session.uid : 0;

    const payload = Proto.encodeSendGiftPacketWithWallet({
      peer: peerObj,
      randomId: BigInt(rid),
      message: {
        giftPacketMessage: {
          giftCount: Number(count),
          totalAmount: BigInt(amount),
          givingType: Number(givingType),
          walletId: String(sourceWalletId || ''),
          regarding: String(message || ''),
          ownerUserId: Number(myUid),
          coverId: Number(coverId),
          showTotalAmount: Boolean(showTotalAmount)
        }
      },
      sourceWalletId: String(sourceWalletId || '')
    });
    return this.connection.sendRequest('bale.giftpacket.v1.GiftPacket', 'SendGiftPacketWithWallet', payload);
  }

  /**
   * Open and claim a regular Cash Gift Packet.
   * @param {Object} options
   * @param {number|Object} options.peer - Peer where packet was sent
   * @param {number|string|bigint} [options.date] - Message timestamp
   * @param {number|string|bigint} options.randomId - Message randomId / rid
   * @param {string} [options.walletId=''] - Receiver destination wallet ID
   * @param {number} [options.pageNo=1] - Pagination page
   * @param {number} [options.orderType=0] - Sorting order
   */
  async openGiftPacket({ peer, date = Date.now(), randomId, walletId = '', pageNo = 1, orderType = 0 }) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const payload = Proto.encodeOpenGiftPacket({
      msgIdentifier: {
        peer: peerObj,
        date: BigInt(date),
        randomId: BigInt(randomId)
      },
      receiverWalletId: String(walletId || ''),
      pageNo: Number(pageNo),
      orderType: Number(orderType)
    });
    const resBytes = await this.connection.sendRequest('bale.giftpacket.v1.GiftPacket', 'OpenGiftPacket', payload);
    return Proto.decodeOpenGiftPacketResponse(resBytes);
  }

  /**
   * Alias for openGiftPacket (claim cash gift packet).
   */
  async claimGiftPacket(options) {
    return this.openGiftPacket(options);
  }

  /**
   * Get details of a Cash Gift Packet (wrapper around openGiftPacket).
   */
  async getGiftPacket({ peer, date = Date.now(), randomId, walletId = '', pageNo = 1, orderType = 0 }) {
    return this.openGiftPacket({ peer, date, randomId, walletId, pageNo, orderType });
  }

  /**
   * Get list of receivers / winners of a Cash Gift Packet.
   */
  async getGiftPacketReceivers({ peer, date = Date.now(), randomId, walletId = '', pageNo = 1, orderType = 0 }) {
    const res = await this.openGiftPacket({ peer, date, randomId, walletId, pageNo, orderType });
    return res.receivers || [];
  }

  /**
   * Get payment token for gift packet.
   * @param {Object} options
   */
  async getGiftPacketPaymentToken(options = {}) {
    return this.giftPacket.getGiftPacketPaymentToken(options);
  }

  /**
   * Send Gold Gift Packet (Bale Gold).
   * @param {Object} options
   * @param {number|Object} options.peer - Destination chat
   * @param {number|string|bigint} options.amountMilligrams - Total gold amount in milligrams
   * @param {number} [options.count=1] - Number of recipients
   * @param {string} [options.message=''] - Message / Description
   * @param {number} [options.givingType=0] - 0: Random (شانسی), 1: Equal (مساوی)
   */
  async sendGoldGiftPacket({ peer, amountMilligrams, count = 1, message = '', givingType = 0 }) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const rid = String(Date.now()) + Math.floor(Math.random() * 10000).toString();
    const payload = Proto.encodeSendGoldGiftPacket({
      peer: peerObj,
      amount: BigInt(amountMilligrams),
      count: BigInt(count),
      description: String(message || ''),
      givingType: Number(givingType),
      randomId: BigInt(rid)
    });
    const resBytes = await this.connection.sendRequest('bale.balebank.v1.GoldGiftPacket', 'SendGoldGiftPacket', payload);
    return Proto.decodeSendGoldGiftPacketResponse(resBytes);
  }

  /**
   * Legacy alias for sendGoldGiftPacket.
   */
  async sendGoldPacket({ peerId, goldMilligrams, message, packetType = 0 }) {
    return this.sendGoldGiftPacket({
      peer: peerId,
      amountMilligrams: goldMilligrams,
      count: 1,
      message,
      givingType: packetType
    });
  }

  /**
   * Open and claim a Gold Gift Packet.
   * @param {number|string|bigint} giftPacketId - ID of gold gift packet
   */
  async openGoldGiftPacket(giftPacketId) {
    const payload = Proto.encodeOpenGoldGiftPacket({ giftPacketId: BigInt(giftPacketId) });
    const resBytes = await this.connection.sendRequest('bale.balebank.v1.GoldGiftPacket', 'OpenGoldGiftPacket', payload);
    return Proto.decodeOpenGoldGiftPacketResponse(resBytes);
  }

  /**
   * Alias for openGoldGiftPacket (claim gold gift packet).
   */
  async claimGoldGiftPacket(giftPacketId) {
    return this.openGoldGiftPacket(giftPacketId);
  }

  /**
   * Get list of winners/receivers who opened a Gold Gift Packet.
   * @param {number|string|bigint} giftPacketId
   */
  async getGoldGiftPacketWinners(giftPacketId) {
    const payload = Proto.encodeGetWinnerIDs({ giftPacketId: BigInt(giftPacketId) });
    const resBytes = await this.connection.sendRequest('bale.balebank.v1.GoldGiftPacket', 'GetWinnerIDs', payload);
    return Proto.decodeGetWinnerIDsResponse ? Proto.decodeGetWinnerIDsResponse(resBytes) : resBytes;
  }

  /**
   * Alias for getGoldGiftPacketWinners.
   */
  async getGoldGiftPacket(giftPacketId) {
    return this.getGoldGiftPacketWinners(giftPacketId);
  }

  /**
   * Alias for getGoldGiftPacketWinners.
   */
  async getGoldWinners(giftPacketId) {
    return this.getGoldGiftPacketWinners(giftPacketId);
  }

  // ==========================================
  // Group & Channel Administration Operations
  // ==========================================

  /**
   * Invite / Add members to a group.
   */
  async inviteMembers(groupId, userIds = []) {
    const users = userIds.map(id => ({ type: PeerType.PRIVATE, id: Number(id) }));
    return this.groups.inviteUser({ groupId: Number(groupId), users });
  }

  /**
   * Kick / Remove a member from a group.
   */
  async kickMember(groupId, userId) {
    const user = { type: PeerType.PRIVATE, id: Number(userId) };
    return this.groups.kickUser({ groupId: Number(groupId), user });
  }

  /**
   * Set / Update group title.
   */
  async setGroupTitle(groupId, title) {
    return this.groups.editGroupTitle({ groupId: Number(groupId), title: String(title) });
  }

  /**
   * Leave a group.
   */
  async leaveGroup(groupId) {
    return this.groups.leaveGroup({ groupId: Number(groupId) });
  }

  /**
   * Forward messages to another peer.
   * @param {number|Object} toPeer
   * @param {number|Object} fromPeer
   * @param {Array<string|number>} mids
   * @param {Object} [options]
   */
  async forwardMessages(toPeer, fromPeer, mids = [], options = {}) {
    const toPeerObj = typeof toPeer === 'object' ? toPeer : { type: PeerType.PRIVATE, id: Number(toPeer) };
    const fromPeerObj = typeof fromPeer === 'object' ? fromPeer : { type: PeerType.PRIVATE, id: Number(fromPeer) };
    const rids = mids.map(() => String(Date.now()) + Math.floor(Math.random() * 10000).toString());
    const forwardedMessages = mids.map((mid) => ({
      peer: fromPeerObj,
      rid: String(mid)
    }));
    const payload = Proto.encodeForwardMessages({
      peer: toPeerObj,
      rid: rids,
      forwardedMessages,
      hideSender: Boolean(options.hideSender)
    });
    return this.connection.sendRequest('bale.messaging.v2.Messaging', 'ForwardMessages', payload);
  }

  /**
   * Edit sent message text.
   * @param {number|Object} peer
   * @param {string|number} messageId
   * @param {string} newText
   */
  async editMessage(peer, messageId, newText) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const payload = Proto.encodeUpdateMessage({
      peer: peerObj,
      rid: String(messageId),
      updatedMessage: {
        textMessage: { text: String(newText), mentions: [] }
      }
    });
    return this.connection.sendRequest('bale.messaging.v2.Messaging', 'UpdateMessage', payload);
  }

  /**
   * Clear chat history with peer.
   */
  async clearChat(peer) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    return this.messaging.clearChat({ peer: peerObj });
  }

  // ==========================================
  // Contacts Management API
  // ==========================================

  /**
   * Import contacts list to Bale account.
   * @param {Array<{ phone: string, name?: string }>} contacts
   */
  async importContacts(contacts = []) {
    const payload = Proto.encodeImportContacts(contacts);
    const resBytes = await this.connection.sendRequest('bale.users.v1.Users', 'ImportContacts', payload);
    return Proto.decodeImportContactsResponse(resBytes);
  }

  /**
   * Add a single contact to account.
   * @param {string} phone - e.g. "09121234567" or "+989121234567"
   * @param {string} [name] - Contact name
   */
  async addContact(phone, name = '') {
    const res = await this.importContacts([{ phone, name }]);
    return res.users && res.users.length > 0 ? res.users[0] : res;
  }

  /**
   * Add existing Bale user to contacts by user ID.
   * @param {number|string} uid
   * @param {number|string|bigint} [accessHash=0]
   */
  async addContactByUid(uid, accessHash = 0n) {
    const payload = Proto.encodeAddContact({ uid, accessHash: BigInt(accessHash) });
    return this.connection.sendRequest('bale.users.v1.Users', 'AddContact', payload);
  }

  /**
   * Remove user from contacts.
   * @param {number|string} uid
   * @param {number|string|bigint} [accessHash=0]
   */
  async removeContact(uid, accessHash = 0n) {
    const payload = Proto.encodeRemoveContact({ uid, accessHash: BigInt(accessHash) });
    return this.connection.sendRequest('bale.users.v1.Users', 'RemoveContact', payload);
  }

  /**
   * Search saved contacts.
   * @param {string} query
   */
  async searchContacts(query) {
    const payload = Proto.encodeSearchContacts(query);
    const resBytes = await this.connection.sendRequest('bale.users.v1.Users', 'SearchContacts', payload);
    return Proto.decodeBySchema(resBytes, {
      fields: [
        { tag: 1, name: 'users', type: 'message', isRepeated: true },
        { tag: 2, name: 'userPeers', type: 'message', isRepeated: true }
      ]
    });
  }

  // ==========================================
  // User Profile & Privacy Management API
  // ==========================================

  /**
   * Edit display name of current user account.
   * @param {string} name
   */
  async editName(name) {
    const payload = Proto.encodeEditName(name);
    return this.connection.sendRequest('bale.users.v1.Users', 'EditName', payload);
  }

  /**
   * Edit bio / about text of current user account.
   * @param {string} about
   */
  async editAbout(about) {
    const payload = Proto.encodeEditAbout(about);
    return this.connection.sendRequest('bale.users.v1.Users', 'EditAbout', payload);
  }

  /**
   * Change username (handle / nick) of current user account.
   * @param {string} username
   */
  async editUsername(username) {
    const payload = Proto.encodeEditNickName(username);
    return this.connection.sendRequest('bale.users.v1.Users', 'EditNickName', payload);
  }

  /**
   * Check if a username is available.
   * @param {string} username
   */
  async checkUsername(username) {
    const payload = Proto.encodeCheckNickName(username);
    return this.connection.sendRequest('bale.users.v1.Users', 'CheckNickName', payload);
  }

  /**
   * Block a user.
   * @param {number|string} userId
   */
  async blockUser(userId) {
    const payload = Proto.encodeBlockUser(userId);
    return this.connection.sendRequest('bale.users.v1.Users', 'BlockUser', payload);
  }

  /**
   * Unblock a user.
   * @param {number|string} userId
   */
  async unblockUser(userId) {
    const payload = Proto.encodeUnblockUser(userId);
    return this.connection.sendRequest('bale.users.v1.Users', 'UnblockUser', payload);
  }

  /**
   * Load list of blocked users.
   */
  async loadBlockedUsers() {
    return this.users.loadBlockedUsers({});
  }

  // ==========================================
  // Reactions API (Abacus)
  // ==========================================

  /**
   * Add / set emoji reaction on a message.
   * @param {number|Object} peer
   * @param {string|number|bigint} messageId
   * @param {string} emoji - e.g. "❤️", "👍", "🔥"
   * @param {number|bigint} [date=0]
   */
  async setReaction(peer, messageId, emoji, date = 0) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const payload = Proto.encodeMessageSetReaction({
      peer: peerObj,
      rid: BigInt(messageId),
      code: emoji,
      date: BigInt(date || Date.now())
    });
    return this.connection.sendRequest('bale.abacus.v1.Abacus', 'MessageSetReaction', payload);
  }

  /**
   * Remove emoji reaction from a message.
   * @param {number|Object} peer
   * @param {string|number|bigint} messageId
   * @param {string} emoji
   * @param {number|bigint} [date=0]
   */
  async removeReaction(peer, messageId, emoji, date = 0) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const payload = Proto.encodeMessageRemoveReaction({
      peer: peerObj,
      rid: BigInt(messageId),
      code: emoji,
      date: BigInt(date || Date.now())
    });
    return this.connection.sendRequest('bale.abacus.v1.Abacus', 'MessageRemoveReaction', payload);
  }

  /**
   * Get reactions of specific messages.
   * @param {number|Object} peer
   * @param {Array<string|number|bigint>} messageIds
   */
  async getReactions(peer, messageIds) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
    return this.abacus.getMessagesReactions({ peer: peerObj, rids: ids.map(id => String(id)) });
  }

  // ==========================================
  // Chat Folders API (Messaging)
  // ==========================================

  /**
   * Load user chat folders.
   */
  async loadFolders() {
    return this.messaging.loadFolders({});
  }

  /**
   * Create a new chat folder.
   * @param {string} title
   * @param {Array<number|Object>} peerIds
   */
  async createFolder(title, peerIds = []) {
    const payload = Proto.encodeCreateFolder({ title, peerIds });
    return this.connection.sendRequest('bale.messaging.v2.Messaging', 'CreateFolder', payload);
  }

  /**
   * Delete a chat folder by ID.
   * @param {number} folderId
   */
  async deleteFolder(folderId) {
    const payload = Proto.encodeDeleteFolder(folderId);
    return this.connection.sendRequest('bale.messaging.v2.Messaging', 'DeleteFolder', payload);
  }

  // ==========================================
  // Polls API
  // ==========================================

  /**
   * Send a Poll directly to a chat.
   * @param {number|Object} peer
   * @param {string} question
   * @param {Array<string>} options
   * @param {Object} [config]
   */
  async sendPoll(peer, question, options = [], config = {}) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const rid = String(Date.now()) + Math.floor(Math.random() * 10000).toString();
    const payload = Proto.encodeSendMessageRequest({
      peer: peerObj,
      rid,
      message: {
        pollMessage: {
          question,
          options,
          isAnonymous: config.isAnonymous !== undefined ? config.isAnonymous : true,
          isMultipleChoice: Boolean(config.isMultipleChoice),
          isQuiz: Boolean(config.isQuiz)
        }
      }
    });
    return this.connection.sendRequest('bale.messaging.v2.Messaging', 'SendMessage', payload);
  }

  /**
   * Create a standalone poll via Poll service.
   * @param {string} question
   * @param {Array<string>} options
   * @param {Object} [config]
   */
  async createPoll(question, options = [], config = {}) {
    const pollMessageBuf = Proto.encodeCreatePoll({
      question,
      options,
      isAnonymous: config.isAnonymous !== undefined ? config.isAnonymous : true,
      isMultipleChoice: Boolean(config.isMultipleChoice),
      isQuiz: Boolean(config.isQuiz)
    });
    return this.poll.createPoll({
      pollMessage: pollMessageBuf,
      createAt: Date.now()
    });
  }

  /**
   * Get poll results.
   * @param {string|number|bigint} pollId
   */
  async getPollResults(pollId) {
    return this.poll.getPollResults({ pollIds: [String(pollId)] });
  }

  /**
   * Close a poll.
   * @param {string|number|bigint} pollId
   */
  async closePoll(pollId) {
    return this.poll.closePoll({ pollId: String(pollId) });
  }

  // ==========================================
  // Wallet / Kifpool API
  // ==========================================

  /**
   * Get wallet balance / accounts.
   */
  async getWalletCredit() {
    return this.kifpool.getMyKifpools({});
  }

  /**
   * Get wallet point balance.
   */
  async getWalletPoints() {
    return this.kifpool.getKifpoolPointBalance({});
  }

  // ==========================================
  // Bot & Interactive Callbacks API
  // ==========================================

  /**
   * Send inline keyboard button callback click to a bot.
   * @param {number|Object} peer
   * @param {string|number} messageId
   * @param {string|Buffer} data
   */
  async sendInlineCallback(peer, messageId, data) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    return this.ketf.sendInlineCallback({
      peer: peerObj,
      messageId: Number(messageId),
      data: String(data)
    });
  }

  // ==========================================
  // Mini Apps / WebApps API (Appzar & Ketf)
  // ==========================================

  /**
   * Get official Mini App launch URL with server signature.
   * @param {Object} options
   * @param {number|string} options.botUserId - Bot ID
   * @param {number} [options.screenMode=0] - Fullscreen / compact mode
   * @param {string} [options.directLink] - Optional direct deep-link
   * @param {Object} [options.themeParams] - Optional theme colors
   */
  async getMiniAppUrl({ botUserId, screenMode = 0, directLink = '', themeParams }) {
    const payload = Proto.encodeGetMiniAppUrl({
      botUserId: Number(botUserId),
      screenMode: Number(screenMode),
      directLink,
      themeParams
    });
    const resBytes = await this.connection.sendRequest('bale.appzar.v1.Appzar', 'GetMiniAppUrl', payload);
    return Proto.decodeGetMiniAppUrlResponse(resBytes);
  }

  /**
   * Get Webapp cryptographic authentication hash from server.
   * @param {number|string} botUserId
   * @param {string} [data='']
   */
  async getWebappHash(botUserId, data = '') {
    const payload = Proto.encodeGetWebappHash({
      botUserId: Number(botUserId),
      data: String(data)
    });
    const resBytes = await this.connection.sendRequest('bale.ketf.v1.Ketf', 'GetWebappHash', payload);
    return Proto.decodeGetWebappHashResponse(resBytes);
  }

  /**
   * Generate complete Mini App launch parameters (initData, tgWebAppData, and signed launch URL).
   * Used to embed and launch any Bale / Telegram Mini App in WebView or external browser.
   * @param {number|string} botUserId - Bot UID
   * @param {Object} [options]
   * @param {string} [options.startParam] - Deep-link start parameter
   * @param {string} [options.appUrl] - Base URL of mini app (if known)
   * @param {string} [options.platform='weba'] - Platform name ('weba', 'android', 'tdesktop')
   * @param {Object} [options.theme] - Custom theme colors
   */
  async createMiniAppParams(botUserId, options = {}) {
    let hashData = { hash: '', authDate: Math.floor(Date.now() / 1000), queryId: '' };
    if (!options.botToken) {
      try {
        hashData = await this.getWebappHash(botUserId, options.startParam || '');
      } catch (_) {
        // Fallback for offline generation
      }
    }

    const user = {
      id: this.session ? this.session.uid : 0,
      first_name: 'BaleX User',
      last_name: '',
      username: '',
      language_code: 'fa'
    };
    if (this.session && this.session.user) {
      user.id = this.session.user.id || user.id;
      user.first_name = this.session.user.name || user.first_name;
      user.username = this.session.user.username || '';
    }

    const themeParams = options.theme || DefaultThemeParams;
    const authDate = hashData.authDate ? Number(hashData.authDate) : Math.floor(Date.now() / 1000);
    const queryId = hashData.queryId || ('AAH_' + Math.random().toString(36).substring(2, 9));

    let rawInitData;
    if (options.botToken) {
      rawInitData = MiniAppUtils.createInitData({
        user,
        queryId,
        authDate,
        startParam: options.startParam,
        botToken: options.botToken
      });
    } else {
      const params = new URLSearchParams();
      params.set('query_id', queryId);
      params.set('user', JSON.stringify(user));
      params.set('auth_date', String(authDate));
      if (options.startParam) params.set('start_param', options.startParam);
      if (hashData.hash) params.set('hash', hashData.hash);
      rawInitData = params.toString();
    }

    let fullLaunchUrl = '';
    if (options.appUrl) {
      fullLaunchUrl = MiniAppUtils.buildMiniAppUrl({
        webAppUrl: options.appUrl,
        initData: rawInitData,
        themeParams
      });
    }

    return {
      queryId,
      authDate,
      hash: hashData.hash || '',
      initData: rawInitData,
      themeParams,
      platform: options.platform || 'weba',
      launchUrl: fullLaunchUrl
    };
  }

  /**
   * Create standard Mini App initData query string.
   * @param {Object} options
   */
  createInitData(options = {}) {
    const user = (this.session && this.session.user) ? {
      id: this.session.uid || this.session.user.id || 0,
      first_name: this.session.user.name || 'BaleX User',
      username: this.session.user.username || '',
      language_code: 'fa'
    } : {
      id: this.session ? this.session.uid : 0,
      first_name: 'BaleX User',
      username: '',
      language_code: 'fa'
    };
    return MiniAppUtils.createInitData({ user, ...options });
  }

  /**
   * Sign initData with bot token.
   * @param {string|Object} data
   * @param {string} botToken
   */
  signInitData(data, botToken) {
    return MiniAppUtils.signInitData(data, botToken);
  }

  /**
   * Cryptographically validate initData signature.
   * @param {string} initData
   * @param {string} botToken
   * @param {number} [maxAgeSeconds]
   */
  validateInitData(initData, botToken, maxAgeSeconds) {
    return MiniAppUtils.validateInitData(initData, botToken, maxAgeSeconds);
  }

  /**
   * Parse initData into structured object.
   * @param {string} initData
   */
  parseInitData(initData) {
    return MiniAppUtils.parseInitData(initData);
  }

  /**
   * Build complete Mini App launch URL.
   * @param {Object} options
   */
  buildMiniAppUrl(options = {}) {
    return MiniAppUtils.buildMiniAppUrl(options);
  }

  /**
   * Send data back from Mini App to bot (Telegram / Bale WebApp sendData).
   * @param {Object} options
   * @param {number|string} options.botUserId
   * @param {string} [options.queryId]
   * @param {string|Object} options.data
   * @param {string} [options.buttonText]
   */
  async sendMiniAppData({ botUserId, queryId = '', data, buttonText = '' }) {
    const payload = Proto.encodeSendMiniAppData({
      botUserId: Number(botUserId),
      queryId,
      data,
      buttonText
    });
    return this.connection.sendRequest('bale.ketf.v1.Ketf', 'SendMiniAppData', payload);
  }

  /**
   * Get bot menu button configuration (WebApp, Commands, etc.).
   * @param {number|string} botUserId
   */
  async getBotMenuButton(botUserId) {
    const payload = Proto.encodeGetMenuButton({ botUserId: Number(botUserId) });
    const resBytes = await this.connection.sendRequest('bale.appzar.v1.Appzar', 'GetMenuButton', payload);
    return Proto.decodeGetMenuButtonResponse(resBytes);
  }

  /**
   * Invoke custom method of a Mini App.
   * @param {Object} options
   * @param {number|string} options.botUserId
   * @param {string} options.method
   * @param {string|Object} options.params
   */
  async invokeMiniAppCustomMethod({ botUserId, method, params = '' }) {
    const pStr = typeof params === 'string' ? params : JSON.stringify(params);
    const payload = Proto.encodeInvokeCustomMethod({ botUserId: Number(botUserId), method: String(method), params: pStr });
    const resBytes = await this.connection.sendRequest('bale.appzar.v1.Appzar', 'InvokeCustomMethod', payload);
    return Proto.decodeInvokeCustomMethodResponse(resBytes);
  }

  // ==========================================
  // Stories API (Story)
  // ==========================================

  /**
   * Send / Post a new Story to Bale.
   * @param {Object} options
   */
  async sendStory(options = {}) {
    return this.story.addStory(options);
  }

  /**
   * Delete a Story.
   * @param {number|string|bigint} storyId
   */
  async deleteStory(storyId) {
    return this.story.removeStory({ storyId: String(storyId) });
  }

  /**
   * Get active stories of a user or chat.
   * @param {number|string} [userId]
   */
  async getUserStories(userId) {
    return this.story.getStories({ userId: Number(userId || 0) });
  }

  /**
   * Get viewers list of a story.
   * @param {number|string|bigint} storyId
   */
  async getStoryViewers(storyId) {
    return this.story.getViewers({ storyId: String(storyId) });
  }

  /**
   * React or like a story.
   * @param {number|string|bigint} storyId
   * @param {string} [reaction='❤️']
   */
  async likeStory(storyId, reaction = '❤️') {
    return this.story.reactToStory({ storyId: String(storyId), reaction: String(reaction) });
  }

  // ==========================================
  // Scheduler API
  // ==========================================

  /**
   * Schedule a message/task to be sent at a future date/time.
   * @param {Object} options
   * @param {number|Object} options.peer
   * @param {string} options.text
   * @param {number|string|bigint} options.sendAtDate - Future Unix timestamp in milliseconds
   */
  async scheduleMessage({ peer, text, sendAtDate }) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    return this.scheduler.scheduleTask({
      peer: peerObj,
      message: { textMessage: { text: String(text) } },
      sendAtDate: BigInt(sendAtDate)
    });
  }

  /**
   * Load list of scheduled messages/tasks.
   * @param {number|Object} peer
   */
  async loadScheduledMessages(peer) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    return this.scheduler.listTasks({ peer: peerObj });
  }

  /**
   * Delete a scheduled message/task.
   * @param {number|Object} peer
   * @param {number|string|bigint} taskId
   */
  async deleteScheduledMessage(peer, taskId) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    return this.scheduler.unScheduleTask({ peer: peerObj, taskId: String(taskId) });
  }

  // ==========================================
  // AI & TLDR Summarizer API
  // ==========================================

  /**
   * Summarize content or link with Bale TLDR.
   * @param {string} link
   */
  async summarizeLink(link) {
    return this.tLDR.getLinkSummary({ link: String(link) });
  }

  /**
   * Ask question or send event to Bale Turing AI.
   * @param {string} prompt
   */
  async askAI(prompt) {
    return this.aI.sendEvent({ event: String(prompt) });
  }

  // ==========================================
  // Stealth & Human-like Simulation API
  // ==========================================

  /**
   * Set user online status (Presence).
   * Shows the green online badge to other users.
   * @param {boolean} [isOnline=true]
   * @param {number} [timeout=90000]
   */
  async setOnline(isOnline = true, timeout = 90000) {
    const payload = Proto.encodeSetOnline({
      isOnline,
      timeout,
      deviceType: DeviceType.PC
    });
    return this.connection.sendRequest('bale.presence.v1.Presence', 'SetOnline', payload);
  }

  /**
   * Send typing indicator to a chat ("در حال نوشتن...").
   * @param {number|Object} peer - Peer ID or { type, id }
   * @param {number} [durationMs=0] - If provided, automatically stops typing after duration
   * @param {number} [typingType=1] - TypingType enum (TEXT, VOICE_RECORDING, etc.)
   */
  async sendTyping(peer, durationMs = 0, typingType = TypingType.TEXT) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const payload = Proto.encodeTyping({ peer: peerObj, typingType });
    const res = await this.connection.sendRequest('bale.presence.v1.Presence', 'Typing', payload);

    if (durationMs > 0) {
      setTimeout(() => {
        this.stopTyping(peerObj, typingType).catch(() => {});
      }, durationMs);
    }
    return res;
  }

  /**
   * Stop typing indicator in a chat.
   * @param {number|Object} peer
   * @param {number} [typingType=1]
   */
  async stopTyping(peer, typingType = TypingType.TEXT) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const payload = Proto.encodeStopTyping({ peer: peerObj, typingType });
    return this.connection.sendRequest('bale.presence.v1.Presence', 'StopTyping', payload);
  }

  /**
   * Mark message as received / delivered.
   * @param {number|Object} peer
   * @param {number|string|BigInt} date
   */
  async markAsReceived(peer, date) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const payload = Proto.encodeMessageReceived({ peer: peerObj, date });
    return this.connection.sendRequest('bale.messaging.v2.Messaging', 'MessageReceived', payload);
  }

  /**
   * Mark message as read (seen / double blue checkmarks).
   * @param {number|Object} peer
   * @param {number|string|BigInt} date
   */
  async markAsRead(peer, date) {
    const peerObj = typeof peer === 'object' ? peer : { type: PeerType.PRIVATE, id: Number(peer) };
    const payload = Proto.encodeMessageRead({ peer: peerObj, date });
    return this.connection.sendRequest('bale.messaging.v2.Messaging', 'MessageRead', payload);
  }

  /**
   * Utility sleep helper.
   * @param {number} ms
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _startOnlineHeartbeat() {
    this._stopOnlineHeartbeat();
    const sendPresence = async () => {
      if (this.isConnected && this.session && this.session.isLoggedIn()) {
        try {
          await this.setOnline(true);
        } catch (_) {}
      }
    };
    sendPresence();
    this.onlineTimer = setInterval(sendPresence, 60000);
  }

  _stopOnlineHeartbeat() {
    if (this.onlineTimer) {
      clearInterval(this.onlineTimer);
      this.onlineTimer = null;
    }
  }

  /**
   * Check if humanize/stealth mode is currently active.
   * @returns {boolean}
   */
  get isHumanized() {
    return Boolean(this.humanize && this.humanize.enabled);
  }

  /**
   * Dynamically enable, disable, or configure humanize mode at runtime.
   * @param {boolean|Object} value - true/false or config object
   */
  setHumanize(value) {
    if (typeof value === 'boolean') {
      this.humanize.enabled = value;
      this.humanize.keepOnline = value;
      if (!value) {
        this._stopOnlineHeartbeat();
      } else if (this.isConnected) {
        this._startOnlineHeartbeat();
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(this.humanize, value);
      if (this.humanize.enabled && this.humanize.keepOnline && this.isConnected) {
        this._startOnlineHeartbeat();
      } else if (!this.humanize.enabled || !this.humanize.keepOnline) {
        this._stopOnlineHeartbeat();
      }
    }
    return this.humanize.enabled;
  }

  /**
   * Enable humanize/stealth mode.
   * @param {Object} [config]
   */
  enableHumanize(config = {}) {
    return this.setHumanize({ enabled: true, keepOnline: true, ...config });
  }

  /**
   * Disable humanize/stealth mode (switches to high-speed instant response bot).
   */
  disableHumanize() {
    return this.setHumanize(false);
  }

  // ==========================================
  // Generic RPC Invocation
  // ==========================================

  /**
   * Invoke any of the 636 Bale RPC methods.
   * @param {string} serviceName - e.g. "bale.messaging.v2.Messaging"
   * @param {string} methodName - e.g. "SendMessage"
   * @param {Buffer|Uint8Array|Object} [payload] - Serialized protobuf request or JS object
   * @param {Object} [metadata] - Optional request metadata
   */
  async invoke(serviceName, methodName, payload = Buffer.alloc(0), metadata = {}) {
    let buf;
    if (Buffer.isBuffer(payload)) {
      buf = payload;
    } else if (payload instanceof Uint8Array) {
      buf = Buffer.from(payload);
    } else if (typeof payload === 'object' && payload !== null) {
      // Find method schema in catalog if available
      const sData = servicesCatalog.services[serviceName];
      const mData = sData ? sData.methods.find(m => m.methodName === methodName) : null;
      buf = Proto.encodeBySchema(payload, mData ? mData.requestSchema : null);
    } else {
      buf = Buffer.alloc(0);
    }

    const resBytes = await this.connection.sendRequest(serviceName, methodName, buf, metadata);

    // Auto-decode if schema available
    const sData = servicesCatalog.services[serviceName];
    const mData = sData ? sData.methods.find(m => m.methodName === methodName) : null;
    return Proto.decodeBySchema(resBytes, mData ? mData.responseSchema : null);
  }

  // ==========================================
  // Internal Event & Update Handling
  // ==========================================

  _handleUpdate(update) {
    this.emit('update', update);

    if (update.type === 'message' && update.data) {
      const msgData = update.data;
      const raw = msgData.message || {};
      const doc = raw.documentMessage;
      const ext = doc && doc.ext;
      const isPhoto = Boolean(ext && ext.photo);
      const isVoice = Boolean(ext && ext.voice);
      const isAudio = Boolean(ext && ext.audio);
      const isVideo = Boolean(ext && ext.video);
      const isDocument = Boolean(doc && !isPhoto && !isVoice && !isAudio && !isVideo);
      const isSticker = Boolean(raw.stickerMessage);
      const isGiftPacket = Boolean(raw.giftPacketMessage);
      const isGoldGiftPacket = Boolean(raw.goldGiftPacketMessage);
      const isService = Boolean(raw.serviceMessage);
      const isOut = Boolean(this.user && this.user.id && (Number(msgData.senderId) === Number(this.user.id)));

      let text = '';
      if (raw.textMessage && raw.textMessage.text) {
        text = raw.textMessage.text;
      } else if (doc && doc.caption && doc.caption.text) {
        text = doc.caption.text;
      } else if (raw.giftPacketMessage && raw.giftPacketMessage.regarding) {
        text = raw.giftPacketMessage.regarding;
      } else if (raw.serviceMessage && raw.serviceMessage.text) {
        text = raw.serviceMessage.text;
      }

      const messageEvent = {
        senderId: msgData.senderId,
        peer: msgData.peer,
        date: msgData.date,
        randomId: msgData.randomId,
        text,
        rawMessage: raw,
        isGroup: msgData.peer ? msgData.peer.type === PeerType.GROUP : false,
        isOut,
        isPhoto,
        isVoice,
        isAudio,
        isVideo,
        isDocument,
        isSticker,
        isGiftPacket,
        isGoldGiftPacket,
        isService,
        giftPacket: raw.giftPacketMessage || null,
        goldGiftPacket: raw.goldGiftPacketMessage || null,
        serviceMessage: raw.serviceMessage || null,
        markAsRead: () => this.markAsRead(msgData.peer, msgData.date),
        markAsReceived: () => this.markAsReceived(msgData.peer, msgData.date),
        sendTyping: (durationMs, typingType) => this.sendTyping(msgData.peer, durationMs, typingType),
        react: (emoji) => this.setReaction(msgData.peer, msgData.randomId, emoji),
        delete: () => this.deleteMessages(msgData.peer, [msgData.randomId]),
        pin: () => this.pinMessage(msgData.peer, msgData.randomId),
        forwardTo: (toPeer) => this.forwardMessages(toPeer, msgData.peer, [msgData.randomId]),
        openGiftPacket: (walletId) => this.openGiftPacket({ peer: msgData.peer, randomId: msgData.randomId, date: msgData.date, walletId }),
        claimGiftPacket: (walletId) => this.openGiftPacket({ peer: msgData.peer, randomId: msgData.randomId, date: msgData.date, walletId }),
        getGiftPacket: () => this.getGiftPacket({ peer: msgData.peer, randomId: msgData.randomId, date: msgData.date }),
        getGiftPacketReceivers: (pageNo = 1) => this.getGiftPacketReceivers({ peer: msgData.peer, randomId: msgData.randomId, date: msgData.date, pageNo }),
        openGoldGiftPacket: () => {
          if (!raw.goldGiftPacketMessage || !raw.goldGiftPacketMessage.packetId) {
            throw new Error('این پیام حاوی پاکت هدیه طلا نیست.');
          }
          return this.openGoldGiftPacket(raw.goldGiftPacketMessage.packetId);
        },
        claimGoldGiftPacket: () => {
          if (!raw.goldGiftPacketMessage || !raw.goldGiftPacketMessage.packetId) {
            throw new Error('این پیام حاوی پاکت هدیه طلا نیست.');
          }
          return this.openGoldGiftPacket(raw.goldGiftPacketMessage.packetId);
        },
        getGoldWinners: () => {
          if (!raw.goldGiftPacketMessage || !raw.goldGiftPacketMessage.packetId) {
            throw new Error('این پیام حاوی پاکت هدیه طلا نیست.');
          }
          return this.getGoldGiftPacketWinners(raw.goldGiftPacketMessage.packetId);
        },
        reply: async (replyText, options = {}) => {
          const isHuman = options.humanize !== undefined ? options.humanize : this.humanize.enabled;
          if (isHuman) {
            // 1. Mark as received
            if (this.humanize.autoMarkAsRead) {
              await this.markAsReceived(msgData.peer, msgData.date).catch(() => {});
            }

            // 2. Natural delay before reading the message (simulates human noticing and reading)
            const [minRead, maxRead] = this.humanize.readDelay || [600, 1400];
            const readDelay = Math.floor(minRead + Math.random() * (maxRead - minRead));
            await this.sleep(readDelay);

            // 3. Mark message as read (seen / double checks appear for sender)
            if (this.humanize.autoMarkAsRead) {
              await this.markAsRead(msgData.peer, msgData.date).catch(() => {});
            }

            // 4. Short human thinking pause before typing
            await this.sleep(300 + Math.floor(Math.random() * 350));

            // 5. Realistic typing duration proportional to reply length
            const textLen = (replyText || '').length;
            const cpsMs = this.humanize.typingDurationPerChar || 45;
            let typingDuration = Math.round(textLen * cpsMs + Math.random() * 300);
            typingDuration = Math.max(this.humanize.minTypingDelay, Math.min(this.humanize.maxTypingDelay, typingDuration));

            // 6. Send typing indicator ("در حال نوشتن...")
            await this.sendTyping(msgData.peer, typingDuration, options.typingType || this.humanize.typingType).catch(() => {});
            await this.sleep(typingDuration);
          }

          return this.sendMessage(msgData.peer, replyText, { ...options, humanize: false, simulateTyping: false });
        },
        replyPhoto: (options) => this.sendPhoto(msgData.peer, options),
        replyVoice: (options) => this.sendVoice(msgData.peer, options),
        replyAudio: (options) => this.sendAudio(msgData.peer, options),
        replyVideo: (options) => this.sendVideo(msgData.peer, options),
        replyDocument: (options) => this.sendDocument(msgData.peer, options),
        edit: (newText) => this.editMessage(msgData.peer, msgData.randomId, newText)
      };

      // Emit specific message type events
      if (isGiftPacket) {
        this.emit('giftPacket', messageEvent);
      }
      if (isGoldGiftPacket) {
        this.emit('goldGiftPacket', messageEvent);
      }
      if (raw.serviceMessage) {
        const srv = raw.serviceMessage;
        this.emit('serviceMessage', { ...srv, message: messageEvent });
        if (srv.ext) {
          if (srv.ext.giftPacketOpened) {
            this.emit('giftPacketOpened', { ...srv.ext.giftPacketOpened, message: messageEvent });
          }
          if (srv.ext.miniAppDataSent) {
            this.emit('miniAppData', { ...srv.ext.miniAppDataSent, message: messageEvent });
          }
          if (srv.ext.groupCreated) {
            this.emit('groupCreated', { ...srv.ext.groupCreated, message: messageEvent });
          }
          if (srv.ext.userInvited) {
            this.emit('userInvited', { ...srv.ext.userInvited, message: messageEvent });
          }
          if (srv.ext.userKicked) {
            this.emit('userKicked', { ...srv.ext.userKicked, message: messageEvent });
          }
          if (srv.ext.userLeft) {
            this.emit('userLeft', { ...srv.ext.userLeft, message: messageEvent });
          }
        }
      }

      this.emit('message', messageEvent);
    } else if (update.type && update.data) {
      // Primary event dispatching for all 60+ WebSocket updates
      this.emit(update.type, update.data);

      // Event aliases for multi-level listening convenience
      if (update.type === 'messageNewReaction') {
        this.emit('reaction', update.data);
      } else if (update.type === 'messagePinned' || update.type === 'groupMessagePinned') {
        this.emit('pinned', update.data);
      } else if (update.type === 'callStarted' || update.type === 'groupCallStarted' || update.type === 'multiPeerCallStarted') {
        this.emit('call', update.data);
      } else if (update.type === 'userOnline' || update.type === 'userOffline' || update.type === 'userLastSeen') {
        this.emit('presence', update.data);
      }
    }
  }

  // ==========================================
  // Dynamic Service Namespaces Generation
  // ==========================================

  _initServiceNamespaces() {
    this.services = {};

    for (const [sName, sData] of Object.entries(servicesCatalog.services)) {
      const ns = sData.namespace;
      const serviceObj = {};

      for (const m of sData.methods) {
        const mName = m.methodName;
        // Function that dispatches RPC with automatic schema encoding and decoding
        const fn = async (payload = {}, metadata = {}) => {
          let payloadBytes;
          if (Buffer.isBuffer(payload)) {
            payloadBytes = payload;
          } else {
            payloadBytes = Proto.encodeBySchema(payload, m.requestSchema);
          }

          const resBytes = await this.connection.sendRequest(sName, mName, payloadBytes, metadata);
          return Proto.decodeBySchema(resBytes, m.responseSchema);
        };

        const camelName = mName.charAt(0).toLowerCase() + mName.slice(1);
        serviceObj[mName] = fn;
        if (camelName !== mName) {
          serviceObj[camelName] = fn;
        }
      }

      this[ns] = serviceObj;
      const lowerNs = ns.toLowerCase();
      if (!this[lowerNs]) {
        this[lowerNs] = serviceObj;
      }
      this.services[sName] = serviceObj;
    }
  }
}

module.exports = {
  BaleClient,
  PeerType,
  ExPeerType,
  Session,
  StringSession,
  FileSession,
  Proto,
  MiniAppUtils,
  ScreenMode,
  MiniAppEvent,
  DefaultThemeParams
};
