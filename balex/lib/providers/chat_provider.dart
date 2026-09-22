import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/chat_model.dart';
import '../models/card_model.dart';
import '../core/proto/bale_proto.dart';

class ChatProvider extends ChangeNotifier {
  final _uuid = const Uuid();

  List<DialogModel> _dialogs = [
    DialogModel(
      id: 'dm_1',
      title: 'رضا اسماعیلی',
      type: ChatType.direct,
      lastMessage: 'کارت به کارت برات زدم، رسیدش رو فرستادم ببین.',
      lastMessageTime: DateTime.now().subtract(const Duration(minutes: 4)),
      unreadCount: 2,
      isPinned: true,
      isOnline: true,
      category: 'کاری',
    ),
    DialogModel(
      id: 'dm_2',
      title: 'سارا باقری',
      type: ChatType.direct,
      lastMessage: 'ممنون از پاکت طلای قشنگی که فرستادی 💛',
      lastMessageTime: DateTime.now().subtract(const Duration(minutes: 25)),
      unreadCount: 0,
      isPinned: true,
      isOnline: true,
      category: 'عمومی',
    ),
    DialogModel(
      id: 'group_1',
      title: '🚀 تیم توسعه BaleX',
      type: ChatType.group,
      lastMessage: 'امیرحسین: نسخه فلاتر دیسکوردی واقعاً شیکه!',
      lastMessageTime: DateTime.now().subtract(const Duration(minutes: 12)),
      unreadCount: 5,
      isPinned: true,
      category: 'کاری',
    ),
    DialogModel(
      id: 'channel_1',
      title: '📢 کانال رسمی بله',
      type: ChatType.channel,
      lastMessage: 'قابلیت‌های جدید بخش مالی و پاکت هدیه فعال شد.',
      lastMessageTime: DateTime.now().subtract(const Duration(hours: 3)),
      unreadCount: 0,
      category: 'عمومی',
    ),
    DialogModel(
      id: 'dm_3',
      title: 'پشتیبانی پرداخت پیوند (بانک ملی)',
      type: ChatType.direct,
      lastMessage: 'تراکنش مانده‌گیری شتابی با موفقیت ثبت شد.',
      lastMessageTime: DateTime.now().subtract(const Duration(days: 1)),
      unreadCount: 0,
      category: 'مالی',
    ),
  ];

  String _selectedDialogId = 'dm_1';

  final Map<String, List<MessageModel>> _messages = {
    'dm_1': [
      MessageModel(
        id: 'm1',
        senderId: 101,
        senderName: 'رضا اسماعیلی',
        roleBadge: 'عضو تیم',
        text: 'سلام مهندس! پروژه BaleX آماده شد؟ ظاهر دیسکوردیش رو دیدم معرکه شده بود!',
        timestamp: DateTime.now().subtract(const Duration(minutes: 20)),
        isMe: false,
      ),
      MessageModel(
        id: 'm2',
        senderId: 998877,
        senderName: 'شما (BaleX)',
        roleBadge: 'BaleX Founder',
        text: 'سلام رضا جان. آره نسخه دسکتاپ و وب آماده است با پشتیبانی کامل از پروتکل‌های بله و کارت‌به‌کارت.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
        isMe: true,
      ),
      MessageModel(
        id: 'm3',
        senderId: 101,
        senderName: 'رضا اسماعیلی',
        text: 'عالیه! بابت خرید لایسنس سرورها برات کارت به کارت زدم، رسیدش اینه:',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        isMe: false,
      ),
      MessageModel(
        id: 'm4',
        senderId: 101,
        senderName: 'رضا اسماعیلی',
        text: 'رسید انتقال وجه شتابی',
        timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
        isMe: false,
        type: MessageType.cardReceipt,
        cardReceipt: CardTransferReceipt(
          trackingCode: '849201',
          rrn: '984128503921',
          sourcePan: '6037991234567890',
          destPan: '6104337788990011',
          destName: 'علی محمدی (بانک ملت)',
          amount: 5000000, // 5,000,000 Rials (500,000 Tomans)
          date: DateTime.now().subtract(const Duration(minutes: 4)),
          status: 'موفق',
          description: 'تسویه سهم هاست و سرور BaleX',
        ),
      ),
    ],
    'dm_2': [
      MessageModel(
        id: 'm5',
        senderId: 998877,
        senderName: 'شما (BaleX)',
        text: 'سلام سارا، به مناسبت لانچ BaleX این پاکت طلای بله رو برات فرستادم 💛',
        timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
        isMe: true,
        type: MessageType.goldPacket,
        goldAmountGrams: 0.250,
      ),
      MessageModel(
        id: 'm6',
        senderId: 102,
        senderName: 'سارا باقری',
        text: 'ممنون از پاکت طلای قشنگی که فرستادی 💛 خیلی سورپرایز قشنگی بود!',
        timestamp: DateTime.now().subtract(const Duration(minutes: 25)),
        isMe: false,
      ),
    ],
    'group_1': [
      MessageModel(
        id: 'm7',
        senderId: 103,
        senderName: 'امیرحسین ابراهیمی',
        roleBadge: 'UI/UX Designer',
        text: 'بچه‌ها نوار ماژول سمت چپ دیسکورد رو با رنگ‌های بله تست کردید؟ ترکیب بلرپل و سبز زمردی بله فوق‌العاده شده.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 45)),
        isMe: false,
      ),
      MessageModel(
        id: 'm8',
        senderId: 998877,
        senderName: 'شما (BaleX)',
        roleBadge: 'BaleX Founder',
        text: 'دقیقاً! کاروسل کارت‌های بانکی و بخش استعلام کارت هم کاملاً رسپانسیو و روان اجرا میشن.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 20)),
        isMe: true,
      ),
    ],
  };

