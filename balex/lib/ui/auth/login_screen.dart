import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/bale_client_provider.dart';
import '../../providers/settings_provider.dart';
import '../../core/proto/bale_proto.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _codeController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  int _step = 1; // 1: Phone, 2: Code, 3: 2FA Password
  bool _obscurePassword = true;

  Timer? _countdownTimer;
  int _secondsRemaining = 60;
  bool _canResend = false;

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _phoneController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _startResendTimer() {
    _countdownTimer?.cancel();
    setState(() {
      _secondsRemaining = 60;
      _canResend = false;
    });

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 1) {
        setState(() => _secondsRemaining--);
      } else {
        timer.cancel();
        setState(() => _canResend = true);
      }
    });
  }

  Future<void> _handleSendCode(BaleClientProvider clientProvider) async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) return;

    final success = await clientProvider.sendVerificationCode(phone);
    if (success && mounted) {
      setState(() => _step = 2);
      _startResendTimer();
    }
  }

  Future<void> _handleVerifyCode(
    BaleClientProvider clientProvider,
    SettingsProvider settingsProvider,
  ) async {
    final code = _codeController.text.trim();
    if (code.isEmpty) return;

    final success = await clientProvider.verifyAndSignIn(code);
    if (mounted) {
      if (success) {
        final user = clientProvider.user;
        if (user != null) {
          settingsProvider.updateProfile(
            id: user.id,
            name: user.name,
            phone: user.phone,
            username: user.username,
          );
        }
      } else if (clientProvider.is2faRequired) {
        setState(() => _step = 3);
      }
    }
  }

  Future<void> _handleVerifyPassword(
    BaleClientProvider clientProvider,
    SettingsProvider settingsProvider,
  ) async {
    final password = _passwordController.text.trim();
    if (password.isEmpty) return;

    final success = await clientProvider.verify2faPassword(password);
    if (success && mounted) {
      final user = clientProvider.user;
      if (user != null) {
        settingsProvider.updateProfile(
          id: user.id,
          name: user.name,
          phone: user.phone,
          username: user.username,
        );
      }
    }
  }

  void _handleGuestEntry(BaleClientProvider clientProvider) {
    clientProvider.enterSandboxMode();
  }

  @override
  Widget build(BuildContext context) {
    final clientProvider = context.watch<BaleClientProvider>();
    final settingsProvider = context.watch<SettingsProvider>();

    return Scaffold(
      backgroundColor: AppColors.bgRail,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: AppColors.bgSidebar,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.bgCard,
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.45),
                      blurRadius: 28,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Top Logo and App Name
                    _buildHeader(),
                    const SizedBox(height: 24),

                    // Error message banner if any
                    if (clientProvider.errorMessage != null) ...[
                      _buildErrorBanner(clientProvider.errorMessage!),
                      const SizedBox(height: 16),
                    ],

                    // Wizard Step Form
                    if (_step == 1)
                      _buildPhoneStep(clientProvider)
                    else if (_step == 2)
                      _buildCodeStep(clientProvider, settingsProvider)
                    else
                      _buildPasswordStep(clientProvider, settingsProvider),

                    const SizedBox(height: 24),
                    const Divider(color: AppColors.bgRail, height: 1),
                    const SizedBox(height: 16),

                    // Guest / Sandbox Demo Login
                    _buildGuestOption(clientProvider),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        // Discord Blurple + Bale Green Shield Icon
        Container(
          width: 68,
          height: 68,
          decoration: BoxDecoration(
            color: AppColors.bgRail,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.baleGreen.withValues(alpha: 0.4), width: 2),
            boxShadow: [
              BoxShadow(
                color: AppColors.baleGreen.withValues(alpha: 0.25),
                blurRadius: 18,
                spreadRadius: 2,
              ),
            ],
          ),
          child: const Center(
            child: Icon(Icons.bolt_rounded, color: AppColors.baleGreen, size: 36),
          ),
        ),
        const SizedBox(height: 14),
        const Text(
          'ورود به بله | BaleX',
          style: TextStyle(
            color: AppColors.textHeader,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 6),
        const Text(
          'اتصال مستقیم به سرورهای رسمی بله با رابط کاربری دیسکورد',
          style: TextStyle(
            color: AppColors.textMuted,
            fontSize: 12.5,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildErrorBanner(String message) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.dnd.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.dnd.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, color: AppColors.dnd, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: Colors.white, fontSize: 12.5, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------
  // Step 1: Phone Number Entry
  // -------------------------------------------------------------
  Widget _buildPhoneStep(BaleClientProvider clientProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'شماره موبایل خود را وارد کنید',
          style: TextStyle(
            color: AppColors.textHeader,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'کد تایید یک‌بار مصرف از طریق پیامک رسمی بله برای شما ارسال می‌شود.',
          style: TextStyle(color: AppColors.textMuted, fontSize: 12),
        ),
        const SizedBox(height: 16),

        // Phone Input Container
        Container(
          decoration: BoxDecoration(
            color: AppColors.bgInput,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.bgRail, width: 1.5),
          ),
          child: Row(
            children: [
              // Iran country code
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: const BoxDecoration(
                  border: Border(left: BorderSide(color: AppColors.bgRail, width: 1.5)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('🇮🇷', style: TextStyle(fontSize: 18)),
                    SizedBox(width: 6),
                    Text(
                      '+98',
                      style: TextStyle(
                        color: AppColors.textHeader,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                      textDirection: TextDirection.ltr,
                    ),
                  ],
                ),
              ),

              // Phone text field
              Expanded(
                child: TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  enableSuggestions: false,
                  autocorrect: false,
                  style: const TextStyle(color: AppColors.textNormal, fontSize: 15, letterSpacing: 1.2),
                  textDirection: TextDirection.ltr,
                  decoration: const InputDecoration(
                    hintText: '912 345 6789',
                    hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  onSubmitted: (_) => _handleSendCode(clientProvider),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Submit Button
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.baleGreen,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            elevation: 0,
          ),
          onPressed: clientProvider.isLoading ? null : () => _handleSendCode(clientProvider),
          child: clientProvider.isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                )
              : const Text(
                  'دریافت کد تایید',
                  style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold),
                ),
        ),
      ],
    );
  }

  // -------------------------------------------------------------
  // Step 2: SMS Verification Code
  // -------------------------------------------------------------
  Widget _buildCodeStep(
    BaleClientProvider clientProvider,
    SettingsProvider settingsProvider,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'کد تایید را وارد کنید',
                    style: TextStyle(
                      color: AppColors.textHeader,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'کد پیامک‌شده به ${_phoneController.text}',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                    textDirection: TextDirection.rtl,
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () {
                setState(() {
                  _step = 1;
                  _codeController.clear();
                });
              },
              child: const Text('ویرایش شماره', style: TextStyle(color: AppColors.blurple, fontSize: 12)),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Code Input Field
        Container(
          decoration: BoxDecoration(
            color: AppColors.bgInput,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.baleGreen.withValues(alpha: 0.6), width: 1.5),
          ),
          child: TextField(
            controller: _codeController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            enableSuggestions: false,
            autocorrect: false,
            style: const TextStyle(
              color: AppColors.textHeader,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              letterSpacing: 10,
            ),
            textDirection: TextDirection.ltr,
            maxLength: 6,
            onChanged: (val) {
              final clean = BaleProto.normalizeCode(val);
              if (clean.length == 5 && !clientProvider.isLoading) {
                _handleVerifyCode(clientProvider, settingsProvider);
              }
            },
            decoration: const InputDecoration(
              counterText: '',
              hintText: '• • • • •',
              hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 20, letterSpacing: 8),
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(vertical: 14),
            ),
            onSubmitted: (_) => _handleVerifyCode(clientProvider, settingsProvider),
          ),
        ),
        const SizedBox(height: 14),

        // Resend Timer Row
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!_canResend)
              Text(
                'امکان ارسال مجدد پس از: ۰۰:${_secondsRemaining.toString().padLeft(2, '0')}',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
              )
            else
              TextButton.icon(
                icon: const Icon(Icons.refresh_rounded, size: 16, color: AppColors.baleGreen),
                label: const Text('ارسال مجدد پیامک', style: TextStyle(color: AppColors.baleGreen, fontSize: 12)),
                onPressed: () => _handleSendCode(clientProvider),
              ),
          ],
        ),
        const SizedBox(height: 14),

        // Verify Button
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.baleGreen,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            elevation: 0,
          ),
          onPressed: clientProvider.isLoading ? null : () => _handleVerifyCode(clientProvider, settingsProvider),
          child: clientProvider.isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                )
              : const Text(
                  'تایید و ورود به حساب',
                  style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold),
                ),
        ),
      ],
    );
  }

  // -------------------------------------------------------------
  // Step 3: Two-Factor Authentication (2FA Password)
  // -------------------------------------------------------------
  Widget _buildPasswordStep(
    BaleClientProvider clientProvider,
    SettingsProvider settingsProvider,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'رمز عبور دومرحله‌ای (۲FA)',
          style: TextStyle(
            color: AppColors.textHeader,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'اکانت شما دارای رمز عبور ابری است. لطفاً رمز عبور خود را وارد کنید.',
          style: TextStyle(color: AppColors.textMuted, fontSize: 12),
        ),
        const SizedBox(height: 16),

        Container(
          decoration: BoxDecoration(
            color: AppColors.bgInput,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.blurple.withValues(alpha: 0.6), width: 1.5),
          ),
          child: TextField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            style: const TextStyle(color: AppColors.textNormal, fontSize: 15),
            decoration: InputDecoration(
              hintText: 'رمز عبور دومرحله‌ای',
              hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                  color: AppColors.textMuted,
                  size: 20,
                ),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            onSubmitted: (_) => _handleVerifyPassword(clientProvider, settingsProvider),
          ),
        ),
        const SizedBox(height: 20),

        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.blurple,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            elevation: 0,
          ),
          onPressed: clientProvider.isLoading ? null : () => _handleVerifyPassword(clientProvider, settingsProvider),
          child: clientProvider.isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                )
              : const Text(
                  'ورود با رمز عبور',
                  style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold),
                ),
        ),
      ],
    );
  }

  // -------------------------------------------------------------
  // Bottom Guest / Sandbox Mode
  // -------------------------------------------------------------
  Widget _buildGuestOption(BaleClientProvider clientProvider) {
    return OutlinedButton.icon(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.textMuted,
        side: const BorderSide(color: AppColors.bgRail, width: 1.2),
        padding: const EdgeInsets.symmetric(vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      icon: const Icon(Icons.person_outline_rounded, size: 18),
      label: const Text(
        'ورود به عنوان مهمان (حالت آزمایشی)',
        style: TextStyle(fontSize: 12.5),
      ),
      onPressed: () => _handleGuestEntry(clientProvider),
    );
  }
}
