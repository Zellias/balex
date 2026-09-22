/**
 * BaleX Banking Example: Card-to-Card Shetab Transfer
 * Inquires recipient name and executes dynamic OTP transfer.
 */
import { BaleClient } from 'balex';

async function performTransfer() {
  const client = new BaleClient();
  // بارگذاری نشست ذخیره شده
  await client.loadSession();

  const sourceCard = '6037991812345678';
  const destCard = '6104337890123456';
  const amountRials = 2000000; // ۲۰۰,۰۰۰ تومان

  console.log('۱. در حال استعلام نام دارنده کارت مقصد...');
  const inquiry = await client.banking.inquireDestinationPan({
    sourceCardNumber: sourceCard,
    destinationCardNumber: destCard,
    amountRials,
  });

  console.log(`صاحب کارت: ${inquiry.cardHolderName}`);
  console.log(`کارمزد انتقال: ${inquiry.feeRials || 7200} ریال`);

  // درخواست انتقال با رمز پویا
  console.log('۲. در حال ارسال درخواست انتقال وجه شتابی...');
  const receipt = await client.banking.transferMoneyByCard({
    sourcePan: sourceCard,
    destinationPan: destCard,
    amountRials,
    cvv2: '342',
    expireDate: '0729',
    pin2: '876543', // رمز پویا دریافت شده از پیامک هریم
    inquiryToken: inquiry.inquiryToken,
    description: 'تسویه سهم پروژه',
  });

  console.log('۳. انتقال با موفقیت انجام شد!');
  console.log(`شماره پیگیری (RRN): ${receipt.rrn}`);
  console.log(`شماره ارجاع شاپرک: ${receipt.trackingCode}`);
}

performTransfer().catch(console.error);
