import 'card_model.dart';

enum ChatType { direct, group, channel }

enum MessageType {
  text,
  cardReceipt,
  goldPacket,
  paymentInvoice,
  voice,
  image,
  system
}

class ReactionModel {
  final String emoji;
  final int count;
  final bool reactedByMe;

  const ReactionModel({
    required this.emoji,
    required this.count,
    this.reactedByMe = false,
  });

  ReactionModel copyWith({int? count, bool? reactedByMe}) {
    return ReactionModel(
      emoji: emoji,
      count: count ?? this.count,
      reactedByMe: reactedByMe ?? this.reactedByMe,
    );
  }
}

class MessageModel {
  final String id;
  final int senderId;
  final String senderName;
  final String? senderAvatar;
  final String? roleBadge;
  final String text;
  final DateTime timestamp;
  final bool isMe;
  final MessageType type;
  final CardTransferReceipt? cardReceipt;
  final double? goldAmountGrams;
  final int? paymentAmount;
  final bool isRead;
  final List<ReactionModel> reactions;

  const MessageModel({
    required this.id,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    this.roleBadge,
    required this.text,
    required this.timestamp,
    required this.isMe,
    this.type = MessageType.text,
    this.cardReceipt,
    this.goldAmountGrams,
    this.paymentAmount,
    this.isRead = true,
    this.reactions = const [],
  });

  MessageModel copyWith({
    String? text,
    bool? isRead,
    List<ReactionModel>? reactions,
  }) {
    return MessageModel(
      id: id,
      senderId: senderId,
      senderName: senderName,
      senderAvatar: senderAvatar,
      roleBadge: roleBadge,
      text: text ?? this.text,
      timestamp: timestamp,
      isMe: isMe,
      type: type,
      cardReceipt: cardReceipt,
      goldAmountGrams: goldAmountGrams,
      paymentAmount: paymentAmount,
      isRead: isRead ?? this.isRead,
      reactions: reactions ?? this.reactions,
    );
  }
}

class DialogModel {
  final String id;
  final String title;
  final ChatType type;
  final String? avatarUrl;
  final String lastMessage;
  final DateTime lastMessageTime;
  final int unreadCount;
  final bool isPinned;
  final bool isOnline;
  final String category; // 'عمومی', 'کاری', 'مالی'
  final bool isMuted;

  const DialogModel({
    required this.id,
    required this.title,
    required this.type,
    this.avatarUrl,
    required this.lastMessage,
    required this.lastMessageTime,
    this.unreadCount = 0,
    this.isPinned = false,
    this.isOnline = false,
    this.category = 'عمومی',
    this.isMuted = false,
  });

  DialogModel copyWith({
    String? lastMessage,
    DateTime? lastMessageTime,
    int? unreadCount,
    bool? isPinned,
    bool? isOnline,
  }) {
    return DialogModel(
      id: id,
      title: title,
      type: type,
      avatarUrl: avatarUrl,
      lastMessage: lastMessage ?? this.lastMessage,
      lastMessageTime: lastMessageTime ?? this.lastMessageTime,
      unreadCount: unreadCount ?? this.unreadCount,
      isPinned: isPinned ?? this.isPinned,
      isOnline: isOnline ?? this.isOnline,
      category: category,
      isMuted: isMuted,
    );
  }
}
