import 'package:flutter/material.dart';
import '../models/user_model.dart';

enum NavigationModule {
  dms,          // Direct Messages (Discord Home)
  channels,     // Groups & Channels
  financialHub, // Bale Banking, Card-to-Card & Wallet
  stories,      // Stories & Moments
  botStore,     // Garson Bots & Mini Apps
  calls,        // Meet Voice & Video
  settings      // App & Stealth Settings
}

class SettingsProvider extends ChangeNotifier {
  NavigationModule _currentModule = NavigationModule.dms;
  bool _isStealthMode = true;
  bool _autoMarkSeen = true;
  int _typingDelayMs = 2000;
  bool _rightSidebarOpen = true;

  UserModel _myProfile = const UserModel(
    id: 998877,
    name: 'توسعه‌دهنده BaleX',
    username: 'balex_dev',
    phone: '+98 912 345 6789',
    status: UserStatus.online,
    customStatus: 'Building BaleX Discord Experience 🚀',
    roleBadge: 'BaleX Founder',
    isMe: true,
  );

  NavigationModule get currentModule => _currentModule;
  bool get isStealthMode => _isStealthMode;
  bool get autoMarkSeen => _autoMarkSeen;
  int get typingDelayMs => _typingDelayMs;
  bool get rightSidebarOpen => _rightSidebarOpen;
  UserModel get myProfile => _myProfile;

  void selectModule(NavigationModule module) {
    if (_currentModule != module) {
      _currentModule = module;
      notifyListeners();
    }
  }

  void toggleRightSidebar() {
    _rightSidebarOpen = !_rightSidebarOpen;
    notifyListeners();
  }

  void toggleStealthMode(bool value) {
    _isStealthMode = value;
    notifyListeners();
  }

  void setAutoMarkSeen(bool value) {
    _autoMarkSeen = value;
    notifyListeners();
  }

  void setTypingDelay(int ms) {
    _typingDelayMs = ms;
    notifyListeners();
  }

  void setUserStatus(UserStatus status) {
    _myProfile = _myProfile.copyWith(status: status);
    notifyListeners();
  }

  void updateCustomStatus(String text) {
    _myProfile = _myProfile.copyWith(customStatus: text);
    notifyListeners();
  }

  void updateProfile({
    required int id,
    required String name,
    required String phone,
    String? username,
  }) {
    _myProfile = UserModel(
      id: id,
      name: name,
      username: username ?? 'user_$id',
      phone: phone,
      status: _myProfile.status,
      customStatus: 'متصل به حساب اصلی بله ✨',
      roleBadge: 'Bale User',
      isMe: true,
    );
    notifyListeners();
  }
}
