import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../models/chat_model.dart';
import '../../providers/chat_provider.dart';
import '../../providers/settings_provider.dart';
import 'message_tile.dart';
import 'message_input.dart';
import '../banking/transfer_modal.dart';

class ChatCanvas extends StatelessWidget {
  const ChatCanvas({super.key});

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final settingsProvider = context.watch<SettingsProvider>();
    final activeDialog = chatProvider.selectedDialog;
    final messages = chatProvider.currentMessages;

    return Container(
      color: AppColors.bgCanvas,
      child: Column(
        children: [
          // Top Discord Channel Header Bar
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: const BoxDecoration(
              color: AppColors.bgCanvas,
              border: Border(bottom: BorderSide(color: AppColors.bgRail, width: 1.5)),
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isMobile = constraints.maxWidth < 600;
                return Row(
                  children: [
                    // Mobile Open Right Drawer (Channels & Modules) button
                    Builder(
                      builder: (ctx) {
                        final scaffold = Scaffold.maybeOf(ctx);
                        if (scaffold != null && scaffold.hasDrawer) {
                          return Padding(
                            padding: const EdgeInsets.only(left: 8),
                            child: IconButton(
                              tooltip: 'منوی گفتگوها و کانال‌ها (اسلاید راست)',
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
                    Icon(
                      activeDialog.type == ChatType.direct
                          ? Icons.alternate_email_rounded
                          : (activeDialog.type == ChatType.group
                              ? Icons.tag_rounded
                              : Icons.campaign_rounded),
                      color: AppColors.textMuted,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Flexible(
                            child: Text(
                              activeDialog.title,
                              style: const TextStyle(
                                color: AppColors.textHeader,
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (activeDialog.isOnline) ...[
                            const SizedBox(width: 6),
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.online,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (!isMobile) ...[
                      const SizedBox(width: 14),
                      const VerticalDivider(width: 1, color: AppColors.divider),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          activeDialog.type == ChatType.direct
                              ? 'گفتگوی مستقیم با رمزنگاری سرتاسری'
                              : 'گروه گفتگوی پروژه BaleX',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ] else
                      const Spacer(),

                    // Quick Card-to-Card header button
                    if (!isMobile)
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.baleGreen.withValues(alpha: 0.18),
                          foregroundColor: AppColors.baleGreen,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                            side: const BorderSide(color: AppColors.baleGreen, width: 0.8),
                          ),
                        ),
                        icon: const Icon(Icons.credit_card_rounded, size: 16),
                        label: const Text('کارت به کارت',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (_) => const TransferModal(),
                          );
                        },
                      )
                    else
                      IconButton(
                        tooltip: 'کارت به کارت شتابی',
                        icon: const Icon(Icons.credit_card_rounded, color: AppColors.baleGreen, size: 20),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (_) => const TransferModal(),
                          );
                        },
                      ),
                    const SizedBox(width: 8),

                    // Toggle Right / End Sidebar (Members/Info/Banking)
                    Builder(
                      builder: (ctx) {
                        final scaffold = Scaffold.maybeOf(ctx);
                        return IconButton(
                          tooltip: 'نمایش اعضا و امور مالی (اسلاید چپ)',
                          icon: Icon(
                            Icons.people_alt_rounded,
                            color: (scaffold?.isEndDrawerOpen ?? false) || settingsProvider.rightSidebarOpen
                                ? AppColors.blurple
                                : AppColors.textMuted,
                            size: 20,
                          ),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                          onPressed: () {
                            if (scaffold != null && scaffold.hasEndDrawer) {
                              scaffold.openEndDrawer();
                            } else {
                              settingsProvider.toggleRightSidebar();
                            }
                          },
                        );
                      },
                    ),
                  ],
                );
              },
            ),
          ),

          // Message timeline
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 12),
              itemCount: messages.length,
              itemBuilder: (ctx, i) {
                final msg = messages[i];
                final isFirst =
                    i == 0 || messages[i - 1].senderId != msg.senderId;
                return MessageTile(
                  message: msg,
                  isFirstInGroup: isFirst,
                );
              },
            ),
          ),

          // Typing status banner
          if (chatProvider.isTyping)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              alignment: Alignment.centerRight,
              child: Row(
                children: [
                  const SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(
                      strokeWidth: 1.5,
                      color: AppColors.baleGreen,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${activeDialog.title} در حال نوشتن است...',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11.5),
                  ),
                ],
              ),
            ),

          // Floating Message Input Bar
          MessageInput(
            placeholder: 'ارسال پیام در #${activeDialog.title}',
          ),
        ],
      ),
    );
  }
}
