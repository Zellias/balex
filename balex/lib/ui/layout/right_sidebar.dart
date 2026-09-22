import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../models/user_model.dart';
import '../../providers/chat_provider.dart';
import '../../widgets/discord_avatar.dart';
import '../banking/transfer_modal.dart';

class RightSidebar extends StatelessWidget {
  const RightSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final activeDialog = chatProvider.selectedDialog;

    final members = [
      const UserModel(
        id: 998877,
        name: 'شما (توسعه‌دهنده)',
        roleBadge: 'BaleX Founder',
        status: UserStatus.online,
        isMe: true,
      ),
      const UserModel(
        id: 101,
        name: 'رضا اسماعیلی',
        roleBadge: 'مدیر گروه',
        status: UserStatus.online,
      ),
      const UserModel(
        id: 102,
        name: 'سارا باقری',
        roleBadge: 'عضو فعال',
        status: UserStatus.idle,
      ),
      const UserModel(
        id: 103,
        name: 'امیرحسین ابراهیمی',
        roleBadge: 'طراح UI/UX',
        status: UserStatus.dnd,
      ),
      const UserModel(
        id: 104,
        name: 'ربات پیوند شتاب',
        roleBadge: 'BOT',
        isBot: true,
        status: UserStatus.online,
      ),
    ];

    return Container(
      width: 240,
      color: AppColors.bgSidebar,
      child: ListView(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        children: [
          // Quick Banking Card for current chat
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.baleGreen.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: const [
                    Icon(Icons.credit_card_rounded, color: AppColors.baleGreen, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'امور مالی این گفتگو',
                        style: TextStyle(
                          color: AppColors.textHeader,
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'انتقال مستقیم شتابی به حساب ${activeDialog.title}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
                const SizedBox(height: 10),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.baleGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    elevation: 0,
                  ),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (_) => const TransferModal(),
                    );
                  },
                  child: const Text('کارت به کارت سریع',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          _buildHeader('مدیران و سازندگان — ۲'),
          ...members.where((m) => m.roleBadge != null && m.roleBadge!.contains('BaleX') || m.roleBadge!.contains('مدیر')).map((m) => _MemberTile(user: m)),

          const SizedBox(height: 14),
          _buildHeader('آنلاین — ۳'),
          ...members.where((m) => m.status == UserStatus.online && !m.isBot).map((m) => _MemberTile(user: m)),

          const SizedBox(height: 14),
          _buildHeader('ربات‌ها و دستیاران — ۱'),
          ...members.where((m) => m.isBot).map((m) => _MemberTile(user: m)),
        ],
      ),
    );
  }

  Widget _buildHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          color: AppColors.textMuted,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _MemberTile extends StatelessWidget {
  final UserModel user;

  const _MemberTile({required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 2),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        children: [
          DiscordAvatar(
            name: user.name,
            size: 32,
            status: user.status,
            showStatus: true,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.name,
                  style: const TextStyle(
                    color: AppColors.textHeader,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                if (user.roleBadge != null)
                  Text(
                    user.roleBadge!,
                    style: TextStyle(
                      color: user.isMe ? AppColors.baleGreen : AppColors.blurple,
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
