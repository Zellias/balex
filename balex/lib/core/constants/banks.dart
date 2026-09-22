import 'package:flutter/material.dart';

class BankInfo {
  final String nameFa;
  final String nameEn;
  final String bin;
  final List<Color> gradientColors;
  final IconData icon;

  const BankInfo({
    required this.nameFa,
    required this.nameEn,
    required this.bin,
    required this.gradientColors,
    required this.icon,
  });
}

class IranianBanks {
  static const List<BankInfo> supportedBanks = [
    BankInfo(
      nameFa: 'بانک ملی ایران',
      nameEn: 'Bank Melli Iran',
      bin: '603799',
      gradientColors: [Color(0xFF0F766E), Color(0xFF042F2E)],
      icon: Icons.account_balance,
    ),
    BankInfo(
      nameFa: 'بانک ملت',
      nameEn: 'Bank Mellat',
      bin: '610433',
      gradientColors: [Color(0xFFDC2626), Color(0xFF7F1D1D)],
      icon: Icons.account_balance,
    ),
    BankInfo(
      nameFa: 'بانک تجارت',
      nameEn: 'Tejarat Bank',
      bin: '627353',
      gradientColors: [Color(0xFF1D4ED8), Color(0xFF1E3A8A)],
      icon: Icons.account_balance,
    ),
    BankInfo(
      nameFa: 'بانک پاسارگاد',
      nameEn: 'Pasargad Bank',
      bin: '502229',
      gradientColors: [Color(0xFFD97706), Color(0xFF78350F)],
      icon: Icons.account_balance,
    ),
    BankInfo(
      nameFa: 'بانک صادرات ایران',
      nameEn: 'Bank Saderat',
      bin: '603769',
      gradientColors: [Color(0xFF4338CA), Color(0xFF312E81)],
      icon: Icons.account_balance,
    ),
    BankInfo(
      nameFa: 'بانک سامان',
      nameEn: 'Saman Bank',
      bin: '621986',
      gradientColors: [Color(0xFF0284C7), Color(0xFF0369A1)],
      icon: Icons.account_balance,
    ),
    BankInfo(
      nameFa: 'بانک کشاورزی',
      nameEn: 'Keshavarzi Bank',
      bin: '603770',
      gradientColors: [Color(0xFF15803D), Color(0xFF14532D)],
      icon: Icons.account_balance,
    ),
    BankInfo(
      nameFa: 'بانک سپه',
      nameEn: 'Bank Sepah',
      bin: '589210',
      gradientColors: [Color(0xFFB45309), Color(0xFF78350F)],
      icon: Icons.account_balance,
    ),
    BankInfo(
      nameFa: 'بانک رسالت',
      nameEn: 'Resalat Bank',
      bin: '504172',
      gradientColors: [Color(0xFF0D9488), Color(0xFF115E59)],
      icon: Icons.account_balance,
    ),
    BankInfo(
      nameFa: 'بانک آینده',
      nameEn: 'Ayandeh Bank',
      bin: '636214',
      gradientColors: [Color(0xFF854D0E), Color(0xFF713F12)],
      icon: Icons.account_balance,
    ),
  ];

  static BankInfo detectBank(String cardNumber) {
    final clean = cardNumber.replaceAll(RegExp(r'\D'), '');
    if (clean.length >= 6) {
      final bin = clean.substring(0, 6);
      for (final bank in supportedBanks) {
        if (bank.bin == bin) return bank;
      }
    }
    return const BankInfo(
      nameFa: 'کارت شتابی',
      nameEn: 'Shetab Card',
      bin: '000000',
      gradientColors: [Color(0xFF475569), Color(0xFF1E293B)],
      icon: Icons.credit_card,
    );
  }

  static String formatCardNumber(String raw) {
    final clean = raw.replaceAll(RegExp(r'\D'), '');
    final chunks = <String>[];
    for (int i = 0; i < clean.length; i += 4) {
      final end = (i + 4 < clean.length) ? i + 4 : clean.length;
      chunks.add(clean.substring(i, end));
    }
    return chunks.join(' - ');
  }

  static String maskCardNumber(String pan) {
    final clean = pan.replaceAll(RegExp(r'\D'), '');
    if (clean.length == 16) {
      return '${clean.substring(0, 4)} - **** - **** - ${clean.substring(12, 16)}';
    }
    return pan;
  }
}
