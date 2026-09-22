import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../models/chat_model.dart';
import '../../providers/chat_provider.dart';
import '../../widgets/discord_avatar.dart';
import 'embedded_cards.dart';

class MessageTile extends StatefulWidget {
  final MessageModel message;
  final bool isFirstInGroup;

  const MessageTile({
    super.key,
    required this.message,
    this.isFirstInGroup = true,
  });

  @override
  State<MessageTile> createState() => _MessageTileState();
}

class _MessageTileState extends State<MessageTile> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final m = widget.message;
    final chatProvider = context.read<ChatProvider>();

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: 16,
          vertical: widget.isFirstInGroup ? 6 : 2,
        ),
        color: _isHovered ? AppColors.bgHover.withValues(alpha: 0.35) : Colors.transparent,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar (only if first in group)
                if (widget.isFirstInGroup)
                  DiscordAvatar(
                    name: m.senderName,
                    size: 40,
                  )
                else
                  const SizedBox(width: 40),

                const SizedBox(width: 14),

                // Message Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (widget.isFirstInGroup)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 3),
                          child: Row(
                            children: [
                              Flexible(
                                child: Text(
                                  m.senderName,
                                  style: const TextStyle(
                                    color: AppColors.textHeader,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (m.roleBadge != null) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: m.isMe ? AppColors.baleGreen : AppColors.blurple,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    m.roleBadge!,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                              const SizedBox(width: 8),
                              Text(
                                DateFormat('HH:mm').format(m.timestamp),
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),

                      // Text message content
                      if (m.type == MessageType.text || m.text.isNotEmpty)
                        SelectableText(
                          m.text,
                          style: const TextStyle(
                            color: AppColors.textNormal,
                            fontSize: 14.5,
                            height: 1.45,
                          ),
                        ),

                      // Embedded Card-to-Card Receipt
                      if (m.type == MessageType.cardReceipt && m.cardReceipt != null)
                        CardReceiptWidget(receipt: m.cardReceipt!),

                      // Embedded Gold Packet
                      if (m.type == MessageType.goldPacket && m.goldAmountGrams != null)
                        GoldPacketWidget(grams: m.goldAmountGrams!),

                      // Reactions list
                      if (m.reactions.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            children: m.reactions.map((r) {
                              return InkWell(
                                onTap: () => chatProvider.toggleReaction(m.id, r.emoji),
                                borderRadius: BorderRadius.circular(6),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: r.reactedByMe
                                        ? AppColors.blurple.withValues(alpha: 0.25)
                                        : AppColors.bgInput,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: r.reactedByMe
                                          ? AppColors.blurple
                                          : AppColors.divider,
                                      width: 1,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(r.emoji, style: const TextStyle(fontSize: 13)),
                                      const SizedBox(width: 5),
                                      Text(
                                        r.count.toString(),
                                        style: TextStyle(
                                          color: r.reactedByMe
                                              ? AppColors.blurple
                                              : AppColors.textMuted,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),

            // Discord Quick Reaction Action Bar on Hover
            if (_isHovered)
              Positioned(
                top: -12,
                left: 16,
                child: Container(
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.bgSidebar,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.divider, width: 0.8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      _actionButton('❤️', () => chatProvider.toggleReaction(m.id, '❤️')),
                      _actionButton('👍', () => chatProvider.toggleReaction(m.id, '👍')),
                      _actionButton('🔥', () => chatProvider.toggleReaction(m.id, '🔥')),
                      _actionButton('🎁', () => chatProvider.toggleReaction(m.id, '🎁')),
                      const VerticalDivider(width: 1, color: AppColors.divider),
                      IconButton(
                        tooltip: 'پاسخ دادن (Reply)',
                        icon: const Icon(Icons.reply_rounded, size: 16, color: AppColors.textMuted),
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        constraints: const BoxConstraints(minWidth: 28),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _actionButton(String emoji, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        child: Text(emoji, style: const TextStyle(fontSize: 14)),
      ),
    );
  }
}
