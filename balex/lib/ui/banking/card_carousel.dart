import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/banks.dart';
import '../../models/card_model.dart';
import '../../providers/bank_provider.dart';

class CardCarousel extends StatefulWidget {
  final List<UserCard> cards;

  const CardCarousel({super.key, required this.cards});

  @override
  State<CardCarousel> createState() => _CardCarouselState();
}

class _CardCarouselState extends State<CardCarousel> {
  final _pageController = PageController(viewportFraction: 0.88);
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 200,
          child: PageView.builder(
            controller: _pageController,
            itemCount: widget.cards.length,
            onPageChanged: (i) => setState(() => _currentIndex = i),
            itemBuilder: (ctx, i) {
              final card = widget.cards[i];
              return _BankCardView(card: card);
            },
          ),
        ),
        const SizedBox(height: 8),
        // Dots indicator
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(widget.cards.length, (i) {
            final isActive = i == _currentIndex;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isActive ? 18 : 6,
              height: 6,
              decoration: BoxDecoration(
                color: isActive ? AppColors.baleGreen : AppColors.textMuted.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }
}

class _BankCardView extends StatelessWidget {
  final UserCard card;

  const _BankCardView({required this.card});

  @override
  Widget build(BuildContext context) {
    final bank = IranianBanks.detectBank(card.pan);
    final currencyFormatter = NumberFormat('#,###', 'fa');

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: bank.gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: bank.gradientColors.first.withValues(alpha: 0.35),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Top row: Bank name and logo
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(bank.icon, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      bank.nameFa,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'شتاب',
                    style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),

            // Middle: EMV chip & Masked PAN
            Row(
              children: [
                Container(
                  width: 34,
                  height: 26,
                  decoration: BoxDecoration(
                    color: const Color(0xFFD4AF37),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: const Color(0xFFB8860B), width: 0.8),
                  ),
                ),
                const Spacer(),
                Text(
                  IranianBanks.formatCardNumber(card.pan),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 2,
                  ),
                ),
              ],
            ),

            // Bottom: Holder Name, Expiry, Balance
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('دارنده کارت',
                        style: TextStyle(color: Colors.white60, fontSize: 9.5)),
                    Text(card.cardHolderName,
                        style: const TextStyle(
                            color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('انقضا', style: TextStyle(color: Colors.white60, fontSize: 9.5)),
                    Text(card.expireDate,
                        style: const TextStyle(
                            color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                  ],
                ),
                if (card.balance != null)
                  Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('موجودی',
                              style: TextStyle(color: Colors.white60, fontSize: 9.5)),
                          Text(
                            '${currencyFormatter.format(card.balance)} ریال',
                            style: const TextStyle(
                                color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(width: 4),
                      IconButton(
                        tooltip: 'استعلام مجدد موجودی',
                        icon: const Icon(Icons.refresh, color: Colors.white70, size: 16),
                        onPressed: () {
                          context.read<BankProvider>().refreshCardBalance(card.id);
                        },
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
