import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/settings_provider.dart';
import 'module_rail.dart';
import 'channel_sidebar.dart';
import 'right_sidebar.dart';
import '../chat/chat_canvas.dart';
import '../banking/financial_hub_view.dart';
import '../settings/settings_modal.dart';
import '../stories/stories_bar.dart';

class DiscordScaffold extends StatelessWidget {
  const DiscordScaffold({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsProvider>();

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 850;
        final isWide = constraints.maxWidth >= 1050;

        if (isMobile) {
          return Scaffold(
            backgroundColor: AppColors.bgCanvas,
            drawerEnableOpenDragGesture: true,
            endDrawerEnableOpenDragGesture: true,
            drawerEdgeDragWidth: max(constraints.maxWidth * 0.35, 100),
            // Right Drawer (Start in RTL): Server Rail + Channels Sidebar
            drawer: Drawer(
              backgroundColor: AppColors.bgRail,
              width: min(constraints.maxWidth * 0.88, 360),
              child: const SafeArea(
                child: Row(
                  children: [
                    ModuleRail(),
                    Expanded(child: ChannelSidebar()),
                  ],
                ),
              ),
            ),
            // Left Drawer (End in RTL): Members & Quick Banking Card
            endDrawer: Drawer(
              backgroundColor: AppColors.bgSidebar,
              width: min(constraints.maxWidth * 0.8, 300),
              child: const SafeArea(
                child: RightSidebar(),
              ),
            ),
            // Swipe gesture detector anywhere across the mobile canvas
            body: Builder(
              builder: (innerContext) => GestureDetector(
                key: const Key('mobile_canvas_gesture'),
                behavior: HitTestBehavior.translucent,
                onHorizontalDragStart: (_) {},
                onHorizontalDragUpdate: (_) {},
                onHorizontalDragEnd: (details) {
                  final velocity = details.primaryVelocity;
                  if (velocity == null) return;
                  final scaffold = Scaffold.of(innerContext);
                  if (velocity > 150 && !scaffold.isDrawerOpen && !scaffold.isEndDrawerOpen) {
                    scaffold.openDrawer();
                  } else if (velocity < -150 && !scaffold.isDrawerOpen && !scaffold.isEndDrawerOpen) {
                    scaffold.openEndDrawer();
                  }
                },
                child: _buildMainView(settings),
              ),
            ),
          );
        }

        // Desktop / Wide Layout (Persistent Sidebars)
        return Scaffold(
          backgroundColor: AppColors.bgRail,
          body: Row(
            children: [
              // 1. Left-most Discord Server / Module Rail
              const ModuleRail(),

              // 2. Secondary Sidebar: Channels / Dialogs List
              if (settings.currentModule == NavigationModule.dms ||
                  settings.currentModule == NavigationModule.channels)
                const ChannelSidebar(),

              // 3. Main Center Canvas
              Expanded(
                child: _buildMainView(settings),
              ),

              // 4. Right Collapsible Sidebar (Members & Quick Banking)
              if (isWide &&
                  settings.rightSidebarOpen &&
                  (settings.currentModule == NavigationModule.dms ||
                      settings.currentModule == NavigationModule.channels))
                const RightSidebar(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMainView(SettingsProvider settings) {
    switch (settings.currentModule) {
      case NavigationModule.financialHub:
        return const FinancialHubView();

      case NavigationModule.settings:
        return const SettingsModal();

      case NavigationModule.stories:
        return Column(
          children: const [
            StoriesBar(),
            Expanded(child: ChatCanvas()),
          ],
        );

      case NavigationModule.botStore:
        return Container(
          color: AppColors.bgCanvas,
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.storefront_rounded, color: AppColors.blurple, size: 64),
              SizedBox(height: 16),
              Text(
                'ویترین و فروشگاه ربات‌های بله (Garson)',
                style: TextStyle(
                  color: AppColors.textHeader,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'تمامی مینی‌اپ‌ها و بات‌های رسمی و غیررسمی بله در این بخش در دسترس خواهند بود.',
                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              ),
            ],
          ),
        );

      case NavigationModule.calls:
        return Container(
          color: AppColors.bgCanvas,
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.baleGreen.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.phone_in_talk_rounded, color: AppColors.baleGreen, size: 54),
              ),
              const SizedBox(height: 18),
              const Text(
                'جلسات و تماس‌های بله (Bale Meet)',
                style: TextStyle(
                  color: AppColors.textHeader,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'اتاق‌های گفتگوی صوتی شبیه دیسکورد با پروتکل اختصاصی WebRTC بله.',
                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              ),
            ],
          ),
        );

      case NavigationModule.dms:
      case NavigationModule.channels:
        return const ChatCanvas();
    }
  }
}
