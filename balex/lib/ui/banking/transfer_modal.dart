import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/banks.dart';
import '../../providers/bank_provider.dart';
import '../../providers/chat_provider.dart';

class TransferModal extends StatefulWidget {
  const TransferModal({super.key});

  @override
  State<TransferModal> createState() => _TransferModalState();
}

class _TransferModalState extends State<TransferModal> {
  int _step = 1; // 1: Card & Amount, 2: Inquire & OTP, 3: Confirmation
  late String _selectedCardId;
  final _destPanController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _pinController = TextEditingController();
  final _cvv2Controller = TextEditingController();
  final _expiryController = TextEditingController();

  String? _destHolderName;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final bankProvider = context.read<BankProvider>();
    _selectedCardId = bankProvider.defaultCard.id;
  }

  void _onNextStep1() async {
    final destPan = _destPanController.text.replaceAll(RegExp(r'\D'), '');
    final amountText = _amountController.text.replaceAll(RegExp(r'\D'), '');

    if (destPan.length != 16) {
      setState(() => _errorMessage = 'شماره کارت مقصد باید ۱۶ رقم باشد.');
      return;
    }
    final amount = int.tryParse(amountText);
    if (amount == null || amount < 10000) {
      setState(() => _errorMessage = 'حداقل مبلغ انتقال ۱۰,۰۰۰ ریال است.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final name = await context.read<BankProvider>().inquireDestinationPan(destPan);
      setState(() {
        _destHolderName = name;
        _step = 2;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _requestOtp() async {
    setState(() => _isLoading = true);
    await context.read<BankProvider>().requestOtp(
          cardId: _selectedCardId,
          destPan: _destPanController.text,
          amount: int.parse(_amountController.text.replaceAll(RegExp(r'\D'), '')),
        );
    setState(() => _isLoading = false);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('رمز پویا با پیامک ارسال شد (شبیه‌سازی: ۱۲۳۴۵۶)'),
        backgroundColor: AppColors.baleGreen,
      ),
    );
  }

  void _submitTransfer() async {
    if (_pinController.text.isEmpty || _cvv2Controller.text.isEmpty) {
      setState(() => _errorMessage = 'لطفاً رمز پویا و کد CVV2 را وارد نمایید.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final amount = int.parse(_amountController.text.replaceAll(RegExp(r'\D'), ''));
      final receipt = await context.read<BankProvider>().transferMoneyByCard(
            sourceCardId: _selectedCardId,
            destinationPan: _destPanController.text,
            destCardHolderName: _destHolderName ?? 'گیرنده',
            amount: amount,
            pin2: _pinController.text,
            cvv2: _cvv2Controller.text,
            expireDate: _expiryController.text,
            description: _descriptionController.text.isNotEmpty
                ? _descriptionController.text
                : 'انتقال از BaleX',
          );

      // Also send receipt into current chat!
      if (mounted) {
        context.read<ChatProvider>().sendCardReceipt(receipt);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('انتقال وجه با موفقیت انجام شد و رسید به چت ارسال گردید! 🎉'),
            backgroundColor: AppColors.baleGreen,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bankProvider = context.watch<BankProvider>();
    final currencyFormatter = NumberFormat('#,###', 'fa');

    return Dialog(
      backgroundColor: AppColors.bgSidebar,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Container(
        width: 440,
        padding: const EdgeInsets.all(22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Title Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.baleGreen.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.credit_card_rounded, color: AppColors.baleGreen, size: 22),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'انتقال وجه کارت به کارت (شتاب)',
                    style: TextStyle(
                      color: AppColors.textHeader,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textMuted, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (_errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.danger.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(color: AppColors.danger, fontSize: 12),
                ),
              ),

            // Step 1: Source Card, Dest Pan, Amount
            if (_step == 1) ...[
              const Text('کارت مبدا:', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: _selectedCardId,
                dropdownColor: AppColors.bgCard,
                decoration: _inputDecoration(),
                items: bankProvider.cards.map((c) {
                  final bank = IranianBanks.detectBank(c.pan);
                  return DropdownMenuItem(
                    value: c.id,
                    child: Row(
                      children: [
                        Icon(bank.icon, size: 16, color: bank.gradientColors.first),
                        const SizedBox(width: 8),
                        Text(
                          '${bank.nameFa} (${IranianBanks.maskCardNumber(c.pan)})',
                          style: const TextStyle(color: AppColors.textNormal, fontSize: 13),
                        ),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (v) {
                  if (v != null) setState(() => _selectedCardId = v);
                },
              ),
              const SizedBox(height: 12),

              const Text('شماره کارت مقصد (۱۶ رقم):',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              const SizedBox(height: 6),
              TextField(
                controller: _destPanController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textHeader, fontSize: 14),
                decoration: _inputDecoration(hint: 'مثال: ۶۰۳۷۹۹...'),
                onChanged: (_) => setState(() {}),
              ),
              if (_destPanController.text.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    IranianBanks.detectBank(_destPanController.text).nameFa,
                    style: const TextStyle(color: AppColors.baleGreen, fontSize: 11),
                  ),
                ),
              const SizedBox(height: 12),

              const Text('مبلغ (ریال):', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              const SizedBox(height: 6),
              TextField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textHeader, fontSize: 14),
                decoration: _inputDecoration(hint: 'مثال: ۵,۰۰۰,۰۰۰'),
              ),
              const SizedBox(height: 18),

              ElevatedButton(
                style: _buttonStyle(AppColors.blurple),
                onPressed: _isLoading ? null : _onNextStep1,
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('استعلام نام و مرحله بعد',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ]

            // Step 2: Confirmation & OTP
            else if (_step == 2) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.bgCanvas,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    _infoRow('نام صاحب حساب:', _destHolderName ?? '', isBold: true),
                    const SizedBox(height: 6),
                    _infoRow('کارت مقصد:', IranianBanks.maskCardNumber(_destPanController.text)),
                    const SizedBox(height: 6),
                    _infoRow(
                      'مبلغ قابل پرداخت:',
                      '${currencyFormatter.format(int.tryParse(_amountController.text.replaceAll(RegExp(r'\D'), '')) ?? 0)} ریال',
                      color: AppColors.baleGreen,
                    ),
                    const SizedBox(height: 6),
                    _infoRow('کارمزد شتاب:', '۷,۲۰۰ ریال'),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // OTP row
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _pinController,
                      keyboardType: TextInputType.number,
                      obscureText: true,
                      style: const TextStyle(color: AppColors.textHeader, fontSize: 14),
                      decoration: _inputDecoration(hint: 'رمز دوم پویا'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    style: _buttonStyle(AppColors.bgCard),
                    onPressed: _requestOtp,
                    child: const Text('دریافت رمز پویا',
                        style: TextStyle(color: AppColors.baleGreen, fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _cvv2Controller,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: AppColors.textHeader, fontSize: 14),
                      decoration: _inputDecoration(hint: 'کد CVV2'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _expiryController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: AppColors.textHeader, fontSize: 14),
                      decoration: _inputDecoration(hint: 'انقضا (ماه/سال)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              TextField(
                controller: _descriptionController,
                style: const TextStyle(color: AppColors.textHeader, fontSize: 14),
                decoration: _inputDecoration(hint: 'بابت / توضیحات (اختیاری)'),
              ),
              const SizedBox(height: 18),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.divider),
                        foregroundColor: AppColors.textMuted,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: () => setState(() => _step = 1),
                      child: const Text('بازگشت'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      style: _buttonStyle(AppColors.baleGreen),
                      onPressed: _isLoading ? null : _submitTransfer,
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('تایید و انتقال وجه',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({String? hint}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
      filled: true,
      fillColor: AppColors.bgInput,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide.none,
      ),
    );
  }

  ButtonStyle _buttonStyle(Color bg) {
    return ElevatedButton.styleFrom(
      backgroundColor: bg,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
      elevation: 0,
    );
  }

  Widget _infoRow(String label, String val, {bool isBold = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
        Text(
          val,
          style: TextStyle(
            color: color ?? AppColors.textHeader,
            fontSize: 12.5,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