  bool _isTyping = false;
  bool _isRealAccount = false;

  List<DialogModel> get dialogs => _dialogs;
  String get selectedDialogId => _selectedDialogId;
  bool get isTyping => _isTyping;

  bool get isRealAccount => _isRealAccount;

  /// Removes the bundled showcase conversations as soon as a real Bale
  /// session is active. Real dialogs are then populated by socket updates.
  void useRealAccount() {
    if (_isRealAccount) return;
    _isRealAccount = true;
    _dialogs = [];
    _messages.clear();
    _selectedDialogId = '';
    notifyListeners();
  }

  void replaceWithBaleDialogs(BaleDialogsPage page) {
    if (!_isRealAccount) useRealAccount();
    final now = DateTime.now();
    _dialogs = page.dialogs.map((d) => DialogModel(id: 'bale_${d.peerType}_${d.peerId}', title: d.title, type: d.peerType == 2 ? ChatType.group : (d.peerType == 3 ? ChatType.channel : ChatType.direct), lastMessage: d.lastMessage, lastMessageTime: now, unreadCount: d.unreadCount, isOnline: true)).toList();
    if (_dialogs.isNotEmpty && !_dialogs.any((d) => d.id == _selectedDialogId)) _selectedDialogId = _dialogs.first.id;
    notifyListeners();
  }

  void receiveBaleMessage(BaleIncomingMessage incoming, {required int currentUserId}) {
    final dialogId = 'bale_${incoming.peerType}_${incoming.peerId}';
    if (!_dialogs.any((d) => d.id == dialogId)) {
      _dialogs = [
        DialogModel(id: dialogId, title: 'گفتگوی بله ${incoming.peerId}', type: incoming.peerType == 2 ? ChatType.group : ChatType.direct, lastMessage: incoming.text, lastMessageTime: DateTime.now(), unreadCount: 1, isOnline: true),
        ..._dialogs,
      ];
    }
    final message = MessageModel(id: incoming.randomId.toString(), senderId: incoming.senderId, senderName: incoming.senderId == currentUserId ? 'شما' : 'کاربر بله', text: incoming.text, timestamp: DateTime.fromMillisecondsSinceEpoch(incoming.date.toInt() * 1000), isMe: incoming.senderId == currentUserId);
    (_messages[dialogId] ??= []).add(message);
    _dialogs = _dialogs.map((d) => d.id == dialogId ? d.copyWith(lastMessage: incoming.text, lastMessageTime: message.timestamp, unreadCount: d.id == _selectedDialogId ? 0 : d.unreadCount + 1) : d).toList();
    notifyListeners();
  }

