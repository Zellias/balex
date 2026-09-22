import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/banks.dart';
import '../../providers/bank_provider.dart';
import 'card_carousel.dart';
import 'transfer_modal.dart';

class FinancialHubView extends StatelessWidget {
  const FinancialHubView({super.key});

  @override
  Widget build(BuildContext context) {
    final bankProvider = context.watch<BankProvider>();
    final currencyFormatter = NumberFormat('#,###', 'fa');

    return Container(
      color: AppColors.bgCanvas,
      child: Column(
        children: [
          // Top Discord-style Header
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: const BoxDecoration(
              color: AppColors.bgCanvas,
              border: Border(bottom: BorderSide(color: AppColors.bgRail, width: 1.5)),
            ),
            child: Row(
              children: [
                Builder(
                  builder: (ctx) {
                    final scaffold = Scaffold.maybeOf(ctx);
                    if (scaffold != null && scaffold.hasDrawer) {
                      return Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: IconButton(
                          tooltip: 'منوی ناوبری (اسلاید راست)',
                          icon: const Icon(Icons.menu_rounded, color: AppColors.textHeader, size: 22),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                          onPressed: () => scaffold.openDrawer(),
                        ),
                      );
                    }
                    return const SizedBox.shrink();
                  },
                ),
                const Icon(Icons.credit_card_rounded, color: AppColors.baleGreen, size: 22),
                const SizedBox(width: 10),
                const Expanded(
                  child: Text(
                    'مرکز خدمات مالی و بانکی BaleX',
                    style: TextStyle(
                      color: AppColors.textHeader,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.baleGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  ),
                  icon: const Icon(Icons.send_rounded, size: 16),
                  label: const Text('کارت به کارت جدید',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (_) => const TransferModal(),
                    );
                  },
                ),
              ],
            ),
          ),

          // Scrollable Financial Canvas
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Bale Wallet & Gold Summary Cards
                Row(
                  children: [
                    // Cash Wallet Card
                    Expanded(
                      child: _buildWalletSummaryCard(
                        title: 'کیف پول بله (نقدی)',
                        value: '${currencyFormatter.format(bankProvider.wallet.cashRials)} ریال',
                        subtitle:
                            'معادل ${(bankProvider.wallet.cashRials / 10).round()} تومان موجودی فعال',
                        icon: Icons.account_balance_wallet_rounded,
                        accentColor: AppColors.baleGreen,
                        actionLabel: 'شارژ کیف پول',
                        onTap: () {},
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Gold Wallet Card
                    Expanded(
                      child: _buildWalletSummaryCard(
                        title: 'کیف طلای بله 💛',
                        value: '${bankProvider.wallet.goldGrams} گرم',
                        subtitle: 'طلای آب‌شده ۱۸ عیار تضمینی',
                        icon: Icons.card_giftcard_rounded,
                        accentColor: AppColors.gold,
                        actionLabel: 'خرید / ارسال پاکت طلا',
                        onTap: () {},
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Bank Cards Section Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text(
                      'کارت‌های بانکی متصل به شتاب (پیوند)',
                      style: TextStyle(
                        color: AppColors.textHeader,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'مدیریت کارت‌ها',
                      style: TextStyle(color: AppColors.blurple, fontSize: 13),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Bank Cards Carousel
                CardCarousel(cards: bankProvider.cards),

                const SizedBox(height: 28),

                // Recent Shetab Transactions Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text(
                      'تراکنش‌های اخیر شتاب و کارت به کارت',
                      style: TextStyle(
                        color: AppColors.textHeader,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'مشاهده صورتحساب کامل (PFM)',
                      style: TextStyle(color: AppColors.baleGreen, fontSize: 13),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Transactions Table / List
                if (bankProvider.recentReceipts.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.bgSidebar,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.divider),
                    ),
                    alignment: Alignment.center,
                    child: Column(
                      children: const [
                        Icon(Icons.receipt_long_rounded, color: AppColors.textMuted, size: 36),
                        SizedBox(height: 8),
                        Text(
                          'هنوز تراکنش جدیدی در این نشست ثبت نشده است.',
                          style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                        ),
                      ],
                    ),
                  )
                else
                  ...bankProvider.recentReceipts.map((r) {
                    final bank = IranianBanks.detectBank(r.sourcePan);
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppColors.bgSidebar,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.divider, width: 0.8),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.baleGreen.withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.check, color: AppColors.baleGreen, size: 18),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'انتقال به ${r.destName}',
                                  style: const TextStyle(
                                    color: AppColors.textHeader,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13.5,
                                  ),
                                ),
                                Text(
                                  'پیگیری: ${r.trackingCode} • ${bank.nameFa}',
                                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11.5),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '- ${currencyFormatter.format(r.amount)} ریال',
                                style: const TextStyle(
                                  color: AppColors.danger,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                DateFormat('HH:mm').format(r.date),
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWalletSummaryCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
    required String actionLabel,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.bgSidebar,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: accentColor.withValues(alpha: 0.35), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.18),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: accentColor, size: 22),
              ),
              const SizedBox(width: 10),
              Text(
                title,
                style: const TextStyle(color: AppColors.textNormal, fontSize: 14, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            value,
            style: TextStyle(color: accentColor, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: onTap,
              child: Text(actionLabel, style: TextStyle(color: accentColor, fontSize: 12.5)),
            ),
          ),
        ],
      ),
    );
  }
}
