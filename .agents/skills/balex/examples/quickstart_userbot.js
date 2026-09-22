/**
 * BaleX Quickstart Userbot
 * Demonstrates full authentication, event listening, and reply handling.
 */
import { BaleClient } from 'balex';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  const client = new BaleClient({
    humanize: {
      enabled: true,
      typingSimulation: true,
      readingDelay: true,
    },
    logLevel: 'info',
  });

  console.log('=== BaleX Userbot Login ===');
  const phone = await ask('شماره موبایل را وارد کنید (مثال: 09372570490): ');
  
  // مرحله ۱: ارسال کد پیامکی
  const { transactionHash } = await client.auth.startPhoneAuth({
    phoneNumber: phone,
    deviceTitle: 'BaleX Automation Server',
  });
  console.log('کد پیامک شد.');

  // مرحله ۲: ورود کد ۵ رقمی
  const code = await ask('کد ۵ رقمی تایید بله را وارد کنید: ');
  try {
    const session = await client.auth.validateCode({
      code: code.trim(),
      transactionHash,
    });
    console.log(`ورود موفقیت‌آمیز بود! خوش آمدید ${session.user.name}`);
  } catch (err) {
    if (err.message.includes('PHONE_PASSWORD_INVALID')) {
      const password = await ask('رمز عبور دومرحله‌ای (2FA) را وارد کنید: ');
      await client.auth.validatePassword({ password, transactionHash });
      console.log('لاگین دومرحله‌ای تایید شد!');
    } else {
      throw err;
    }
  }

  // مرحله ۳: گوش دادن به پیام‌ها
  client.on('message', async (msg) => {
    console.log(`[${msg.senderName}]: ${msg.text}`);

    if (msg.text === '!ping') {
      await client.messages.sendMessage({
        peerId: msg.senderId,
        peerType: msg.peerType,
        text: 'پونگ! 🏓 پاسخ داده شد با BaleX',
        replyToMessageId: msg.id,
      });
    }
  });

  await client.connect();
  console.log('ربات در حال اجرا است...');
}

main().catch(console.error);
