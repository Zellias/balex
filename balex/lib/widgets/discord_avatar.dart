import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../models/user_model.dart';

class DiscordAvatar extends StatelessWidget {
  final String name;
  final String? imageUrl;
  final double size;
  final UserStatus? status;
  final bool showStatus;

  const DiscordAvatar({
    super.key,
    required this.name,
    this.imageUrl,
    this.size = 40,
    this.status,
    this.showStatus = false,
  });

  Color _getStatusColor(UserStatus s) {
    switch (s) {
      case UserStatus.online:
        return AppColors.online;
      case UserStatus.idle:
        return AppColors.idle;
      case UserStatus.dnd:
        return AppColors.dnd;
      case UserStatus.offline:
        return AppColors.offline;
    }
  }

  Color _generateColor(String str) {
    final colors = [
      AppColors.blurple,
      AppColors.baleGreen,
      const Color(0xFFE91E63),
      const Color(0xFF9C27B0),
      const Color(0xFF00BCD4),
      const Color(0xFFFF9800),
      const Color(0xFF3F51B5),
    ];
    return colors[str.hashCode.abs() % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    final initial = name.trim().isNotEmpty ? name.trim().characters.first : '?';
    final badgeSize = size * 0.32;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _generateColor(name),
          ),
          alignment: Alignment.center,
          child: Text(
            initial,
            style: TextStyle(
              color: Colors.white,
              fontSize: size * 0.42,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        if (showStatus && status != null)
          Positioned(
            bottom: -1,
            right: -1,
            child: Container(
              width: badgeSize,
              height: badgeSize,
              decoration: BoxDecoration(
                color: _getStatusColor(status!),
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.bgSidebar,
                  width: badgeSize * 0.22,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
