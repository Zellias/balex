# -*- coding: utf-8 -*-
import sys
import re

with open("README.md", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update repo and pages links
text = text.replace("github.com/Zellias/bale-userbot", "github.com/Zellias/balex")
text = text.replace("zellias.github.io/bale-userbot", "zellias.github.io/balex")
text = text.replace("require('bale-userbot')", "require('balex')")

# 2. Add 106 High-Level methods table and expand BaleBot in README
# Find bot section in README
bot_pattern = r'## 🤖 بازوهای رسمی بله \(Official Bale HTTP Bot API\)[\s\S]*?(?=## 🐹 اتصال و اجرا در زبان Go)'

new_bot_readme = """## 🤖 بازوهای رسمی بله (Official Bale HTTP Bot API - docs.bale.ai)

علاوه بر یوزربات و پروتکل باینری، کتابخانه BaleX دارای پشتیبانی ۱۰۰٪ بومی و صفر وابستگی از **API رسمی بازوهای بله ([docs.bale.ai](https://docs.bale.ai/))** است.

### راه‌اندازی سریع بازو با Long Polling
```javascript
const { BaleBot, InlineKeyboard, ReplyKeyboard, KeyboardRemove } = require('balex');

// ۱. مقداردهی با توکن دریافت شده از botfather@ در بله
const bot = new BaleBot('123456789:abcdIuZmK5qNEm2A1BhUaAg7MPJv1O9KCcBQB2ro');

// ۲. دریافت مشخصات ربات
const me = await bot.getMe();
console.log(`ربات فعال شد: @${me.username}`);

// ۳. دریافت و پاسخ به پیام‌ها
bot.on('message', async (msg) => {
  if (msg.text === '/start') {
    const kb = new InlineKeyboard()
      .button('ثبت‌نام', 'btn_register')
      .url('وب‌سایت بله', 'https://ble.ir')
      .row()
      .webApp('مینی‌اپ فروشگاه', 'https://app.example.com')
      .copyText('کپی کد معرف', 'BALE2026'); // کپی سریع در کلیپ‌بورد کاربر

    await bot.sendMessage(msg.chat.id, 'سلام! به بازوی بله خوش آمدید.', {
      reply_markup: kb
    });
  }
});

// ۴. کلیک دکمه‌های شیشه‌ای
bot.on('callback_query', async (query) => {
  await bot.answerCallbackQuery(query.id, {
    text: 'عملیات با موفقیت ثبت شد.',
    show_alert: true
  });
});

// ۵. شروع دریافت رویدادها
bot.startPolling({ interval: 300, timeout: 20 });
```

### ارسال انواع رسانه‌ها با ۴ روش ورودی فایل (Media Uploads)
بازوی بله از ۴ روش برای ارسال عکس، صوت، سند، ویدیو، ویس و انیمیشن پشتیبانی می‌کند:
```javascript
const fs = require('fs');

// ۱. با شناسه فایل قبلی روی بله (بدون نیاز به آپلود مجدد و مصرف پهنای باند)
await bot.sendPhoto(chatId, 'file_id_from_bale', { caption: 'عکس آرشیو' });

// ۲. با آدرس URL اینترنتی (دانلود مستقیم توسط سرور بله)
await bot.sendPhoto(chatId, 'https://example.com/image.png');

// ۳. با مسیر فایل محلی (آپلود خودکار به صورت multipart/form-data)
await bot.sendPhoto(chatId, './images/banner.jpg', { caption: 'آپلود محلی' });

// ۴. با بافر حافظه (Buffer)
const buffer = fs.readFileSync('./chart.png');
await bot.sendPhoto(chatId, buffer, { caption: 'تصویر داینامیک' });

// ارسال سایر رسانه‌ها
await bot.sendAudio(chatId, './track.mp3', { performer: 'بله', title: 'آهنگ' });
await bot.sendDocument(chatId, './doc.pdf');
await bot.sendVideo(chatId, './video.mp4', { duration: 60 });
await bot.sendVoice(chatId, './voice.ogg');
await bot.sendAnimation(chatId, './anim.gif');
await bot.sendLocation(chatId, 35.7219, 51.3347);
await bot.sendContact(chatId, '+989123456789', 'پشتیبانی');
await bot.sendChatAction(chatId, 'upload_photo');
```

### مدیریت گروه‌ها، اعضا و لینک‌های دعوت
```javascript
// دریافت اطلاعات و اعضا
const chat = await bot.getChat(groupId);
const count = await bot.getChatMembersCount(groupId);
const admins = await bot.getChatAdministrators(groupId);

// اخراج، رفع اخراج و ارتقا به ادمین
await bot.banChatMember(groupId, userId);
await bot.unbanChatMember(groupId, userId);
await bot.promoteChatMember(groupId, userId, { can_delete_messages: true });

// تنظیمات گروه و سنجاق پیام
await bot.setChatTitle(groupId, 'گروه برنامه‌نویسان بله');
await bot.setChatDescription(groupId, 'توسعه بازو و مینی‌اپ');
await bot.pinChatMessage(groupId, messageId);
await bot.unpinChatMessage(groupId, messageId);

// لینک‌های دعوت
const invite = await bot.createChatInviteLink(groupId);
await bot.revokeChatInviteLink(groupId, invite.invite_link);
```

### متد اختصاصی دریافت امتیاز و نظر کاربر (askReview)
```javascript
// باز کردن پنجره بومی دریافت امتیاز و ثبت نظر در کلاینت بله کاربر
await bot.askReview(chatId);
```

### پرداخت و کیف‌پول الکترونیکی بله (Electronic Wallet Invoices)
```javascript
// ارسال فاکتور پرداخت به کاربر
await bot.sendInvoice(
  chatId,
  'اشتراک ویژه بازو',
  'دسترسی یک‌ماهه به امکانات پرمیوم',
  'order_vip_30days',
  'PROVIDER_TOKEN',
  'IRR',
  [{ label: 'هزینه اشتراک', amount: 150000 }]
);

// تایید پیش از پرداخت (PreCheckoutQuery)
bot.on('pre_checkout_query', async (query) => {
  await bot.answerPreCheckoutQuery(query.id, true);
});

// دریافت رویداد پرداخت موفق
bot.on('successful_payment', async (payment, msg) => {
  console.log('پرداخت تایید شد:', payment.total_amount, payment.invoice_payload);
});

// استعلام وضعیت تراکنش
const tx = await bot.inquireTransaction('transaction_id_here');
```

### استقرار به صورت وب‌هوک (Webhook)
```javascript
const http = require('http');

// ثبت آدرس وب‌هوک در سرور بله
await bot.setWebhook('https://bot.example.com/bale-webhook');

// اتصال میدلور به سرور Express یا Node.js HTTP
const webhookHandler = bot.createWebhookMiddleware({ secretToken: 'MY_SECRET' });
http.createServer((req, res) => {
  if (req.url === '/bale-webhook') return webhookHandler(req, res);
  res.writeHead(404).end();
}).listen(443);
```

### کاتالوگ جامع ۶۲ متد رسمی BaleBot (docs.bale.ai)
| دسته‌بندی | متدها |
| :--- | :--- |
| **چرخه حیات و وب‌هوک** | `getMe()`, `logout()`, `close()`, `getUpdates(opts)`, `setWebhook(opts)`, `deleteWebhook()`, `getWebhookInfo()`, `startPolling(opts)`, `stopPolling()`, `createWebhookMiddleware(opts)` |
| **پیام‌ها و چندرسانه‌ای** | `sendMessage(chatId, text, opts)`, `forwardMessage(chatId, fromChatId, msgId)`, `copyMessage(chatId, fromChatId, msgId, opts)`, `sendPhoto(chatId, photo, opts)`, `sendAudio(chatId, audio, opts)`, `sendDocument(chatId, doc, opts)`, `sendVideo(chatId, video, opts)`, `sendAnimation(chatId, anim, opts)`, `sendVoice(chatId, voice, opts)`, `sendMediaGroup(chatId, media)`, `sendLocation(chatId, lat, lon, opts)`, `sendContact(chatId, phone, name, opts)`, `sendChatAction(chatId, action)`, `getFile(fileId)`, `downloadFile(fileId, dest)` |
| **دکمه‌ها و تعامل** | `answerCallbackQuery(id, opts)`, `askReview(chatId)` (پاپ‌آپ نظرخواهی اختصاصی بله) |
| **ویرایش و حذف** | `editMessageText(chatId, msgId, text, opts)`, `editMessageCaption(chatId, msgId, cap, opts)`, `editMessageReplyMarkup(chatId, msgId, kb)`, `deleteMessage(chatId, msgId)`, `deleteMessages(chatId, msgIds)` |
| **مدیریت چت و اعضا** | `getChat(chatId)`, `getChatAdministrators(chatId)`, `getChatMembersCount(chatId)`, `getChatMember(chatId, userId)`, `banChatMember(chatId, userId)`, `unbanChatMember(chatId, userId)`, `promoteChatMember(chatId, userId, opts)`, `setChatPhoto(chatId, photo)`, `deleteChatPhoto(chatId)`, `setChatTitle(chatId, title)`, `setChatDescription(chatId, desc)`, `pinChatMessage(chatId, msgId)`, `unpinChatMessage(chatId, msgId)`, `unPinChatMessage(chatId, msgId)`, `unpinAllChatMessages(chatId)`, `leaveChat(chatId)`, `createChatInviteLink(chatId)`, `revokeChatInviteLink(chatId, link)`, `exportChatInviteLink(chatId)` |
| **استیکرها** | `uploadStickerFile(userId, png)`, `createNewStickerSet(userId, name, title, png, emojis)`, `addStickerToSet(userId, name, png, emojis)` |
| **پرداخت و کیف‌پول** | `sendInvoice(chatId, title, desc, payload, token, curr, prices, opts)`, `createInvoiceLink(title, desc, payload, token, curr, prices, opts)`, `answerPreCheckoutQuery(queryId, ok, errMsg)`, `inquireTransaction(transactionId)` |
| **متدهای کمکی** | `call(method, params, files)`, `getMethodUrl(method)`, `getFileUrl(filePath)` |

---

"""

text = re.sub(bot_pattern, new_bot_readme, text, count=1)
print("Updated Bot section in README.md.")

with open("README.md", "w", encoding="utf-8") as f:
    f.write(text)
print("Saved README.md successfully.")
