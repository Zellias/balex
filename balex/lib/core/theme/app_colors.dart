import 'package:flutter/material.dart';

class AppColors {
  // Discord Core Backgrounds
  static const Color bgRail = Color(0xFF1E1F22);        // Server / Module vertical rail
  static const Color bgSidebar = Color(0xFF2B2D31);     // Channels & DMs list
  static const Color bgCanvas = Color(0xFF313338);      // Main message canvas
  static const Color bgInput = Color(0xFF383A40);       // Floating chat input bar
  static const Color bgCard = Color(0xFF232428);        // Embedded cards, receipts, modals
  static const Color bgHover = Color(0xFF35373C);       // Item hover / selected state
  static const Color bgActive = Color(0xFF404249);      // Active channel / tile

  // Brand Accents
  static const Color blurple = Color(0xFF5865F2);       // Discord primary blurple
  static const Color blurpleHover = Color(0xFF4752C4);
  static const Color baleGreen = Color(0xFF10B981);     // Bale emerald accent
  static const Color baleGreenDark = Color(0xFF059669);
  static const Color gold = Color(0xFFF59E0B);          // Bale Gold Packet & Wallet
  static const Color goldLight = Color(0xFFFDE68A);

  // Status Indicators
  static const Color online = Color(0xFF23A55A);        // Online green dot
  static const Color idle = Color(0xFFF0B232);          // Idle yellow moon
  static const Color dnd = Color(0xFFF23F43);           // Do Not Disturb red badge
  static const Color offline = Color(0xFF80848E);       // Offline grey circle

  // Text Hierarchy
  static const Color textHeader = Color(0xFFF2F3F5);    // White/Off-white titles
  static const Color textNormal = Color(0xFFDBDEE1);    // Primary message body
  static const Color textMuted = Color(0xFF949BA4);     // Timestamps, hints, metadata
  static const Color textLink = Color(0xFF00A8FC);      // Discord link blue

  // Functional Accents
  static const Color danger = Color(0xFFDA373C);        // Red delete / error
  static const Color success = Color(0xFF23A55A);       // Transfer success
  static const Color divider = Color(0xFF3F4147);       // Subtle borders
}
