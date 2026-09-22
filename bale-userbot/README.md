<div align="center" dir="rtl">

# 🚀 BaleX — کتابخانه جامع پروتکل رسمی بله

[![Version](https://img.shields.io/badge/version-1.2.0-emerald.svg?style=for-the-badge)](https://github.com/Zellias/balex)
[![Protocol](https://img.shields.io/badge/protocol-Protobuf%20%7C%20gRPC--Web-5865F2.svg?style=for-the-badge)](https://github.com/Zellias/balex)
[![Platform](https://img.shields.io/badge/platform-Node.js%20%7C%20TypeScript%20%7C%20Go-F59E0B.svg?style=for-the-badge)](https://github.com/Zellias/balex)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)

**پیاده‌سازی مستقل، پرسرعت و خالص پروتکل باینری پیام‌رسان بله و Bot API رسمی، بدون نیاز به مرورگر یا گوشی، همراه با پشتیبانی از سیستم مالی کارت‌به‌کارت، موتور ضد مسدودی و قابلیت اجرای مستقیم از زبان Go (Golang).**

[📖 مشاهده سایت مستندات آنلاین (GitHub Pages)](https://zellias.github.io/balex/)

---

</div>

<div dir="rtl">

## 📑 فهرست مطالب
1. [معرفی کتابخانه BaleX](#-معرفی-کتابخانه-balex)
2. [ویژگی‌های کلیدی](#-ویژگیهای-کلیدی)
3. [نصب و پیش‌نیازها (از جمله گیت‌هاب)](#-نصب-و-پیشنیازها)
4. [شروع سریع (Quickstart)](#-شروع-سریع-quickstart)
5. [احراز هویت و ورود (Authentication)](#-احراز-هویت-و-ورود-authentication)
   - [ارسال کد تایید (StartPhoneAuth)](#۱-ارسال-کد-تایید-پیامکی)
   - [اعتبارسنجی کد ۵ رقمی (ValidateCode)](#۲-اعتبارسنجی-کد-پیامکی)
   - [رمز عبور دومرحله‌ای (ValidatePassword)](#۳-رمز-عبور-دومرحلهای-۲fa)
   - [ذخیره و بازیابی نشست (Session Persistence)](#۴-ذخیره-و-بازیابی-نشست)
6. [پیام‌رسانی و رویدادهای زنده (Messaging)](#-پیامرسانی-و-رویدادهای-زنده-messaging)
   - [ارسال پیام ساده و ریپلای](#ارسال-پیام-ساده-و-پاسخ-reply)
   - [کاتالوگ جامع رویدادهای زنده سوکت (۶۰+ رویداد)](#سامانه-جامع-رویدادها-و-کاتالوگ-۶۰-رویداد-زنده-سوکت)
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
20. [بازوهای رسمی بله (Official Bale HTTP Bot API - docs.bale.ai)](#-بازوهای-رسمی-بله-official-bale-http-bot-api)
21. [اتصال و اجرا در زبان Go (Golang Integration)](#-اتصال-و-اجرا-در-زبان-go-golang-integration)

---

## 🌟 معرفی کتابخانه BaleX
کتابخانه **BaleX** با مهندسی معکوس و استخراج کامل پروتکل رسمی کلاینت بله (`web.bale.ai`) ساخته شده است. این ابزار به توسعه‌دهندگان اجازه می‌دهد انواع ربات‌های هوشمند، یوزربات‌های اتوماسیون سازمانی سمت سرور، سامانه‌های دریافت و ارسال گزارش مالی، تراکنش بانکی و بات‌های رسمی را بدون نیاز به گوشی، شبیه‌ساز یا مرورگر پیاده‌سازی کنند.

### مزایای اصلی:
- **عدم نیاز به مرورگر یا گوشی**: بدون باز کردن مرورگر و بدون نیاز به گوشی روشن، بسته‌های باینری Protobuf را با سرورهای بله تبادل می‌کند.
- **پشتیبانی از سرور و Go**: قابل اجرا در **Node.js** و همچنین اتصال و فراخوانی بلادرنگ از طریق زبان **Go (Golang)** با پل ارتباطی IPC (STDIO) و HTTP REST.
- **پایداری بالا**: استفاده از لایه gRPC-Web HTTP POST برای درخواست‌های حساس و WebSocket برای استریم بلادرنگ پیام‌ها.

---

## 📦 نصب و پیش‌نیازها

### روش ۱: نصب مستقیم از گیت‌هاب (GitHub)
برای نصب کتابخانه مستقیماً از روی ریپازیتوری گیت‌هاب:
```bash
# نصب با شناسه گیت‌هاب
npm install github:Zellias/balex

# یا با آدرس کامل گیت
npm install git+https://github.com/Zellias/balex.git

# یا با Yarn و pnpm
pnpm add github:Zellias/balex
yarn add github:Zellias/balex
```

### روش ۲: نصب از طریق npm
```bash
npm install balex
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

### سامانه جامع رویدادها و کاتالوگ ۶۰+ رویداد زنده سوکت

کتابخانه BaleX از طریق استریم اختصاصی WebSocket از تمامی بیش از ۶۰ رویداد رسمی پروتکل بله پشتیبانی می‌کند. رویدادها به صورت خودکار از فریم‌های باینری Protobuf سرور بله (تگ‌های ۱ تا ۵۴۳۵۵) دیکود شده و از طریق `EventEmitter` به اپلیکیشن تحویل داده می‌شوند:

| نام رویداد (Event) | تگ سرور | دسته‌بندی | شرح و کاربرد در بله |
| :--- | :--- | :--- | :--- |
| **`message`** | Tag 55 | پیام‌رسانی | دریافت پیام جدید (متنی، رسانه‌ای، پاکت هدیه، پیام سرویس) همراه با متدهای هوشمند عملیاتی |
| **`messageEdit`** | Tag 162 | پیام‌رسانی | ویرایش متن، کپشن یا محتوای پیام ارسال‌شده |
| **`messageDelete`** | Tag 46 | پیام‌رسانی | حذف یک یا چند پیام در گفتگو توسط کاربر یا مدیر چت |
| **`chatClear`** | Tag 47 | پیام‌رسانی | پاکسازی کامل تاریخچه گفتگو برای دو طرف |
| **`chatDelete`** | Tag 48 | پیام‌رسانی | حذف کل گفتگو از لیست چت‌ها |
| **`messageReceived`** | Tag 54 | پیام‌رسانی | تایید رسیدن پیام به دستگاه مقصد (تک‌تیک خاکستری) |
| **`messageRead`** | Tag 19 | پیام‌رسانی | تایید خوانده شدن پیام توسط مخاطب (دو تیک آبی) |
| **`messageReadByMe`** | Tag 50 | پیام‌رسانی | علامت‌گذاری پیام به عنوان خوانده‌شده توسط اکانت خودمان |
| **`chatShow`** | Tag 93 | پیام‌رسانی | خروج گفتگو از حالت مخفی و نمایش مجدد در لیست چت‌ها |
| **`chatArchive`** | Tag 94 | پیام‌رسانی | آرشیو شدن گفتگو یا پوشه |
| **`chatFavourite`** | Tag 95 | پیام‌رسانی | افزودن گفتگو به برگزیده‌ها (Favorite) |
| **`messageDateChanged`** | Tag 163 | پیام‌رسانی | تغییر برچسب زمانی پیام |
| **`stickerCollectionsChanged`** | Tag 164 | پیام‌رسانی | به‌روزرسانی کالکشن‌ها و پکیج‌های استیکر کاربر |
| **`messageQuotedChanged`** | Tag 169 | پیام‌رسانی | تغییر یا حذف پیام مرجع ریپلای شده |
| **`mentionReadByMe`** | Tag 52829 | پیام‌رسانی | سین شدن پیام‌های حاوی منشن کاربر |
| **`pinnedDialogsChanged`** | Tag 52830 | پیام‌رسانی | تغییر در لیست یا ترتیب گفتگوهای پین‌شده |
| **`dialogsMarkedAsRead`** | Tag 54335 | پیام‌رسانی | علامت‌گذاری گروهی گفتگوها به عنوان خوانده‌شده |
| **`dialogsMarkedAsUnread`** | Tag 54336 | پیام‌رسانی | علامت‌گذاری گروهی چت‌ها به عنوان خوانده‌نشده |
| **`dialogsUnpinned`** | Tag 54339 | پیام‌رسانی | برداشته شدن سنجاق و پین گفتگو |
| **`messagePinned`** | Tag 54340 | پیام‌رسانی | پین و سنجاق شدن پیام جدید در گروه یا کانال |
| **`messagesUnPinned`** | Tag 54341 | پیام‌رسانی | برداشته شدن سنجاق یک یا چند پیام |
| **`dialogArchiveStatus`** | Tag 54345 | پیام‌رسانی | تغییر وضعیت فعال/غیرفعال آرشیو گفتگو |
| **`messageStreamChunks`** | Tag 54351 | پیام‌رسانی | دریافت بسته‌های زنده متن تولیدی هوش مصنوعی یا استریم (Streaming) |
| **`reaction`** | Tag 222 / 52825 | واکنش‌ها | ثبت، تغییر یا حذف واکنش ایموجی روی پیام توسط کاربران |
| **`messageNewReaction`** | Tag 54323 | واکنش‌ها | ثبت واکنش جدید با جزئیات کامل کاربر و ایموجی |
| **`messageReactionsReadByMe`** | Tag 52832 | واکنش‌ها | سین شدن واکنش‌های ثبت‌شده توسط کاربر |
| **`typing`** | Tag 6 | حضور و وضعیت | شروع تایپ، ضبط صدا، ارسال ویدیو یا آپلود فایل توسط مخاطب |
| **`typingStop`** | Tag 81 | حضور و وضعیت | توقف وضعیت در حال نوشتن مخاطب |
| **`userOnline`** | Tag 7 | حضور و وضعیت | آنلاین شدن کاربر در پلتفرم بله |
| **`userOffline`** | Tag 8 | حضور و وضعیت | آفلاین شدن کاربر همراه با برچسب زمانی آخرین بازدید |
| **`userLastSeen`** | Tag 9 | حضور و وضعیت | تغییر در تنظیمات حریم خصوصی یا وضعیت آخرین بازدید کاربر |
| **`presence`** | Alias | حضور و وضعیت | شنونده سراسری هرگونه تغییر وضعیت آنلاین/آفلاین/بازدید |
| **`userAvatarChanged`** | Tag 16 | کاربر و نمایه | تغییر یا حذف عکس پروفایل کاربر |
| **`userNameChanged`** | Tag 32 | کاربر و نمایه | تغییر نام و نام‌خانوادگی نمایشی کاربر |
| **`userLocalNameChanged`** | Tag 51 | کاربر و نمایه | تغییر نام ذخیره شده مخاطب در دفترچه تلفن |
| **`userContactsChanged`** | Tag 134 | کاربر و نمایه | به‌روزرسانی لیست مخاطبین همگام‌شده |
| **`userNickChanged`** | Tag 209 | کاربر و نمایه | تغییر یا ثبت نام‌کاربری عمومی (Username) |
| **`userAboutChanged`** | Tag 210 | کاربر و نمایه | تغییر بیوگرافی (About / Bio) نمایه کاربر |
| **`userPreferredLanguagesChanged`** | Tag 212 | کاربر و نمایه | تغییر زبان مورد نظر کاربر در تنظیمات بله |
| **`userTimeZoneChanged`** | Tag 216 | کاربر و نمایه | تغییر منطقه زمانی حساب کاربری |
| **`userBotCommandsChanged`** | Tag 217 | کاربر و نمایه | تغییر در لیست دستورات ثبت‌شده برای ربات |
| **`userBlocked`** | Tag 2629 | کاربر و نمایه | مسدودسازی یک کاربر (بلاک) |
| **`userUnblocked`** | Tag 2630 | کاربر و نمایه | رفع مسدودیت کاربر (آنبلاک) |
| **`phoneNumberChanged`** | Tag 52803 | کاربر و نمایه | تغییر شماره تلفن همراه متصل به حساب کاربری |
| **`contactsAdded`** | Tag 40 | کاربر و نمایه | افزوده شدن مخاطب جدید به دفترچه تلفن |
| **`contactsRemoved`** | Tag 41 | کاربر و نمایه | حذف مخاطب از دفترچه تلفن بله |
| **`allContactsRemoved`** | Tag 54353 | کاربر و نمایه | پاکسازی کامل تمام مخاطبین حساب |
| **`groupOnline`** | Tag 33 | گروه و کانال | تغییر تعداد اعضای آنلاین گروه |
| **`groupNicknameChanged`** | Tag 57 | گروه و کانال | تغییر آیدی یا لینک عمومی گروه |
| **`groupMessagePinned`** | Tag 721 | گروه و کانال | پین شدن پیام جدید در گروه |
| **`groupPinRemoved`** | Tag 722 | گروه و کانال | برداشته شدن سنجاق پیام گروه |
| **`groupRestrictionChanged`** | Tag 723 | گروه و کانال | تغییر در محدودیت‌های اعمال‌شده روی گروه |
| **`groupTitleChanged`** | Tag 2609 | گروه و کانال | تغییر عنوان و نام گروه |
| **`groupAvatarChanged`** | Tag 2610 | گروه و کانال | تغییر عکس نمایه و آواتار گروه |
| **`groupMemberChanged`** | Tag 2612 | گروه و کانال | تغییر وضعیت یا نقش عضو در گروه |
| **`groupExtChanged`** | Tag 2613 | گروه و کانال | تغییر اکستنشن‌ها و ویژگی‌های تکمیلی گروه |
| **`groupMembersUpdated`** | Tag 2614 | گروه و کانال | به‌روزرسانی جامع لیست اعضای گروه |
| **`groupTopicChanged`** | Tag 2616 | گروه و کانال | تغییر موضوع یا دسته‌بندی موضوعی گروه |
| **`groupAboutChanged`** | Tag 2617 | گروه و کانال | تغییر توضیحات و بیوگرافی گروه |
| **`groupOwnerChanged`** | Tag 2619 | گروه و کانال | انتقال مالکیت اصلی گروه به کاربر دیگر |
| **`groupHistoryShared`** | Tag 2620 | گروه و کانال | تغییر وضعیت دسترسی اعضای جدید به تاریخچه چت |
| **`groupMembersCountChanged`** | Tag 2622 | گروه و کانال | تغییر تعداد کل اعضای گروه |
| **`groupMemberDiff`** | Tag 2623 | گروه و کانال | رویداد پیوستن یا خروج عضو به گروه |
| **`groupCanSendMessagesChanged`** | Tag 2624 | گروه و کانال | تغییر مجوز ارسال پیام اعضا (بستن یا باز کردن چت) |
| **`groupCanViewMembersChanged`** | Tag 2625 | گروه و کانال | تغییر مجوز دیدن لیست اعضا توسط کاربران عادی |
| **`groupCanInviteMembersChanged`** | Tag 2626 | گروه و کانال | تغییر دسترسی اعضا جهت دعوت دیگران |
| **`groupMemberAdminChanged`** | Tag 2627 | گروه و کانال | ارتقا به مدیر یا تنزل مقام در گروه |
| **`groupBecameOrphaned`** | Tag 2628 | گروه و کانال | بدون مالک و مدیر شدن گروه |
| **`groupMemberPermissionsChanged`** | Tag 52804 | گروه و کانال | تغییر ریزمجوزهای یک عضو خاص در گروه |
| **`groupDefaultPermissionsChanged`** | Tag 52805 | گروه و کانال | تغییر مجوزهای پیش‌فرض عمومی گروه |
| **`channelNickChanged`** | Tag 2880 | گروه و کانال | تغییر نام‌کاربری یا شناسه عمومی کانال |
| **`channelAdvertisementTypeChanged`** | Tag 52801 | گروه و کانال | تغییر نوع تبلیغات فعال درون کانال |
| **`channelAdTagIdChanged`** | Tag 52802 | گروه و کانال | تغییر شناسه تگ‌های تبلیغاتی کانال |
| **`channelSignMessagesChanged`** | Tag 54354 | گروه و کانال | فعال یا غیرفعال شدن امضای نام نویسنده در کانال |
| **`slowModeChanged`** | Tag 54355 | گروه و کانال | تنظیم حالت آرام (Slow Mode) و تاخیر ارسال پیام اعضا |
| **`callStarted`** | Tag 52807 | تماس‌ها | شروع تماس صوتی یا تصویری |
| **`callAccepted`** | Tag 52808 | تماس‌ها | پذیرش و برقراری تماس توسط مخاطب |
| **`callDiscarded`** | Tag 52809 | تماس‌ها | قطع شدن، رد یا پایان یافتن تماس |
| **`callReceived`** | Tag 52810 | تماس‌ها | دریافت زنگ تماس ورودی |
| **`groupCallStarted`** | Tag 52811 | تماس‌ها | شروع تماس گروهی درون گروه یا کانال |
| **`groupCallEnded`** | Tag 52812 | تماس‌ها | پایان تماس صوتی یا تصویری گروهی |
| **`callReactionSent`** | Tag 52813 | تماس‌ها | ارسال واکنش ایموجی حین مکالمه زنده |
| **`callUpgraded`** | Tag 52816 | تماس‌ها | ارتقای تماس دو نفره به تماس گروهی |
| **`peersInvited`** | Tag 52817 | تماس‌ها | دعوت کاربران جدید به تماس در حال اجرا |
| **`multiPeerCallStarted`** | Tag 52818 | تماس‌ها | آغاز کنفرانس و تماس چندطرفه |
| **`peersStateChanged`** | Tag 52819 | تماس‌ها | تغییر وضعیت اعضا در تماس (میکروفون، دوربین، ...) |
| **`call`** | Alias | تماس‌ها | شنونده جامع و یکپارچه تمامی رویدادهای تماس |
| **`giftPacket`** | Custom | پاکت هدیه | دریافت پیام پاکت هدیه نقدی ریالی در گفتگو |
| **`goldGiftPacket`** | Custom | پاکت هدیه | دریافت پیام پاکت هدیه طلای بله در گفتگو |
| **`giftPacketOpened`** | Service 17/18 | پاکت هدیه | رویداد باز شدن پاکت هدیه توسط یکی از کاربران و دریافت مبلغ |
| **`miniAppData`** | Service 21 | مینی‌اپ | دریافت داده‌های ارسال‌شده از مینی‌اپ/وب‌اپ به ربات |
| **`serviceMessage`** | Tag 11 | پیام سرویس | پیام‌های سیستمی بله (عضویت، اخراج، تغییر عنوان، ...) |
| **`groupCreated`** | Service 1 | پیام سرویس | رویداد ساخته شدن گروه جدید |
| **`userInvited`** | Service 2 | پیام سرویس | رویداد افزوده شدن کاربر جدید به گروه |
| **`userKicked`** | Service 3 | پیام سرویس | رویداد اخراج کاربر از گروه |
| **`userLeft`** | Service 4 | پیام سرویس | رویداد ترک گروه توسط عضو |
| **`connected`** | Lifecycle | سوکت | اتصال موفق به سرور WebSocket و شروع نشست کاربری |
| **`disconnected`** | Lifecycle | سوکت | قطع ارتباط سوکت همراه با کد و دلیل قطع |
| **`status`** | Lifecycle | سوکت | تغییر وضعیت کانکشن (CONNECTING, CONNECTED, ...) |
| **`error`** | Error | خطاها | بروز هرگونه خطای شبکه، اعتبارسنجی یا سرور |
| **`update`** | Universal | سوکت | دریافت فریم خام تمام به‌روزرسانی‌های ورودی سوکت |

#### هوشمندی شیء پیام (`MessageEvent`) و متدهای عملیاتی مستقیم:
شیء ارسالی به شنونده رویداد `message` مجهز به ویژگی‌های تشخیصی و متدهای مستقیم است:

```javascript
client.on('message', async (msg) => {
  console.log(`فرستنده: ${msg.senderId} | متن: ${msg.text}`);

  // ۱. پرچم‌های تشخیصی نوع محتوا
  if (msg.isPhoto) console.log('پیام حاوی تصویر است 📸');
  if (msg.isVoice) console.log('پیام حاوی ویس است 🎙️');
  if (msg.isAudio) console.log('پیام حاوی فایل صوتی است 🎵');
  if (msg.isVideo) console.log('پیام حاوی ویدیو است 🎥');
  if (msg.isDocument) console.log('پیام حاوی سند یا فایل است 📄');
  if (msg.isSticker) console.log('پیام حاوی استیکر است ✨');

  // ۲. باز کردن خودکار پاکت هدیه نقدی (Cash Gift Packet)
  if (msg.isGiftPacket) {
    console.log('مبلغ کل پاکت:', msg.giftPacket.totalAmount, 'ریال');
    const claimRes = await msg.claimGiftPacket(); // یا msg.openGiftPacket()
    console.log('مبلغ برنده شده شما:', claimRes.amount, 'ریال');
    console.log('لیست برندگان:', await msg.getGiftPacketReceivers());
  }

  // ۳. باز کردن خودکار پاکت هدیه طلا (Gold Gift Packet)
  if (msg.isGoldGiftPacket) {
    console.log('شناسه پاکت طلا:', msg.goldGiftPacket.packetId);
    const goldWin = await msg.claimGoldGiftPacket(); // یا msg.openGoldGiftPacket()
    console.log('طلای برنده شده:', goldWin.amount, 'میلی‌گرم');
    console.log('شناسه‌های برندگان طلا:', await msg.getGoldWinners());
  }

  // ۴. پاسخ هوشمند شبیه‌ساز انسان (Seen -> Thinking Pause -> Typing -> Send)
  if (msg.text === 'سلام') {
    await msg.reply('درود! چطور می‌تونم کمکتون کنم؟ 👋');
  }

  // ۵. تایید دریافت و خوانده شدن
  await msg.markAsReceived(); // تیک خاکستری
  await msg.markAsRead();     // دو تیک آبی

  // ۶. واکنش ایموجی، پین، فوروارد، حذف
  await msg.react('❤️');
  // await msg.forwardTo(targetPeer);
  // await msg.pin();
  // await msg.delete();
});
```

#### کد نمونه شنود دسته‌های مختلف رویدادهای زنده:
```javascript
// ۱. پیام‌ها، ویرایش، حذف و سنجاق
client.on('messageEdit', (e) => console.log(`پیام ${e.rid} ویرایش شد:`, e.message));
client.on('messageDelete', (d) => console.log(`پیام‌های ${d.rids} حذف شدند.`));
client.on('messagePinned', (p) => console.log(`پیام سنجاق شد:`, p));

// ۲. تیک دریافت و خوانده شدن
client.on('messageReceived', (r) => console.log(`تحویل تا ${r.startDate} (تک‌تیک)`));
client.on('messageRead', (r) => console.log(`خوانده شدن تا ${r.startDate} (دو تیک آبی)`));

// ۳. واکنش‌ها و حضور
client.on('reaction', (react) => console.log(`ری‌اکشن پیام ${react.rid}:`, react.reactions));
client.on('typing', (t) => console.log(`کاربر ${t.userId} در حال تایپ...`));
client.on('typingStop', (t) => console.log(`کاربر ${t.userId} تایپ را متوقف کرد.`));
client.on('userOnline', (u) => console.log(`🟢 کاربر ${u.userId} آنلاین شد.`));
client.on('userOffline', (u) => console.log(`🔴 کاربر ${u.userId} آفلاین شد. آخرین بازدید: ${new Date(Number(u.lastSeen))}`));

// ۴. گروه‌ها و کانال‌ها
client.on('groupTitleChanged', (g) => console.log(`نام گروه به ${g.title} تغییر کرد.`));
client.on('groupMemberDiff', (m) => console.log(`تغییر عضویت گروه:`, m));
client.on('slowModeChanged', (s) => console.log(`تاخیر ارسال گروه: ${s.seconds} ثانیه`));

// ۵. تماس‌ها
client.on('callStarted', (c) => console.log(`تماس شروع شد:`, c));
client.on('callAccepted', (c) => console.log(`تماس پاسخ داده شد:`, c));
client.on('callDiscarded', (c) => console.log(`تماس قطع شد:`, c));

// ۶. پاکت‌های هدیه و وب‌اپ‌ها
client.on('giftPacketOpened', (open) => console.log(`کاربر ${open.receiverUserId} پاکت هدیه را باز کرد. مبلغ: ${open.amount} ریال`));
client.on('miniAppData', (app) => console.log(`داده دریافتی از مینی‌اپ:`, app.data));

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
  'Go (Golang)',
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

پیام‌رسان بله از دو نوع پاکت هدیه پشتیبانی می‌کند: **پاکت هدیه نقدی ریالی** (از طریق موجودی کیف پول بله بر بستر `bale.giftpacket.v1.GiftPacket`) و **پاکت هدیه طلا** (بر بستر `bale.balebank.v1.GoldGiftPacket`). کتابخانه BaleX تمامی متدهای ارسال، باز کردن (Claim)، استعلام و دریافت لیست برندگان هر دو نوع پاکت را به سادگی در اختیارتان قرار می‌دهد.

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

### باز کردن، دریافت وجه و استعلام پاکت نقدی (openGiftPacket / claimGiftPacket / getGiftPacket)
هنگامی که پیامی حاوی پاکت هدیه نقدی دریافت می‌کنید، می‌توانید با متد `claimGiftPacket` آن را باز کرده و سهم خود را مستقیماً دریافت کنید، یا با `getGiftPacket` و `getGiftPacketReceivers` مشخصات و لیست برندگان آن را بخوانید:

```javascript
// ۱. باز کردن و دریافت سهم نقدی از پاکت (Claim)
const claimRes = await client.claimGiftPacket({
  peer: 123456789,            // شناسه پیری که پیام پاکت در آن آمده
  randomId: 9876543210123n,   // شناسه رندوم پیام پاکت هدیه
  date: Date.now(),           // زمان پیام
  walletId: 'WAL-12345'       // شناسه کیف پول (اختیاری)
});

console.log('وضعیت پاکت:', claimRes.status);
console.log('مبلغ برنده شده شما:', claimRes.amount, 'ریال');
console.log('آیا برنده شدید؟', claimRes.isCurrentWinner);
console.log('رتبه شما در باز کردن پاکت:', claimRes.rank);
console.log('تعداد افرادی که تاکنون پاکت را باز کرده‌اند:', claimRes.openedCount);

// ۲. استعلام جزئیات پاکت هدیه بدون نیاز به کلیم مجدد
const packetInfo = await client.getGiftPacket({
  peer: 123456789,
  randomId: 9876543210123n
});
console.log('متن پاکت:', packetInfo.description);
console.log('تعداد کل جوایز:', packetInfo.winnerCount);

// ۳. دریافت لیست برندگان پاکت هدیه نقدی
const receivers = await client.getGiftPacketReceivers({
  peer: 123456789,
  randomId: 9876543210123n
});
console.log('لیست برندگان:', receivers);

// ۴. دریافت توکن پرداخت پاکت هدیه از درگاه
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

### باز کردن پاکت طلا و دریافت برندگان (openGoldGiftPacket / claimGoldGiftPacket / getGoldWinners)
برای دریافت سهم طلا از پاکت باز شده و استعلام لیست برندگان:

```javascript
const packetId = 987654321n;

// ۱. باز کردن و دریافت سهم طلا (Claim)
const goldClaim = await client.claimGoldGiftPacket(packetId);
console.log('میلی‌گرم طلای برنده شده:', goldClaim.amount);
console.log('تعداد افراد بازکننده:', goldClaim.openedCount);
console.log('رتبه شما:', goldClaim.rank);

// ۲. مشاهده شناسه‌های کاربری برندگان پاکت طلا
const winners = await client.getGoldWinners(packetId);
console.log('لیست برندگان طلا:', winners.winnerIds);
```

---

## 📱 مینی‌اپ‌ها و وب‌اپ‌های بله (Mini Apps & WebApps)

پیام‌رسان بله از وب‌اپلیکیشن‌ها و مینی‌اپ‌ها بر بستر پروتکل رسمی `bale.appzar.v1.Appzar` و `bale.ketf.v1.Ketf` پشتیبانی می‌کند. کتابخانه BaleX مجهز به موتور اختصاصی `MiniAppUtils` کاملاً همگام با استاندارد رسمی تلگرام و بله است که تمامی امکانات تولید رشته `initData`، امضای رمزی با توکن ربات (HMAC-SHA256)، اعتبارسنجی سمت سرور، پارس داده‌ها و ساخت لینک راه‌اندازی (Launch URL) درون وب‌ویو را فراهم می‌کند.

### ساخت و اعتبارسنجی پارامترهای مینی‌اپ (MiniAppUtils Engine)
تولید آفلاین یا آنلاین `initData`، امضای امنیتی هش، و اعتبارسنجی رمزی در سمت بک‌اند ربات:

```javascript
const { MiniAppUtils, ScreenMode, MiniAppEvent } = require('balex');

const botToken = '123456789:ABCdefGhIJKlmNoPQRstuVWXyz';

// ۱. تولید رشته استاندارد initData با امضای معتبر HMAC-SHA256
const initData = MiniAppUtils.createInitData({
  user: {
    id: 987654321,
    first_name: 'رضا',
    username: 'rezabalex',
    language_code: 'fa'
  },
  queryId: 'AAH_test123',
  authDate: Math.floor(Date.now() / 1000),
  startParam: 'ref_bonus_100',
  botToken // اختیاری جهت ایجاد هش امضای معتبر
});

console.log('رشته اعتبارسنجی مینی‌اپ:', initData);

// ۲. اعتبارسنجی امضای امنیتی در سمت بک‌اند ربات (Backend Validation)
const validation = MiniAppUtils.validateInitData(initData, botToken);
if (validation.valid) {
  console.log('امضای مینی‌اپ کاملاً معتبر است! کاربر تایید شد:', validation.data.user);
} else {
  console.error('داده‌های مینی‌اپ نامعتبر یا دستکاری شده است:', validation.error);
}

// ۳. پارس کردن رشته initData به آبجکت تایپ‌شده
const parsed = MiniAppUtils.parseInitData(initData);
console.log('شناسه کوئری:', parsed.query_id);
console.log('پارامتر استارت دیپ‌لینک:', parsed.start_param);

// ۴. ساخت آدرس کامل باز کردن مینی‌اپ درون وب‌ویو (Launch URL)
const launchUrl = MiniAppUtils.buildMiniAppUrl({
  webAppUrl: 'https://my-app.bale.ai',
  initData,
  themeParams: {
    bg_color: '#0e1015',
    text_color: '#f3f4f6',
    button_color: '#10b981'
  }
});
console.log('آدرس نهایی جهت بارگذاری در WebView:', launchUrl);
// نمونه خروجی:
// https://my-app.bale.ai/#tgWebAppData=query_id%3D...%26user%3D...%26hash%3D...&tgWebAppVersion=7.0&tgWebAppPlatform=weba&tgWebAppThemeParams=...
```

### دریافت پارامترهای راه‌اندازی از سرور بله (createMiniAppParams)
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
console.log('آدرس کامل جهت بارگذاری در وب‌ویو (launchUrl):', appParams.launchUrl);
```

### دریافت آدرس مینی‌اپ از سرور (getMiniAppUrl)
متد رسمی سرور اپ‌زار بله جهت دریافت لینک احراز هویت شده وب‌اپلیکیشن:

```javascript
const { url, queryId } = await client.getMiniAppUrl({
  botUserId: botId,
  screenMode: ScreenMode.FULLSCREEN, // ۰: تمام‌صفحه، ۱: فول سایز، ۲: فشرده
  directLink: 'start_param_value'
});

console.log('لینک اجرای وب‌اپ:', url);
```

### ارسال داده از مینی‌اپ به ربات (sendMiniAppData)
هنگامی که مینی‌اپ با کاربر تعامل کرد و رویداد `sendData` را صدا زد، می‌توانید داده‌های حاصل را به ربات بفرستید:

```javascript
await client.sendMiniAppData({
  botUserId: botId,
  queryId: appParams.queryId,
  data: { score: 250, action: 'level_complete' },
  buttonText: 'مشاهده نتیجه'
});

console.log('داده‌ها با موفقیت به ربات ارسال شد.');
```

### تنظیمات دکمه منو و متدهای سفارشی مینی‌اپ
```javascript
// دریافت دکمه منوی ربات (Commands یا WebApp)
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

## 🤖 بازوهای رسمی بله (Official Bale HTTP Bot API - docs.bale.ai)

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

## 🐹 اتصال و اجرا در زبان Go (Golang Integration)

کتابخانه BaleX دارای پل ارتباطی داخلی (Bridge) به دو صورت **STDIO Stream** (برای اجرای مستقیم به عنوان Subprocess) و **HTTP JSON-RPC** (برای اتصال میکروسرویسی) می‌باشد:

### روش ۱: اجرای مستقیم از Go به عنوان Child Process (تاخیر صفر، بدون اشغال پورت)

```go
package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os/exec"
)

type Command struct {
	ID     int         `json:"id"`
	Action string      `json:"action"`
	Method string      `json:"method,omitempty"`
	Params interface{} `json:"params,omitempty"`
}

type Response struct {
	ID      int             `json:"id"`
	Success bool            `json:"success"`
	Result  json.RawMessage `json:"result"`
	Error   string          `json:"error,omitempty"`
}

func main() {
	// اجرای پل ارتباطی به عنوان زیرپروسس
	cmd := exec.Command("node", "src/bridge.js", "--stdio")
	stdin, _ := cmd.StdinPipe()
	stdout, _ := cmd.StdoutPipe()
	_ = cmd.Start()
	reader := bufio.NewReader(stdout)

	// رویداد اولیه اتصال
	initMsg, _ := reader.ReadBytes('\n')
	fmt.Println("Bridge ready:", string(initMsg))

	// ارسال متد sendMessage به بله
	cmdData, _ := json.Marshal(Command{
		ID:     1,
		Action: "call",
		Method: "sendMessage",
		Params: []interface{}{123456789, "سلام از برنامه نوشته شده با Go!"},
	})
	stdin.Write(append(cmdData, '\n'))

	// خواندن پاسخ
	respLine, _ := reader.ReadBytes('\n')
	var resp Response
	json.Unmarshal(respLine, &resp)
	fmt.Printf("نتیجه بازگشتی در Go: %+v\n", resp)
}
```

### روش ۲: اجرای دائم به عنوان پل HTTP

```bash
# اجرای پل ارتباطی در پس‌زمینه
npx balex bridge --port 8765
```

سپس در زبان Go با پکیج استاندارد `net/http`:

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	payload, _ := json.Marshal(map[string]interface{}{
		"method": "sendMessage",
		"params": []interface{}{
			123456789,
			"ارسال پیام مستقیم از سرور Go به بله",
		},
	})

	resp, err := http.Post("http://127.0.0.1:8765/api/call", "application/json", bytes.NewBuffer(payload))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println("وضعیت ارسال HTTP:", resp.Status)
}
```

---

## 📄 مجوز و پشتیبانی
این پروژه تحت پروانه [MIT License](LICENSE) منتشر شده است. هرگونه استفاده تحقیقاتی، توسعه کلاینت و ربات‌های خودکار مجاز می‌باشد.

</div>
