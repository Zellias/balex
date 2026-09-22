/**
 * TypeScript Definitions for BaleX / Bale Userbot
 * High-performance Node.js userbot & client library for Bale Messenger.
 * Supports all 53 Protobuf services, 636 RPC methods, Mini App parameter engine,
 * Shetab Banking, Gift Packets, and 60+ WebSocket event streams.
 */

/// <reference types="node" />

import { EventEmitter } from 'events';

// ==========================================
// Enums & Protocol Constants
// ==========================================

export enum PeerType {
  PRIVATE = 1,
  GROUP = 2
}

export enum ExPeerType {
  USER = 1,
  GROUP = 2
}

export enum TypingType {
  TEXT = 0,
  RECORD_AUDIO = 1,
  UPLOAD_AUDIO = 2,
  RECORD_VIDEO = 3,
  UPLOAD_VIDEO = 4,
  UPLOAD_DOCUMENT = 5,
  LOCATION = 6,
  CHOOSE_CONTACT = 7
}

export enum DeviceType {
  GENERIC = 0,
  PC = 1,
  WEB = 2,
  HANDSET = 3,
  TABLET = 4
}

export enum ScreenMode {
  FULLSCREEN = 0,
  FULL_SIZE = 1,
  COMPACT = 2
}

export const MiniAppEvent: {
  // Host -> MiniApp
  readonly SETUP_BACK_BUTTON: 'web_app_setup_back_button';
  readonly SETUP_SETTINGS_BUTTON: 'web_app_setup_settings_button';
  readonly READ_TEXT_FROM_CLIPBOARD: 'web_app_read_text_from_clipboard';
  readonly EXPAND: 'web_app_expand';
  readonly READY: 'web_app_ready';
  readonly CLOSE: 'web_app_close';
  readonly ADD_TO_HOME_SCREEN: 'web_app_add_to_home_screen';
  readonly CHECK_HOME_SCREEN: 'web_app_check_home_screen';
  readonly SET_BACKGROUND_COLOR: 'web_app_set_background_color';
  readonly SET_HEADER_COLOR: 'web_app_set_header_color';
  readonly SET_BOTTOM_BAR_COLOR: 'web_app_set_bottom_bar_color';
  readonly IFRAME_CLICKED: 'web_app_iframe_clicked';
  readonly SETUP_CLOSING_BEHAVIOR: 'web_app_setup_closing_behavior';
  readonly REQUEST_PHONE: 'web_app_request_phone';
  readonly OPEN_LINK: 'web_app_open_link';
  readonly SEND_DATA: 'web_app_data_send';
  readonly OPEN_SCAN_QR_POPUP: 'web_app_open_scan_qr_popup';
  readonly INVOKE_CUSTOM_METHOD: 'web_app_invoke_custom_method';
  readonly OPEN_INVOICE: 'web_app_open_invoice';

  // MiniApp -> Host callbacks
  readonly CLIPBOARD_TEXT_RECEIVED: 'clipboardTextReceived';
  readonly SETTINGS_BUTTON_PRESSED: 'settingsButtonPressed';
  readonly BACK_BUTTON_PRESSED: 'backButtonPressed';
  readonly INVOICE_CLOSED: 'invoiceClosed';
  readonly QR_TEXT_RECEIVED: 'qrTextReceived';
  readonly MAIN_BUTTON_PRESSED: 'mainButtonPressed';
  readonly SECONDARY_BUTTON_PRESSED: 'secondaryButtonPressed';
  readonly CUSTOM_METHOD_INVOKED: 'customMethodInvoked';
};

export interface ThemeParams {
  bg_color?: string;
  bgColor?: string;
  text_color?: string;
  textColor?: string;
  hint_color?: string;
  hintColor?: string;
  link_color?: string;
  linkColor?: string;
  button_color?: string;
  buttonColor?: string;
  button_text_color?: string;
  buttonTextColor?: string;
  secondary_bg_color?: string;
  secondaryBgColor?: string;
  header_bg_color?: string;
  headerBgColor?: string;
  bottom_bar_bg_color?: string;
  bottomBarBgColor?: string;
  accent_text_color?: string;
  accentTextColor?: string;
  section_bg_color?: string;
  sectionBgColor?: string;
  section_header_text_color?: string;
  sectionHeaderTextColor?: string;
  section_separator_color?: string;
  sectionSeparatorColor?: string;
  subtitle_text_color?: string;
  subtitleTextColor?: string;
  destructive_text_color?: string;
  destructiveTextColor?: string;
  [key: string]: any;
}

export const DefaultThemeParams: ThemeParams;

// ==========================================
// Core Entities & Messaging Types
// ==========================================

export interface Peer {
  type: PeerType | number;
  id: number;
}

export interface User {
  id: number;
  accessHash?: bigint | string;
  name?: string;
  localName?: string;
  username?: string;
  phone?: string;
  avatar?: any;
}

export interface Group {
  id: number;
  accessHash?: bigint | string;
  title: string;
  avatar?: any;
  memberCount?: number;
  isChannel?: boolean;
}

export interface Dialog {
  peer: Peer;
  unreadCount?: number;
  lastMessage?: any;
  sortDate?: bigint | number;
}

export interface PhotoAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  width?: number;
  height?: number;
  caption?: string;
  name?: string;
}

export interface VoiceAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  duration?: number;
  waveForm?: Buffer | Uint8Array;
  caption?: string;
}

export interface AudioAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  duration?: number;
  title?: string;
  performer?: string;
  caption?: string;
  name?: string;
}

export interface VideoAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  duration?: number;
  width?: number;
  height?: number;
  caption?: string;
  name?: string;
}

export interface DocumentAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  name?: string;
  mimeType?: string;
  caption?: string;
}

export interface GiftPacketMessage {
  giftCount: number;
  totalAmount: bigint;
  givingType: number;
  walletId?: string;
  regarding?: string;
  ownerUserId?: number;
  coverId?: number;
  showTotalAmount?: boolean;
}

export interface GoldGiftPacketMessage {
  packetId: bigint | string;
}

