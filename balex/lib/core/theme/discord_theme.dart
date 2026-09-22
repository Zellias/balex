import 'package:flutter/material.dart';
import 'app_colors.dart';

class DiscordTheme {
  static ThemeData get darkTheme {
    final baseTextTheme = ThemeData.dark().textTheme;
    // Runtime font fetching causes a long first-frame stall on Android
    // networks where fonts.gstatic.com is unavailable. Use local system
    // fallbacks; the visual hierarchy remains the same and startup is instant.
    final vazirTheme = baseTextTheme.apply(
      fontFamily: 'sans-serif',
      fontFamilyFallback: const ['Vazirmatn', 'Vazir', 'Tahoma'],
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: 'sans-serif',
      fontFamilyFallback: const ['Vazirmatn', 'Vazir', 'Tahoma', 'sans-serif'],
      scaffoldBackgroundColor: AppColors.bgCanvas,
      primaryColor: AppColors.blurple,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.blurple,
        secondary: AppColors.baleGreen,
        surface: AppColors.bgCard,
        error: AppColors.danger,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: AppColors.textNormal,
      ),
      textTheme: vazirTheme.copyWith(
        displayLarge: vazirTheme.displayLarge?.copyWith(
          color: AppColors.textHeader,
          fontWeight: FontWeight.bold,
        ),
        titleLarge: vazirTheme.titleLarge?.copyWith(
          color: AppColors.textHeader,
          fontWeight: FontWeight.w700,
          fontSize: 18,
        ),
        titleMedium: vazirTheme.titleMedium?.copyWith(
          color: AppColors.textHeader,
          fontWeight: FontWeight.w600,
          fontSize: 15,
        ),
        bodyLarge: vazirTheme.bodyLarge?.copyWith(
          color: AppColors.textNormal,
          fontSize: 14.5,
          height: 1.45,
        ),
        bodyMedium: vazirTheme.bodyMedium?.copyWith(
          color: AppColors.textNormal,
          fontSize: 13.5,
          height: 1.4,
        ),
        bodySmall: vazirTheme.bodySmall?.copyWith(
          color: AppColors.textMuted,
          fontSize: 12,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 1,
        space: 1,
      ),
      scrollbarTheme: ScrollbarThemeData(
        thumbColor: WidgetStateProperty.all(AppColors.bgRail),
        trackColor: WidgetStateProperty.all(Colors.transparent),
        radius: const Radius.circular(4),
        thickness: WidgetStateProperty.all(6),
      ),
      cardTheme: CardThemeData(
        color: AppColors.bgCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: AppColors.divider, width: 0.8),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.bgSidebar,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 8,
      ),
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: AppColors.bgRail,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: AppColors.divider, width: 0.5),
        ),
        textStyle: const TextStyle(
          color: AppColors.textHeader,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
