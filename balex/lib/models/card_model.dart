class UserCard {
  final String id;
  final String pan;
  final String cardHolderName;
  final String expireDate; // MM/YY
  final bool isDefault;
  final int? balance; // in Rials

  const UserCard({
    required this.id,
    required this.pan,
    required this.cardHolderName,
    required this.expireDate,
    this.isDefault = false,
    this.balance,
  });

  UserCard copyWith({
    String? cardHolderName,
    String? expireDate,
    bool? isDefault,
    int? balance,
  }) {
    return UserCard(
      id: id,
      pan: pan,
      cardHolderName: cardHolderName ?? this.cardHolderName,
      expireDate: expireDate ?? this.expireDate,
      isDefault: isDefault ?? this.isDefault,
      balance: balance ?? this.balance,
    );
  }
}

class CardTransferReceipt {
  final String trackingCode;
  final String rrn;
  final String sourcePan;
  final String destPan;
  final String destName;
  final int amount; // in Rials
  final DateTime date;
  final String status; // 'موفق'
  final String? description;

  const CardTransferReceipt({
    required this.trackingCode,
    required this.rrn,
    required this.sourcePan,
    required this.destPan,
    required this.destName,
    required this.amount,
    required this.date,
    this.status = 'موفق',
    this.description,
  });
}

class WalletBalance {
  final int cashRials;
  final double goldGrams;
  final int points;

  const WalletBalance({
    this.cashRials = 12500000,
    this.goldGrams = 1.485,
    this.points = 450,
  });
}