export interface GiftReceiver {
  userId: number;
  amount: bigint;
  date: bigint;
  rank: number;
}

export interface OpenGiftPacketResponse {
  giftReceivers: GiftReceiver[];
  receivers: GiftReceiver[];
  status: number;
  openedCount: number;
  winnerCount: number;
  selfWinAmount: bigint;
  amount: bigint;
  rank: number;
  isCurrentWinner: boolean;
  userOutPeers: any[];
  description: string;
  message: string;
}

export interface OpenGoldGiftPacketResponse {
  openedCount: number;
  selfWinAmount: bigint;
  amount: bigint;
  rank: number;
  giftReceivers: GiftReceiver[];
  receivers: GiftReceiver[];
  status: number;
}

export interface GetWinnerIDsResponse {
  winnerIds: (number | bigint)[];
}

export interface ServiceMessage {
  text?: string;
  ext?: {
    giftPacketOpened?: {
      giftPacketId: bigint;
      receiverUserId: number;
      amount: bigint;
    };
    miniAppDataSent?: {
      data: string;
      buttonText?: string;
    };
    groupCreated?: any;
    userInvited?: any;
    userKicked?: any;
    userLeft?: any;
  };
}

export interface MessageReplyOptions {
  humanize?: boolean;
  simulateTyping?: boolean;
  typingType?: TypingType | number;
  quoteMessageId?: string | number | bigint;
}

/**
 * Rich message event received in client.on('message', ...)
 */
export interface MessageEvent {
  senderId: number;
  peer: Peer;
  date: number | bigint;
  randomId: string | number | bigint;
  text: string;
  rawMessage: any;
  isGroup: boolean;
  isOut: boolean;
  isPhoto: boolean;
  isVoice: boolean;
  isAudio: boolean;
  isVideo: boolean;
  isDocument: boolean;
  isSticker: boolean;
  isGiftPacket: boolean;
  isGoldGiftPacket: boolean;
  isService: boolean;
  giftPacket: GiftPacketMessage | null;
  goldGiftPacket: GoldGiftPacketMessage | null;
  serviceMessage: ServiceMessage | null;

  // Actions
  reply(replyText: string, options?: MessageReplyOptions): Promise<any>;
  replyPhoto(options: PhotoAttachment): Promise<any>;
  replyVoice(options: VoiceAttachment): Promise<any>;
  replyAudio(options: AudioAttachment): Promise<any>;
  replyVideo(options: VideoAttachment): Promise<any>;
  replyDocument(options: DocumentAttachment): Promise<any>;
  edit(newText: string): Promise<any>;
  markAsReceived(): Promise<any>;
  markAsRead(): Promise<any>;
  sendTyping(durationMs?: number, typingType?: TypingType | number): Promise<any>;
  react(emoji: string): Promise<any>;
  delete(): Promise<any>;
  pin(): Promise<any>;
  forwardTo(toPeer: number | Peer): Promise<any>;

  // Cash Gift Packet actions
  openGiftPacket(walletId?: string): Promise<OpenGiftPacketResponse>;
  claimGiftPacket(walletId?: string): Promise<OpenGiftPacketResponse>;
  getGiftPacket(): Promise<OpenGiftPacketResponse>;
  getGiftPacketReceivers(pageNo?: number): Promise<GiftReceiver[]>;

  // Gold Gift Packet actions
  openGoldGiftPacket(): Promise<OpenGoldGiftPacketResponse>;
  claimGoldGiftPacket(): Promise<OpenGoldGiftPacketResponse>;
  getGoldWinners(): Promise<GetWinnerIDsResponse>;
}

// ==========================================
// Update & Event Data Structures (60+ Events)
// ==========================================

export interface MessageEditUpdate {
  peer: Peer;
  rid: string | number | bigint;
  message: any;
  date: number | bigint;
}

export interface MessageDeleteUpdate {
  peer: Peer;
  rids: (string | number | bigint)[];
}

export interface ChatClearUpdate {
  peer: Peer;
}

export interface MessageReceivedUpdate {
  peer: Peer;
  startDate: number | bigint;
  date: number | bigint;
}

export interface MessageReadUpdate {
  peer: Peer;
  startDate: number | bigint;
  date: number | bigint;
}

export interface ReactionUpdate {
  peer: Peer;
  rid: string | number | bigint;
  reactions?: any[];
  reactionByMe?: any;
  userId?: number;
  code?: string;
}

export interface TypingUpdate {
  peer: Peer;
  userId: number;
  typingType: TypingType | number;
}

export interface TypingStopUpdate {
  peer: Peer;
  userId: number;
}

export interface UserOnlineUpdate {
  userId: number;
  deviceType?: DeviceType | number;
}

export interface UserOfflineUpdate {
  userId: number;
  lastSeen?: number | bigint;
}

export interface CallUpdate {
  callId?: string | number | bigint;
  peer?: Peer;
  userId?: number;
  [key: string]: any;
}

export interface GiftPacketOpenedEvent {
  giftPacketId: bigint;
  receiverUserId: number;
  amount: bigint;
  message?: MessageEvent;
}

export interface MiniAppDataEvent {
  data: string;
  buttonText?: string;
  message?: MessageEvent;
}

export interface ServiceMessageEvent extends ServiceMessage {
  message?: MessageEvent;
}

export interface GenericUpdate {
  type?: string;
  data?: any;
  [key: string]: any;
}

export interface ConnectedInfo {
  uid: number;
  url: string;
  timestamp: number;
}

export interface DisconnectedInfo {
  code: number;
  reason: string;
}

export interface UpdateContainer {
  type: string;
  data: any;
  raw?: Buffer;
}

