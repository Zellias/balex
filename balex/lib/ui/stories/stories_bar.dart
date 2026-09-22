import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/discord_avatar.dart';

class StoriesBar extends StatelessWidget {
  const StoriesBar({super.key});

  @override
  Widget build(BuildContext context) {
    final stories = [
      {'name': 'شما', 'hasStory': false, 'isMe': true},
      {'name': 'رضا اسماعیلی', 'hasStory': true, 'isMe': false},
      {'name': 'سارا باقری', 'hasStory': true, 'isMe': false},
      {'name': 'کانال بله', 'hasStory': true, 'isMe': false},
      {'name': 'امیرحسین', 'hasStory': true, 'isMe': false},
      {'name': 'تیم مارکتینگ', 'hasStory': true, 'isMe': false},
    ];

    return Container(
      height: 94,
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: const BoxDecoration(
        color: AppColors.bgSidebar,
        border: Border(bottom: BorderSide(color: AppColors.bgRail, width: 1)),
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        itemCount: stories.length,
        itemBuilder: (ctx, i) {
          final item = stories[i];
          final isMe = item['isMe'] as bool;
          final hasStory = item['hasStory'] as bool;
          final name = item['name'] as String;

          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 6),
            child: Column(
              children: [
                Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(2.5),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: hasStory
                            ? const LinearGradient(
                                colors: [AppColors.gold, AppColors.baleGreen],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : null,
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.bgSidebar,
                        ),
                        child: DiscordAvatar(
                          name: name,
                          size: 46,
                        ),
                      ),
                    ),
                    if (isMe)
                      Positioned(
                        bottom: 2,
                        right: 2,
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: const BoxDecoration(
                            color: AppColors.blurple,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.add, color: Colors.white, size: 14),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                SizedBox(
                  width: 58,
                  child: Text(
                    name,
                    style: const TextStyle(
                      color: AppColors.textNormal,
                      fontSize: 10.5,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
