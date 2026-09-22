import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../models/chat_model.dart';
import '../../models/user_model.dart';
import '../../providers/chat_provider.dart';
import '../../providers/settings_provider.dart';
import '../../providers/bale_client_provider.dart';
import '../auth/bale_login_dialog.dart';
import '../../widgets/discord_avatar.dart';

class ChannelSidebar extends StatelessWidget {
  const ChannelSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final settingsProvider = context.watch<SettingsProvider>();

    return Container(
      width: 250,
      color: AppColors.bgSidebar,
      child: Column(
        children: [
          // Top Search bar / Quick Find (Discord ⌘K)
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.bgRail, width: 1.5)),
            ),
            child: InkWell(
              onTap: () {
                // Open search modal
              },
              borderRadius: BorderRadius.circular(4),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  color: AppColors.bgRail,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.search, color: AppColors.textMuted, size: 16),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'جستجو یا گفتگو... (⌘K)',
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 12.5,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bale MKProto Connection Bar
          Consumer<BaleClientProvider>(
            builder: (context, clientProvider, _) {
              final isConnected = clientProvider.isConnected;
              final isGuest = clientProvider.isSandboxMode;
              return InkWell(
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    backgroundColor: AppColors.bgCard,
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                    ),
                    builder: (ctx) => SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              isGuest
                                  ? 'حالت مهمان (آزمایشی)'
                                  : (clientProvider.user?.name ?? 'اکانت بله'),
                              style: const TextStyle(color: AppColors.textHeader, fontSize: 16, fontWeight: FontWeight.bold),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              isGuest
                                  ? 'برای دسترسی به پیام‌ها و گروه‌های واقعی خود، به حساب بله متصل شوید.'
                                  : (clientProvider.phoneNumber ?? ''),
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 12.5),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 18),
                            if (!isConnected && !isGuest)
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.baleGreen,
                                  foregroundColor: Colors.white,
                                ),
                                icon: const Icon(Icons.refresh_rounded),
                                label: const Text('اتصال مجدد به سرور'),
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  clientProvider.connectToBaleServer();
                                },
                              ),
                            const SizedBox(height: 8),
                            OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.dnd,
                                side: const BorderSide(color: AppColors.dnd),
                              ),
                              icon: const Icon(Icons.logout_rounded),
                              label: Text(isGuest ? 'ورود به اکانت واقعی بله' : 'خروج از حساب کاربری'),
                              onPressed: () {
                                Navigator.pop(ctx);
                                clientProvider.logout();
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  color: isConnected
                      ? AppColors.baleGreen.withValues(alpha: 0.12)
                      : (isGuest ? AppColors.gold.withValues(alpha: 0.1) : AppColors.bgCard),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isConnected
                              ? AppColors.online
                              : (isGuest ? AppColors.gold : AppColors.idle),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          isConnected
                              ? 'متصل به سرور بله (MKProto)'
                              : (isGuest ? 'حالت مهمان (آزمایشی)' : 'اتصال به پروتکل بله (ورود/لایو)'),
                          style: TextStyle(
                            color: isConnected
                                ? AppColors.baleGreen
                                : (isGuest ? AppColors.gold : AppColors.textMuted),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Icon(
                        isGuest ? Icons.person_outline_rounded : Icons.bolt_rounded,
                        size: 14,
                        color: isConnected
                            ? AppColors.baleGreen
                            : (isGuest ? AppColors.gold : AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // Dialog list
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
              children: [
                _buildCategoryHeader('پین شده‌ها'),
                ...chatProvider.dialogs
                    .where((d) => d.isPinned)
                    .map((d) => _DialogTile(
                          dialog: d,
                          isSelected: d.id == chatProvider.selectedDialogId,
                          onTap: () {
                            chatProvider.selectDialog(d.id);
                            final scaffold = Scaffold.maybeOf(context);
                            if (scaffold != null && scaffold.isDrawerOpen) {
                              Navigator.of(context).pop();
                            }
                          },
                        )),
                const SizedBox(height: 12),
                _buildCategoryHeader('گفتگوهای مستقیم (DMs)'),
                ...chatProvider.dialogs
                    .where((d) => !d.isPinned && d.type == ChatType.direct)
                    .map((d) => _DialogTile(
                          dialog: d,
                          isSelected: d.id == chatProvider.selectedDialogId,
                          onTap: () {
                            chatProvider.selectDialog(d.id);
                            final scaffold = Scaffold.maybeOf(context);
                            if (scaffold != null && scaffold.isDrawerOpen) {
                              Navigator.of(context).pop();
                            }
                          },
                        )),
                const SizedBox(height: 12),
                _buildCategoryHeader('کانال‌ها و گروه‌ها'),
                ...chatProvider.dialogs
                    .where((d) => !d.isPinned && d.type != ChatType.direct)
                    .map((d) => _DialogTile(
                          dialog: d,
                          isSelected: d.id == chatProvider.selectedDialogId,
                          onTap: () {
                            chatProvider.selectDialog(d.id);
                            final scaffold = Scaffold.maybeOf(context);
                            if (scaffold != null && scaffold.isDrawerOpen) {
                              Navigator.of(context).pop();
                            }
                          },
                        )),
              ],
            ),
          ),

          // Bottom Discord User Panel
          _buildUserBottomBar(context, settingsProvider),
        ],
      ),
    );
  }

  Widget _buildCategoryHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 4, left: 6, right: 6),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          color: AppColors.textMuted,
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  Widget _buildUserBottomBar(BuildContext context, SettingsProvider settings) {
    return Container(
      height: 54,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      color: AppColors.bgRail,
      child: Row(
        children: [
          // User Avatar with status dot
          InkWell(
            onTap: () {
              // Toggle user status
              final nextStatus = settings.myProfile.status == UserStatus.online
                  ? UserStatus.idle
                  : (settings.myProfile.status == UserStatus.idle
                      ? UserStatus.dnd
                      : UserStatus.online);
              settings.setUserStatus(nextStatus);
            },
            borderRadius: BorderRadius.circular(16),
            child: DiscordAvatar(
              name: settings.myProfile.name,
              size: 32,
              status: settings.myProfile.status,
              showStatus: true,
            ),
          ),
          const SizedBox(width: 8),
          // User name and tag
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  settings.myProfile.name,
                  style: const TextStyle(
                    color: AppColors.textHeader,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  settings.isStealthMode ? 'حالت مخفی فعال 🕵️' : '#9988',
                  style: TextStyle(
                    color: settings.isStealthMode ? AppColors.baleGreen : AppColors.textMuted,
                    fontSize: 10.5,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          // Stealth mode quick toggle button
          IconButton(
            tooltip: settings.isStealthMode ? 'حالت مخفی (انسان‌نما) فعال است' : 'حالت ربات سریع',
            icon: Icon(
              settings.isStealthMode ? Icons.visibility_off_rounded : Icons.flash_on_rounded,
              color: settings.isStealthMode ? AppColors.baleGreen : AppColors.gold,
              size: 18,
            ),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
            onPressed: () {
              settings.toggleStealthMode(!settings.isStealthMode);
            },
          ),
          // Bale MKProto connection button
          Consumer<BaleClientProvider>(
            builder: (context, cp, _) => IconButton(
              tooltip: cp.isConnected ? 'متصل به سرور بله (MKProto)' : 'ورود / اتصال به بله',
              icon: Icon(
                Icons.bolt_rounded,
                color: cp.isConnected ? AppColors.online : AppColors.textMuted,
                size: 20,
              ),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (_) => const BaleLoginDialog(),
                );
              },
            ),
          ),
          // Settings button
          IconButton(
            tooltip: 'تنظیمات',
            icon: const Icon(Icons.settings_rounded, color: AppColors.textMuted, size: 18),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
            onPressed: () {
              settings.selectModule(NavigationModule.settings);
            },
          ),
        ],
      ),
    );
  }
}