export interface BaleEventMap {
  message: MessageEvent;
  giftPacket: MessageEvent;
  goldGiftPacket: MessageEvent;
  giftPacketOpened: GiftPacketOpenedEvent;
  miniAppData: MiniAppDataEvent;
  serviceMessage: ServiceMessageEvent;
  groupCreated: any;
  userInvited: any;
  userKicked: any;
  userLeft: any;
  messageEdit: MessageEditUpdate;
  messageDelete: MessageDeleteUpdate;
  chatClear: ChatClearUpdate;
  chatDelete: GenericUpdate;
  messageReceived: MessageReceivedUpdate;
  messageRead: MessageReadUpdate;
  messageReadByMe: MessageReadUpdate;
  chatShow: GenericUpdate;
  chatArchive: GenericUpdate;
  chatFavourite: GenericUpdate;
  messageDateChanged: GenericUpdate;
  stickerCollectionsChanged: GenericUpdate;
  messageQuotedChanged: GenericUpdate;
  mentionReadByMe: GenericUpdate;
  pinnedDialogsChanged: GenericUpdate;
  dialogsMarkedAsRead: GenericUpdate;
  dialogsMarkedAsUnread: GenericUpdate;
  dialogsUnpinned: GenericUpdate;
  messagePinned: GenericUpdate;
  messagesUnPinned: GenericUpdate;
  dialogArchiveStatus: GenericUpdate;
  messageStreamChunks: GenericUpdate;
  reaction: ReactionUpdate;
  messageNewReaction: ReactionUpdate;
  messageReactionsReadByMe: GenericUpdate;
  typing: TypingUpdate;
  typingStop: TypingStopUpdate;
  userOnline: UserOnlineUpdate;
  userOffline: UserOfflineUpdate;
  userLastSeen: GenericUpdate;
  presence: any;
  botCallbackQuery: any;
  userAvatarChanged: GenericUpdate;
  userNameChanged: GenericUpdate;
  userLocalNameChanged: GenericUpdate;
  userContactsChanged: GenericUpdate;
  userNickChanged: GenericUpdate;
  userAboutChanged: GenericUpdate;
  userPreferredLanguagesChanged: GenericUpdate;
  userTimeZoneChanged: GenericUpdate;
  userBotCommandsChanged: GenericUpdate;
  userBlocked: GenericUpdate;
  userUnblocked: GenericUpdate;
  phoneNumberChanged: GenericUpdate;
  contactsAdded: GenericUpdate;
  contactsRemoved: GenericUpdate;
  allContactsRemoved: GenericUpdate;
  groupOnline: GenericUpdate;
  groupNicknameChanged: GenericUpdate;
  groupMessagePinned: GenericUpdate;
  groupPinRemoved: GenericUpdate;
  groupRestrictionChanged: GenericUpdate;
  groupTitleChanged: GenericUpdate;
  groupAvatarChanged: GenericUpdate;
  groupMemberChanged: GenericUpdate;
  groupExtChanged: GenericUpdate;
  groupMembersUpdated: GenericUpdate;
  groupTopicChanged: GenericUpdate;
  groupAboutChanged: GenericUpdate;
  groupOwnerChanged: GenericUpdate;
  groupHistoryShared: GenericUpdate;
  groupMembersCountChanged: GenericUpdate;
  groupMemberDiff: GenericUpdate;
  groupCanSendMessagesChanged: GenericUpdate;
  groupCanViewMembersChanged: GenericUpdate;
  groupCanInviteMembersChanged: GenericUpdate;
  groupMemberAdminChanged: GenericUpdate;
  groupBecameOrphaned: GenericUpdate;
  groupMemberPermissionsChanged: GenericUpdate;
  groupDefaultPermissionsChanged: GenericUpdate;
  channelNickChanged: GenericUpdate;
  channelAdvertisementTypeChanged: GenericUpdate;
  channelAdTagIdChanged: GenericUpdate;
  channelSignMessagesChanged: GenericUpdate;
  slowModeChanged: GenericUpdate;
  callStarted: CallUpdate;
  callAccepted: CallUpdate;
  callDiscarded: CallUpdate;
  callReceived: CallUpdate;
  groupCallStarted: CallUpdate;
  groupCallEnded: CallUpdate;
  callReactionSent: CallUpdate;
  callUpgraded: CallUpdate;
  peersInvited: CallUpdate;
  multiPeerCallStarted: CallUpdate;
  peersStateChanged: CallUpdate;
  call: CallUpdate;
  connected: ConnectedInfo;
  disconnected: DisconnectedInfo;
  status: string;
  error: Error;
  update: UpdateContainer;
  [event: string]: any;
}

export type UpdateEventMap = BaleEventMap;

// ==========================================
// Mini App Parameter Engine
// ==========================================

export interface MiniAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface MiniAppInitDataOptions {
  user?: MiniAppUser;
  queryId?: string;
  authDate?: number;
  startParam?: string;
  chatType?: string;
  chatInstance?: string;
  botToken?: string;
  customParams?: Record<string, string>;
}

export interface MiniAppParsedInitData {
  query_id?: string;
  user?: MiniAppUser;
  auth_date?: number;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
  hash?: string;
  rawParams: Record<string, string>;
}

export interface MiniAppBuildUrlOptions {
  webAppUrl: string;
  initData?: string;
  themeParams?: ThemeParams;
  platform?: string;
  version?: string;
}

export class MiniAppUtils {
  static createInitData(options?: MiniAppInitDataOptions): string;
  static signInitData(data: Record<string, any> | string, botToken: string): string;
  static validateInitData(
    initData: string,
    botToken: string,
    maxAgeSeconds?: number
  ): { valid: boolean; data?: MiniAppParsedInitData; error?: string };
  static parseInitData(initData: string): MiniAppParsedInitData;
  static buildMiniAppUrl(options: MiniAppBuildUrlOptions): string;
}

// ==========================================
// Sessions & Connection
// ==========================================

export abstract class Session {
  token: string | null;
  uid: number | null;
  user: User | null;
  deviceHash: Buffer;
  phone: string | null;
  constructor();
  save(): string;
  load(data: string): void;
}

export class StringSession extends Session {
  constructor(sessionString?: string);
  save(): string;
  load(sessionString: string): void;
}

export class FileSession extends Session {
  constructor(filePath: string);
  save(): string;
  load(filePath: string): void;
}

export class BaleConnection extends EventEmitter {
  constructor(options: { endpoint: string; session: Session; autoReconnect?: boolean });
  get isConnected(): boolean;
  connect(): Promise<any>;
  close(): void;
  sendRequest(serviceName: string, methodName: string, payload?: Buffer, metadata?: any): Promise<Buffer>;
}

