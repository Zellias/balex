import 'dart:typed_data';
import 'bale_socket_client.dart';

/// Base class for all Bale real-time events
abstract class BaleEvent {
  const BaleEvent();
}

/// Incoming message event with rich convenience helper methods
class BaleMessageEvent extends BaleEvent {
  final int senderId;
  final int peerType;
  final int peerId;
  final BigInt date;
  final BigInt randomId;
  final String text;
  final bool isGroup;
  final bool isOut;

  // Media & type indicators
  final bool isPhoto;
  final bool isVoice;
  final bool isAudio;
  final bool isVideo;
  final bool isDocument;
  final bool isSticker;
  final bool isGiftPacket;
  final bool isGoldGiftPacket;

  final Map<String, dynamic>? giftPacketInfo;
  final BigInt? goldGiftPacketId;
  final Uint8List? rawMessage;

  final BaleSocketClient _client;

  BaleMessageEvent({
    required this.senderId,
    required this.peerType,
    required this.peerId,
    required this.date,
    required this.randomId,
    required this.text,
    this.isGroup = false,
    this.isOut = false,
    this.isPhoto = false,
    this.isVoice = false,
    this.isAudio = false,
    this.isVideo = false,
    this.isDocument = false,
    this.isSticker = false,
    this.isGiftPacket = false,
    this.isGoldGiftPacket = false,
    this.giftPacketInfo,
    this.goldGiftPacketId,
    this.rawMessage,
    BaleSocketClient? client,
  }) : _client = client ?? BaleSocketClient.instance;

  /// Reply to this message with optional humanized delays
  Future<void> reply(String replyText, {bool humanize = true}) {
    return _client.sendChatMessage(
      peerType: peerType,
      peerId: peerId,
      text: replyText,
      humanize: humanize,
    );
  }

  /// Mark this message as delivered (single gray checkmark)
  Future<void> markAsReceived() {
    return _client.markAsReceived(peerType: peerType, peerId: peerId, date: date);
  }

  /// Mark this message as read / seen (double blue checkmarks)
  Future<void> markAsRead() {
    return _client.markAsRead(peerType: peerType, peerId: peerId, date: date);
  }

  /// Add emoji reaction to this message
  Future<void> react(String emoji) {
    return _client.setReaction(peerType: peerType, peerId: peerId, messageId: randomId, emoji: emoji);
  }

  /// Pin this message in the conversation
  Future<void> pin() {
    return _client.pinMessage(peerType: peerType, peerId: peerId, messageId: randomId);
  }

  /// Delete this message
  Future<void> delete() {
    return _client.deleteMessages(peerType: peerType, peerId: peerId, messageIds: [randomId]);
  }

  /// Forward this message to another peer
  Future<void> forwardTo({required int toPeerType, required int toPeerId}) {
    return _client.forwardMessages(
      toPeerType: toPeerType,
      toPeerId: toPeerId,
      fromPeerType: peerType,
      fromPeerId: peerId,
      messageIds: [randomId],
    );
  }

  /// Automatically claim and open cash gift packet
  Future<({int status, BigInt selfWinAmount, int rank, int openedCount})> openGiftPacket({String? walletId}) {
    return _client.openGiftPacket(
      peerType: peerType,
      peerId: peerId,
      randomId: randomId,
      date: date,
      walletId: walletId,
    );
  }

  /// Automatically claim and open gold gift packet
  Future<({BigInt selfWinAmount, int openedCount})> openGoldGiftPacket() {
    if (goldGiftPacketId == null) {
      throw StateError('این پیام حاوی پاکت هدیه طلا نیست.');
    }
    return _client.openGoldGiftPacket(goldGiftPacketId!);
  }
}

/// Message edited event
class BaleMessageEditEvent extends BaleEvent {
  final int peerType;
  final int peerId;
  final BigInt rid;
  final String? newText;
  final BigInt date;

  const BaleMessageEditEvent({
    required this.peerType,
    required this.peerId,
    required this.rid,
    this.newText,
    required this.date,
  });
}

/// Message(s) deleted event
class BaleMessageDeleteEvent extends BaleEvent {
  final int peerType;
  final int peerId;
  final List<BigInt> rids;

  const BaleMessageDeleteEvent({
    required this.peerType,
    required this.peerId,
    required this.rids,
  });
}

/// Message delivered confirmation (single tick)
class BaleMessageReceivedEvent extends BaleEvent {
  final int peerType;
  final int peerId;
  final BigInt startDate;
  final BigInt date;

  const BaleMessageReceivedEvent({
    required this.peerType,
    required this.peerId,
    required this.startDate,
    required this.date,
  });
}

/// Message read confirmation (double blue ticks)
class BaleMessageReadEvent extends BaleEvent {
  final int peerType;
  final int peerId;
  final BigInt startDate;
  final BigInt date;

  const BaleMessageReadEvent({
    required this.peerType,
    required this.peerId,
    required this.startDate,
    required this.date,
  });
}

/// Chat history cleared event
class BaleChatClearEvent extends BaleEvent {
  final int peerType;
  final int peerId;

  const BaleChatClearEvent({
    required this.peerType,
    required this.peerId,
  });
}

/// Emoji reaction updated event
class BaleReactionEvent extends BaleEvent {
  final int peerType;
  final int peerId;
  final BigInt rid;
  final List<({String code, int count, bool isSelf})> reactions;
  final bool reactionByMe;

  const BaleReactionEvent({
    required this.peerType,
    required this.peerId,
    required this.rid,
    required this.reactions,
    this.reactionByMe = false,
  });
}

/// User started typing event
class BaleTypingEvent extends BaleEvent {
  final int peerType;
  final int peerId;
  final int userId;
  final int typingType;

  const BaleTypingEvent({
    required this.peerType,
    required this.peerId,
    required this.userId,
    required this.typingType,
  });
}

/// User stopped typing event
class BaleTypingStopEvent extends BaleEvent {
  final int peerType;
  final int peerId;
  final int userId;
  final int typingType;

  const BaleTypingStopEvent({
    required this.peerType,
    required this.peerId,
    required this.userId,
    this.typingType = 0,
  });
}

/// User online status event
class BaleUserOnlineEvent extends BaleEvent {
  final int userId;
  final int deviceType;

  const BaleUserOnlineEvent({
    required this.userId,
    required this.deviceType,
  });
}

/// User offline status event
class BaleUserOfflineEvent extends BaleEvent {
  final int userId;
  final BigInt lastSeen;

  const BaleUserOfflineEvent({
    required this.userId,
    required this.lastSeen,
  });
}

/// WebSocket connection established event
class BaleConnectedEvent extends BaleEvent {
  final String? uid;
  final String endpoint;
  final int timestamp;

  const BaleConnectedEvent({
    this.uid,
    required this.endpoint,
    required this.timestamp,
  });
}

/// WebSocket disconnected event
class BaleDisconnectedEvent extends BaleEvent {
  final int code;
  final String reason;

  const BaleDisconnectedEvent({
    required this.code,
    required this.reason,
  });
}

/// Connection status transition event
class BaleStatusEvent extends BaleEvent {
  final BaleConnectionStatus status;

  const BaleStatusEvent(this.status);
}

/// Error event
class BaleErrorEvent extends BaleEvent {
  final Object error;
  final StackTrace? stackTrace;

  const BaleErrorEvent(this.error, [this.stackTrace]);
}

/// Universal raw update frame event
class BaleRawUpdateEvent extends BaleEvent {
  final String type;
  final Uint8List raw;

  const BaleRawUpdateEvent({
    required this.type,
    required this.raw,
  });
}
