import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/settings_provider.dart';
import '../../widgets/discord_avatar.dart';

class ModuleRail extends StatelessWidget {
  const ModuleRail({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsProvider>();

    void onSelect(NavigationModule mod) {
      settings.selectModule(mod);
      final scaffold = Scaffold.maybeOf(context);
      if (scaffold != null && scaffold.isDrawerOpen) {
        Navigator.of(context).pop();
      }
    }

    return Container(
      width: 72,
      color: AppColors.bgRail,
      child: Column(
        children: [
          const SizedBox(height: 12),
          // BaleX Logo / Home
          _RailItem(
            tooltip: 'خانه (چت‌های خصوصی)',
            icon: Icons.chat_bubble_rounded,
            isActive: settings.currentModule == NavigationModule.dms,
            activeColor: AppColors.blurple,
            onTap: () => onSelect(NavigationModule.dms),
          ),
          const SizedBox(height: 6),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Divider(color: AppColors.divider, height: 1),
          ),
          const SizedBox(height: 6),

          // Channels / Communities
          _RailItem(
            tooltip: 'گروه‌ها و کانال‌ها',
            icon: Icons.tag_rounded,
            isActive: settings.currentModule == NavigationModule.channels,
            activeColor: AppColors.blurple,
            onTap: () => onSelect(NavigationModule.channels),
          ),
          const SizedBox(height: 8),

          // Financial Hub (Bale Bank & Wallet)
          _RailItem(
            tooltip: 'مرکز مالی و کارت به کارت بله',
            icon: Icons.credit_card_rounded,
            badgeText: 'بانک',
            isActive: settings.currentModule == NavigationModule.financialHub,
            activeColor: AppColors.baleGreen,
            onTap: () => onSelect(NavigationModule.financialHub),
          ),
          const SizedBox(height: 8),

          // Stories & Moments
          _RailItem(
            tooltip: 'استوری‌ها و لحظه‌ها',
            icon: Icons.motion_photos_on_rounded,
            isActive: settings.currentModule == NavigationModule.stories,
            activeColor: AppColors.gold,
            onTap: () => onSelect(NavigationModule.stories),
          ),
          const SizedBox(height: 8),

          // Garson Bot Store
          _RailItem(
            tooltip: 'ویترین بات‌ها و مینی‌اپ‌ها',
            icon: Icons.storefront_rounded,
            isActive: settings.currentModule == NavigationModule.botStore,
            activeColor: AppColors.blurple,
            onTap: () => onSelect(NavigationModule.botStore),
          ),
          const SizedBox(height: 8),

          // Calls & Meetings
          _RailItem(
            tooltip: 'تماس صوتی و تصویری (Meet)',
            icon: Icons.phone_in_talk_rounded,
            isActive: settings.currentModule == NavigationModule.calls,
            activeColor: AppColors.baleGreen,
            onTap: () => onSelect(NavigationModule.calls),
          ),

          const Spacer(),

          // Settings Button
          _RailItem(
            tooltip: 'تنظیمات و حالت انسانی (Stealth)',
            icon: Icons.settings_rounded,
            isActive: settings.currentModule == NavigationModule.settings,
            activeColor: AppColors.textNormal,
            onTap: () => onSelect(NavigationModule.settings),
          ),
          const SizedBox(height: 12),

          // User Avatar Pill at Bottom
          Tooltip(
            message: '${settings.myProfile.name}\n${settings.myProfile.customStatus ?? ""}',
            child: InkWell(
              onTap: () => onSelect(NavigationModule.settings),
              borderRadius: BorderRadius.circular(24),
              child: Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: DiscordAvatar(
                  name: settings.myProfile.name,
                  size: 44,
                  status: settings.myProfile.status,
                  showStatus: true,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RailItem extends StatefulWidget {
  final String tooltip;
  final IconData icon;
  final bool isActive;
  final Color activeColor;
  final String? badgeText;
  final VoidCallback onTap;

  const _RailItem({
    required this.tooltip,
    required this.icon,
    required this.isActive,
    required this.activeColor,
    this.badgeText,
    required this.onTap,
  });

  @override
  State<_RailItem> createState() => _RailItemState();
}

class _RailItemState extends State<_RailItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: widget.tooltip,
      preferBelow: false,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: GestureDetector(
          onTap: widget.onTap,
          child: SizedBox(
            width: 72,
            height: 48,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Discord Left white indicator pill
                Positioned(
                  left: 0,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    curve: Curves.easeOut,
                    width: 4,
                    height: widget.isActive ? 40 : (_isHovered ? 20 : 0),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: const BorderRadius.only(
                        topRight: Radius.circular(4),
                        bottomRight: Radius.circular(4),
                      ),
                    ),
                  ),
                ),
                // Icon Button shape
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: widget.isActive
                        ? widget.activeColor
                        : (_isHovered ? widget.activeColor : AppColors.bgInput),
                    borderRadius: BorderRadius.circular(
                      widget.isActive || _isHovered ? 16 : 24,
                    ),
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Icon(
                        widget.icon,
                        color: widget.isActive || _isHovered
                            ? Colors.white
                            : AppColors.textNormal,
                        size: 24,
                      ),
                      if (widget.badgeText != null)
                        Positioned(
                          top: 2,
                          right: 2,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                            decoration: BoxDecoration(
                              color: AppColors.gold,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              widget.badgeText!,
                              style: const TextStyle(
                                color: Colors.black87,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
