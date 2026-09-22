<div align="center" dir="rtl">

# 🚀 BaleX — کتابخانه جامع پروتکل رسمی بله

[![Version](https://img.shields.io/badge/version-1.2.0-emerald.svg?style=for-the-badge)](https://github.com/exactslash/balex)
[![Protocol](https://img.shields.io/badge/protocol-Protobuf%20%7C%20gRPC--Web-5865F2.svg?style=for-the-badge)](https://github.com/exactslash/balex)
[![Language](https://img.shields.io/badge/language-Persian%20(فارسی)-10B981.svg?style=for-the-badge)](https://github.com/exactslash/balex)
[![Platform](https://img.shields.io/badge/platform-Node.js%20%7C%20Flutter%20%7C%20Dart-F59E0B.svg?style=for-the-badge)](https://github.com/exactslash/balex)

**پیاده‌سازی مستقل، پرسرعت و خالص پروتکل باینری پیام‌رسان بله بدون نیاز به مرورگر، همراه با پشتیبانی از سیستم مالی کارت‌به‌کارت و موتور رفتار انسانی ضد مسدودی (Stealth).**

[📖 مشاهده سایت مستندات آنلاین (GitHub Pages)](https://exactslash.github.io/web.bale.ai/)

---

</div>

<div dir="rtl">

## 📑 فهرست مطالب
1. [معرفی کتابخانه BaleX](#-معرفی-کتابخانه-balex)
2. [ویژگی‌های کلیدی](#-ویژگیهای-کلیدی)
3. [نصب و پیش‌نیازها](#-نصب-و-پیشنیازها)
4. [شروع سریع (Quickstart)](#-شروع-سریع-quickstart)
5. [احراز هویت و ورود (Authentication)](#-احراز-هویت-و-ورود-authentication)
   - [ارسال کد تایید (StartPhoneAuth)](#۱-ارسال-کد-تایید-پیامکی)
   - [اعتبارسنجی کد ۵ رقمی (ValidateCode)](#۲-اعتبارسنجی-کد-پیامکی)
   - [رمز عبور دومرحله‌ای (ValidatePassword)](#۳-رمز-عبور-دومرحلهای-۲fa)
   - [ذخیره و بازیابی نشست (Session Persistence)](#۴-ذخیره-و-بازیابی-نشست)
6. [پیام‌رسانی و رویدادهای زنده (Messaging)](#-پیامرسانی-و-رویدادهای-زنده-messaging)
   - [ارسال پیام ساده و ریپلای](#ارسال-پیام-ساده-و-پاسخ-reply)
   - [دریافت رویدادهای زنده (WebSocket Updates)](#دریافت-رویدادها-و-پیامهای-زنده)
   - [دریافت لیست گفتگوها (LoadDialogs)](#دریافت-لیست-گفتگوها-loaddialogs)
   - [تاریخچه پیام‌ها (LoadHistory)](#دریافت-تاریخچه-گفتگو-loadhistory)
7. [ارسال چندرسانه‌ای (Media Messaging)](#-ارسال-چندرسانهای-media-messaging)
   - [ارسال عکس (sendPhoto)](#ارسال-عکس-با-کپشن-و-ابعاد-sendphoto)
   - [ارسال پیام صوتی و ویس (sendVoice)](#ارسال-پیام-صوتی-و-ویس-با-شکل-موج-sendvoice)
   - [ارسال موزیک و آهنگ با پلیر بله (sendAudio)](#ارسال-موزیک-و-آهنگ-با-پلیر-بله-sendaudio)
   - [ارسال ویدیو (sendVideo)](#ارسال-ویدیو-sendvideo)
   - [ارسال اسناد و فایل دانلودی (sendDocument)](#ارسال-فایل-و-اسناد-دانلودی-senddocument)
   - [ارسال استیکر بله (sendSticker)](#ارسال-استیکر-بله-sendsticker)
8. [مدیریت پیام‌ها و چت‌ها (Message Management)](#-مدیریت-پیامها-و-چتها-message-management)
   - [ویرایش پیام (editMessage)](#ویرایش-متن-پیام-ارسال-شده-editmessage)
   - [فوروارد پیام‌ها (forwardMessages)](#فوروارد-و-هدایت-پیامها-forwardmessages)
   - [پین کردن پیام (pinMessage)](#پین-کردن-پیام-pinmessage)
   - [حذف پیام‌ها (deleteMessages)](#حذف-پیامها-deletemessages)
   - [پاکسازی گفتگو (clearChat)](#پاکسازی-کامل-چت-clearchat)
9. [مدیریت گروه‌ها و کانال‌ها (Group Administration)](#-مدیریت-گروهها-و-کانالها-group-administration)
   - [ساخت گروه جدید (createGroup)](#ساخت-گروه-جدید-creategroup)
   - [افزودن عضو (inviteMembers)](#افزودن-و-دعوت-اعضا-invitemembers)
   - [اخراج عضو (kickMember)](#اخراج-عضو-از-گروه-kickmember)
   - [تغییر عنوان گروه (setGroupTitle)](#تغییر-عنوان-گروه-setgrouptitle)
   - [ترک گروه (leaveGroup)](#ترک-گروه-leavegroup)
10. [کاربران، مخاطبین و پروفایل (Users, Contacts & Profile)](#-کاربران-مخاطبین-و-پروفایل-users-contacts--profile)
   - [پروفایل کاربر (getUser)](#دریافت-پروفایل-کاربر-getuser)
   - [مشخصات گروه (getGroup)](#دریافت-مشخصات-کامل-گروه-getgroup)
   - [مخاطبین بله (getContacts)](#دریافت-لیست-مخاطبین-getcontacts)
   - [افزودن مخاطب (addContact)](#افزودن-مخاطب-addcontact)
   - [واردسازی گروهی مخاطبین (importContacts)](#واردسازی-گروهی-مخاطبین-importcontacts)
   - [حذف مخاطب (removeContact)](#حذف-مخاطب-removecontact)
   - [جستجوی مخاطبین (searchContacts)](#جستجوی-مخاطبین-searchcontacts)
   - [ویرایش نام و بیو (editName / editAbout)](#ویرایش-نام-و-بیو-editname--editabout)
   - [نام‌کاربری (editUsername / checkUsername)](#نامکاربری-editusername--checkusername)
   - [مسدودسازی کاربر (blockUser / unblockUser)](#مسدودسازی-کاربر-blockuser--unblockuser)
11. [واکنش‌ها، پوشه‌ها، نظرسنجی و ربات‌ها (Reactions, Folders, Polls & Bots)](#-واکنشها-پوشهها-نظرسنجی-و-رباتها)
   - [واکنش به پیام‌ها (setReaction / removeReaction)](#واکنش-به-پیامها-setreaction--removereaction)
   - [پوشه‌های گفتگو (Chat Folders)](#پوشههای-گفتگو-chat-folders)
   - [نظرسنجی و آزمون (sendPoll / createPoll)](#نظرسنجی-و-آزمون-sendpoll--createpoll)
   - [کیف پول و امتیازات (getWalletCredit)](#کیف-پول-و-امتیازات-getwalletcredit)
   - [کلیک دکمه شیشه‌ای ربات (sendInlineCallback)](#کلیک-دکمه-شیشهای-ربات-sendinlinecallback)
12. [بانکداری و خدمات مالی شتابی (Banking Hub)](#-بانکداری-و-خدمات-مالی-شتابی-banking-hub)
   - [استعلام نام صاحب کارت شتاب (InquireDestinationPan)](#۱-استعلام-نام-دارنده-کارت-مقصد)
   - [انتقال کارت به کارت شتابی (TransferMoneyByCard)](#۲-انتقال-وجه-کارت-به-کارت-شتابی)
   - [استعلام موجودی کارت شتاب (getCardBalance)](#۳-استعلام-موجودی-کارت-شتابی-getcardbalance)
13. [پاکت‌های هدیه نقدی و طلا (Gift Packets - Cash & Gold)](#-پاکتهای-هدیه-نقدی-و-طلا-gift-packets)
   - [ارسال پاکت هدیه نقدی (sendGiftPacket)](#ارسال-پاکت-هدیه-نقدی-sendgiftpacket)
   - [باز کردن پاکت نقدی (openGiftPacket)](#باز-کردن-و-دریافت-پاکت-نقدی-opengiftpacket)
   - [ارسال پاکت هدیه طلا (sendGoldGiftPacket)](#ارسال-پاکت-هدیه-طلا-sendgoldgiftpacket)
   - [باز کردن پاکت طلا و برندگان (openGoldGiftPacket / getGoldGiftPacketWinners)](#باز-کردن-پاکت-طلا-و-استعلام-برندگان)
   - [دریافت توکن پرداخت پاکت (getGiftPacketPaymentToken)](#دریافت-توکن-پرداخت-پاکت-هدیه)
14. [مینی‌اپ‌ها و وب‌اپ‌های بله (Mini Apps & WebApps)](#-مینیاپها-و-وباپهای-بله-mini-apps--webapps)
   - [ساخت پارامترهای راه‌اندازی (createMiniAppParams)](#ساخت-کامل-پارامترهای-راهاندازی-مینیاپ-createminiappparams)
   - [دریافت آدرس مینی‌اپ با امضای سرور (getMiniAppUrl)](#دریافت-آدرس-مینیاپ-از-سرور-getminiappurl)
   - [دریافت هش امنیتی وب‌اپ (getWebappHash)](#دریافت-هش-امنیتی-وباپ-getwebapphash)
   - [ارسال داده از مینی‌اپ به ربات (sendMiniAppData)](#ارسال-داده-از-مینیاپ-به-ربات-sendminiappdata)
   - [دکمه منو و متدهای سفارشی (getBotMenuButton / invokeMiniAppCustomMethod)](#تنظیمات-دکمه-منو-و-متدهای-سفارشی-مینیاپ)
15. [استوری‌ها، زمان‌بندی و هوش مصنوعی (Stories, Scheduler & AI)](#-استوریها-زمانبندی-و-هوش-مصنوعی)
   - [مدیریت استوری‌ها (sendStory / getUserStories / likeStory)](#استوریهای-بله-stories-api)
   - [پیام‌های زمان‌بندی شده (scheduleMessage / loadScheduledMessages)](#پیامهای-زمانبندی-شده-scheduled-messages)
   - [خلاصه‌ساز و هوش مصنوعی تورینگ (summarizeLink / askAI)](#هوش-مصنوعی-و-خلاصهساز-بله-ai--tldr)
16. [موتور رفتار انسانی و ضد مسدودی (Humanize Engine)](#-موتور-رفتار-انسانی-و-ضد-مسدودی-humanize-engine)
17. [کاتالوگ کامل ۵۳ سرویس و ۶۳۶ متد بله (Dynamic RPC Proxy)](#-کاتالوگ-کامل-۵۳-سرویس-و-۶۳۶-متد-بله)
18. [معماری فریم‌های پروتکل (Wire Protocol)](#-معماری-فریمهای-پروتکل-wire-protocol)
19. [جدول کدهای خطای سرور بله (Error Handling)](#-جدول-کدهای-خطای-سرور-بله)

---

## 🌟 معرفی کتابخانه BaleX
کتابخانه **BaleX** با مهندسی معکوس و استخراج کامل پروتکل رسمی کلاینت بله (`web.bale.ai`) ساخته شده است. این ابزار به توسعه‌دهندگان اجازه می‌دهد انواع ربات‌های هوشمند، یوزربات‌های اتوماسیون سازمانی، کلاینت‌های سفارشی دسکتاپ و موبایل، و سامانه‌های دریافت و ارسال گزارش مالی و تراکنش بانکی را پیاده‌سازی کنند.

### مزایای اصلی:
- **عدم نیاز به مرورگر**: برخلاف سلنیوم و Puppeteer که نیازمند باز کردن مرورگر و مصرف بالای پردازنده و رم هستند، BaleX به شکل مستقیم با بسته‌های باینری Protobuf تبادل پکت می‌کند.
- **پشتیبانی دوگانه**: قابل استفاده هم به صورت پکیج **Node.js** و هم در قالب کتابخانه **Flutter / Dart**.
- **پایداری بالا**: استفاده از لایه gRPC-Web HTTP POST برای درخواست‌های حساس (لاگین و احراز هویت) و WebSocket برای استریم بلادرنگ پیام‌ها.

---

## 📦 نصب و پیش‌نیازها

### در محیط Node.js / TypeScript:
```bash
npm install balex
# یا
yarn add balex
# یا
pnpm add balex
```

### در محیط Flutter / Dart:
فایل `pubspec.yaml` را باز کرده و وابستگی را اضافه کنید:
```yaml
dependencies:
  flutter:
    sdk: flutter
  balex: ^1.2.0
  web_socket_channel: ^3.0.1
  http: ^1.2.2
```

---

## 🚀 شروع سریع (Quickstart)

```javascript
import { BaleClient } from 'balex';

async function main() {
  // راه‌اندازی کلاینت با حالت شبیه‌سازی رفتار انسانی
  const client = new BaleClient({ humanize: true });

  // ورود به حساب با نشست ذخیره‌شده یا اعتبارسنجی پیامکی
  await client.importSession(JSON.parse(process.env.BALEX_SESSION));

  // گوش دادن به پیام‌های دریافتی
  client.on('message', async (msg) => {
    console.log(`پیام از طرف ${msg.senderName}: ${msg.text}`);
    
    if (msg.text === 'سلام') {
      await client.messages.sendMessage({
        peerId: msg.senderId,
        peerType: msg.peerType,
        text: 'سلام! پیام به صورت خودکار از طریق BaleX ارسال شد. ⚡',
        replyToMessageId: msg.id,
      });
    }
  });

  await client.connect();
  console.log('یوزربات آنلاین شد و در حال گوش دادن به پیام‌هاست...');
}

main().catch(console.error);
```

---

## 🔐 احراز هویت و ورود (Authentication)

فرآیند لاگین در بله بر روی متدهای سرویس `bale.auth.v1.Auth` و از طریق فریم‌های استاندارد gRPC-Web صورت می‌پذیرد.

### ۱. ارسال کد تایید پیامکی
```javascript
const { transactionHash } = await client.auth.startPhoneAuth({
  phoneNumber: '09372570490', // پشتیبانی کامل از +98، 0098 و ارقام فارسی
  deviceTitle: 'BaleX Automation',
});

console.log('کد پیامک شد. شناسه تراکنش:', transactionHash);
```

### ۲. اعتبارسنجی کد پیامکی
کد پیامک‌شده از طرف بله **۵ رقمی** است. کتابخانه ارقام فارسی (`۰۱۲۳۴۵۶۷۸۹`) و عربی را پیش از ارسال نرمال‌سازی می‌کند:

```javascript
const loginResult = await client.auth.validateCode({
  code: '15011',
  transactionHash: transactionHash,
});

console.log('خوش آمدید:', loginResult.user.name);
console.log('توکن JWT:', loginResult.jwt);
```

### ۳. رمز عبور دومرحله‌ای (۲FA)
اگر برای حساب کاربری رمز عبور ابری تنظیم شده باشد:
```javascript
const session = await client.auth.validatePassword({
  password: 'رمز_عبور_حساب_شما',
  transactionHash: transactionHash,
});

console.log('احراز هویت دو مرحله‌ای موفق بود:', session.jwt);
```

### ۴. ذخیره و بازیابی نشست
برای جلوگیری از درخواست مکرر پیامک در هر بار اجرای اسکریپت:
```javascript
// خروجی گرفتن از نشست فعال
const sessionData = client.exportSession();
fs.writeFileSync('session.json', JSON.stringify(sessionData));

// در اجراهای بعدی: بازیابی بدون لاگین پیامکی
const saved = JSON.parse(fs.readFileSync('session.json', 'utf8'));
const client = new BaleClient();
await client.importSession(saved);
```

---

## 💬 پیام‌رسانی و رویدادهای زنده (Messaging)

### ارسال پیام ساده و پاسخ (Reply)
```javascript
// ارسال به کاربر عادی (PV)
await client.messages.sendMessage({
  peerId: 987654321,
  peerType: 'user',
  text: 'سلام! پیام ارسال‌شده از ربات BaleX',
});

// ارسال ریپلای در گروه
await client.messages.sendMessage({
  peerId: 543210987,
  peerType: 'group',
  text: 'این پاسخ به پیام شما در گروه است.',
  replyToMessageId: 88412,
});
```

### سامانه جامع رویدادها و شنونده‌های بلادرنگ (All 16 Events & Listeners)
کتابخانه BaleX از طریق استریم WebSocket از تمامی ۱۶ رویداد رسمی بله پشتیبانی می‌کند:

| نام رویداد (Event) | تگ سرور | آرگومان دریافتی | کاربرد و مفهوم |
| :--- | :--- | :--- | :--- |
| `message` | Tag 55 | `MessageEvent` | دریافت پیام جدید (متنی، چندرسانه‌ای یا پاکت هدیه) همراه با هلپرها |
| `messageEdit` | Tag 162 | `{ peer, rid, message, date }` | ویرایش متن یا محتوای پیام ارسال‌شده |
| `messageDelete` | Tag 46 | `{ peer, rids }` | حذف یک یا چند پیام در چت |
| `messageReceived` | Tag 54 | `{ peer, startDate, date }` | تایید دریافت پیام در کلاینت مقصد (یک تیک خاکستری) |
| `messageRead` | Tag 19 | `{ peer, startDate, date }` | تایید خوانده شدن پیام‌ها توسط مخاطب (دو تیک آبی) |
| `chatClear` | Tag 47 | `{ peer }` | پاکسازی کامل تاریخچه گفتگو |
| `reaction` | Tag 222 | `{ peer, rid, reactions, reactionByMe }` | ثبت یا حذف ایموجی و واکنش روی پیام |
| `typing` | Tag 6 | `{ peer, userId, typingType }` | آغاز نوشتن پیام توسط مخاطب |
| `typingStop` | Tag 81 | `{ peer, userId }` | پایان وضعیت در حال نوشتن |
| `userOnline` | Tag 7 | `{ userId, deviceType }` | آنلاین شدن مخاطب در بله |
| `userOffline` | Tag 8 | `{ userId, lastSeen }` | آفلاین شدن مخاطب و ثبت برچسب زمانی آخرین بازدید |
| `connected` | Lifecycle | `{ uid, url, timestamp }` | اتصال موفقیت‌آمیز به سرور سوکت |
| `disconnected` | Lifecycle | `{ code, reason }` | قطع اتصال سوکت |
| `status` | Lifecycle | `ConnectionStatus` | تغییر وضعیت اتصال (CONNECTING, CONNECTED, ...) |
| `error` | Error | `Error` | خطاهای شبکه، نشست یا سوکت |
| `update` | Universal | `{ type, data, raw }` | فریم خام تمام آپدیت‌ها برای پردازش سفارشی |

#### هوشمندی شیء پیام (`MessageEvent`) و هلپرهای آن:
شیء ارسالی به شنونده رویداد `message` مجهز به متدهای عملیاتی مستقیم و پرچم‌های نوع محتوا است:

```javascript
client.on('message', async (msg) => {
  console.log(`فرستنده: ${msg.senderId} | متن: ${msg.text}`);

  // پرچم‌های نوع پیام
  if (msg.isPhoto) console.log('پیام حاوی تصویر است 📸');
  if (msg.isVoice) console.log('پیام حاوی ویس است 🎙️');
  if (msg.isGiftPacket) {
    // باز کردن خودکار پاکت هدیه نقدی ریالی
    const win = await msg.openGiftPacket();
    console.log('مبلغ برنده شده از پاکت نقدی:', win.selfWinAmount, 'ریال');
  }
  if (msg.isGoldGiftPacket) {
    // باز کردن خودکار پاکت هدیه طلای بله
    const gold = await msg.openGoldGiftPacket();
    console.log('میلی‌گرم طلای برنده شده:', gold.selfWinAmount);
  }

  // متدهای عملیاتی سریع روی پیام
  if (msg.text === 'پینگ') {
    // پاسخ هوشمند با تاخیر انسانی، نمایش Seen و فرستادن تایپینگ
    await msg.reply('پونگ! 🏓');
  }

  await msg.markAsReceived(); // تیک دریافت خاکستری
  await msg.markAsRead();     // دو تیک سین آبی
  await msg.react('❤️');      // ری‌اکشن ایموجی
});
```

#### کد کامل شنونده‌های تمامی رویدادها:
```javascript
// ویرایش و حذف
client.on('messageEdit', (e) => console.log(`پیام ${e.rid} ویرایش شد.`));
client.on('messageDelete', (d) => console.log(`پیام‌های ${d.rids} حذف شدند.`));

// تیک دریافت و خوانده‌شدن
client.on('messageReceived', (r) => console.log(`تحویل تا تاریخ ${r.startDate} (تک‌تیک)`));
client.on('messageRead', (r) => console.log(`خوانده شدن تا تاریخ ${r.startDate} (دو تیک آبی)`));

// واکنش‌ها و تایپینگ
client.on('reaction', (react) => console.log(`ری‌اکشن جدید روی پیام ${react.rid}:`, react.reactions));
client.on('typing', (t) => console.log(`کاربر ${t.userId} در حال تایپ...`));
client.on('typingStop', (t) => console.log(`تایپ کاربر ${t.userId} پایان یافت.`));

// حضور و آنلاین بودن
client.on('userOnline', (u) => console.log(`کاربر ${u.userId} آنلاین شد 🟢`));
client.on('userOffline', (u) => console.log(`کاربر ${u.userId} آفلاین شد 🔴`));

// چرخه اتصال
client.on('connected', (c) => console.log(`اتصال برقرار شد برای UID: ${c.uid}`));
client.on('disconnected', (d) => console.warn(`اتصال قطع شد: ${d.reason}`));
client.on('error', (err) => console.error('خطای کلاینت:', err));

await client.connect();
```

### دریافت لیست گفتگوها (LoadDialogs)
دریافت تمام گفتگوهای فعال، کانال‌ها و گروه‌های سنجاق‌شده:
```javascript
const { dialogs, users, groups } = await client.messaging.loadDialogs({
  limit: 30,
  minDate: 0,
});

for (const d of dialogs) {
  console.log(`گفتگو: ${d.title} | پیام خوانده نشده: ${d.unreadCount}`);
}
```

### دریافت تاریخچه گفتگو (LoadHistory)
```javascript
const history = await client.messaging.loadHistory({
  peerId: 987654321,
  peerType: 'user',
  limit: 50,
  direction: 'older',
});

console.log(`تعداد ${history.messages.length} پیام دریافت شد.`);
```

---

## 📸 ارسال چندرسانه‌ای (Media Messaging)

تمامی انواع رسانه‌ها طبق پروتکل رسمی Document بله (تگ شماره ۴ پروتوباف) با ساختار `DocumentEx` و پشتیبانی کامل از استریم، پیش‌نمایش و جزئیات ارسال می‌شوند:

### ارسال عکس با کپشن و ابعاد (sendPhoto)
```javascript
await client.sendPhoto(peerId, {
  fileId: 1048576,                     // شناسه فایل آپلود شده در سرور نسیم
  accessHash: 9876543210123456n,       // هش امنیتی اعتبارسنجی
  fileSize: 245000,                    // حجم تصویر به بایت
  name: 'cover.jpg',                   // نام فایل
  width: 1280,                         // عرض تصویر به پیکسل
  height: 720,                         // ارتفاع تصویر به پیکسل
  caption: 'تصویر ارسالی از طریق کتابخانه قدرتمند BaleX 🚀'
});
```

### ارسال پیام صوتی و ویس با شکل موج (sendVoice)
ارسال صدا به عنوان وویس به همراه مدت زمان دقیق و شکل‌موج فرکانسی (Waveform):
```javascript
await client.sendVoice(peerId, {
  fileId: 2097152,
  accessHash: 8765432109876543n,
  fileSize: 64000,
  duration: 14,                        // مدت زمان وویس به ثانیه
  waveForm: Buffer.from([0x01, 0x05, 0x1a, 0x22, 0x08]), // شکل موج صوتی
  caption: 'پیام صوتی راهنمای پروژه 🎙️'
});
```

### ارسال موزیک و آهنگ با پلیر بله (sendAudio)
پخش مستقیم آهنگ در پلیر رسمی بله با مشخصات خواننده و عنوان:
```javascript
await client.sendAudio(peerId, {
  fileId: 3145728,
  accessHash: 7654321098765432n,
  fileSize: 5200000,
  name: 'track.mp3',
  duration: 215,                       // طول مدت موزیک (ثانیه)
  title: 'آهنگ جدید',
  performer: 'خواننده قطعه',
  caption: 'موزیک ارسالی با پخش‌کننده داخلی بله 🎵'
});
```

### ارسال ویدیو (sendVideo)
ارسال ویدیو به همراه رزولوشن، کیفیت و مدت زمان پخش:
```javascript
await client.sendVideo(peerId, {
  fileId: 4194304,
  accessHash: 6543210987654321n,
  fileSize: 18500000,
  name: 'tutorial.mp4',
  width: 1920,
  height: 1080,
  duration: 52,                        // ۵۲ ثانیه
  caption: 'ویدیوی آموزشی استفاده از بله ایکس 🎥'
});
```

### ارسال فایل و اسناد دانلودی (sendDocument)
پشتیبانی از کلیه فرمت‌ها از قبیل PDF, ZIP, APK, RAR و ...:
```javascript
await client.sendDocument(peerId, {
  fileId: 5242880,
  accessHash: 5432109876543210n,
  fileSize: 14200000,
  name: 'BaleX-Handbook.pdf',
  mimeType: 'application/pdf',
  caption: 'کتابچه راهنمای جامع مستندات فنی 📑'
});
```

### ارسال استیکر بله (sendSticker)
ارسال استیکر با شناسه‌های استیکر و بسته استیکر:
```javascript
await client.sendSticker(peerId, 123456, 987654321n, 555);
```

---

## 🛠️ مدیریت پیام‌ها و چت‌ها (Message Management)

### ویرایش متن پیام ارسال شده (editMessage)
```javascript
await client.editMessage(peerId, messageId, 'متن جدید و ویرایش‌شده پیام ✍️');
```

### فوروارد و هدایت پیام‌ها (forwardMessages)
```javascript
await client.forwardMessages(destinationPeerId, sourcePeerId, [mid1, mid2]);
```

### پین کردن پیام (pinMessage)
```javascript
await client.pinMessage(peerId, messageId);
```

### حذف پیام‌ها (deleteMessages)
```javascript
await client.deleteMessages(peerId, [mid1, mid2]);
```

### پاکسازی کامل چت (clearChat)
```javascript
await client.clearChat(peerId);
```

---

## 👥 مدیریت گروه‌ها و کانال‌ها (Group Administration)

### ساخت گروه جدید (createGroup)
```javascript
const group = await client.createGroup('گروه توسعه‌دهندگان BaleX', [userId1, userId2]);
console.log('گروه با شناسه ایجاد شد:', group.groupId);
```

### افزودن و دعوت اعضا (inviteMembers)
```javascript
await client.inviteMembers(groupId, [userId1, userId2, userId3]);
```

### اخراج عضو از گروه (kickMember)
```javascript
await client.kickMember(groupId, userId);
```

### تغییر عنوان گروه (setGroupTitle)
```javascript
await client.setGroupTitle(groupId, 'نام رسمی و جدید گروه 📢');
```

### ترک گروه (leaveGroup)
```javascript
await client.leaveGroup(groupId);
```

---

## 👤 کاربران، مخاطبین و پروفایل (Users, Contacts & Profile)

### دریافت پروفایل کاربر (getUser)
```javascript
const user = await client.getUser(userId);
console.log(`نام: ${user.name} | نام کاربری: @${user.username}`);
```

### دریافت مشخصات کامل گروه (getGroup)
```javascript
const group = await client.getGroup(groupId);
console.log(`عنوان: ${group.title} | تعداد اعضا: ${group.membersCount}`);
```

### دریافت لیست مخاطبین (getContacts)
```javascript
const contacts = await client.getContacts();
contacts.users.forEach(u => console.log(`مخاطب: ${u.name} - شماره: ${u.phone}`));
```

### افزودن مخاطب (addContact)
```javascript
// پشتیبانی کامل از ارقام فارسی و فرمت‌های مختلف شماره تماس
const contact = await client.addContact('۰۹۱۲۳۴۵۶۷۸۹', 'علی رضایی');
console.log(`مخاطب افزوده شد: ${contact.name} (ID: ${contact.id})`);

// یا با UID و AccessHash
await client.addContactByUid(1234567, 987654321n);
```

### واردسازی گروهی مخاطبین (importContacts)
```javascript
const result = await client.importContacts([
  { phone: '09121111111', name: 'مهندس حسینی' },
  { phone: '09352222222', name: 'سارا احمدی' },
  { phone: '+989193333333', name: 'پشتیبانی فنی' }
]);
console.log(`تعداد ${result.users.length} مخاطب در سرور بله همگام‌سازی شدند.`);
```

### حذف مخاطب (removeContact)
```javascript
await client.removeContact(1234567, 0n);
```

### جستجوی مخاطبین (searchContacts)
```javascript
const results = await client.searchContacts('علی');
console.log('مخاطبین یافته شده:', results.users);
```

### ویرایش نام و بیو (editName / editAbout)
```javascript
// تغییر نام نمایشی کاربر
await client.editName('امیرحسین راد');

// ویرایش متن بیوگرافی (About)
await client.editAbout('توسعه‌دهنده سیستم‌های بلادرنگ و پروژه‌های BaleX 🚀');
```

### نام‌کاربری (editUsername / checkUsername)
```javascript
// بررسی آزاد بودن نام کاربری
const check = await client.checkUsername('balex_bot');

// تنظیم نام کاربری (آیدی بله)
await client.editUsername('balex_bot');
```

### مسدودسازی کاربر (blockUser / unblockUser)
```javascript
// بلاک کردن کاربر
await client.blockUser(99887766);

// آنبلاک کردن کاربر
await client.unblockUser(99887766);

// دریافت لیست کاربران مسدود شده
const blocked = await client.loadBlockedUsers();
```

---

## ⚡ واکنش‌ها، پوشه‌ها، نظرسنجی و ربات‌ها

### واکنش به پیام‌ها (setReaction / removeReaction)
```javascript
// ثبت ری‌اکشن ایموجی روی پیام
await client.setReaction(peerId, messageRandomId, '❤️');

// حذف ری‌اکشن قبلی
await client.removeReaction(peerId, messageRandomId, '❤️');

// استعلام آمار واکنش‌های پیام
const reactions = await client.getReactions(peerId, [messageRandomId]);
```

### پوشه‌های گفتگو (Chat Folders)
```javascript
// ساخت پوشه اختصاصی جدید
const folder = await client.createFolder('پروژه‌های کاری', [peer1, peer2]);

// دریافت لیست پوشه‌ها
const folders = await client.loadFolders();

// حذف پوشه
await client.deleteFolder(folderId);
```

### نظرسنجی و آزمون (sendPoll / createPoll)
```javascript
// ارسال نظرسنجی در گروه یا کانال
await client.sendPoll(peerId, 'کدام زبان برنامه‌نویسی را ترجیح می‌دهید؟', [
  'JavaScript / Node.js',
  'Dart / Flutter',
  'Python'
], {
  isAnonymous: true,
  isMultipleChoice: false
});

// مشاهده نتایج زنده آراء
const pollStats = await client.getPollResults(pollId);

// بستن نظرسنجی
await client.closePoll(pollId);
```

### کیف پول و امتیازات (getWalletCredit)
```javascript
// دریافت اطلاعات و موجودی کیف پول‌های کاربر
const wallets = await client.getWalletCredit();

// استعلام امتیازات حساب
const points = await client.getWalletPoints();
```

### کلیک دکمه شیشه‌ای ربات (sendInlineCallback)
```javascript
// کلیک روی دکمه اینلاین کیبورد بات بله
await client.sendInlineCallback(botPeer, messageId, 'action:confirm_order');
```

---

## 💳 بانکداری و خدمات مالی شتابی (Banking Hub)

بله دارای مجوز اتصال مستقیم به سوئیچ شاپرک و سامانه پیوند بانک ملی ایران است. کلیه متدهای مالی در کلاینت BaleX استخراج شده و در دسترس هستند.

### ۱. استعلام نام دارنده کارت مقصد
پیش از انتقال وجه، نام و نام خانوادگی صاحب کارت را استعلام کنید:
```javascript
const inquiry = await client.banking.inquireDestinationPan({
  sourceCardNumber: '6037991812345678',      // کارت مبدا
  destinationCardNumber: '6104337890123456', // کارت مقصد
  amountRials: 5000000,                      // مبلغ (۵۰۰,۰۰۰ تومان به ریال)
});

console.log('نام صاحب حساب:', inquiry.cardHolderName); // مثال: علی محمدی
console.log('توکن استعلام:', inquiry.inquiryToken);
```

### ۲. انتقال وجه کارت به کارت شتابی
تراکنش نهایی انتقال وجه با رمز پویا:
```javascript
const receipt = await client.banking.transferMoneyByCard({
  sourcePan: '6037991812345678',
  destinationPan: '6104337890123456',
  amountRials: 5000000,
  cvv2: '1234',
  expireDate: '0628', // سال/ماه (۱۴۰۶/۰۸)
  pin2: '984512',     // رمز دوم یکبار مصرف پیامک شده
  inquiryToken: inquiry.inquiryToken,
  description: 'تسویه سهم هاست و سرور',
});

console.log('تراکنش با موفقیت انجام شد!');
console.log('شماره پیگیری (RRN):', receipt.rrn);
console.log('شماره ارجاع شاپرک:', receipt.trackingCode);
```

### ۳. استعلام موجودی کارت شتابی (getCardBalance)
استعلام مانده حساب کارت بانکی متصل به شتاب با رمز دوم پویا:
```javascript
const balanceInfo = await client.getCardBalance({
  sourcePan: '6037991812345678', // ۱۶ رقم کارت مبدا
  pin2: '984512',                 // رمز دوم پویا
  cvv2: '345',                    // کد سه یا چهار رقمی CVV2
  expireDate: '0628'              // تاریخ انقضا (ماه و سال)
});

console.log('موجودی کارت:', balanceInfo.balanceRials, 'ریال');
console.log('مبلغ قابل برداشت:', balanceInfo.availableBalanceRials, 'ریال');
```

---

## 🎁 پاکت‌های هدیه نقدی و طلا (Gift Packets - Cash & Gold)

پیام‌رسان بله از دو نوع پاکت هدیه پشتیبانی می‌کند: **پاکت هدیه نقدی ریالی** (از طریق کیف پول بله بر بستر `bale.giftpacket.v1.GiftPacket`) و **پاکت هدیه طلا** (بر بستر `bale.balebank.v1.GoldGiftPacket`). کتابخانه BaleX امکان ارسال و باز کردن هر دو نوع پاکت را به سادگی در اختیارتان قرار می‌دهد.

### ارسال پاکت هدیه نقدی (sendGiftPacket)
ارسال پاکت هدیه به چت شخصی، گروه یا کانال با قابلیت تقسیم شانسی (Random) یا مساوی (Equal):

```javascript
// ارسال پاکت هدیه ۵۰۰ هزار ریالی بین ۵ نفر به صورت شانسی
const res = await client.sendGiftPacket({
  peer: 123456789,            // کاربر، گروه یا کانال مقصد
  amount: 500000,             // مبلغ کل پاکت (ریال)
  count: 5,                   // تعداد افراد دریافت‌کننده
  message: 'عیدی نوروز مبارک! 🌸', // متن روی پاکت
  givingType: 0,              // ۰: شانسی (Random)، ۱: مساوی (Equal)
  coverId: 1,                 // طرح جلد پاکت
  showTotalAmount: true       // نمایش مبلغ کل برای همه
});

console.log('پاکت هدیه معمولی نقدی با موفقیت ارسال شد.');
```

### باز کردن و دریافت پاکت نقدی (openGiftPacket)
هنگامی که پیامی حاوی پاکت هدیه نقدی دریافت می‌کنید، می‌توانید با متد `openGiftPacket` آن را باز کنید و سهم خود را مستقیماً به کیف پول انتقال دهید:

```javascript
// باز کردن پاکت هدیه نقدی بر اساس مشخصات پیام
const result = await client.openGiftPacket({
  peer: 123456789,            // شناسه پیری که پیام پاکت در آن آمده
  randomId: 9876543210123n,   // شناسه رندوم پیام پاکت هدیه
  date: Date.now(),           // زمان پیام
  walletId: 'کیف_پول_مقصد'    // شناسه کیف پول (اختیاری)
});

console.log('وضعیت پاکت:', result.status);
console.log('مبلغ برنده شده شما:', result.selfWinAmount, 'ریال');
console.log('رتبه شما در باز کردن پاکت:', result.rank);
console.log('تعداد افرادی که تاکنون پاکت را باز کرده‌اند:', result.openedCount);
console.log('لیست دریافت‌کنندگان:', result.giftReceivers);
```

### دریافت توکن پرداخت پاکت هدیه (getGiftPacketPaymentToken)
جهت پرداخت و فعال‌سازی پاکت هدیه ایجاد شده از درگاه پرداخت:
```javascript
const payToken = await client.getGiftPacketPaymentToken({ 
  token: 'payment_token_123', 
  amount: 500000 
});
console.log('توکن پرداخت:', payToken);
```

### ارسال پاکت هدیه طلا (sendGoldGiftPacket)
ارسال شمش طلا بر حسب میلی‌گرم در قالب پاکت هدیه بله‌بانک:

```javascript
const goldPacket = await client.sendGoldGiftPacket({
  peer: 123456789,
  amountMilligrams: 100,      // ۱۰۰ میلی‌گرم طلا
  count: 3,                   // ۳ برنده
  message: 'هدیه طلای بله تقدیم به شما! 🪙',
  givingType: 0               // ۰: شانسی، ۱: مساوی
});

console.log('شناسه پاکت طلای ارسالی:', goldPacket.giftPacketId);
```

### باز کردن پاکت طلا و استعلام برندگان
برای دریافت سهم طلا از پاکت باز شده و استعلام لیست برندگان:

```javascript
const packetId = 987654321n;

// ۱. باز کردن و دریافت سهم طلا
const claimResult = await client.openGoldGiftPacket(packetId);
console.log('میلی‌گرم طلای برنده شده:', claimResult.selfWinAmount);
console.log('تعداد افراد بازکننده:', claimResult.openedCount);

// ۲. مشاهده شناسه‌های کاربری برندگان پاکت طلا
const winners = await client.getGoldGiftPacketWinners(packetId);
console.log('لیست برندگان طلا:', winners);
```

---

## 📱 مینی‌اپ‌ها و وب‌اپ‌های بله (Mini Apps & WebApps)

پیام‌رسان بله از وب‌اپلیکیشن‌ها و مینی‌اپ‌ها بر بستر پروتکل رسمی `bale.appzar.v1.Appzar` و `bale.ketf.v1.Ketf` پشتیبانی می‌کند. کتابخانه BaleX تمامی متدهای مورد نیاز برای احراز هویت، تولید رشته `initData`، امضای امنیتی هش سرور و تبادل داده را فراهم نموده است.

### ساخت کامل پارامترهای راه‌اندازی مینی‌اپ (createMiniAppParams)
این متد هش امنیتی رسمی بله را دریافت کرده و رشته `initData` استاندارد تلگرام/بله، آبجکت اطلاعات کاربر، پارامترهای تم و `launchUrl` کامل همراه با فرگمنت هش (`#tgWebAppData=...`) را آماده می‌سازد:

```javascript
const botId = 123456; // شناسه ربات دارنده مینی‌اپ

const appParams = await client.createMiniAppParams(botId, {
  appUrl: 'https://my-mini-app.example.com',
  startParam: 'ref_user_789',
  platform: 'weba'
});

console.log('رشته اعتبارسنجی (initData):', appParams.initData);
console.log('امضای امنیتی سرور (hash):', appParams.hash);
console.log('شناسه کوئری (queryId):', appParams.queryId);
console.log('اطلاعات کاربر (user):', appParams.user);
console.log('آدرس کامل جهت بارگذاری در وب‌ویو (launchUrl):', appParams.launchUrl);
// نمونه خروجی launchUrl:
// https://my-mini-app.example.com/#tgWebAppData=query_id%3D...%26user%3D...%26auth_date%3D...%26hash%3D...&tgWebAppThemeParams=...&tgWebAppPlatform=weba
```

### دریافت آدرس مینی‌اپ از سرور (getMiniAppUrl)
متد رسمی سرور اپ‌زار بله جهت دریافت لینک احراز هویت شده وب‌اپلیکیشن:

```javascript
const { url, queryId } = await client.getMiniAppUrl({
  botUserId: botId,
  screenMode: 1, // ۱: تمام‌صفحه (Fullscreen)، ۰: پیش‌فرض
  directLink: 'start_param_value'
});

console.log('لینک اجرای وب‌اپ:', url);
```

### دریافت هش امنیتی وب‌اپ (getWebappHash)
دریافت هش اختصاصی ربات برای تایید نشست کاربر (سرویس `bale.ketf.v1.Ketf`):

```javascript
const hashInfo = await client.getWebappHash(botId, 'custom_payload_data');
console.log('هش امنیتی:', hashInfo.hash);
console.log('شناسه کوئری:', hashInfo.queryId);
console.log('زمان امضا:', hashInfo.authDate);
```

### ارسال داده از مینی‌اپ به ربات (sendMiniAppData)
هنگامی که مینی‌اپ با کاربر تعامل کرد و رویداد `sendData` را صدا زد، می‌توانید داده‌های حاصل را به ربات بفرستید:

```javascript
await client.sendMiniAppData({
  botUserId: botId,
  queryId: hashInfo.queryId,
  data: { score: 250, action: 'level_complete' },
  buttonText: 'مشاهده نتیجه'
});

console.log('داده‌ها با موفقیت به ربات ارسال شد.');
```

### تنظیمات دکمه منو و متدهای سفارشی مینی‌اپ
```javascript
// دریافت دکمه منوی ربات
const menuBtn = await client.getBotMenuButton(botId);
console.log('دکمه منو:', menuBtn);

// فراخوانی متد سفارشی مینی‌اپ
const customRes = await client.invokeMiniAppCustomMethod({
  botUserId: botId,
  method: 'getUserTier',
  params: { userId: 123456 }
});
console.log('پاسخ متد سفارشی:', customRes);
```

---

## 🎬 استوری‌ها، زمان‌بندی و هوش مصنوعی (Stories, Scheduler & AI)

### استوری‌های بله (Stories API)
مدیریت کامل استوری‌ها بر بستر سرویس `bale.story.v1.Story`:

```javascript
// ۱. انتشار استوری جدید
await client.sendStory({
  caption: 'روز برفی و زیبا در تهران ❄️'
});

// ۲. مشاهده استوری‌های فعال یک کاربر
const stories = await client.getUserStories(123456789);
console.log('استوری‌های فعال:', stories);

// ۳. مشاهده بینندگان استوری
const viewers = await client.getStoryViewers(stories[0]?.storyId);
console.log('بینندگان استوری:', viewers);

// ۴. لایک و واکنش به استوری
await client.likeStory(stories[0]?.storyId, '❤️');

// ۵. حذف استوری
await client.deleteStory(stories[0]?.storyId);
```

### پیام‌های زمان‌بندی شده (Scheduled Messages)
ارسال خودکار پیام‌ها در ساعت و تاریخ مشخص در آینده بر بستر سرویس `bale.schedule.v1.Scheduler`:

```javascript
// تنظیم ارسال پیام برای ۲ ساعت بعد
const sendTime = Date.now() + (2 * 60 * 60 * 1000);

await client.scheduleMessage({
  peer: 123456789,
  text: 'یادآوری: جلسه هماهنگی پروژه BaleX آغاز شد.',
  sendAtDate: sendTime
});

// دریافت لیست پیام‌های زمان‌بندی‌شده
const tasks = await client.loadScheduledMessages(123456789);
console.log('پیام‌های زمان‌بندی‌شده:', tasks);

// لغو یک پیام زمان‌بندی شده
await client.deleteScheduledMessage(123456789, tasks[0]?.taskId);
```

### هوش مصنوعی و خلاصه‌ساز بله (AI & TLDR)
استفاده از هوش مصنوعی تورینگ بله و موتور خلاصه‌ساز مقالات و لینک‌ها:

```javascript
// ۱. خلاصه‌سازی یک پیوند یا صفحه وب با Bale TLDR
const summary = await client.summarizeLink('https://bale.ai');
console.log('خلاصه محتوا:', summary);

// ۲. پرسش و پاسخ هوشمند از هوش مصنوعی بله
const aiAnswer = await client.askAI('ساعت کاری شعب بانک ملی چگونه است؟');
console.log('پاسخ هوش مصنوعی:', aiAnswer);
```

---

## 🕵️‍♂️ موتور رفتار انسانی و ضد مسدودی (Humanize Engine)

سرورهای بله الگوهای تکراری و ماشینی (مانند ارسال آنی پیام بدون فرستادن وضعیت تایپ) را شناسایی می‌کنند. فعال بودن ماژول Humanize رفتار انسان واقعی را با دقت بالا شبیه‌سازی می‌کند:

```javascript
const client = new BaleClient({
  humanize: {
    enabled: true,
    typingSimulation: true,     // محاسبه زمان تایپ بر اساس تعداد کلمات
    readingDelay: true,         // تاخیر خواندن ۲ تا ۵ ثانیه پیش از پاسخ
    typingSpeedWpm: 45,         // سرعت متوسط تایپ کاربر عادی
    randomDelayVariation: 0.3,  // نوسان تصادفی زمان‌ها با توزیع نرمال
    onlineHeartbeat: true,      // ارسال دوره‌ای پینگ آنلاین
  }
});
```

---

## ⚡ کاتالوگ کامل ۵۳ سرویس و ۶۳۶ متد بله (Dynamic RPC Proxy)

کتابخانه BaleX تمامی ۵۳ سرویس gRPC و ۶۳۶ متد RPC رسمی استخراج شده از بله را به صورت پویا پروکسی می‌کند. می‌توانید مستقیماً از طریق فضای نام متناظر یا متد عمومی `invoke` هر سرویسی را صدا بزنید:

```javascript
// ۱. فراخوانی از طریق فضای نام اختصاصی
await client.presence.setOnline({ isOnline: true, timeout: 60000, deviceType: 1 });
await client.users.getContacts({});
await client.groups.inviteUser({ groupId: 123456, users: [{ type: 1, id: 987654 }] });

// ۲. فراخوانی عمومی با invoke
const res = await client.invoke('bale.presence.v1.Presence', 'SetOnline', {
  isOnline: true,
  timeout: 60000,
  deviceType: 1
});
```

| فضای نام (Namespace) | نام کامل سرویس gRPC | توضیحات عملکردی |
| :--- | :--- | :--- |
| `client.auth` | `bale.auth.v1.Auth` | احراز هویت، اعتبارسنجی پیامک، رمز عبور دو مرحله‌ای و خروج |
| `client.messaging` | `bale.messaging.v2.Messaging` | ارسال و ویرایش پیام، فوروارد، حذف، پین و تاریخچه چت |
| `client.banking` | `bale.banking.v1.Banking` | استعلام شتابی کارت مقصد، انتقال وجه، موجودی و پاکت طلا |
| `client.groups` | `bale.groups.v1.Groups` | ایجاد گروه، عضوگیری، اخراج، تغییر عنوان و خروج |
| `client.presence` | `bale.presence.v1.Presence` | وضعیت آنلاین بودن، ارسال تایپینگ، لایو سابسکرایب |
| `client.users` | `bale.users.v1.Users` | پروفایل کاربر، دفترچه تلفن و جستجوی مخاطبان |
| `client.files` | `ai.bale.server.Files` | دریافت آدرس‌های آپلود و دانلود فایل از سرورهای نسیم بله |

---

## 🧩 معماری فریم‌های پروتکل (Wire Protocol)

فریم‌های gRPC-Web در بله دارای ساختار ۵ بایتی پیشوند هستند:
```text
┌──────────────┬───────────────────────────────┬────────────────────────────┐
│ Flag (1 byte)│ Length (4 bytes, Big-Endian)  │ Protobuf Payload (N bytes) │
├──────────────┼───────────────────────────────┼────────────────────────────┤
│  0x00 / 0x80 │          uint32 length        │ binary protobuf wire       │
└──────────────┴───────────────────────────────┴────────────────────────────┘
```
- **Flag 0x00**: فریم داده‌های ورودی / خروجی
- **Flag 0x80**: فریم تریلرهای پایانی وضعیت gRPC
- **Length**: طول محتوای باینری پروتوباف

---

## ⚠️ جدول کدهای خطای سرور بله

| کد خطای سرور | مفهوم و علت | نحوه مدیریت در BaleX |
| :--- | :--- | :--- |
| `PHONE_CODE_INVALID` | کد تایید پیامک نادرست است | کتابخانه ارقام فارسی را خودکار تصحیح می‌کند |
| `PHONE_CODE_EXPIRED` | کد پیامک منقضی شده است | فراخوانی مجدد `startPhoneAuth` برای دریافت کد جدید |
| `PHONE_PASSWORD_INVALID` | رمز عبور ۲FA اشتباه است | ورود رمز عبور صحیح با `validatePassword` |
| `FLOOD_WAIT` | تعداد درخواست فراتر از حد مجاز است | انتظار خودکار مطابق زمان اعلامی سرور |
| `INVALID_PAN` | شماره کارت مقصد نامعتبر است | اعتبارسنجی الگوریتم Luhn پیش از استعلام |
| `4401 onUnauthenticated` | نشست سوکت منقضی شده است | تمدید خودکار توکن JWT با متد Refresh |

---

## 📄 مجوز و پشتیبانی
این پروژه تحت پروانه [MIT License](LICENSE) منتشر شده است. هرگونه استفاده تحقیقاتی، توسعه کلاینت و ربات‌های خودکار مجاز می‌باشد.

</div>
