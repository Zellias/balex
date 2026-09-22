import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/network/bale_socket_client.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/bale_client_provider.dart';
import '../../providers/settings_provider.dart';

class BaleLoginDialog extends StatefulWidget {
  const BaleLoginDialog({super.key});

  @override
  State<BaleLoginDialog> createState() => _BaleLoginDialogState();
}

class _BaleLoginDialogState extends State<BaleLoginDialog> {
  int _step = 1; // 1: Phone, 2: OTP Code, 3: 2FA Password
  final _phoneController = TextEditingController(text: '09');
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final clientProvider = context.watch<BaleClientProvider>();
    final settingsProvider = context.read<SettingsProvider>();

    return Dialog(
      backgroundColor: AppColors.bgSidebar,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 440,
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.85),
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.baleGreen.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.bolt_rounded, color: AppColors.baleGreen, size: 26),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'اتصال به حساب بله شما',
                          style: TextStyle(
                            color: AppColors.textHeader,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'ورود امن با پروتکل رسمی بله (MKProto)',
                          style: TextStyle(color: AppColors.textMuted, fontSize: 11.5),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Server Status Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _getStatusColor(clientProvider.status),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _getStatusText(clientProvider.status),
                        style: const TextStyle(
                          color: AppColors.textHeader,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (!clientProvider.isConnected)
                      TextButton(
                        onPressed: clientProvider.isLoading
                            ? null
                            : () => clientProvider.connectToBaleServer(),
                        child: const Text('اتصال مجدد', style: TextStyle(fontSize: 11, color: AppColors.blurple)),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              if (clientProvider.errorMessage != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: AppColors.danger, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          clientProvider.errorMessage!,
                          style: const TextStyle(color: AppColors.danger, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),

              // Step 1: Enter Phone Number
              if (_step == 1) ...[
                const Text(
                  'شماره موبایل خود را وارد کنید:',
                  style: TextStyle(color: AppColors.textNormal, fontSize: 13.5, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                const Text(
                  'کد تأیید پیامکی رسمی توسط بله به این شماره ارسال خواهد شد.',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 11.5),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  enableSuggestions: false,
                  autocorrect: false,
                  style: const TextStyle(color: AppColors.textHeader, fontSize: 16, letterSpacing: 1),
                  decoration: InputDecoration(
                    hintText: '۰۹۱۲۳۴۵۶۷۸۹',
                    hintStyle: const TextStyle(color: AppColors.textMuted),
                    filled: true,
                    fillColor: AppColors.bgInput,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                    prefixIcon: const Icon(Icons.phone_android_rounded, color: AppColors.baleGreen, size: 20),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.baleGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: clientProvider.isLoading
                      ? null
                      : () async {
                          final ok = await clientProvider.sendVerificationCode(_phoneController.text.trim());
                          if (ok && mounted) {
                            setState(() => _step = 2);
                          }
                        },
                  child: clientProvider.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text(
                          'ارسال کد تأیید پیامکی بله (SendCode)',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                        ),
                ),
              ],

              // Step 2: Enter Verification Code
              if (_step == 2) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'کد پیامک‌شده به ${_phoneController.text}:',
                      style: const TextStyle(color: AppColors.textNormal, fontSize: 13),
                    ),
                    TextButton(
                      onPressed: () => setState(() => _step = 1),
                      child: const Text('ویرایش شماره', style: TextStyle(color: AppColors.blurple, fontSize: 11.5)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _codeController,
                  keyboardType: TextInputType.number,
                  enableSuggestions: false,
                  autocorrect: false,
                  autofocus: true,
                  style: const TextStyle(color: AppColors.textHeader, fontSize: 22, letterSpacing: 8),
                  textAlign: TextAlign.center,
                  decoration: InputDecoration(
                    hintText: '•••••',
                    hintStyle: const TextStyle(color: AppColors.textMuted, letterSpacing: 8),
                    filled: true,
                    fillColor: AppColors.bgInput,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 18),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.baleGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: clientProvider.isLoading
                      ? null
                      : () async {
                          final ok = await clientProvider.verifyAndSignIn(_codeController.text.trim());
                          if (!context.mounted) return;
                          if (ok) {
                            if (clientProvider.user != null) {
                              settingsProvider.updateProfile(
                                id: clientProvider.user!.id,
                                name: clientProvider.user!.name,
                                phone: clientProvider.user!.phone,
                                username: clientProvider.user!.username,
                              );
                            }
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('با موفقیت به حساب بله متصل شدید!'),
                                backgroundColor: AppColors.baleGreen,
                              ),
                            );
                          } else if (clientProvider.is2faRequired) {
                            setState(() => _step = 3);
                          }
                        },
                  child: clientProvider.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('تأیید و ورود به حساب بله (SignIn)', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: clientProvider.isLoading
                      ? null
                      : () => clientProvider.sendVerificationCode(_phoneController.text.trim()),
                  child: const Text('ارسال مجدد کد پیامکی', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                ),
              ],

              // Step 3: Enter 2FA Password
              if (_step == 3) ...[
                const Text(
                  'رمز عبور دومرحله‌ای بله (2FA Password):',
                  style: TextStyle(color: AppColors.textNormal, fontSize: 13.5, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                const Text(
                  'برای این حساب بله، رمز دو مرحله‌ای تنظیم شده است.',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 11.5),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  autofocus: true,
                  style: const TextStyle(color: AppColors.textHeader, fontSize: 16),
                  decoration: InputDecoration(
                    hintText: 'رمز عبور خود را وارد کنید',
                    hintStyle: const TextStyle(color: AppColors.textMuted),
                    filled: true,
                    fillColor: AppColors.bgInput,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                    prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.gold, size: 20),
                  ),
                ),
                const SizedBox(height: 18),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: clientProvider.isLoading
                      ? null
                      : () async {
                          final ok = await clientProvider.verify2faPassword(_passwordController.text);
                          if (!context.mounted) return;
                          if (ok) {
                            if (clientProvider.user != null) {
                              settingsProvider.updateProfile(
                                id: clientProvider.user!.id,
                                name: clientProvider.user!.name,
                                phone: clientProvider.user!.phone,
                                username: clientProvider.user!.username,
                              );
                            }
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('با موفقیت به حساب بله متصل شدید!'),
                                backgroundColor: AppColors.baleGreen,
                              ),
                            );
                          }
                        },
                  child: clientProvider.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : const Text('تأیید رمز دو مرحله‌ای و ورود', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(BaleConnectionStatus s) {
    switch (s) {
      case BaleConnectionStatus.connected:
        return AppColors.online;
      case BaleConnectionStatus.connecting:
      case BaleConnectionStatus.handshaking:
        return AppColors.idle;
      case BaleConnectionStatus.error:
        return AppColors.danger;
      case BaleConnectionStatus.disconnected:
        return AppColors.offline;
    }
  }

  String _getStatusText(BaleConnectionStatus s) {
    switch (s) {
      case BaleConnectionStatus.connected:
        return 'متصل به سرور بله (MKProto زنده)';
      case BaleConnectionStatus.connecting:
        return 'در حال اتصال به wss://next-ws.bale.ai/ws/...';
      case BaleConnectionStatus.handshaking:
        return 'در حال ارسال Handshake به بله...';
      case BaleConnectionStatus.error:
        return 'خطا در ارتباط با سرور بله';
      case BaleConnectionStatus.disconnected:
        return 'قطع ارتباط با سرور بله';
    }
  }
}
