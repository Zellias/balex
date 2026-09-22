import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/settings_provider.dart';
import '../../widgets/discord_avatar.dart';

class SettingsModal extends StatelessWidget {
  const SettingsModal({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsProvider>();

    return Container(
      color: AppColors.bgCanvas,
      child: Column(
        children: [
          // Top Header
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
                const Icon(Icons.settings_rounded, color: AppColors.textHeader, size: 20),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'تنظیمات حساب کاربری و حالت مخفی (Stealth)',
                    style: TextStyle(
                      color: AppColors.textHeader,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Spacer(),
                TextButton(
                  onPressed: () => settings.selectModule(NavigationModule.dms),
                  child: const Text('بازگشت به گفتگوها (ESC)',
                      style: TextStyle(color: AppColors.blurple)),
                ),
              ],
            ),
          ),

          // Content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                // Profile Banner
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.bgSidebar,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Row(
                    children: [
                      DiscordAvatar(
                        name: settings.myProfile.name,
                        size: 64,
                        status: settings.myProfile.status,
                        showStatus: true,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  settings.myProfile.name,
                                  style: const TextStyle(
                                    color: AppColors.textHeader,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.baleGreen,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'BaleX Pro',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${settings.myProfile.phone} • شناسه: #${settings.myProfile.id}',
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              settings.myProfile.customStatus ?? '',
                              style: const TextStyle(color: AppColors.textNormal, fontSize: 12.5),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // STEALTH / HUMANIZE MODE SECTION
                _buildSectionHeader('حالت مخفی و ضدتشخیص (Stealth / Humanize Mode)'),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bgSidebar,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: settings.isStealthMode
                          ? AppColors.baleGreen.withValues(alpha: 0.5)
                          : AppColors.divider,
                      width: 1.2,
                    ),
                  ),
                  child: Column(
                    children: [
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeThumbColor: AppColors.baleGreen,
                        title: const Text(
                          'فعال‌سازی حالت شبیه‌سازی انسان (Humanize)',
                          style: TextStyle(
                            color: AppColors.textHeader,
                            fontWeight: FontWeight.bold,
                            fontSize: 14.5,
                          ),
                        ),
                        subtitle: const Text(
                          'با فعال بودن این گزینه، ربات دقیقاً مثل یک انسان پیام‌ها را بعد از چند ثانیه سین می‌زند و قبل از ارسال وضعیت «درحال نوشتن...» نمایش می‌دهد تا هیچکس متوجه نشود یوزربات است.',
                          style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                        ),
                        value: settings.isStealthMode,
                        onChanged: (v) => settings.toggleStealthMode(v),
                      ),
                      const Divider(color: AppColors.divider),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeThumbColor: AppColors.baleGreen,
                        title: const Text(
                          'تیک دوم خودکار و سین کردن پیام‌ها (Auto Seen)',
                          style: TextStyle(color: AppColors.textNormal, fontSize: 13.5),
                        ),
                        subtitle: const Text(
                          'قبل از ارسال پاسخ، پیام مخاطب سین زده می‌شود.',
                          style: TextStyle(color: AppColors.textMuted, fontSize: 11.5),
                        ),
                        value: settings.autoMarkSeen,
                        onChanged: settings.isStealthMode ? (v) => settings.setAutoMarkSeen(v) : null,
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'مدت زمان شبیه‌سازی تایپ (Typing Duration):',
                            style: TextStyle(color: AppColors.textNormal, fontSize: 13),
                          ),
                          Text(
                            '${(settings.typingDelayMs / 1000).toStringAsFixed(1)} ثانیه',
                            style: const TextStyle(
                              color: AppColors.baleGreen,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      Slider(
                        value: settings.typingDelayMs.toDouble(),
                        min: 500,
                        max: 6000,
                        divisions: 11,
                        activeColor: AppColors.baleGreen,
                        inactiveColor: AppColors.bgRail,
                        onChanged: settings.isStealthMode
                            ? (v) => settings.setTypingDelay(v.round())
                            : null,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // PROTOCOL & SERVER INFO
                _buildSectionHeader('اطلاعات پروتکل و ارتباط با سرورهای بله'),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bgSidebar,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Column(
                    children: [
                      _infoRow('سرور متصل:', 'wss://next-ws.bale.ai/ws/'),
                      const Divider(color: AppColors.divider, height: 16),
                      _infoRow('پروتکل فریمینگ:', 'mkproto v1 (Protobuf)'),
                      const Divider(color: AppColors.divider, height: 16),
                      _infoRow('نسخه API بله:', '171248 (Bale Web 5.6.0)'),
                      const Divider(color: AppColors.divider, height: 16),
                      _infoRow('تعداد سرویس‌های فعال:', '۵۳ سرویس کامل'),
                      const Divider(color: AppColors.divider, height: 16),
                      _infoRow('متدهای RPC استخراج شده:', '۶۳۶ متد قابل اجرا'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, right: 4),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.textHeader,
          fontSize: 14,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _infoRow(String k, String v) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(k, style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
        Text(v,
            style: const TextStyle(
                color: AppColors.textNormal, fontSize: 13, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
