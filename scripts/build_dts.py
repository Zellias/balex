import os
import sys

dts_content = '''/**
 * TypeScript Definitions for BaleX / Bale Userbot & Bot SDK
 * High-performance Node.js userbot & official bot library for Bale Messenger.
 * Supports all 53 Protobuf services, 636 RPC methods, Mini App parameter engine,
 * Shetab Banking, Gift Packets, and 60+ WebSocket event streams.
 */

/// <reference types="node" />

import { EventEmitter } from 'events';

// ==========================================
// Enums & Protocol Constants
// ==========================================

/**
 * Peer type enumeration: 1 for Private chat (User), 2 for Group chat.
 */
export enum PeerType {
  PRIVATE = 1,
  GROUP = 2
}

/**
 * Extended peer type for internal catalog resolution.
 */
export enum ExPeerType {
  USER = 1,
  GROUP = 2
}

/**
 * Typing action state for userbot presence updates.
 */
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

/**
 * Device platform enumeration for session handshake.
 */
export enum DeviceType {
  GENERIC = 0,
  PC = 1,
  WEB = 2,
  HANDSET = 3,
  TABLET = 4
}

/**
 * Display mode for launching Mini Apps / WebApps in Bale.
 */
export enum ScreenMode {
  FULLSCREEN = 0,
  FULL_SIZE = 1,
  COMPACT = 2
}

/**
 * Mini App bidirectional event constants for communication between host and web view.
 */
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

/**
 * Theme color parameters for Mini App appearance.
 */
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

/**
 * Default theme parameters matching standard dark mode in Bale.
 */
export const DefaultThemeParams: ThemeParams;

// ==========================================
// Core Entities & Messaging Types
// ==========================================

/**
 * Bale Peer reference identifying a chat dialog.
 */
export interface Peer {
  type: PeerType | number;
  id: number;
}

/**
 * User avatar file information.
 */
export interface UserAvatar {
  fileId?: number | string | bigint;
  accessHash?: number | string | bigint;
  fileSize?: number;
  small?: { fileId: number | string | bigint; accessHash: number | string | bigint };
  big?: { fileId: number | string | bigint; accessHash: number | string | bigint };
  [key: string]: any;
}

/**
 * User profile entity.
 */
export interface User {
  id: number;
  accessHash?: bigint | string;
  name?: string;
  localName?: string;
  username?: string;
  phone?: string;
  avatar?: UserAvatar;
  isBot?: boolean;
  about?: string;
  [key: string]: any;
}

/**
 * Group or channel entity.
 */
export interface Group {
  id: number;
  accessHash?: bigint | string;
  title: string;
  avatar?: UserAvatar;
  memberCount?: number;
  isChannel?: boolean;
  about?: string;
  creatorUserId?: number;
  [key: string]: any;
}

/**
 * Dialog / conversation entry in chat list.
 */
export interface Dialog {
  peer: Peer;
  unreadCount?: number;
  lastMessage?: MessageEvent | any;
  sortDate?: bigint | number;
}

/**
 * Result returned by loadDialogs.
 */
export interface DialogsResult {
  dialogs: Dialog[];
  users: User[];
  groups: Group[];
}

/**
 * Result returned by loadHistory.
 */
export interface HistoryResult {
  history: MessageEvent[] | any[];
  users: User[];
  groups: Group[];
}

/**
 * Options for sending or replying with photo attachment.
 */
export interface PhotoAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  width?: number;
  height?: number;
  caption?: string;
  name?: string;
  mimeType?: string;
}

/**
 * Options for sending or replying with voice note attachment.
 */
export interface VoiceAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  duration?: number;
  waveForm?: Buffer | Uint8Array;
  caption?: string;
  name?: string;
  mimeType?: string;
}

/**
 * Options for sending or replying with audio / music attachment.
 */
export interface AudioAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  duration?: number;
  title?: string;
  performer?: string;
  caption?: string;
  name?: string;
  mimeType?: string;
}

/**
 * Options for sending or replying with video attachment.
 */
export interface VideoAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  duration?: number;
  width?: number;
  height?: number;
  caption?: string;
  name?: string;
  mimeType?: string;
}

/**
 * Options for sending or replying with document / file attachment.
 */
export interface DocumentAttachment {
  fileId: number | string | bigint;
  accessHash: number | string | bigint;
  fileSize: number;
  name?: string;
  mimeType?: string;
  caption?: string;
}

/**
 * Cash gift packet message payload.
 */
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

/**
 * Gold gift packet message payload.
 */
export interface GoldGiftPacketMessage {
  packetId: bigint | string;
}

/**
 * Winner / receiver entry in a gift packet.
 */
export interface GiftReceiver {
  userId: number;
  amount: bigint;
  date: bigint;
  rank: number;
}

/**
 * Response structure when opening or querying a cash gift packet.
 */
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

/**
 * Response structure when opening or querying a gold gift packet.
 */
export interface OpenGoldGiftPacketResponse {
  openedCount: number;
  selfWinAmount: bigint;
  amount: bigint;
  rank: number;
  giftReceivers: GiftReceiver[];
  receivers: GiftReceiver[];
  status: number;
}

/**
 * Response containing list of winner IDs for gold packets.
 */
export interface GetWinnerIDsResponse {
  winnerIds: (number | bigint)[];
}

/**
 * Options for sending cash gift packets.
 */
export interface SendGiftPacketOptions {
  peer: number | Peer;
  amount: number | string | bigint;
  count?: number;
  message?: string;
  sourceWalletId?: string;
  givingType?: number;
  coverId?: number;
  showTotalAmount?: boolean;
}

/**
 * Result returned after dispatching a cash gift packet.
 */
export interface GiftPacketResult {
  randomId: bigint | string;
  date: bigint | number;
  packetId?: bigint | string;
  [key: string]: any;
}

/**
 * Options for sending gold gift packets.
 */
export interface SendGoldGiftPacketOptions {
  peer: number | Peer;
  amountMilligrams: number | string | bigint;
  count?: number;
  message?: string;
  givingType?: number;
}

/**
 * Options for sending gold packets via sendGoldPacket.
 */
export interface SendGoldPacketOptions {
  peerId: number | Peer;
  goldMilligrams: number | string | bigint;
  message?: string;
  packetType?: number;
}

/**
 * Result returned after sending a gold gift packet.
 */
export interface GoldGiftPacketResult {
  giftPacketId: bigint;
  [key: string]: any;
}

// ==========================================
// Shetab Banking & Card Interfaces
// ==========================================

/**
 * Parameters for cardholder inquiry (نام صاحب حساب).
 */
export interface CardInquiryOptions {
  sourcePan?: string;
  sourceCardNumber?: string;
  destinationPan?: string;
  destinationCardNumber?: string;
  amountRials?: number | string | bigint;
  amount?: number | string | bigint;
  [key: string]: any;
}

/**
 * Result of cardholder name inquiry.
 */
export interface CardInquiryResult {
  cardHolderName: string;
  inquiryToken: string;
  isSuccess?: boolean;
  traceNumber?: string;
  [key: string]: any;
}

/**
 * Parameters for executing card-to-card money transfer (کارت به کارت شتاب).
 */
export interface CardTransferOptions {
  sourcePan: string;
  destinationPan: string;
  amountRials: number | string | bigint;
  cvv2: string;
  expireDate: string;
  pin2: string;
  inquiryToken: string;
  description?: string;
  [key: string]: any;
}

/**
 * Result of card-to-card transfer execution.
 */
export interface CardTransferResult {
  refNumber?: string;
  traceNumber?: string;
  date?: string;
  status?: string;
  balanceRials?: string;
  availableBalanceRials?: string;
  [key: string]: any;
}

/**
 * Parameters for inquiring card balance.
 */
export interface CardBalanceOptions {
  sourcePan: string;
  pin2: string;
  cvv2: string;
  expireDate: string;
  [key: string]: any;
}

/**
 * Result of card balance inquiry.
 */
export interface CardBalanceResult {
  balanceRials: string;
  availableBalanceRials: string;
  [key: string]: any;
}

// ==========================================
// Social, Folders, Polls & Story Interfaces
// ==========================================

/**
 * Chat folder / tab definition.
 */
export interface Folder {
  id: number | string;
  name: string;
  peers: Peer[];
  isReserved?: boolean;
  [key: string]: any;
}

/**
 * Single option in a poll.
 */
export interface PollOption {
  id: number;
  text: string;
  votes?: number;
  [key: string]: any;
}

/**
 * Poll structure.
 */
export interface Poll {
  id: bigint | string;
  question: string;
  options: PollOption[];
  isAnonymous?: boolean;
  isMultipleChoice?: boolean;
  isQuiz?: boolean;
  isClosed?: boolean;
  [key: string]: any;
}

/**
 * Poll results with vote tallies.
 */
export interface PollResults {
  pollId: bigint | string;
  totalVotes: number;
  options: PollOption[];
  [key: string]: any;
}

/**
 * Scheduled message item.
 */
export interface ScheduledMessage {
  id: string | number;
  peer: Peer;
  text: string;
  sendDate: number | Date;
  [key: string]: any;
}

/**
 * Story item uploaded or viewed.
 */
export interface StoryItem {
  id: string | number | bigint;
  userId: number;
  date: number;
  caption?: string;
  media?: any;
  viewsCount?: number;
  likesCount?: number;
  [key: string]: any;
}

/**
 * Viewer entry for a story.
 */
export interface StoryViewer {
  userId: number;
  date: number;
  [key: string]: any;
}

/**
 * Options for sending a story.
 */
export interface SendStoryOptions {
  media?: any;
  caption?: string;
  privacy?: number;
  duration?: number;
  [key: string]: any;
}

/**
 * Wallet credit balance.
 */
export interface WalletCredit {
  credit: bigint | string | number;
  walletId?: string;
  currency?: string;
  [key: string]: any;
}

/**
 * User wallet points.
 */
export interface WalletPoints {
  points: number;
  [key: string]: any;
}

/**
 * Username availability check result.
 */
export interface CheckUsernameResult {
  isAvailable: boolean;
  username?: string;
  [key: string]: any;
}

/**
 * Service message metadata container.
 */
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

/**
 * Options when replying to a message.
 */
export interface MessageReplyOptions {
  humanize?: boolean;
  simulateTyping?: boolean;
  typingType?: TypingType | number;
  quoteMessageId?: string | number | bigint;
}

/**
 * Options for sendMessage.
 */
export interface SendMessageOptions {
  replyToMessageId?: string | number | bigint;
  humanize?: boolean;
  simulateTyping?: boolean;
  typingType?: TypingType | number;
  isGroup?: boolean;
  isSilent?: boolean;
  mentions?: number[];
  [key: string]: any;
}

/**
 * Result returned after sending a text message.
 */
export interface SentMessageResult {
  rid: string;
  date: bigint | number;
  peer: Peer;
  text: string;
  [key: string]: any;
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
  reply(replyText: string, options?: MessageReplyOptions): Promise<SentMessageResult>;
  replyPhoto(options: PhotoAttachment): Promise<Buffer>;
  replyVoice(options: VoiceAttachment): Promise<Buffer>;
  replyAudio(options: AudioAttachment): Promise<Buffer>;
  replyVideo(options: VideoAttachment): Promise<Buffer>;
  replyDocument(options: DocumentAttachment): Promise<Buffer>;
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

export interface GroupCreatedEvent {
  groupId: number;
  title: string;
  creatorUserId: number;
  memberUserIds: number[];
  [key: string]: any;
}

export interface UserInvitedEvent {
  groupId: number;
  inviterUserId: number;
  invitedUserId: number;
  [key: string]: any;
}

export interface UserKickedEvent {
  groupId: number;
  adminUserId: number;
  kickedUserId: number;
  [key: string]: any;
}

export interface UserLeftEvent {
  groupId: number;
  userId: number;
  [key: string]: any;
}

export interface BotCallbackQueryEvent {
  peer: Peer;
  messageId: string | number;
  data: string | Buffer;
  userId: number;
  [key: string]: any;
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

/**
 * Event map defining listener arguments for all BaleClient events.
 */
export interface BaleEventMap {
  message: MessageEvent;
  giftPacket: MessageEvent;
  goldGiftPacket: MessageEvent;
  giftPacketOpened: GiftPacketOpenedEvent;
  miniAppData: MiniAppDataEvent;
  serviceMessage: ServiceMessageEvent;
  groupCreated: GroupCreatedEvent;
  userInvited: UserInvitedEvent;
  userKicked: UserKickedEvent;
  userLeft: UserLeftEvent;
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
  botCallbackQuery: BotCallbackQueryEvent;
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
// Protobuf Namespace Service Interfaces
// ==========================================

/**
 * Bale Protobuf Messaging service namespace.
 */
export interface MessagingService {
  sendMessage(payload: any, metadata?: any): Promise<any>;
  SendMessage(payload: any, metadata?: any): Promise<any>;
  loadHistory(payload: any, metadata?: any): Promise<any>;
  LoadHistory(payload: any, metadata?: any): Promise<any>;
  loadDialogs(payload: any, metadata?: any): Promise<any>;
  LoadDialogs(payload: any, metadata?: any): Promise<any>;
  deleteMessage(payload: any, metadata?: any): Promise<any>;
  DeleteMessage(payload: any, metadata?: any): Promise<any>;
  editMessage(payload: any, metadata?: any): Promise<any>;
  EditMessage(payload: any, metadata?: any): Promise<any>;
  pinMessage(payload: any, metadata?: any): Promise<any>;
  PinMessage(payload: any, metadata?: any): Promise<any>;
  clearChat(payload: any, metadata?: any): Promise<any>;
  ClearChat(payload: any, metadata?: any): Promise<any>;
  createFolder(payload: any, metadata?: any): Promise<any>;
  CreateFolder(payload: any, metadata?: any): Promise<any>;
  deleteFolder(payload: any, metadata?: any): Promise<any>;
  DeleteFolder(payload: any, metadata?: any): Promise<any>;
  [method: string]: (payload?: any, metadata?: any) => Promise<any>;
}

/**
 * Bale Protobuf Auth service namespace.
 */
export interface AuthService {
  startPhoneAuth(payload: any, metadata?: any): Promise<any>;
  StartPhoneAuth(payload: any, metadata?: any): Promise<any>;
  validateCode(payload: any, metadata?: any): Promise<any>;
  ValidateCode(payload: any, metadata?: any): Promise<any>;
  validatePassword(payload: any, metadata?: any): Promise<any>;
  ValidatePassword(payload: any, metadata?: any): Promise<any>;
  getAuthSessions(payload?: any, metadata?: any): Promise<any>;
  GetAuthSessions(payload?: any, metadata?: any): Promise<any>;
  [method: string]: (payload?: any, metadata?: any) => Promise<any>;
}

/**
 * Bale Protobuf Banking / Bank service namespace.
 */
export interface BankingService {
  inquireDestinationPan(payload: any, metadata?: any): Promise<any>;
  InquireDestinationPan(payload: any, metadata?: any): Promise<any>;
  transferMoneyByCard(payload: any, metadata?: any): Promise<any>;
  TransferMoneyByCard(payload: any, metadata?: any): Promise<any>;
  getCardRemain(payload: any, metadata?: any): Promise<any>;
  GetCardRemain(payload: any, metadata?: any): Promise<any>;
  getPaymentToken(payload?: any, metadata?: any): Promise<any>;
  GetPaymentToken(payload?: any, metadata?: any): Promise<any>;
  getOTPToken(payload?: any, metadata?: any): Promise<any>;
  GetOTPToken(payload?: any, metadata?: any): Promise<any>;
  [method: string]: (payload?: any, metadata?: any) => Promise<any>;
}

/**
 * Bale Protobuf Groups service namespace.
 */
export interface GroupsService {
  createGroup(payload: any, metadata?: any): Promise<any>;
  CreateGroup(payload: any, metadata?: any): Promise<any>;
  editGroupTitle(payload: any, metadata?: any): Promise<any>;
  EditGroupTitle(payload: any, metadata?: any): Promise<any>;
  editGroupAbout(payload: any, metadata?: any): Promise<any>;
  EditGroupAbout(payload: any, metadata?: any): Promise<any>;
  inviteMembers(payload: any, metadata?: any): Promise<any>;
  InviteMembers(payload: any, metadata?: any): Promise<any>;
  kickMember(payload: any, metadata?: any): Promise<any>;
  KickMember(payload: any, metadata?: any): Promise<any>;
  fetchGroupAdmins(payload: any, metadata?: any): Promise<any>;
  FetchGroupAdmins(payload: any, metadata?: any): Promise<any>;
  [method: string]: (payload?: any, metadata?: any) => Promise<any>;
}

/**
 * Bale Protobuf Users service namespace.
 */
export interface UsersService {
  loadFullUsers(payload: any, metadata?: any): Promise<any>;
  LoadFullUsers(payload: any, metadata?: any): Promise<any>;
  getContacts(payload?: any, metadata?: any): Promise<any>;
  GetContacts(payload?: any, metadata?: any): Promise<any>;
  addContact(payload: any, metadata?: any): Promise<any>;
  AddContact(payload: any, metadata?: any): Promise<any>;
  removeContact(payload: any, metadata?: any): Promise<any>;
  RemoveContact(payload: any, metadata?: any): Promise<any>;
  searchContacts(payload: any, metadata?: any): Promise<any>;
  SearchContacts(payload: any, metadata?: any): Promise<any>;
  editName(payload: any, metadata?: any): Promise<any>;
  EditName(payload: any, metadata?: any): Promise<any>;
  editAbout(payload: any, metadata?: any): Promise<any>;
  EditAbout(payload: any, metadata?: any): Promise<any>;
  blockUser(payload: any, metadata?: any): Promise<any>;
  BlockUser(payload: any, metadata?: any): Promise<any>;
  unblockUser(payload: any, metadata?: any): Promise<any>;
  UnblockUser(payload: any, metadata?: any): Promise<any>;
  [method: string]: (payload?: any, metadata?: any) => Promise<any>;
}

/**
 * Bale Protobuf Presence service namespace.
 */
export interface PresenceService {
  setOnline(payload: any, metadata?: any): Promise<any>;
  SetOnline(payload: any, metadata?: any): Promise<any>;
  stopTyping(payload: any, metadata?: any): Promise<any>;
  StopTyping(payload: any, metadata?: any): Promise<any>;
  getUsersPresence(payload: any, metadata?: any): Promise<any>;
  GetUsersPresence(payload: any, metadata?: any): Promise<any>;
  [method: string]: (payload?: any, metadata?: any) => Promise<any>;
}

/**
 * Bale Protobuf Gift Packet service namespace.
 */
export interface GiftPacketService {
  sendGiftPacketWithWallet(payload: any, metadata?: any): Promise<any>;
  SendGiftPacketWithWallet(payload: any, metadata?: any): Promise<any>;
  openGiftPacket(payload: any, metadata?: any): Promise<any>;
  OpenGiftPacket(payload: any, metadata?: any): Promise<any>;
  getGiftPacketPaymentToken(payload?: any, metadata?: any): Promise<any>;
  GetGiftPacketPaymentToken(payload?: any, metadata?: any): Promise<any>;
  [method: string]: (payload?: any, metadata?: any) => Promise<any>;
}

/**
 * Bale Protobuf Gold Gift Packet service namespace.
 */
export interface GoldGiftPacketService {
  sendGoldGiftPacket(payload: any, metadata?: any): Promise<any>;
  SendGoldGiftPacket(payload: any, metadata?: any): Promise<any>;
  openGoldGiftPacket(payload: any, metadata?: any): Promise<any>;
  OpenGoldGiftPacket(payload: any, metadata?: any): Promise<any>;
  getWinnerIDs(payload: any, metadata?: any): Promise<any>;
  GetWinnerIDs(payload: any, metadata?: any): Promise<any>;
  [method: string]: (payload?: any, metadata?: any) => Promise<any>;
}

// ==========================================
// BaleClient Class
// ==========================================

/**
 * BaleClient is the primary Userbot client class for Bale Messenger.
 * Connects directly over WebSockets and executes Protobuf RPCs with humanization & anti-ban protection.
 */
export class BaleClient extends EventEmitter {
  options: BaleClientOptions;
  session: Session;
  connection: BaleConnection;
  humanize: HumanizeConfig;
  miniapp: typeof MiniAppUtils;
  services: Record<string, any>;

  // Dynamic 53 Service Namespaces
  messaging: MessagingService;
  auth: AuthService;
  banking: BankingService;
  bank: BankingService;
  giftPacket: GiftPacketService;
  goldGiftPacket: GoldGiftPacketService;
  appzar: any;
  ketf: any;
  groups: GroupsService;
  presence: PresenceService;
  users: UsersService;
  files: any;
  story: any;
  poll: any;
  kifpool: any;
  abacus: any;
  advertisement: any;
  [namespace: string]: any;

  constructor(options?: BaleClientOptions);

  /**
   * Whether the WebSocket connection is actively open and ready.
   */
  get isConnected(): boolean;

  /**
   * The currently logged in user profile, or null if unauthenticated.
   */
  get me(): User | null;

  /**
   * Connect to Bale WebSocket server and perform session handshake.
   */
  connect(): Promise<this>;

  /**
   * Disconnect from Bale WebSocket server.
   */
  disconnect(): void;

  // ==========================================
  // Authentication Flow
  // ==========================================

  /**
   * Request an SMS verification code for a phone number.
   * @param phoneNumber Phone number in international format, e.g. "+989123456789"
   */
  sendCode(phoneNumber: string): Promise<{ transactionHash: string }>;

  /**
   * Validate SMS code and sign in.
   * @param code The SMS verification code
   * @param transactionHash Transaction hash from sendCode
   */
  signIn(code: string | number, transactionHash?: string): Promise<any>;

  /**
   * Complete 2FA password login if enabled on the account.
   * @param password Two-factor authentication password
   * @param transactionHash Transaction hash
   */
  signInWithPassword(password: string, transactionHash?: string): Promise<any>;

  /**
   * Log out of the current session and invalidate tokens.
   */
  logout(): Promise<any>;

  // ==========================================
  // Messaging Operations
  // ==========================================

  /**
   * Send a text message to a user or group dialog.
   * @param peer User ID, Group ID, or Peer object
   * @param text Message body text
   * @param options Message options including humanize overrides and quote replies
   */
  sendMessage(
    peer: number | Peer,
    text: string,
    options?: SendMessageOptions
  ): Promise<SentMessageResult>;

  /**
   * Quick shortcut to send a text message.
   * @param peerId User or Group ID
   * @param text Message body text
   * @param isGroup Set to true if target is a group
   */
  sendTextMessage(
    peer: number | Peer,
    text: string,
    isGroup?: boolean
  ): Promise<SentMessageResult>;

  /**
   * Send a photo to a user or group.
   */
  sendPhoto(peer: number | Peer, options: PhotoAttachment, clientOptions?: SendMessageOptions): Promise<Buffer>;

  /**
   * Send a voice note to a user or group.
   */
  sendVoice(peer: number | Peer, options: VoiceAttachment, clientOptions?: SendMessageOptions): Promise<Buffer>;

  /**
   * Send an audio / music track to a user or group.
   */
  sendAudio(peer: number | Peer, options: AudioAttachment, clientOptions?: SendMessageOptions): Promise<Buffer>;

  /**
   * Send a video to a user or group.
   */
  sendVideo(peer: number | Peer, options: VideoAttachment, clientOptions?: SendMessageOptions): Promise<Buffer>;

  /**
   * Send a document / file to a user or group.
   */
  sendDocument(peer: number | Peer, options: DocumentAttachment, clientOptions?: SendMessageOptions): Promise<Buffer>;

  /**
   * Send a sticker to a user or group.
   */
  sendSticker(
    peer: number | Peer,
    stickerId: number | string,
    accessHash?: number | string | bigint,
    stickerPackId?: number | string
  ): Promise<Buffer>;

  /**
   * Load dialogs / chat list.
   */
  loadDialogs(limit?: number, minDate?: number | bigint | string): Promise<DialogsResult>;

  /**
   * Load message history for a peer dialog.
   */
  loadHistory(peer: number | Peer, limit?: number, endDate?: number | bigint | string): Promise<HistoryResult>;

  /**
   * Mark messages as received up to a specified timestamp.
   */
  markAsReceived(peer: number | Peer, date: number | bigint): Promise<any>;

  /**
   * Mark messages as read up to a specified timestamp.
   */
  markAsRead(peer: number | Peer, date: number | bigint): Promise<any>;

  /**
   * Send typing or media recording action to a peer.
   */
  sendTyping(peer: number | Peer, durationMs?: number, typingType?: TypingType | number): Promise<any>;

  /**
   * Stop typing action in a peer dialog.
   */
  stopTyping(peer: number | Peer, typingType?: TypingType | number): Promise<any>;

  /**
   * Set presence online status.
   */
  setOnline(isOnline?: boolean, timeout?: number): Promise<any>;

  /**
   * Edit an existing message text.
   */
  editMessage(peer: number | Peer, messageId: string | number, newText: string): Promise<any>;

  /**
   * Forward one or more messages to another dialog.
   */
  forwardMessages(
    toPeer: number | Peer,
    fromPeer: number | Peer,
    mids: (string | number)[],
    options?: { hideSender?: boolean }
  ): Promise<any>;

  /**
   * Pin a message in a conversation.
   */
  pinMessage(peer: number | Peer, messageId: string | number): Promise<any>;

  /**
   * Delete one or more messages by their IDs.
   */
  deleteMessages(peer: number | Peer, messageIds: (string | number)[]): Promise<any>;

  /**
   * Clear all messages in a conversation dialog.
   */
  clearChat(peer: number | Peer): Promise<any>;

  // ==========================================
  // Group & Channel Administration
  // ==========================================

  /**
   * Create a new group with a title and optional initial members.
   */
  createGroup(title: string, userIds?: number[]): Promise<{ group: Group; userIds: number[] } | any>;

  /**
   * Invite members into an existing group.
   */
  inviteMembers(groupId: number | string, userIds: number[]): Promise<any>;

  /**
   * Remove / kick a member from a group.
   */
  kickMember(groupId: number | string, userId: number | string): Promise<any>;

  /**
   * Change group title.
   */
  setGroupTitle(groupId: number | string, title: string): Promise<any>;

  /**
   * Leave a group.
   */
  leaveGroup(groupId: number | string): Promise<any>;

  /**
   * Retrieve group details by ID.
   */
  getGroup(groupId: number | string): Promise<Group>;

  // ==========================================
  // Contacts & Profile Management
  // ==========================================

  /**
   * Fetch full user profile by user ID.
   */
  getUser(userId: number | string): Promise<User>;

  /**
   * Fetch user contact list.
   */
  getContacts(): Promise<User[]>;

  /**
   * Add a contact by phone number and optional name.
   */
  addContact(phone: string, name?: string): Promise<any>;

  /**
   * Add a contact by user ID and access hash.
   */
  addContactByUid(uid: number | string, accessHash?: bigint | number | string): Promise<any>;

  /**
   * Bulk import contacts into address book.
   */
  importContacts(contacts: Array<{ phone: string; name?: string }>): Promise<{ users: User[] } | any>;

  /**
   * Remove a contact from address book.
   */
  removeContact(userId: number | string, accessHash?: bigint | number | string): Promise<any>;

  /**
   * Search contacts by name or query string.
   */
  searchContacts(query: string): Promise<User[]>;

  /**
   * Edit user profile display name.
   */
  editName(name: string): Promise<any>;

  /**
   * Edit user profile about / bio text.
   */
  editAbout(about: string): Promise<any>;

  /**
   * Edit user public @username handle.
   */
  editUsername(username: string): Promise<any>;

  /**
   * Check if a username is available.
   */
  checkUsername(username: string): Promise<CheckUsernameResult>;

  /**
   * Block a user.
   */
  blockUser(userId: number | string): Promise<any>;

  /**
   * Unblock a user.
   */
  unblockUser(userId: number | string): Promise<any>;

  /**
   * Load list of blocked users.
   */
  loadBlockedUsers(): Promise<User[]>;

  // ==========================================
  // Reactions & Folders
  // ==========================================

  /**
   * Add an emoji reaction to a message.
   */
  setReaction(peer: number | Peer, messageId: string | number, emoji: string): Promise<any>;

  /**
   * Remove an emoji reaction from a message.
   */
  removeReaction(peer: number | Peer, messageId: string | number, emoji: string): Promise<any>;

  /**
   * Query reaction counters and list for messages.
   */
  getReactions(peer: number | Peer, messageIds: (string | number)[]): Promise<{ reactions: Array<{ peer: Peer; rid: string; reactions: any[] }> }>;

  /**
   * Create a new chat folder / tab.
   */
  createFolder(name: string, peers: (number | Peer)[]): Promise<Folder>;

  /**
   * Load all user folders / tabs.
   */
  loadFolders(): Promise<Folder[]>;

  /**
   * Delete a folder by ID.
   */
  deleteFolder(folderId: number | string): Promise<any>;

  // ==========================================
  // Polls & Bot Interaction
  // ==========================================

  /**
   * Send a poll to a chat.
   */
  sendPoll(
    peer: number | Peer,
    question: string,
    options: string[],
    pollOptions?: { isAnonymous?: boolean; isMultipleChoice?: boolean; isQuiz?: boolean }
  ): Promise<{ pollId: bigint | string; peer: Peer }>;

  /**
   * Create a poll with custom settings.
   */
  createPoll(options: {
    question: string;
    options: string[];
    isAnonymous?: boolean;
    isMultipleChoice?: boolean;
    isQuiz?: boolean;
    [key: string]: any;
  }): Promise<Poll>;

  /**
   * Close an active poll.
   */
  closePoll(pollId: number | string | bigint): Promise<any>;

  /**
   * Fetch current results for a poll.
   */
  getPollResults(pollId: number | string | bigint): Promise<PollResults>;

  /**
   * Fetch current wallet credit balance.
   */
  getWalletCredit(): Promise<WalletCredit>;

  /**
   * Fetch user reward points.
   */
  getWalletPoints(): Promise<WalletPoints>;

  /**
   * Trigger an inline button callback query to a bot.
   */
  sendInlineCallback(peer: number | Peer, messageId: number | string, data: string | Buffer): Promise<any>;

  // ==========================================
  // Shetab Banking & Card-to-Card
  // ==========================================

  /**
   * Inquire destination cardholder name from Shetab (استعلام نام دارنده کارت).
   * Supports both object options `{ sourcePan, destinationPan, amountRials }`
   * and positional arguments `(sourcePan, destinationPan, amountRials)`.
   */
  inquireDestinationPan(options: CardInquiryOptions): Promise<CardInquiryResult>;
  inquireDestinationPan(
    sourcePan: string,
    destinationPan: string,
    amountRials: number | string | bigint
  ): Promise<CardInquiryResult>;

  /**
   * Execute card-to-card money transfer through Shetab (کارت به کارت شتاب).
   */
  transferMoneyByCard(options: CardTransferOptions): Promise<CardTransferResult>;

  /**
   * Inquire card balance through Shetab (اعلام موجودی کارت).
   */
  getCardBalance(options: CardBalanceOptions): Promise<CardBalanceResult>;

  // ==========================================
  // Cash & Gold Gift Packets
  // ==========================================

  /**
   * Send a cash gift packet (پاکت هدیه ریالی).
   */
  sendGiftPacket(options: SendGiftPacketOptions): Promise<GiftPacketResult>;

  /**
   * Open a received cash gift packet (مشاهده پاکت هدیه).
   */
  openGiftPacket(options: {
    peer: number | Peer;
    randomId: number | string | bigint;
    date?: number | string | bigint;
    walletId?: string;
    pageNo?: number;
    orderType?: number;
  }): Promise<OpenGiftPacketResponse>;

  /**
   * Claim money from an opened cash gift packet (دریافت سهم از پاکت هدیه).
   */
  claimGiftPacket(options: {
    peer: number | Peer;
    randomId: number | string | bigint;
    date?: number | string | bigint;
    walletId?: string;
    pageNo?: number;
    orderType?: number;
  }): Promise<OpenGiftPacketResponse>;

  /**
   * Query details of a cash gift packet.
   */
  getGiftPacket(options: {
    peer: number | Peer;
    randomId: number | string | bigint;
    date?: number | string | bigint;
    walletId?: string;
    pageNo?: number;
    orderType?: number;
  }): Promise<OpenGiftPacketResponse>;

  /**
   * Get list of receivers / winners for a cash gift packet.
   */
  getGiftPacketReceivers(options: {
    peer: number | Peer;
    randomId: number | string | bigint;
    date?: number | string | bigint;
    walletId?: string;
    pageNo?: number;
    orderType?: number;
  }): Promise<GiftReceiver[]>;

  /**
   * Fetch payment token for funding a cash gift packet.
   */
  getGiftPacketPaymentToken(options?: any): Promise<{ token: string; [key: string]: any }>;

  /**
   * Send a gold gift packet in milligrams of gold (پاکت هدیه طلا).
   */
  sendGoldGiftPacket(options: SendGoldGiftPacketOptions): Promise<GoldGiftPacketResult>;

  /**
   * Send a gold gift packet using peer ID.
   */
  sendGoldPacket(options: SendGoldPacketOptions): Promise<GoldGiftPacketResult>;

  /**
   * Open a gold gift packet.
   */
  openGoldGiftPacket(giftPacketId: number | string | bigint): Promise<OpenGoldGiftPacketResponse>;

  /**
   * Claim gold share from a gold gift packet.
   */
  claimGoldGiftPacket(giftPacketId: number | string | bigint): Promise<OpenGoldGiftPacketResponse>;

  /**
   * Get winner IDs of a gold gift packet.
   */
  getGoldGiftPacketWinners(giftPacketId: number | string | bigint): Promise<GetWinnerIDsResponse>;

  /**
   * Alias for getGoldGiftPacketWinners.
   */
  getGoldGiftPacket(giftPacketId: number | string | bigint): Promise<GetWinnerIDsResponse>;

  /**
   * Alias for getGoldGiftPacketWinners.
   */
  getGoldWinners(giftPacketId: number | string | bigint): Promise<GetWinnerIDsResponse>;

  // ==========================================
  // Mini Apps / WebApps API
  // ==========================================

  /**
   * Get launching URL and query ID for a Mini App.
   */
  getMiniAppUrl(options: {
    botUserId: number | string;
    screenMode?: ScreenMode | number;
    directLink?: string;
    themeParams?: ThemeParams;
  }): Promise<{ url: string; screenMode: number; queryId: string }>;

  /**
   * Get authentication hash for web app launch.
   */
  getWebappHash(botUserId: number | string, data?: string): Promise<{ hash: string; authDate: number; queryId: string }>;

  /**
   * Generate full Mini App launching parameters and signed initData.
   */
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

  /**
   * Create an initData raw query string.
   */
  createInitData(options?: MiniAppInitDataOptions): string;

  /**
   * Sign initData with HMAC-SHA256 using bot token.
   */
  signInitData(data: Record<string, any> | string, botToken: string): string;

  /**
   * Validate initData signature and check expiry.
   */
  validateInitData(
    initData: string,
    botToken: string,
    maxAgeSeconds?: number
  ): { valid: boolean; data?: MiniAppParsedInitData; error?: string };

  /**
   * Parse an initData string into structured object.
   */
  parseInitData(initData: string): MiniAppParsedInitData;

  /**
   * Build complete launch URL with hash fragments.
   */
  buildMiniAppUrl(options?: MiniAppBuildUrlOptions): string;

  /**
   * Send data back from a Mini App to the bot.
   */
  sendMiniAppData(options: {
    botUserId: number | string;
    queryId?: string;
    data: string | any;
    buttonText?: string;
  }): Promise<any>;

  /**
   * Get bot menu button configuration.
   */
  getBotMenuButton(botUserId: number | string): Promise<{ menuButton: any }>;

  /**
   * Invoke custom method on Mini App bridge.
   */
  invokeMiniAppCustomMethod(options: {
    botUserId: number | string;
    method: string;
    params?: string | any;
  }): Promise<any>;

  // ==========================================
  // Stories API
  // ==========================================

  /**
   * Post a new story.
   */
  sendStory(options?: SendStoryOptions): Promise<StoryItem>;

  /**
   * Delete an active story.
   */
  deleteStory(storyId: number | string | bigint): Promise<any>;

  /**
   * Get user stories.
   */
  getUserStories(userId: number | string): Promise<StoryItem[]>;

  /**
   * React / like a story.
   */
  likeStory(storyId: number | string | bigint): Promise<any>;

  /**
   * Fetch viewers list for a story.
   */
  getStoryViewers(storyId: number | string | bigint): Promise<StoryViewer[]>;

  // ==========================================
  // Scheduled Messages
  // ==========================================

  /**
   * Schedule a message to be delivered at a future timestamp.
   */
  scheduleMessage(peer: number | Peer, text: string, sendDate: number | Date): Promise<ScheduledMessage>;

  /**
   * Load list of pending scheduled messages for a dialog.
   */
  loadScheduledMessages(peer: number | Peer): Promise<ScheduledMessage[]>;

  /**
   * Cancel / delete a scheduled message.
   */
  deleteScheduledMessage(peer: number | Peer, messageId: string | number): Promise<any>;

  // ==========================================
  // AI & TLDR
  // ==========================================

  /**
   * Generate an AI summary for a webpage link.
   */
  summarizeLink(url: string): Promise<{ summary: string }>;

  /**
   * Ask Bale AI assistant a question.
   */
  askAI(prompt: string, context?: any): Promise<{ answer: string }>;

  // ==========================================
  // Humanize & Anti-Ban Controls
  // ==========================================

  /**
   * Configure stealth and humanization behavior.
   */
  setHumanize(value: boolean | HumanizeConfig): boolean;

  /**
   * Enable humanized timing and auto-mark-as-read.
   */
  enableHumanize(config?: HumanizeConfig): boolean;

  /**
   * Disable humanized delays (instant bot response mode).
   */
  disableHumanize(): boolean;

  /**
   * Low-level Protobuf RPC dispatcher.
   */
  invoke(serviceName: string, methodName: string, payload?: Buffer | Uint8Array | object, metadata?: any): Promise<any>;

  // ==========================================
  // Utilities & Internal Methods
  // ==========================================

  /**
   * Sleep helper utility.
   */
  sleep(ms: number): Promise<void>;

  _sendDocumentMessage?(peer: number | Peer, file: any, options?: any): Promise<Buffer>;
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
  on(event: 'groupCreated', listener: (evt: GroupCreatedEvent) => void): this;
  on(event: 'userInvited', listener: (evt: UserInvitedEvent) => void): this;
  on(event: 'userKicked', listener: (evt: UserKickedEvent) => void): this;
  on(event: 'userLeft', listener: (evt: UserLeftEvent) => void): this;

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
  on(event: 'botCallbackQuery', listener: (data: BotCallbackQueryEvent) => void): this;
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
};

// ==========================================
// Official Bale HTTP Bot API (https://docs.bale.ai/)
// ==========================================

/**
 * Configuration options for official HTTP bot client.
 */
export interface BaleBotOptions {
  baseUrl?: string;
  timeout?: number;
}

/**
 * Bale Bot API User object.
 */
export interface BotUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

/**
 * Bale Bot API Chat object.
 */
export interface BotChat {
  id: number;
  type: 'private' | 'group' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Photo size variation in Bot API.
 */
export interface BotPhotoSize {
  file_id: string;
  file_unique_id?: string;
  width: number;
  height: number;
  file_size?: number;
}

/**
 * Audio file attachment in Bot API.
 */
export interface BotAudio {
  file_id: string;
  file_unique_id?: string;
  duration: number;
  performer?: string;
  title?: string;
  mime_type?: string;
  file_size?: number;
}

/**
 * Document file attachment in Bot API.
 */
export interface BotDocument {
  file_id: string;
  file_unique_id?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

/**
 * Video file attachment in Bot API.
 */
export interface BotVideo {
  file_id: string;
  file_unique_id?: string;
  width: number;
  height: number;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

/**
 * Voice note file attachment in Bot API.
 */
export interface BotVoice {
  file_id: string;
  file_unique_id?: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

/**
 * Animation / GIF attachment in Bot API.
 */
export interface BotAnimation {
  file_id: string;
  file_unique_id?: string;
  width: number;
  height: number;
  duration: number;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

/**
 * Shared phone contact in Bot API.
 */
export interface BotContact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

/**
 * Shared location point in Bot API.
 */
export interface BotLocation {
  latitude: number;
  longitude: number;
}

/**
 * File information returned by getFile.
 */
export interface BotFile {
  file_id: string;
  file_unique_id?: string;
  file_size?: number;
  file_path?: string;
}

/**
 * Chat permissions configuration.
 */
export interface BotChatPermissions {
  can_send_messages?: boolean;
  can_send_media_messages?: boolean;
  can_send_polls?: boolean;
  can_send_other_messages?: boolean;
  can_add_web_page_previews?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
}

/**
 * Chat photo file IDs.
 */
export interface BotChatPhoto {
  small_file_id: string;
  big_file_id: string;
}

/**
 * Detailed chat info returned by getChat.
 */
export interface BotChatFullInfo {
  id: number;
  type: 'private' | 'group' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  description?: string;
  invite_link?: string;
  pinned_message?: BotMessage;
  permissions?: BotChatPermissions;
  photo?: BotChatPhoto;
  member_count?: number;
  [key: string]: any;
}

/**
 * Chat member status and permission details.
 */
export interface BotChatMember {
  user: BotUser;
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
  until_date?: number;
  can_be_edited?: boolean;
  can_manage_chat?: boolean;
  can_change_info?: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_delete_messages?: boolean;
  can_invite_users?: boolean;
  can_restrict_members?: boolean;
  can_pin_messages?: boolean;
  can_promote_members?: boolean;
  [key: string]: any;
}

/**
 * Chat invite link details.
 */
export interface BotChatInviteLink {
  invite_link: string;
  creator: BotUser;
  creates_join_request: boolean;
  is_primary: boolean;
  is_revoked: boolean;
  name?: string;
  expire_date?: number;
  member_limit?: number;
  pending_join_request_count?: number;
  [key: string]: any;
}

/**
 * Invoice details in a message.
 */
export interface BotInvoice {
  title: string;
  description: string;
  start_parameter?: string;
  currency: string;
  total_amount: number;
}

/**
 * Successful payment information.
 */
export interface BotSuccessfulPayment {
  currency: string;
  total_amount: number;
  invoice_payload: string;
}

/**
 * Price item in invoice creation.
 */
export interface BotLabeledPrice {
  label: string;
  amount: number;
}

/**
 * Financial transaction record from inquireTransaction.
 */
export interface BotTransaction {
  transaction_id: string;
  status: string;
  amount: number;
  currency?: string;
  payer_id?: number;
  creation_date?: number;
  [key: string]: any;
}

/**
 * Webhook status information from getWebhookInfo.
 */
export interface BotWebhookInfo {
  url: string;
  has_custom_certificate?: boolean;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  allowed_updates?: string[];
  [key: string]: any;
}

// Media input for sendMediaGroup
export interface BotInputMediaPhoto {
  type: 'photo';
  media: string | Buffer | NodeJS.ReadableStream;
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
}

export interface BotInputMediaVideo {
  type: 'video';
  media: string | Buffer | NodeJS.ReadableStream;
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  width?: number;
  height?: number;
  duration?: number;
}

export interface BotInputMediaAudio {
  type: 'audio';
  media: string | Buffer | NodeJS.ReadableStream;
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  duration?: number;
  performer?: string;
  title?: string;
}

export interface BotInputMediaDocument {
  type: 'document';
  media: string | Buffer | NodeJS.ReadableStream;
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
}

export type BotInputMedia =
  | BotInputMediaPhoto
  | BotInputMediaVideo
  | BotInputMediaAudio
  | BotInputMediaDocument;

// Keyboard structures
export interface BotInlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
  copy_text?: { text: string };
  [key: string]: any;
}

export interface BotInlineKeyboardMarkup {
  inline_keyboard: BotInlineKeyboardButton[][];
}

export interface BotKeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
  [key: string]: any;
}

export interface BotReplyKeyboardMarkup {
  keyboard: BotKeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  [key: string]: any;
}

export interface BotReplyKeyboardRemove {
  remove_keyboard: true;
  [key: string]: any;
}

export type BotMessageReplyMarkup =
  | BotInlineKeyboardMarkup
  | BotReplyKeyboardMarkup
  | BotReplyKeyboardRemove
  | InlineKeyboard
  | ReplyKeyboard
  | typeof KeyboardRemove;

// Bot method options
export interface BotSendMessageOptions {
  parse_mode?: 'Markdown' | 'HTML' | 'MarkdownV2';
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  [key: string]: any;
}

export interface BotCopyMessageOptions {
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotSendPhotoOptions {
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotSendAudioOptions {
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  duration?: number;
  performer?: string;
  title?: string;
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotSendDocumentOptions {
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotSendVideoOptions {
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  duration?: number;
  width?: number;
  height?: number;
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotSendAnimationOptions {
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  duration?: number;
  width?: number;
  height?: number;
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotSendVoiceOptions {
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  duration?: number;
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotSendLocationOptions {
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotSendContactOptions {
  last_name?: string;
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotSendInvoiceOptions {
  need_name?: boolean;
  need_phone_number?: boolean;
  need_email?: boolean;
  need_shipping_address?: boolean;
  send_phone_number_to_provider?: boolean;
  send_email_to_provider?: boolean;
  is_flexible?: boolean;
  reply_to_message_id?: number;
  reply_markup?: BotMessageReplyMarkup;
  [key: string]: any;
}

export interface BotEditMessageTextOptions {
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
  reply_markup?: BotInlineKeyboardMarkup | InlineKeyboard;
  [key: string]: any;
}

export interface BotEditMessageCaptionOptions {
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: BotInlineKeyboardMarkup | InlineKeyboard;
  [key: string]: any;
}

export interface BotPromoteChatMemberOptions {
  can_change_info?: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_delete_messages?: boolean;
  can_invite_users?: boolean;
  can_restrict_members?: boolean;
  can_pin_messages?: boolean;
  can_promote_members?: boolean;
  [key: string]: any;
}

export interface BotCreateChatInviteLinkOptions {
  name?: string;
  expire_date?: number;
  member_limit?: number;
  creates_join_request?: boolean;
  [key: string]: any;
}

/**
 * Bale Bot API Message representation.
 */
export interface BotMessage {
  message_id: number;
  from?: BotUser;
  date?: number;
  chat: BotChat;
  text?: string;
  caption?: string;
  reply_to_message?: BotMessage;
  photo?: BotPhotoSize[];
  audio?: BotAudio;
  document?: BotDocument;
  video?: BotVideo;
  voice?: BotVoice;
  animation?: BotAnimation;
  contact?: BotContact;
  location?: BotLocation;
  invoice?: BotInvoice;
  successful_payment?: BotSuccessfulPayment;
  web_app_data?: { data: string; button_text: string };
  reply_markup?: BotInlineKeyboardMarkup;
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

export interface BotUpdate {
  update_id: number;
  message?: BotMessage;
  edited_message?: BotMessage;
  callback_query?: BotCallbackQuery;
  pre_checkout_query?: BotPreCheckoutQuery;
}

/**
 * Fluent builder for inline keyboards in Bot API.
 */
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

/**
 * Fluent builder for reply keyboards in Bot API.
 */
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

/**
 * Helper object to remove custom reply keyboard.
 */
export const KeyboardRemove: {
  remove_keyboard: true;
};

/**
 * Official Bale HTTP Bot API Client (https://docs.bale.ai/)
 * Supports all 62 bot methods, webhooks, long-polling, inline buttons, file transfers, and Shetab payments.
 */
export class BaleBot extends EventEmitter {
  token: string;
  baseUrl: string;
  timeout: number;

  constructor(token: string, options?: BaleBotOptions);

  /**
   * Get full endpoint URL for a given Bot API method.
   */
  getMethodUrl(method: string): string;

  /**
   * Get public download URL for a file stored on Bale CDN.
   */
  getFileUrl(filePath: string): string;

  /**
   * Execute raw HTTP request against Bot API.
   */
  call(method: string, params?: Record<string, any>, files?: Record<string, any>): Promise<any>;

  /**
   * Get basic bot account information.
   */
  getMe(): Promise<BotUser>;

  /**
   * Log out of the cloud Bot API server.
   */
  logout(): Promise<boolean>;

  /**
   * Close the bot instance before exiting.
   */
  close(): Promise<boolean>;

  /**
   * Receive incoming updates via long polling.
   */
  getUpdates(options?: { offset?: number; limit?: number; timeout?: number }): Promise<BotUpdate[]>;

  /**
   * Register a webhook endpoint to receive updates via HTTPS POST.
   */
  setWebhook(urlOrOptions: string | { url: string; certificate?: any; max_connections?: number; allowed_updates?: string[]; drop_pending_updates?: boolean; secret_token?: string; [key: string]: any }): Promise<boolean>;

  /**
   * Remove webhook integration and switch back to getUpdates.
   */
  deleteWebhook(options?: { drop_pending_updates?: boolean }): Promise<boolean>;

  /**
   * Get current webhook status.
   */
  getWebhookInfo(): Promise<BotWebhookInfo>;

  /**
   * Start automatic long-polling loop with event emissions.
   */
  startPolling(options?: { interval?: number; limit?: number; timeout?: number }): void;

  /**
   * Stop background long-polling loop.
   */
  stopPolling(): void;

  /**
   * Feed an incoming update to the bot dispatcher.
   */
  handleUpdate(update: BotUpdate): void;

  /**
   * Create Express / Node.js HTTP webhook handler middleware.
   */
  createWebhookMiddleware(options?: { secretToken?: string }): (req: any, res: any) => void;

  /**
   * Send a text message to a chat.
   */
  sendMessage(chatId: number | string, text: string, options?: BotSendMessageOptions): Promise<BotMessage>;

  /**
   * Forward a message of any kind to another chat.
   */
  forwardMessage(chatId: number | string, fromChatId: number | string, messageId: number): Promise<BotMessage>;

  /**
   * Copy a message without link to original author.
   */
  copyMessage(chatId: number | string, fromChatId: number | string, messageId: number, options?: BotCopyMessageOptions): Promise<{ message_id: number }>;

  /**
   * Send a photo to a chat.
   */
  sendPhoto(chatId: number | string, photo: string | Buffer | any, options?: BotSendPhotoOptions): Promise<BotMessage>;

  /**
   * Send an audio / MP3 music file to a chat.
   */
  sendAudio(chatId: number | string, audio: string | Buffer | any, options?: BotSendAudioOptions): Promise<BotMessage>;

  /**
   * Send a general file / document to a chat.
   */
  sendDocument(chatId: number | string, document: string | Buffer | any, options?: BotSendDocumentOptions): Promise<BotMessage>;

  /**
   * Send a video file to a chat.
   */
  sendVideo(chatId: number | string, video: string | Buffer | any, options?: BotSendVideoOptions): Promise<BotMessage>;

  /**
   * Send an animation / GIF to a chat.
   */
  sendAnimation(chatId: number | string, animation: string | Buffer | any, options?: BotSendAnimationOptions): Promise<BotMessage>;

  /**
   * Send a voice note (.ogg) to a chat.
   */
  sendVoice(chatId: number | string, voice: string | Buffer | any, options?: BotSendVoiceOptions): Promise<BotMessage>;

  /**
   * Send an album / carousel of media items.
   */
  sendMediaGroup(chatId: number | string, media: BotInputMedia[]): Promise<BotMessage[]>;

  /**
   * Send a geographical coordinate point.
   */
  sendLocation(chatId: number | string, latitude: number, longitude: number, options?: BotSendLocationOptions): Promise<BotMessage>;

  /**
   * Send a phone contact card.
   */
  sendContact(chatId: number | string, phoneNumber: string, firstName: string, options?: BotSendContactOptions): Promise<BotMessage>;

  /**
   * Broadcast a chat action indicator (typing, uploading photo, etc.).
   */
  sendChatAction(chatId: number | string, action?: 'typing' | 'upload_photo' | 'record_video' | 'upload_video' | 'record_voice' | 'upload_voice' | 'upload_document' | 'find_location' | 'record_video_note' | 'upload_video_note' | string): Promise<boolean>;

  /**
   * Get file metadata and download path from file_id.
   */
  getFile(fileId: string): Promise<BotFile>;

  /**
   * Download a file from Bale servers to disk or buffer.
   */
  downloadFile(filePathOrFileId: string, destinationPath?: string): Promise<Buffer | string>;

  /**
   * Answer a callback query from an inline keyboard button.
   */
  answerCallbackQuery(callbackQueryId: string, options?: { text?: string; show_alert?: boolean; url?: string; cache_time?: number }): Promise<boolean>;

  /**
   * Prompt user to rate / review the bot.
   */
  askReview(chatId: number | string): Promise<boolean>;

  /**
   * Edit text of a previously sent message.
   */
  editMessageText(chatId: number | string, messageId: number, text: string, options?: BotEditMessageTextOptions): Promise<BotMessage>;

  /**
   * Edit caption of a media message.
   */
  editMessageCaption(chatId: number | string, messageId: number, caption: string, options?: BotEditMessageCaptionOptions): Promise<BotMessage>;

  /**
   * Edit inline reply markup of a message.
   */
  editMessageReplyMarkup(chatId: number | string, messageId: number, replyMarkup?: BotMessageReplyMarkup): Promise<BotMessage>;

  /**
   * Delete a message.
   */
  deleteMessage(chatId: number | string, messageId: number): Promise<boolean>;

  /**
   * Delete multiple messages in a chat.
   */
  deleteMessages(chatId: number | string, messageIds: number[]): Promise<boolean>;

  /**
   * Ban a user from a chat group or channel.
   */
  banChatMember(chatId: number | string, userId: number): Promise<boolean>;

  /**
   * Unban a previously banned user.
   */
  unbanChatMember(chatId: number | string, userId: number): Promise<boolean>;

  /**
   * Promote or demote a chat member to administrator.
   */
  promoteChatMember(chatId: number | string, userId: number, options?: BotPromoteChatMemberOptions): Promise<boolean>;

  /**
   * Set new chat profile photo.
   */
  setChatPhoto(chatId: number | string, photo: string | Buffer | any): Promise<boolean>;

  /**
   * Delete chat profile photo.
   */
  deleteChatPhoto(chatId: number | string): Promise<boolean>;

  /**
   * Change chat title.
   */
  setChatTitle(chatId: number | string, title: string): Promise<boolean>;

  /**
   * Change chat description.
   */
  setChatDescription(chatId: number | string, description: string): Promise<boolean>;

  /**
   * Pin a message in a chat.
   */
  pinChatMessage(chatId: number | string, messageId: number): Promise<boolean>;

  /**
   * Unpin a pinned chat message.
   */
  unpinChatMessage(chatId: number | string, messageId?: number): Promise<boolean>;

  /**
   * Alias for unpinChatMessage (docs.bale.ai compatibility).
   */
  unPinChatMessage(chatId: number | string, messageId?: number): Promise<boolean>;

  /**
   * Clear all pinned messages in a chat.
   */
  unpinAllChatMessages(chatId: number | string): Promise<boolean>;

  /**
   * Leave a group or channel.
   */
  leaveChat(chatId: number | string): Promise<boolean>;

  /**
   * Get detailed information about a chat.
   */
  getChat(chatId: number | string): Promise<BotChatFullInfo>;

  /**
   * Get list of administrators in a chat.
   */
  getChatAdministrators(chatId: number | string): Promise<BotChatMember[]>;

  /**
   * Get number of members in a chat.
   */
  getChatMembersCount(chatId: number | string): Promise<number>;

  /**
   * Get information about a specific member of a chat.
   */
  getChatMember(chatId: number | string, userId: number): Promise<BotChatMember>;

  /**
   * Create an additional invite link for a chat.
   */
  createChatInviteLink(chatId: number | string, options?: BotCreateChatInviteLinkOptions): Promise<BotChatInviteLink>;

  /**
   * Revoke an invite link previously generated by the bot.
   */
  revokeChatInviteLink(chatId: number | string, inviteLink: string): Promise<BotChatInviteLink>;

  /**
   * Generate a primary invite link for a chat.
   */
  exportChatInviteLink(chatId: number | string): Promise<string>;

  /**
   * Upload a PNG sticker file for later use in sticker sets.
   */
  uploadStickerFile(userId: number, pngSticker: string | Buffer | any): Promise<BotFile>;

  /**
   * Create a new sticker set owned by a user.
   */
  createNewStickerSet(userId: number, name: string, title: string, pngSticker: string | Buffer | any, emojis: string): Promise<boolean>;

  /**
   * Add a new sticker to an existing sticker set.
   */
  addStickerToSet(userId: number, name: string, pngSticker: string | Buffer | any, emojis: string): Promise<boolean>;

  /**
   * Send an invoice for payment through Shetab banking.
   */
  sendInvoice(
    chatId: number | string,
    title: string,
    description: string,
    payload: string,
    providerToken: string,
    currency: string,
    prices: BotLabeledPrice[],
    options?: BotSendInvoiceOptions
  ): Promise<BotMessage>;

  /**
   * Create a shareable direct payment link for an invoice.
   */
  createInvoiceLink(
    title: string,
    description: string,
    payload: string,
    providerToken: string,
    currency: string,
    prices: BotLabeledPrice[],
    options?: BotSendInvoiceOptions
  ): Promise<string>;

  /**
   * Respond to pre-checkout verification queries.
   */
  answerPreCheckoutQuery(preCheckoutQueryId: string, ok?: boolean, errorMessage?: string): Promise<boolean>;

  /**
   * Inquire payment status for a Shetab transaction ID.
   */
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

// ==========================================
// CLI & IPC Bridge Functions
// ==========================================

export function startStdioMode(): void;
export function startHttpMode(port?: number): void;
export function handleCommand(req: any): Promise<any>;
export function executeMethod(method: string, params?: any): Promise<any>;

export default BaleClient;
'''

root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx_dts = os.path.join(root_path, "index.d.ts")

with open(idx_dts, "w", encoding="utf-8") as f:
    f.write(dts_content)

print(f"Written {len(dts_content)} bytes to index.d.ts")

# Validate brace matching
curly = 0
parens = 0
square = 0
for c in dts_content:
    if c == '{': curly += 1
    elif c == '}': curly -= 1
    elif c == '(': parens += 1
    elif c == ')': parens -= 1
    elif c == '[': square += 1
    elif c == ']': square -= 1

print(f"Brace check: curly={curly}, parens={parens}, square={square}")
assert curly == 0, f"Unbalanced curlies: {curly}"
assert parens == 0, f"Unbalanced parens: {parens}"
assert square == 0, f"Unbalanced square brackets: {square}"
print("All braces are 100% perfectly balanced!")
