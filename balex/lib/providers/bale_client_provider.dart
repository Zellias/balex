import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/network/bale_socket_client.dart';
import '../core/proto/bale_proto.dart';

class BaleUserSession {
  final int id;
  final String name;
  final String phone;
  final String username;
  final String token;

  const BaleUserSession({
    required this.id,
    required this.name,
    required this.phone,
    required this.username,
    required this.token,
  });
}

class BaleClientProvider extends ChangeNotifier {
  final BaleSocketClient _client = BaleSocketClient.instance;

  BaleConnectionStatus _status = BaleConnectionStatus.disconnected;
  BaleConnectionStatus get status => _status;
  bool get isConnected => _status == BaleConnectionStatus.connected;

  bool _isRealProtoMode = true;
  bool get isRealProtoMode => _isRealProtoMode;

  bool _isAuthenticated = false;
  bool get isAuthenticated => _isAuthenticated;

  BaleUserSession? _user;
  BaleUserSession? get user => _user;

  String? _phoneNumber;
  String? get phoneNumber => _phoneNumber;

  String? _transactionHash;
  bool _is2faRequired = false;
  bool get is2faRequired => _is2faRequired;

  final int _timeoutSeconds = 60;
  int get timeoutSeconds => _timeoutSeconds;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  StreamSubscription? _statusSubscription;
  StreamSubscription? _messageSubscription;
  StreamSubscription? _dialogsSubscription;

  BaleClientProvider() {
    _statusSubscription = _client.statusStream.listen((newStatus) {
      _status = newStatus;
      notifyListeners();
    });
    _messageSubscription = _client.messageStream.listen((message) {
      // Forward live server messages to the shared chat store.
      // ChatProvider is attached by the app; this callback is wired in main.dart.
      _lastIncomingMessage = message;
      notifyListeners();
    });
    _dialogsSubscription = _client.dialogsStream.listen((page) {
      _lastDialogsPage = page;
      notifyListeners();
    });

    // Auto-restore saved Bale session
    _restoreSavedSession();
  }

  @override
  void dispose() {
    _statusSubscription?.cancel();
    _messageSubscription?.cancel();
    _dialogsSubscription?.cancel();
    super.dispose();
  }

  BaleIncomingMessage? _lastIncomingMessage;
  BaleDialogsPage? _lastDialogsPage;
  BaleIncomingMessage? takeLastIncomingMessage() {
    final message = _lastIncomingMessage;
    _lastIncomingMessage = null;
    return message;
  }

  BaleDialogsPage? takeLastDialogsPage() {
    final page = _lastDialogsPage;
    _lastDialogsPage = null;
    return page;
  }

  Future<void> _restoreSavedSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('bale_jwt_token');
      final userId = prefs.getInt('bale_user_id');
      final phone = prefs.getString('bale_phone');
      final name = prefs.getString('bale_name');
      final username = prefs.getString('bale_username');

