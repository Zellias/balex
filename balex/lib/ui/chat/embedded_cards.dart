import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/banks.dart';
import '../../models/card_model.dart';

class CardReceiptWidget extends StatelessWidget {
  final CardTransferReceipt receipt;

  const CardReceiptWidget({super.key, required this.receipt});

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###', 'fa');
    final rials = receipt.amount;
    final tomans = (rials / 10).round();
    final bank = IranianBanks.detectBank(receipt.sourcePan);

    return Container(
      constraints: const BoxConstraints(maxWidth: 380),
      margin: const EdgeInsets.only(top: 6, bottom: 4),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.baleGreen.withValues(alpha: 0.4), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: bank.gradientColors),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(9),
                topRight: Radius.circular(9),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'رسید انتقال وجه شتابی (کارت به کارت)',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Text(
                  bank.nameFa,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),

          // Amount Section
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      currencyFormatter.format(tomans),
                      style: const TextStyle(
                        color: AppColors.textHeader,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      'تومان',
                      style: TextStyle(
                        color: AppColors.baleGreen,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Text(
                  '(${currencyFormatter.format(rials)} ریال)',
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),

          const Divider(color: AppColors.divider, height: 1),

          // Details grid
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                _buildRow('کارت مبدا:', IranianBanks.maskCardNumber(receipt.sourcePan)),
                const SizedBox(height: 6),
                _buildRow('کارت مقصد:', IranianBanks.maskCardNumber(receipt.destPan)),
                const SizedBox(height: 6),
                _buildRow('نام گیرنده:', receipt.destName, isHighlight: true),
                const SizedBox(height: 6),
                _buildRow('شماره پیگیری:', receipt.trackingCode),
                const SizedBox(height: 6),
                _buildRow('شماره ارجاع (RRN):', receipt.rrn),
                const SizedBox(height: 6),
                _buildRow(
                  'تاریخ و زمان:',
                  DateFormat('yyyy/MM/dd - HH:mm').format(receipt.date),
                ),
                if (receipt.description != null && receipt.description!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  _buildRow('بابت:', receipt.description!),
                ],
              ],
            ),
          ),

          // Footer branding
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: const BoxDecoration(
              color: AppColors.bgRail,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(9),
                bottomRight: Radius.circular(9),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Expanded(
                  child: Text(
                    'تایید شده توسط سامانه شاپرک و پیوند بله',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                SizedBox(width: 6),
                Icon(Icons.verified_rounded, color: AppColors.baleGreen, size: 14),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.left,
            style: TextStyle(
              color: isHighlight ? AppColors.baleGreen : AppColors.textNormal,
              fontSize: 12,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w500,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class GoldPacketWidget extends StatelessWidget {
  final double grams;

  const GoldPacketWidget({super.key, required this.grams});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 320),
      margin: const EdgeInsets.only(top: 6, bottom: 4),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF78350F), Color(0xFF451A03)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gold, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.2),
            blurRadius: 12,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.card_giftcard_rounded, color: AppColors.gold, size: 28),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'پاکت طلای بله 💛',
                        style: TextStyle(
                          color: AppColors.goldLight,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '$grams گرم طلای ۱۸ عیار',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: Colors.black87,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('تبریک! مقدار $grams گرم طلا به کیف طلای شما افزوده شد.'),
                      backgroundColor: AppColors.baleGreenDark,
                    ),
                  );
                },
                child: const Text(
                  'مشاهده و واریز به کیف طلا',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