// ==========================================
// Client Configuration
// ==========================================

export interface HumanizeConfig {
  enabled?: boolean;
  keepOnline?: boolean;
  autoMarkAsRead?: boolean;
  readDelay?: [number, number];
  typingDurationPerChar?: number;
  minTypingDelay?: number;
  maxTypingDelay?: number;
  typingType?: TypingType | number;
}

export interface BaleClientOptions {
  endpoint?: string;
  session?: Session | string;
  autoReconnect?: boolean;
  stealth?: boolean;
  humanize?: boolean | HumanizeConfig;
}

// ==========================================
// BaleClient Class
// ==========================================

export class BaleClient extends EventEmitter {
  options: BaleClientOptions;
  session: Session;
  connection: BaleConnection;
  humanize: HumanizeConfig;
  miniapp: typeof MiniAppUtils;
  services: Record<string, any>;

  // Dynamic 53 Service Namespaces
  messaging: any;
  auth: any;
  banking: any;
  giftPacket: any;
  goldGiftPacket: any;
  appzar: any;
  ketf: any;
  groups: any;
  presence: any;
  users: any;
  files: any;
  story: any;
  poll: any;
  kifpool: any;
  abacus: any;
  advertisement: any;
  [namespace: string]: any;

  constructor(options?: BaleClientOptions);

  get isConnected(): boolean;
  get me(): User | null;

  connect(): Promise<any>;
  disconnect(): void;

  // ==========================================
  // Authentication Flow
  // ==========================================

  sendCode(phoneNumber: string): Promise<{ transactionHash: string }>;
  signIn(code: string | number, transactionHash?: string): Promise<any>;
  signInWithPassword(password: string, transactionHash?: string): Promise<any>;
  logout(): Promise<any>;

  // ==========================================
  // Messaging Operations
  // ==========================================

  sendMessage(
    peer: number | Peer,
    text: string,
    options?: {
      replyToMessageId?: string | number | bigint;
      humanize?: boolean;
      simulateTyping?: boolean;
      typingType?: TypingType | number;
    }
  ): Promise<any>;
  sendTextMessage(
    peer: number | Peer,
    text: string,
    options?: {
      replyToMessageId?: string | number | bigint;
      humanize?: boolean;
      simulateTyping?: boolean;
      typingType?: TypingType | number;
    }
  ): Promise<any>;

  sendPhoto(peer: number | Peer, options: PhotoAttachment): Promise<any>;
  sendVoice(peer: number | Peer, options: VoiceAttachment): Promise<any>;
  sendAudio(peer: number | Peer, options: AudioAttachment): Promise<any>;
  sendVideo(peer: number | Peer, options: VideoAttachment): Promise<any>;
  sendDocument(peer: number | Peer, options: DocumentAttachment): Promise<any>;
  sendSticker(
    peer: number | Peer,
    stickerId: number | string,
    accessHash: number | string | bigint,
    stickerPackId?: number | string
  ): Promise<any>;

  loadDialogs(limit?: number, minDate?: number | bigint): Promise<{ dialogs: Dialog[]; users: User[]; groups: Group[] }>;
  loadHistory(peer: number | Peer, limit?: number, endDate?: number | bigint): Promise<any>;

  markAsReceived(peer: number | Peer, date: number | bigint): Promise<any>;
  markAsRead(peer: number | Peer, date: number | bigint): Promise<any>;
  sendTyping(peer: number | Peer, durationMs?: number, typingType?: TypingType | number): Promise<any>;
  stopTyping(peer: number | Peer, typingType?: TypingType | number): Promise<any>;
  setOnline(isOnline?: boolean, timeout?: number): Promise<any>;

  editMessage(peer: number | Peer, messageId: string | number, newText: string): Promise<any>;
  forwardMessages(
    toPeer: number | Peer,
    fromPeer: number | Peer,
    mids: (string | number)[],
    options?: { hideSender?: boolean }
  ): Promise<any>;
  pinMessage(peer: number | Peer, messageId: string | number): Promise<any>;
  deleteMessages(peer: number | Peer, messageIds: (string | number)[]): Promise<any>;
  clearChat(peer: number | Peer): Promise<any>;

  // ==========================================
  // Group & Channel Administration
  // ==========================================

  createGroup(title: string, userIds?: number[]): Promise<any>;
  inviteMembers(groupId: number | string, userIds: number[]): Promise<any>;
  kickMember(groupId: number | string, userId: number | string): Promise<any>;
  setGroupTitle(groupId: number | string, title: string): Promise<any>;
  leaveGroup(groupId: number | string): Promise<any>;
  getGroup(groupId: number | string): Promise<Group>;

  // ==========================================
  // Contacts & Profile Management
  // ==========================================

  getUser(userId: number | string): Promise<User>;
  getContacts(): Promise<User[]>;
  addContact(phone: string, name?: string): Promise<any>;
  addContactByUid(uid: number | string, accessHash?: bigint | number | string): Promise<any>;
  importContacts(contacts: Array<{ phone: string; name?: string }>): Promise<any>;
  removeContact(userId: number | string, accessHash?: bigint | number | string): Promise<any>;
  searchContacts(query: string): Promise<User[]>;

  editName(name: string): Promise<any>;
  editAbout(about: string): Promise<any>;
  editUsername(username: string): Promise<any>;
  checkUsername(username: string): Promise<{ isAvailable: boolean }>;
  blockUser(userId: number | string): Promise<any>;
  unblockUser(userId: number | string): Promise<any>;
  loadBlockedUsers(): Promise<User[]>;

  // ==========================================
  // Reactions & Folders
  // ==========================================

  setReaction(peer: number | Peer, messageId: string | number, emoji: string): Promise<any>;
  removeReaction(peer: number | Peer, messageId: string | number, emoji: string): Promise<any>;
  getReactions(peer: number | Peer, messageIds: (string | number)[]): Promise<any>;

  createFolder(name: string, peers: (number | Peer)[]): Promise<any>;
  loadFolders(): Promise<any[]>;
  deleteFolder(folderId: number | string): Promise<any>;