      if (token != null && userId != null && !token.startsWith('bale_token_')) {
        _user = BaleUserSession(
          id: userId,
          name: name ?? 'کاربر بله',
          phone: phone ?? '',
          username: username ?? '',
          token: token,
        );
        _isAuthenticated = true;
        _phoneNumber = phone;
        _client.setSession(token: token, userId: userId.toString());
        notifyListeners();

        // Connect automatically in background
        connectToBaleServer();
      }
    } catch (_) {}
  }

  void toggleProtoMode(bool enabled) {
    _isRealProtoMode = enabled;
    if (enabled && _status == BaleConnectionStatus.disconnected) {
      connectToBaleServer();
    } else if (!enabled) {
      _client.disconnect();
    }
    notifyListeners();
  }

  Future<void> connectToBaleServer() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _client.connect();
      _isRealProtoMode = true;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'اتصال به سرورهای بله ناموفق بود: ${e.toString()}';
      try {
        await _client.loadDialogsHttp();
        _errorMessage = null;
      } catch (_) {}
      _isLoading = false;
      notifyListeners();
    }
  }

  bool _isSandboxMode = false;
  bool get isSandboxMode => _isSandboxMode;

  void enterSandboxMode() {
    _isSandboxMode = true;
    _isAuthenticated = true;
    _user = const BaleUserSession(
      id: 998877,
      name: 'کاربر مهمان BaleX',
      phone: '09120000000',
      username: 'balex_guest',
      token: 'sandbox_guest_token',
    );
    notifyListeners();
  }

  /// Request SMS OTP code from official Bale server via gRPC-Web
  Future<bool> sendVerificationCode(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\s+'), '');
    if (cleanPhone.length < 10) {
      _errorMessage = 'شماره موبایل وارد شده نامعتبر است.';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    _phoneNumber = cleanPhone;
    _is2faRequired = false;
    notifyListeners();

    try {
      // Official Bale gRPC-Web Auth (does NOT require prior WebSocket connection)
      final txHash = await _client.startPhoneAuth(cleanPhone);
      _transactionHash = txHash;

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Verify received SMS code with Bale server
  Future<bool> verifyAndSignIn(String code) async {
    if (_transactionHash == null || _phoneNumber == null) {
      _errorMessage = 'ابتدا شماره تماس را وارد کرده و کد را دریافت کنید.';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final cleanCode = BaleProto.normalizeCode(code);
      final res = await _client.validateCode(
        code: cleanCode,
        transactionHash: _transactionHash!,
      );

      final token = res.jwt;
      if (token == null || token.isEmpty) {
        throw Exception('سرور بله توکن معتبر برنگرداند؛ ورود دوباره را امتحان کنید.');
      }
      _user = BaleUserSession(
        id: res.id,
        name: res.name.isNotEmpty ? res.name : 'کاربر بله',
        phone: res.phone.isNotEmpty ? res.phone : _phoneNumber!,
        username: res.username,
        token: token,
      );
      _isAuthenticated = true;
      _isSandboxMode = false;

      // Connect authenticated WebSocket in background
      _client.setSession(token: token, userId: res.id.toString());
      connectToBaleServer();

      // Persist session to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('bale_jwt_token', token);
      await prefs.setInt('bale_user_id', res.id);
      await prefs.setString('bale_phone', _phoneNumber!);
      await prefs.setString('bale_name', _user!.name);
      await prefs.setString('bale_username', res.username);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      final errStr = e.toString().replaceAll('Exception: ', '');
      if (errStr.toLowerCase().contains('password') || errStr.contains('رمز')) {
        _is2faRequired = true;
        _errorMessage = 'حساب کاربری شما دارای تأیید دومرحله‌ای (رمز عبور ۲FA) است.';
      } else {
        _errorMessage = errStr;
      }
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Verify 2FA password
  Future<bool> verify2faPassword(String password) async {
    if (_transactionHash == null) {
      _errorMessage = 'کد تأیید اولیه یافت نشد.';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _client.validatePassword(
        password: password,
        transactionHash: _transactionHash!,
      );

      final token = res.jwt;
      if (token == null || token.isEmpty) {
        throw Exception('سرور بله توکن معتبر برنگرداند؛ ورود دوباره را امتحان کنید.');
      }
      _user = BaleUserSession(
        id: res.id,
        name: res.name.isNotEmpty ? res.name : 'کاربر بله',
        phone: res.phone.isNotEmpty ? res.phone : (_phoneNumber ?? ''),
        username: res.username,
        token: token,
      );
      _isAuthenticated = true;
      _is2faRequired = false;

      // Persist session
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('bale_jwt_token', token);
      await prefs.setInt('bale_user_id', res.id);
      await prefs.setString('bale_phone', _user!.phone);
      await prefs.setString('bale_name', _user!.name);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'رمز عبور دومرحله‌ای نادرست است.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logout and clear saved session
  Future<void> logout() async {
    _client.disconnect();
    _isAuthenticated = false;
    _user = null;
    _transactionHash = null;
    _phoneNumber = null;
    _is2faRequired = false;

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('bale_jwt_token');
      await prefs.remove('bale_user_id');
      await prefs.remove('bale_phone');
      await prefs.remove('bale_name');
      await prefs.remove('bale_username');
    } catch (_) {}

    notifyListeners();
  }
}
