import 'dart:math';
import 'package:flutter/material.dart';
import '../models/card_model.dart';
import '../core/constants/banks.dart';
import '../core/network/bale_socket_client.dart';

class BankProvider extends ChangeNotifier {
  List<UserCard> _cards = [
    const UserCard(
      id: 'card_1',
      pan: '6037991234567890',
      cardHolderName: 'علی محمدی',
      expireDate: '07/04',
      isDefault: true,
      balance: 142500000,
    ),
    const UserCard(
      id: 'card_2',
      pan: '6104337788990011',
      cardHolderName: 'علی محمدی',
      expireDate: '10/05',
      isDefault: false,
      balance: 48000000,
    ),
    const UserCard(
      id: 'card_3',
      pan: '5022291034567890',
      cardHolderName: 'علی محمدی',
      expireDate: '02/06',
      isDefault: false,
      balance: 9100000,
    ),
  ];

  WalletBalance _wallet = const WalletBalance(
    cashRials: 24500000,
    goldGrams: 1.450,
  );

  final List<CardTransferReceipt> _recentReceipts = [
    CardTransferReceipt(
      trackingCode: '728194',
      rrn: '102938475612',
      sourcePan: '6037991234567890',
      destPan: '6221061122334455',
      destName: 'سارا باقری (بانک پارسیان)',
      amount: 15000000,
      date: DateTime.now().subtract(const Duration(hours: 3)),
      status: 'موفق',
      description: 'هزینه سرور دیسکورد',
    ),
  ];

  List<UserCard> get cards => _cards;
  WalletBalance get wallet => _wallet;
  List<CardTransferReceipt> get recentReceipts => _recentReceipts;
  UserCard get defaultCard => _cards.firstWhere((c) => c.isDefault, orElse: () => _cards.first);

  // Inquire destination PAN holder name
  Future<String> inquireDestinationPan(String pan) async {
    final clean = pan.replaceAll(RegExp(r'\D'), '');
    if (clean.length != 16) {
      throw Exception('شماره کارت باید ۱۶ رقم باشد');
    }

    if (BaleSocketClient.instance.isConnected) {
      try {
        final res = await BaleSocketClient.instance.inquireDestinationPan(
          cardId: defaultCard.id,
          destPan: clean,
          amount: 10000,
        );
        return '${res.cardHolderName} (${res.bankName})';
      } catch (_) {
        // Fallback to local catalog detection
      }
    }

    await Future.delayed(const Duration(milliseconds: 600));
    final bank = IranianBanks.detectBank(pan);

    // Realistic Persian mock names based on card ending digits
    final mockNames = [
      'رضا اسماعیلی',
      'سارا باقری',
      'حسین کاظمی',
      'مریم رضایی',
      'امیرحسین ابراهیمی',
      'فاطمه نوری',
      'محمد حسینی',
      'نرگس کریمی'
    ];
    int index = 0;
    if (clean.length >= 2) {
      index = (int.tryParse(clean.substring(clean.length - 2)) ?? 0) % mockNames.length;
    }
    return '${mockNames[index]} (${bank.nameFa})';
  }

  // Request dynamic SMS OTP (رمز پویا)
  Future<bool> requestOtp({
    required String cardId,
    required String destPan,
    required int amount,
  }) async {
    await Future.delayed(const Duration(milliseconds: 700));
    // Simulated OTP delivery
    return true;
  }

  // Execute Card to Card Transfer (انتقال وجه کارت به کارت)
  Future<CardTransferReceipt> transferMoneyByCard({
    required String sourceCardId,
    required String destinationPan,
    required String destCardHolderName,
    required int amount,
    required String pin2,
    required String cvv2,
    required String expireDate,
    String? description,
  }) async {
    final sourceCard = _cards.firstWhere((c) => c.id == sourceCardId);

    if (BaleSocketClient.instance.isConnected) {
      try {
        final res = await BaleSocketClient.instance.transferMoneyByCard(
          sourceCardId: sourceCardId,
          destinationPan: destinationPan,
          amount: amount,
          pin2: pin2,
          cvv2: cvv2,
          expireDate: expireDate,
          description: description,
        );
        final receipt = CardTransferReceipt(
          trackingCode: res.trackingCode,
          rrn: res.rrn,
          sourcePan: sourceCard.pan,
          destPan: destinationPan,
          destName: destCardHolderName,
          amount: amount,
          date: DateTime.now(),
          status: res.success ? 'موفق' : 'ناموفق',
          description: description,
        );
        _recentReceipts.insert(0, receipt);
        notifyListeners();
        return receipt;
      } catch (_) {
        // Fallback to simulation
      }
    }

    await Future.delayed(const Duration(milliseconds: 1000));
    final random = Random();
    final trackingCode = (100000 + random.nextInt(900000)).toString();
    final rrn = (100000000000 + random.nextInt(899999999999)).toString();

    final receipt = CardTransferReceipt(
      trackingCode: trackingCode,
      rrn: rrn,
      sourcePan: sourceCard.pan,
      destPan: destinationPan,
      destName: destCardHolderName,
      amount: amount,
      date: DateTime.now(),
      status: 'موفق',
      description: description,
    );

    // Update source card balance if available
    if (sourceCard.balance != null) {
      _cards = _cards.map((c) {
        if (c.id == sourceCardId) {
          final newBal = (c.balance! - amount - 7200); // 7200 Rials Shetab fee
          return c.copyWith(balance: newBal > 0 ? newBal : 0);
        }
        return c;
      }).toList();
    }

    _recentReceipts.insert(0, receipt);
    notifyListeners();
    return receipt;
  }

  // Quick balance inquiry for card
  Future<int> refreshCardBalance(String cardId) async {
    await Future.delayed(const Duration(milliseconds: 800));
    final index = _cards.indexWhere((c) => c.id == cardId);
    if (index != -1) {
      final updated = _cards[index].copyWith(
        balance: (_cards[index].balance ?? 50000000) + 200000,
      );
      _cards[index] = updated;
      notifyListeners();
      return updated.balance!;
    }
    return 0;
  }

  // Send Gold Packet
  void recordGoldTransfer(double grams) {
    _wallet = WalletBalance(
      cashRials: _wallet.cashRials,
      goldGrams: (_wallet.goldGrams - grams) > 0 ? (_wallet.goldGrams - grams) : 0,
      points: _wallet.points + 15,
    );
    notifyListeners();
  }
}