  // ==========================================
  // Polls & Bot Interaction
  // ==========================================

  sendPoll(
    peer: number | Peer,
    question: string,
    options: string[],
    pollOptions?: { isAnonymous?: boolean; isMultipleChoice?: boolean; isQuiz?: boolean }
  ): Promise<any>;
  createPoll(options: any): Promise<any>;
  closePoll(pollId: number | string | bigint): Promise<any>;
  getPollResults(pollId: number | string | bigint): Promise<any>;

  getWalletCredit(): Promise<any>;
  getWalletPoints(): Promise<any>;
  sendInlineCallback(peer: number | Peer, messageId: number | string, data: string | Buffer): Promise<any>;

  // ==========================================
  // Shetab Banking & Card-to-Card
  // ==========================================

  inquireDestinationPan(sourcePan: string, destinationPan: string, amountRials: number | string | bigint): Promise<{ cardHolderName: string; inquiryToken: string }>;
  transferMoneyByCard(options: {
    sourcePan: string;
    destinationPan: string;
    amountRials: number | string | bigint;
    cvv2: string;
    expireDate: string;
    pin2: string;
    inquiryToken: string;
    description?: string;
  }): Promise<any>;
  getCardBalance(options: { sourcePan: string; pin2: string; cvv2: string; expireDate: string }): Promise<{ balanceRials: string; availableBalanceRials: string }>;

  // ==========================================
  // Cash & Gold Gift Packets
  // ==========================================

  sendGiftPacket(options: {
    peer: number | Peer;
    amount: number | string | bigint;
    count?: number;
    message?: string;
    sourceWalletId?: string;
    givingType?: number;
    coverId?: number;
    showTotalAmount?: boolean;
  }): Promise<any>;

  openGiftPacket(options: {
    peer: number | Peer;
    randomId: number | string | bigint;
    date?: number | string | bigint;
    walletId?: string;
    pageNo?: number;
    orderType?: number;
  }): Promise<OpenGiftPacketResponse>;

  claimGiftPacket(options: {
    peer: number | Peer;
    randomId: number | string | bigint;
    date?: number | string | bigint;
    walletId?: string;
    pageNo?: number;
    orderType?: number;
  }): Promise<OpenGiftPacketResponse>;

  getGiftPacket(options: {
    peer: number | Peer;
    randomId: number | string | bigint;
    date?: number | string | bigint;
    walletId?: string;
    pageNo?: number;
    orderType?: number;
  }): Promise<OpenGiftPacketResponse>;

  getGiftPacketReceivers(options: {
    peer: number | Peer;
    randomId: number | string | bigint;
    date?: number | string | bigint;
    walletId?: string;
    pageNo?: number;
    orderType?: number;
  }): Promise<GiftReceiver[]>;

  getGiftPacketPaymentToken(options?: any): Promise<any>;

  sendGoldGiftPacket(options: {
    peer: number | Peer;
    amountMilligrams: number | string | bigint;
    count?: number;
    message?: string;
    givingType?: number;
  }): Promise<{ giftPacketId: bigint }>;

  sendGoldPacket(options: {
    peerId: number | Peer;
    goldMilligrams: number | string | bigint;
    message?: string;
    packetType?: number;
  }): Promise<{ giftPacketId: bigint }>;

  openGoldGiftPacket(giftPacketId: number | string | bigint): Promise<OpenGoldGiftPacketResponse>;
  claimGoldGiftPacket(giftPacketId: number | string | bigint): Promise<OpenGoldGiftPacketResponse>;
  getGoldGiftPacket(giftPacketId: number | string | bigint): Promise<GetWinnerIDsResponse>;
  getGoldGiftPacketWinners(giftPacketId: number | string | bigint): Promise<GetWinnerIDsResponse>;
  getGoldWinners(giftPacketId: number | string | bigint): Promise<GetWinnerIDsResponse>;

  // ==========================================
  // Mini Apps / WebApps API
  // ==========================================

  getMiniAppUrl(options: {
    botUserId: number | string;
    screenMode?: ScreenMode | number;
    directLink?: string;
    themeParams?: ThemeParams;
  }): Promise<{ url: string; screenMode: number; queryId: string }>;

  getWebappHash(botUserId: number | string, data?: string): Promise<{ hash: string; authDate: number; queryId: string }>;

  createMiniAppParams(
    botUserId: number | string,
    options?: {
      startParam?: string;
      appUrl?: string;
      platform?: string;
      theme?: ThemeParams;
      botToken?: string;
    }
  ): Promise<{
    queryId: string;
    authDate: number;
    hash: string;
    initData: string;
    themeParams: ThemeParams;
    platform: string;
    launchUrl: string;
  }>;

  createInitData(options?: MiniAppInitDataOptions): string;
  signInitData(data: Record<string, any> | string, botToken: string): string;
  validateInitData(initData: string, botToken: string, maxAgeSeconds?: number): { valid: boolean; data?: MiniAppParsedInitData; error?: string };
  parseInitData(initData: string): MiniAppParsedInitData;
  buildMiniAppUrl(options?: MiniAppBuildUrlOptions): string;

  sendMiniAppData(options: {
    botUserId: number | string;
    queryId?: string;
    data: string | any;
    buttonText?: string;
  }): Promise<any>;

  getBotMenuButton(botUserId: number | string): Promise<{ menuButton: any }>;
  invokeMiniAppCustomMethod(options: {
    botUserId: number | string;
    method: string;
    params?: string | any;
  }): Promise<any>;

  // ==========================================
  // Stories API
  // ==========================================

  sendStory(options?: any): Promise<any>;
  deleteStory(storyId: number | string | bigint): Promise<any>;
  getUserStories(userId: number | string): Promise<any[]>;
  likeStory(storyId: number | string | bigint): Promise<any>;
  getStoryViewers(storyId: number | string | bigint): Promise<any[]>;

  // ==========================================
  // Scheduled Messages
  // ==========================================

