import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/chat_provider.dart';
import '../banking/transfer_modal.dart';

class MessageInput extends StatefulWidget {
  final String placeholder;

  const MessageInput({super.key, required this.placeholder});

  @override
  State<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends State<MessageInput> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();

  void _send() {
    final text = _controller.text.trim();
    if (text.isNotEmpty) {
      context.read<ChatProvider>().sendMessage(text);
      _controller.clear();
      _focusNode.requestFocus();
    }
  }

  void _showAttachmentMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgSidebar,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.baleGreen.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.credit_card_rounded, color: AppColors.baleGreen),
                  ),
                  title: const Text('انتقال وجه و ارسال رسید (کارت به کارت)',
                      style: TextStyle(color: AppColors.textHeader, fontWeight: FontWeight.bold)),
                  subtitle: const Text('انتقال مستقیم شتابی به این گفتگو',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                  onTap: () {
                    Navigator.pop(ctx);
                    showDialog(
                      context: context,
                      builder: (_) => const TransferModal(),
                    );
                  },
                ),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.card_giftcard_rounded, color: AppColors.gold),
                  ),
                  title: const Text('ارسال پاکت طلای بله 💛',
                      style: TextStyle(color: AppColors.textHeader, fontWeight: FontWeight.bold)),
                  subtitle: const Text('هدیه طلا به دوستان و اعضای گروه',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                  onTap: () {
                    Navigator.pop(ctx);
                    context.read<ChatProvider>().sendGoldPacket(0.150, 'هدیه طلای بله برای شما ✨');
                  },
                ),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.blurple.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.attach_file_rounded, color: AppColors.blurple),
                  ),
                  title: const Text('ارسال سند یا فایل',
                      style: TextStyle(color: AppColors.textHeader, fontWeight: FontWeight.bold)),
                  onTap: () => Navigator.pop(ctx),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: AppColors.bgCanvas,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
        decoration: BoxDecoration(
          color: AppColors.bgInput,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            // Attachment Plus button
            InkWell(
              onTap: _showAttachmentMenu,
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: AppColors.bgHover,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.add_rounded, color: AppColors.textMuted, size: 20),
              ),
            ),
            const SizedBox(width: 10),

            // Text input field
            Expanded(
              child: TextField(
                controller: _controller,
                focusNode: _focusNode,
                style: const TextStyle(color: AppColors.textNormal, fontSize: 14.5),
                decoration: InputDecoration(
                  hintText: widget.placeholder,
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                ),
                onSubmitted: (_) => _send(),
              ),
            ),

            // Gold packet quick button
            IconButton(
              tooltip: 'ارسال پاکت طلای بله',
              icon: const Icon(Icons.card_giftcard_rounded, color: AppColors.gold, size: 20),
              onPressed: () {
                context.read<ChatProvider>().sendGoldPacket(0.100, 'هدیه طلای بله 💛');
              },
            ),

            // Send button
            IconButton(
              tooltip: 'ارسال پیام (Enter)',
              icon: const Icon(Icons.send_rounded, color: AppColors.blurple, size: 20),
              onPressed: _send,
            ),
          ],
        ),
      ),
    );
  }
}