class _DialogTile extends StatefulWidget {
  final DialogModel dialog;
  final bool isSelected;
  final VoidCallback onTap;

  const _DialogTile({
    required this.dialog,
    required this.isSelected,
    required this.onTap,
  });

  @override
  State<_DialogTile> createState() => _DialogTileState();
}

class _DialogTileState extends State<_DialogTile> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final d = widget.dialog;
    final isSelected = widget.isSelected;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.bgActive
                : (_isHovered ? AppColors.bgHover : Colors.transparent),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Row(
            children: [
              // Chat type icon or avatar
              if (d.type == ChatType.direct)
                DiscordAvatar(
                  name: d.title,
                  size: 32,
                  status: d.isOnline ? UserStatus.online : UserStatus.offline,
                  showStatus: true,
                )
              else if (d.type == ChatType.group)
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.bgInput,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Center(
                    child: Text(
                      '#',
                      style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                )
              else
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.blurple.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Center(
                    child: Icon(Icons.campaign_rounded, color: AppColors.blurple, size: 18),
                  ),
                ),
              const SizedBox(width: 10),
              // Title and preview
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            d.title,
                            style: TextStyle(
                              color: isSelected ? Colors.white : AppColors.textNormal,
                              fontSize: 13.5,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          DateFormat('HH:mm').format(d.lastMessageTime),
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 10.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      d.lastMessage,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (d.unreadCount > 0)
                Container(
                  margin: const EdgeInsets.only(right: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.dnd,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    d.unreadCount.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