  scheduleMessage(peer: number | Peer, text: string, sendDate: number | Date): Promise<any>;
  loadScheduledMessages(peer: number | Peer): Promise<any[]>;
  deleteScheduledMessage(peer: number | Peer, messageId: string | number): Promise<any>;

  // ==========================================
  // AI & TLDR
  // ==========================================

  summarizeLink(url: string): Promise<{ summary: string }>;
  askAI(prompt: string, context?: any): Promise<{ answer: string }>;

  // ==========================================
  // Humanize & Anti-Ban Controls
  // ==========================================

  setHumanize(value: boolean | HumanizeConfig): boolean;
  enableHumanize(config?: HumanizeConfig): boolean;
  disableHumanize(): boolean;

  invoke(serviceName: string, methodName: string, payload?: Buffer | Uint8Array | object, metadata?: any): Promise<any>;

  // ==========================================
  // Utilities & Internal Methods
  // ==========================================

  sleep(ms: number): Promise<void>;
  _sendDocumentMessage?(peer: number | Peer, file: any, options?: any): Promise<any>;
  _startOnlineHeartbeat?(): void;
  _stopOnlineHeartbeat?(): void;
  _handleUpdate?(update: any): Promise<void>;
  _initServiceNamespaces?(): void;

  // ==========================================
  // Typed Event Emitter Overloads
  // ==========================================

  on(event: 'message', listener: (msg: MessageEvent) => void): this;
  on(event: 'giftPacket', listener: (msg: MessageEvent) => void): this;
  on(event: 'goldGiftPacket', listener: (msg: MessageEvent) => void): this;
  on(event: 'giftPacketOpened', listener: (evt: GiftPacketOpenedEvent) => void): this;
  on(event: 'miniAppData', listener: (evt: MiniAppDataEvent) => void): this;
  on(event: 'serviceMessage', listener: (evt: ServiceMessageEvent) => void): this;
  on(event: 'groupCreated', listener: (evt: any) => void): this;
  on(event: 'userInvited', listener: (evt: any) => void): this;
  on(event: 'userKicked', listener: (evt: any) => void): this;
  on(event: 'userLeft', listener: (evt: any) => void): this;