  DialogModel get selectedDialog =>
      _dialogs.firstWhere(
        (d) => d.id == _selectedDialogId,
        orElse: () => _dialogs.isEmpty
            ? DialogModel(
                id: '',
                title: 'گفتگویی انتخاب نشده',
                type: ChatType.direct,
                lastMessage: '',
                lastMessageTime: DateTime.now(),
              )
            : _dialogs.first,
      );

  List<MessageModel> get currentMessages => _messages[_selectedDialogId] ?? [];

  void selectDialog(String id) {
    if (_selectedDialogId != id) {
      _selectedDialogId = id;
      // Clear unread count
      _dialogs = _dialogs.map((d) {
        if (d.id == id) {
          return d.copyWith(unreadCount: 0);
        }
        return d;
      }).toList();
      notifyListeners();
    }
  }

  void sendMessage(String text, {bool isStealth = false}) {
    if (text.trim().isEmpty) return;

    final newMsg = MessageModel(
      id: _uuid.v4(),
      senderId: 998877,
      senderName: 'شما (BaleX)',
      roleBadge: 'BaleX Founder',
      text: text.trim(),
      timestamp: DateTime.now(),
      isMe: true,
    );

    if (!_messages.containsKey(_selectedDialogId)) {
      _messages[_selectedDialogId] = [];
    }
    _messages[_selectedDialogId]!.add(newMsg);

    // Update last message in dialogs list
    _dialogs = _dialogs.map((d) {
      if (d.id == _selectedDialogId) {
        return d.copyWith(
          lastMessage: text.trim(),
          lastMessageTime: DateTime.now(),
        );
      }
      return d;
    }).toList();

    notifyListeners();
  }

  void sendCardReceipt(CardTransferReceipt receipt) {
    final newMsg = MessageModel(
      id: _uuid.v4(),
      senderId: 998877,
      senderName: 'شما (BaleX)',
      roleBadge: 'BaleX Founder',
      text: 'رسید انتقال وجه شتابی',
      timestamp: DateTime.now(),
      isMe: true,
      type: MessageType.cardReceipt,
      cardReceipt: receipt,
    );

    if (!_messages.containsKey(_selectedDialogId)) {
      _messages[_selectedDialogId] = [];
    }
    _messages[_selectedDialogId]!.add(newMsg);

    _dialogs = _dialogs.map((d) {
      if (d.id == _selectedDialogId) {
        return d.copyWith(
          lastMessage: '💳 رسید انتقال وجه (${receipt.amount} ریال)',
          lastMessageTime: DateTime.now(),
        );
      }
      return d;
    }).toList();

    notifyListeners();
  }

  void sendGoldPacket(double grams, String note) {
    final newMsg = MessageModel(
      id: _uuid.v4(),
      senderId: 998877,
      senderName: 'شما (BaleX)',
      roleBadge: 'BaleX Founder',
      text: note.isNotEmpty ? note : 'پاکت طلای بله 💛',
      timestamp: DateTime.now(),
      isMe: true,
      type: MessageType.goldPacket,
      goldAmountGrams: grams,
    );

    if (!_messages.containsKey(_selectedDialogId)) {
      _messages[_selectedDialogId] = [];
    }
    _messages[_selectedDialogId]!.add(newMsg);
    notifyListeners();
  }

  void toggleReaction(String messageId, String emoji) {
    final list = _messages[_selectedDialogId];
    if (list == null) return;

    final index = list.indexWhere((m) => m.id == messageId);
    if (index == -1) return;

    final msg = list[index];
    final existingReactions = List<ReactionModel>.from(msg.reactions);
    final rIndex = existingReactions.indexWhere((r) => r.emoji == emoji);

    if (rIndex != -1) {
      final r = existingReactions[rIndex];
      if (r.reactedByMe) {
        if (r.count <= 1) {
          existingReactions.removeAt(rIndex);
        } else {
          existingReactions[rIndex] = r.copyWith(count: r.count - 1, reactedByMe: false);
        }
      } else {
        existingReactions[rIndex] = r.copyWith(count: r.count + 1, reactedByMe: true);
      }
    } else {
      existingReactions.add(ReactionModel(emoji: emoji, count: 1, reactedByMe: true));
    }

    list[index] = msg.copyWith(reactions: existingReactions);
    notifyListeners();
  }

  void simulateIncomingTyping(bool typing) {
    _isTyping = typing;
    notifyListeners();
  }
}