  on(event: 'messageEdit', listener: (data: MessageEditUpdate) => void): this;
  on(event: 'messageDelete', listener: (data: MessageDeleteUpdate) => void): this;
  on(event: 'chatClear', listener: (data: ChatClearUpdate) => void): this;
  on(event: 'chatDelete', listener: (data: GenericUpdate) => void): this;
  on(event: 'messageReceived', listener: (data: MessageReceivedUpdate) => void): this;
  on(event: 'messageRead', listener: (data: MessageReadUpdate) => void): this;
  on(event: 'messageReadByMe', listener: (data: MessageReadUpdate) => void): this;
  on(event: 'chatShow', listener: (data: GenericUpdate) => void): this;
  on(event: 'chatArchive', listener: (data: GenericUpdate) => void): this;
  on(event: 'chatFavourite', listener: (data: GenericUpdate) => void): this;
  on(event: 'messageDateChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'stickerCollectionsChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'messageQuotedChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'mentionReadByMe', listener: (data: GenericUpdate) => void): this;
  on(event: 'pinnedDialogsChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'dialogsMarkedAsRead', listener: (data: GenericUpdate) => void): this;
  on(event: 'dialogsMarkedAsUnread', listener: (data: GenericUpdate) => void): this;
  on(event: 'dialogsUnpinned', listener: (data: GenericUpdate) => void): this;
  on(event: 'messagePinned', listener: (data: GenericUpdate) => void): this;
  on(event: 'messagesUnPinned', listener: (data: GenericUpdate) => void): this;
  on(event: 'dialogArchiveStatus', listener: (data: GenericUpdate) => void): this;
  on(event: 'messageStreamChunks', listener: (data: GenericUpdate) => void): this;

  on(event: 'reaction', listener: (data: ReactionUpdate) => void): this;
  on(event: 'messageNewReaction', listener: (data: ReactionUpdate) => void): this;
  on(event: 'messageReactionsReadByMe', listener: (data: GenericUpdate) => void): this;

  on(event: 'typing', listener: (data: TypingUpdate) => void): this;
  on(event: 'typingStop', listener: (data: TypingStopUpdate) => void): this;
  on(event: 'userOnline', listener: (data: UserOnlineUpdate) => void): this;
  on(event: 'userOffline', listener: (data: UserOfflineUpdate) => void): this;
  on(event: 'userLastSeen', listener: (data: GenericUpdate) => void): this;
  on(event: 'presence', listener: (data: any) => void): this;

  on(event: 'userAvatarChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'userNameChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'userLocalNameChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'userContactsChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'userNickChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'userAboutChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'userPreferredLanguagesChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'userTimeZoneChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'userBotCommandsChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'userBlocked', listener: (data: GenericUpdate) => void): this;
  on(event: 'userUnblocked', listener: (data: GenericUpdate) => void): this;
  on(event: 'phoneNumberChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'contactsAdded', listener: (data: GenericUpdate) => void): this;
  on(event: 'contactsRemoved', listener: (data: GenericUpdate) => void): this;
  on(event: 'allContactsRemoved', listener: (data: GenericUpdate) => void): this;

  on(event: 'groupOnline', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupNicknameChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupMessagePinned', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupPinRemoved', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupRestrictionChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupTitleChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupAvatarChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupMemberChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupExtChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupMembersUpdated', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupTopicChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupAboutChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupOwnerChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupHistoryShared', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupMembersCountChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupMemberDiff', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupCanSendMessagesChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupCanViewMembersChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupCanInviteMembersChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupMemberAdminChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupBecameOrphaned', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupMemberPermissionsChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'groupDefaultPermissionsChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'channelNickChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'channelAdvertisementTypeChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'channelAdTagIdChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'channelSignMessagesChanged', listener: (data: GenericUpdate) => void): this;
  on(event: 'slowModeChanged', listener: (data: GenericUpdate) => void): this;

  on(event: 'callStarted', listener: (data: CallUpdate) => void): this;
  on(event: 'callAccepted', listener: (data: CallUpdate) => void): this;
  on(event: 'callDiscarded', listener: (data: CallUpdate) => void): this;
  on(event: 'callReceived', listener: (data: CallUpdate) => void): this;
  on(event: 'groupCallStarted', listener: (data: CallUpdate) => void): this;
  on(event: 'groupCallEnded', listener: (data: CallUpdate) => void): this;
  on(event: 'callReactionSent', listener: (data: CallUpdate) => void): this;
  on(event: 'callUpgraded', listener: (data: CallUpdate) => void): this;
  on(event: 'peersInvited', listener: (data: CallUpdate) => void): this;
  on(event: 'multiPeerCallStarted', listener: (data: CallUpdate) => void): this;
  on(event: 'peersStateChanged', listener: (data: CallUpdate) => void): this;
  on(event: 'botCallbackQuery', listener: (data: any) => void): this;
  on(event: 'call', listener: (data: CallUpdate) => void): this;

  on(event: 'connected', listener: (info: ConnectedInfo) => void): this;
  on(event: 'disconnected', listener: (evt: DisconnectedInfo) => void): this;
  on(event: 'status', listener: (status: string) => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: 'update', listener: (update: UpdateContainer) => void): this;

  on<K extends keyof BaleEventMap>(event: K, listener: (data: BaleEventMap[K]) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;

  once<K extends keyof BaleEventMap>(event: K, listener: (data: BaleEventMap[K]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;

  emit<K extends keyof BaleEventMap>(event: K, data?: BaleEventMap[K]): boolean;
  emit(event: string, ...args: any[]): boolean;
}

// ==========================================
// Protobuf Utility Interfaces
// ==========================================

export class ProtoWriter {
  writeVarint(value: number | bigint): void;
  writeInt32(fieldNumber: number, value: number): void;
  writeInt64(fieldNumber: number, value: number | bigint): void;
  writeBool(fieldNumber: number, value: boolean): void;
  writeString(fieldNumber: number, value: string): void;
  writeBytes(fieldNumber: number, value: Buffer | Uint8Array): void;
  writeMessage(fieldNumber: number, value: Buffer | Uint8Array): void;
  finish(): Buffer;
}

export class ProtoReader {
  constructor(buffer: Buffer | Uint8Array);
  hasMore(): boolean;
  readTag(): { fieldNumber: number; wireType: number };
  readVarint(): bigint;
  readInt32(): number;
  readInt64(): bigint;
  readBool(): boolean;
  readString(length: number): string;
  readBytes(length: number): Buffer;
  skip(wireType: number): void;
}

export const Proto: {
  ProtoWriter: typeof ProtoWriter;
  ProtoReader: typeof ProtoReader;
  [key: string]: any;
};

export const servicesCatalog: {
  servicesCount: number;
  methodsCount: number;
  services: Record<string, {
    serviceName: string;
    namespace: string;
    methods: Array<{
      methodName: string;
      serviceName: string;
      requestSchema: any;
      responseSchema: any;
    }>;
  }>;
// ==========================================
// Official Bale HTTP Bot API (https://docs.bale.ai/)
// ==========================================

export interface BaleBotOptions {
  baseUrl?: string;
  timeout?: number;
}

export interface BotUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface BotChat {
  id: number;
  type: 'private' | 'group' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface BotInvoice {
  title: string;
  description: string;
  start_parameter?: string;
  currency: string;
  total_amount: number;
}

export interface BotSuccessfulPayment {
  currency: string;
  total_amount: number;
  invoice_payload: string;
}

export interface BotMessage {
  message_id: number;
  from?: BotUser;
  date?: number;
  chat: BotChat;
  text?: string;
  caption?: string;
  reply_to_message?: BotMessage;
  photo?: any[];
  audio?: any;
  document?: any;
  video?: any;
  voice?: any;
  animation?: any;
  contact?: any;
  location?: any;
  invoice?: BotInvoice;
  successful_payment?: BotSuccessfulPayment;
  web_app_data?: { data: string; button_text: string };
  [key: string]: any;
}

export interface BotCallbackQuery {
  id: string;
  from: BotUser;
  message?: BotMessage;
  inline_message_id?: string;
  chat_instance?: string;
  data?: string;
}

export interface BotPreCheckoutQuery {
  id: string;
  from: BotUser;
  currency: string;
  total_amount: number;
  invoice_payload: string;
}

export interface BotTransaction {
  transaction_id: string;
  status: string;
  amount: number;
  currency?: string;
  payer_id?: number;
  creation_date?: number;
  [key: string]: any;
}

export interface BotLabeledPrice {
  label: string;
  amount: number;
}

export interface BotUpdate {
  update_id: number;
  message?: BotMessage;
  edited_message?: BotMessage;
  callback_query?: BotCallbackQuery;
  pre_checkout_query?: BotPreCheckoutQuery;
}

export class InlineKeyboard {
  inline_keyboard: Array<Array<{
    text: string;
    url?: string;
    callback_data?: string;
    web_app?: { url: string };
    copy_text?: { text: string };
    [key: string]: any;
  }>>;
  button(text: string, callbackData: string): this;
  url(text: string, url: string): this;
  webApp(text: string, webAppUrl: string): this;
  copyText(text: string, copyText: string): this;
  row(): this;
  toJSON(): { inline_keyboard: any[][] };
}

export class ReplyKeyboard {
  keyboard: any[][];
  resize_keyboard: boolean;
  one_time_keyboard: boolean;
  constructor(options?: { resize?: boolean; oneTime?: boolean });
  button(text: string): this;
  requestContact(text: string): this;
  requestLocation(text: string): this;
  row(): this;
  resize(resize?: boolean): this;
  oneTime(oneTime?: boolean): this;
  toJSON(): { keyboard: any[][]; resize_keyboard: boolean; one_time_keyboard: boolean };
}

export const KeyboardRemove: {
  remove_keyboard: true;
};

export class BaleBot extends EventEmitter {
  token: string;
  baseUrl: string;
  timeout: number;

  constructor(token: string, options?: BaleBotOptions);

  getMethodUrl(method: string): string;
  getFileUrl(filePath: string): string;
  call(method: string, params?: any, files?: any): Promise<any>;

  getMe(): Promise<BotUser>;
  logout(): Promise<boolean>;
  close(): Promise<boolean>;

  getUpdates(options?: { offset?: number; limit?: number; timeout?: number }): Promise<BotUpdate[]>;
  setWebhook(urlOrOptions: string | { url: string; [key: string]: any }): Promise<boolean>;
  deleteWebhook(): Promise<boolean>;
  getWebhookInfo(): Promise<{ url: string; [key: string]: any }>;

  startPolling(options?: { interval?: number; limit?: number; timeout?: number }): void;
  stopPolling(): void;
  handleUpdate(update: BotUpdate): void;
  createWebhookMiddleware(options?: { secretToken?: string }): (req: any, res: any) => void;

  sendMessage(chatId: number | string, text: string, options?: {
    parse_mode?: 'Markdown' | 'HTML';
    reply_to_message_id?: number;
    reply_markup?: any;
    [key: string]: any;
  }): Promise<BotMessage>;

  forwardMessage(chatId: number | string, fromChatId: number | string, messageId: number): Promise<BotMessage>;
  copyMessage(chatId: number | string, fromChatId: number | string, messageId: number, options?: any): Promise<{ message_id: number }>;

  sendPhoto(chatId: number | string, photo: string | Buffer | any, options?: any): Promise<BotMessage>;
  sendAudio(chatId: number | string, audio: string | Buffer | any, options?: any): Promise<BotMessage>;
  sendDocument(chatId: number | string, document: string | Buffer | any, options?: any): Promise<BotMessage>;
  sendVideo(chatId: number | string, video: string | Buffer | any, options?: any): Promise<BotMessage>;
  sendAnimation(chatId: number | string, animation: string | Buffer | any, options?: any): Promise<BotMessage>;
  sendVoice(chatId: number | string, voice: string | Buffer | any, options?: any): Promise<BotMessage>;
  sendMediaGroup(chatId: number | string, media: any[]): Promise<BotMessage[]>;
  sendLocation(chatId: number | string, latitude: number, longitude: number, options?: any): Promise<BotMessage>;
  sendContact(chatId: number | string, phoneNumber: string, firstName: string, options?: any): Promise<BotMessage>;
  sendChatAction(chatId: number | string, action?: string): Promise<boolean>;

  getFile(fileId: string): Promise<{ file_id: string; file_size?: number; file_path?: string }>;
  downloadFile(filePathOrFileId: string, destinationPath?: string): Promise<Buffer | string>;

  answerCallbackQuery(callbackQueryId: string, options?: { text?: string; show_alert?: boolean; url?: string }): Promise<boolean>;
  askReview(chatId: number | string): Promise<boolean>;

  editMessageText(chatId: number | string, messageId: number, text: string, options?: any): Promise<BotMessage>;
  editMessageCaption(chatId: number | string, messageId: number, caption: string, options?: any): Promise<BotMessage>;
  editMessageReplyMarkup(chatId: number | string, messageId: number, replyMarkup: any): Promise<BotMessage>;
  deleteMessage(chatId: number | string, messageId: number): Promise<boolean>;

  banChatMember(chatId: number | string, userId: number): Promise<boolean>;
  unbanChatMember(chatId: number | string, userId: number): Promise<boolean>;
  promoteChatMember(chatId: number | string, userId: number, options?: any): Promise<boolean>;
  setChatPhoto(chatId: number | string, photo: string | Buffer | any): Promise<boolean>;
  deleteChatPhoto(chatId: number | string): Promise<boolean>;
  setChatTitle(chatId: number | string, title: string): Promise<boolean>;
  setChatDescription(chatId: number | string, description: string): Promise<boolean>;
  pinChatMessage(chatId: number | string, messageId: number): Promise<boolean>;
  unpinChatMessage(chatId: number | string, messageId?: number): Promise<boolean>;
  unpinAllChatMessages(chatId: number | string): Promise<boolean>;
  leaveChat(chatId: number | string): Promise<boolean>;
  getChat(chatId: number | string): Promise<any>;
  getChatAdministrators(chatId: number | string): Promise<any[]>;
  getChatMembersCount(chatId: number | string): Promise<number>;
  getChatMember(chatId: number | string, userId: number): Promise<any>;
  createChatInviteLink(chatId: number | string): Promise<any>;
  revokeChatInviteLink(chatId: number | string, inviteLink: string): Promise<any>;
  exportChatInviteLink(chatId: number | string): Promise<string>;

  uploadStickerFile(userId: number, pngSticker: string | Buffer | any): Promise<any>;
  createNewStickerSet(userId: number, name: string, title: string, pngSticker: string | Buffer | any, emojis: string): Promise<boolean>;
  addStickerToSet(userId: number, name: string, pngSticker: string | Buffer | any, emojis: string): Promise<boolean>;

  sendInvoice(
    chatId: number | string,
    title: string,
    description: string,
    payload: string,
    providerToken: string,
    currency: string,
    prices: BotLabeledPrice[],
    options?: any
  ): Promise<BotMessage>;
  createInvoiceLink(
    title: string,
    description: string,
    payload: string,
    providerToken: string,
    currency: string,
    prices: BotLabeledPrice[],
    options?: any
  ): Promise<string>;
  answerPreCheckoutQuery(preCheckoutQueryId: string, ok?: boolean, errorMessage?: string): Promise<boolean>;
  inquireTransaction(transactionId: string): Promise<BotTransaction>;

  on(event: 'message', listener: (msg: BotMessage) => void): this;
  on(event: 'edited_message', listener: (msg: BotMessage) => void): this;
  on(event: 'callback_query', listener: (query: BotCallbackQuery) => void): this;
  on(event: 'pre_checkout_query', listener: (query: BotPreCheckoutQuery) => void): this;
  on(event: 'successful_payment', listener: (payment: BotSuccessfulPayment, message: BotMessage) => void): this;
  on(event: 'update', listener: (update: BotUpdate) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}

export default BaleClient;
