# -*- coding: utf-8 -*-
import sys
import re

def get_bot_sections_html():
    return r"""
      <!-- بخش ۱: معرفی و ساختار بازوهای رسمی بله -->
      <section id="bale-bot-overview">
        <h2>بازوهای رسمی بله (Bale HTTP Bot API - docs.bale.ai)</h2>
        <p>پشتیبانی کامل و استاندارد بدون نیاز به پیش‌نیازهای سنگین از <strong>API رسمی بازوهای بله (<a href="https://docs.bale.ai" target="_blank">docs.bale.ai</a>)</strong>. این کلاس به شما امکان می‌دهد ربات‌های رسمی با توکن دریافتی از <code>@botfather</code> در بله بسازید، رویدادها را دریافت کرده و انواع پیام‌ها، کیبوردها و فاکتورهای پرداخت الکترونیکی را مدیریت کنید.</p>

        <div class="callout callout-info">
          <div class="callout-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <span>نحوه دریافت توکن و آدرس پایه API</span>
          </div>
          <p>
            برای شروع، وارد پیام‌رسان بله شده و به بازوی رسمی <strong>@botfather</strong> پیام دهید. پس از ایجاد بازو، یک توکن اختصاصی شبیه به <code>123456789:abcdIuZmK5qNEm2A1BhUaAg7MPJv1O9KCcBQB2ro</code> دریافت می‌کنید.<br>
            آدرس فراخوانی متدها: <code>https://tapi.bale.ai/bot&lt;token&gt;/&lt;methodName&gt;</code><br>
            آدرس دانلود فایل‌ها: <code>https://tapi.bale.ai/file/bot&lt;token&gt;/&lt;file_path&gt;</code>
          </p>
        </div>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (BaleBot Quickstart)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const { BaleBot, InlineKeyboard, ReplyKeyboard } = require('balex');

// ۱. مقداردهی کلاینت با توکن بات‌فادر بله
const bot = new BaleBot('123456789:abcdIuZmK5qNEm2A1BhUaAg7MPJv1O9KCcBQB2ro');

// ۲. بررسی صحت توکن و دریافت مشخصات ربات
const me = await bot.getMe();
console.log('ربات فعال شد: @' + me.username + ' (' + me.first_name + ')');

// ۳. لیسنر دریافت پیام‌های متنی و دستورات
bot.on('message', async (msg) => {
  if (msg.text === '/start') {
    const kb = new InlineKeyboard()
      .button('ثبت‌نام', 'btn_register')
      .url('وب‌سایت بله', 'https://ble.ir')
      .row()
      .webApp('اجرای مینی‌اپ', 'https://miniapp.example.com')
      .copyText('کپی کد تخفیف', 'DISCOUNT2026');

    await bot.sendMessage(msg.chat.id, 'سلام! به بازوی رسمی بله خوش آمدید.', {
      reply_markup: kb
    });
  }
});

// ۴. شروع دریافت آپدیت‌ها با Long Polling
bot.startPolling({ interval: 300, timeout: 20 });</code></pre>
        </div>
      </section>

      <!-- بخش ۲: ساختار انواع داده‌ای (Types & Objects) -->
      <section id="bale-bot-types">
        <h2>ساختار انواع داده‌ای و اشیاء بازوی بله (Bale Types & Schemas)</h2>
        <p>پلتفرم بازوی بله بر پایه ساختارهای داده‌ای استاندارد JSON طراحی شده است. کلاس <code>BaleBot</code> تمامی این تایپ‌ها را به صورت آبجکت‌های تایپ‌شده در TypeScript با اتوکامپلیت کامل به شما ارائه می‌دهد:</p>

        <div class="table-container">
          <table class="services-table">
            <thead>
              <tr>
                <th>نوع داده‌ای (Type)</th>
                <th>فیلدهای اصلی</th>
                <th>توضیحات و کاربرد</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>User</code></td>
                <td><code>id, is_bot, first_name, last_name, username</code></td>
                <td>نمایش یک حساب کاربری یا حساب ربات در بله.</td>
              </tr>
              <tr>
                <td><code>Chat</code></td>
                <td><code>id, type ("private" | "group" | "channel"), title, username, first_name, last_name</code></td>
                <td>اطلاعات گفتگوی خصوصی، گروه یا کانال.</td>
              </tr>
              <tr>
                <td><code>ChatFullInfo</code></td>
                <td><code>id, type, title, description, invite_link, pinned_message, permissions, photo</code></td>
                <td>اطلاعات جامع و تفصیلی چت بازگشتی از متد <code>getChat</code>.</td>
              </tr>
              <tr>
                <td><code>Message</code></td>
                <td><code>message_id, from, date, chat, forward_from, reply_to_message, text, entities, photo, video, audio, voice, document, animation, contact, location, invoice, successful_payment</code></td>
                <td>آبجکت اصلی پیام دریافتی یا ارسالی با تمامی ویژگی‌های رسانه‌ای و فراداده‌ای.</td>
              </tr>
              <tr>
                <td><code>MessageEntity</code></td>
                <td><code>type, offset, length, url, user</code></td>
                <td>موجودیت قالب‌بندی درون متن (مانند bold, italic, code, text_link, mention, hashtag).</td>
              </tr>
              <tr>
                <td><code>PhotoSize</code></td>
                <td><code>file_id, file_unique_id, width, height, file_size</code></td>
                <td>اندازه‌های مختلف تصویر پیش‌نمایش در بله.</td>
              </tr>
              <tr>
                <td><code>Audio / Video / Voice / Document</code></td>
                <td><code>file_id, duration, mime_type, file_size, thumb, file_name, performer, title</code></td>
                <td>ساختارهای فایل‌های چندرسانه‌ای ذخیره‌شده روی CDN بله.</td>
              </tr>
              <tr>
                <td><code>Contact</code></td>
                <td><code>phone_number, first_name, last_name, user_id, vcard</code></td>
                <td>اطلاعات کارت مخاطب اشتراک‌گذاری شده.</td>
              </tr>
              <tr>
                <td><code>Location</code></td>
                <td><code>latitude, longitude, horizontal_accuracy, live_period</code></td>
                <td>مختصات جغرافیایی ارسال‌شده توسط کاربر.</td>
              </tr>
              <tr>
                <td><code>Invoice</code></td>
                <td><code>title, description, start_parameter, currency, total_amount</code></td>
                <td>اطلاعات فاکتور پرداخت ارسالی برای کاربر.</td>
              </tr>
              <tr>
                <td><code>PreCheckoutQuery</code></td>
                <td><code>id, from, currency, total_amount, invoice_payload</code></td>
                <td>درخواست پیش‌تایید پرداخت که باید توسط ربات ظرف ۱۰ ثانیه پاسخ داده شود.</td>
              </tr>
              <tr>
                <td><code>SuccessfulPayment</code></td>
                <td><code>currency, total_amount, invoice_payload, provider_payment_charge_id</code></td>
                <td>تاییدیه پرداخت نهایی موفق کاربر.</td>
              </tr>
              <tr>
                <td><code>ChatMember</code></td>
                <td><code>status, user, custom_title, can_be_edited, can_manage_chat, can_delete_messages</code></td>
                <td>وضعیت و سطح دسترسی کاربر در گروه یا کانال (owner, administrator, member, restricted, left, kicked).</td>
              </tr>
              <tr>
                <td><code>WebhookInfo</code></td>
                <td><code>url, has_custom_certificate, pending_update_count, last_error_date, last_error_message</code></td>
                <td>وضعیت جاری سرویس وب‌هوک تنظیم‌شده برای بازو.</td>
              </tr>
              <tr>
                <td><code>ResponseParameters</code></td>
                <td><code>migrate_to_chat_id, retry_after</code></td>
                <td>پارامترهای کمکی هنگام مواجهه با جابجایی چت یا محدودیت نرخ ارسال (Rate Limit).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- بخش ۳: فرمت‌بندی پیشرفته متن -->
      <section id="bale-bot-formatting">
        <h2>فرمت‌بندی پیشرفته متن و موجودیت‌ها (Formatting & Markdown/HTML)</h2>
        <p>پلتفرم بازوی بله از دو فرمت محبوب <code>HTML</code> و <code>Markdown</code> برای برجسته‌سازی، درج لینک، و قالب‌بندی متون پیام‌ها و کپشن‌های رسانه پشتیبانی می‌کند.</p>

        <div class="table-container">
          <table class="services-table">
            <thead>
              <tr>
                <th>قالب (Style)</th>
                <th>سینتکس HTML (پیشنهادی)</th>
                <th>سینتکس Markdown</th>
                <th>نتیجه نمایشی</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>متن پررنگ (Bold)</td>
                <td><code>&lt;b&gt;متن&lt;/b&gt;</code> یا <code>&lt;strong&gt;متن&lt;/strong&gt;</code></td>
                <td><code>*متن*</code></td>
                <td><strong>متن پررنگ</strong></td>
              </tr>
              <tr>
                <td>متن کج (Italic)</td>
                <td><code>&lt;i&gt;متن&lt;/i&gt;</code> یا <code>&lt;em&gt;متن&lt;/em&gt;</code></td>
                <td><code>_متن_</code></td>
                <td><em>متن کج</em></td>
              </tr>
              <tr>
                <td>کد درون‌خطی (Code)</td>
                <td><code>&lt;code&gt;const x = 1;&lt;/code&gt;</code></td>
                <td><code>&#96;const x = 1;&#96;</code></td>
                <td><code>const x = 1;</code></td>
              </tr>
              <tr>
                <td>بلوک کد چندخطی (Pre)</td>
                <td><code>&lt;pre&gt;کد برنامه&lt;/pre&gt;</code></td>
                <td><code>&#96;&#96;&#96;کد برنامه&#96;&#96;&#96;</code></td>
                <td>بلوک کد مونواسپیس</td>
              </tr>
              <tr>
                <td>لینک متنی (Link)</td>
                <td><code>&lt;a href="https://ble.ir"&gt;بله&lt;/a&gt;</code></td>
                <td><code>[بله](https://ble.ir)</code></td>
                <td><a href="https://ble.ir" target="_blank">بله</a></td>
              </tr>
              <tr>
                <td>خط‌خورده (Strikethrough)</td>
                <td><code>&lt;s&gt;تخفیف منقضی&lt;/s&gt;</code></td>
                <td><code>~تخفیف منقضی~</code></td>
                <td><s>تخفیف منقضی</s></td>
              </tr>
              <tr>
                <td>زیرخط‌دار (Underline)</td>
                <td><code>&lt;u&gt;توجه مهم&lt;/u&gt;</code></td>
                <td>-</td>
                <td><u>توجه مهم</u></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Text Formatting Example)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// روش ۱: ارسال پیام با حالت HTML
const htmlText = '<b>📢 اطلاعیه مهم نسخه ۱.۲.۰</b>\n' +
  'امکانات جدید اضافه شد:\n' +
  '• <code>BaleBot</code>: پشتیبانی کامل از docs.bale.ai\n' +
  '• <u>سرعت بالا</u> و بدون وابستگی\n' +
  'جهت اطلاعات بیشتر به <a href="https://ble.ir">وب‌سایت بله</a> مراجعه کنید.';

await bot.sendMessage(chatId, htmlText, { parse_mode: 'HTML' });

// روش ۲: ارسال پیام با آرایه مستقیم entities (بدون نیاز به اسکیپ کاراکترها)
await bot.sendMessage(chatId, 'کلیک کنید: پشتیبانی بله', {
  entities: [
    { type: 'bold', offset: 0, length: 11 },
    { type: 'text_link', offset: 12, length: 13, url: 'https://ble.ir/support' }
  ]
});</code></pre>
        </div>
      </section>

      <!-- بخش ۴: دریافت آپدیت‌ها -->
      <section id="bale-bot-polling">
        <h2>دریافت آپدیت‌ها (Long Polling & Webhook)</h2>
        <p>بازوی بله از دو شیوه استاندارد برای تحویل رویدادهای زنده کاربران بهره می‌برد:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Polling & Webhook Server)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. شیوه لانگ پولینگ (مناسب سیستم‌های تست و سرورهای بدون دامنه عمومی)
bot.startPolling({
  interval: 300,  // فاصله بررسی میلی‌ثانیه
  timeout: 25,    // نگه‌داشتن اتصال لانگ پولینگ در سرور بله (ثانیه)
  limit: 100      // حداکثر آپدیت در هر درخواست
});

// توقف پولینگ در زمان خاموش شدن برنامه
process.on('SIGINT', () => {
  bot.stopPolling();
  process.exit(0);
});

// ۲. شیوه وب‌هوک (مناسب سرورهای توزیع‌شده با دامنه HTTPS)
await bot.setWebhook('https://bot.example.com/bale-webhook');

// بررسی وضعیت وب‌هوک فعال
const hookInfo = await bot.getWebhookInfo();
console.log('وضعیت وب‌هوک:', hookInfo.url, 'آپدیت‌های معلق:', hookInfo.pending_update_count);

// میدلور آماده وب‌هوک سازگار با Express / Node http
const http = require('http');
const webhookHandler = bot.createWebhookMiddleware({ secretToken: 'SUPER_SECRET_123' });

http.createServer((req, res) => {
  if (req.url === '/bale-webhook') return webhookHandler(req, res);
  res.writeHead(404).end();
}).listen(8443);

// ۳. لیسنرهای رویدادهای مختلف
bot.on('message', (msg) => console.log('پیام جدید:', msg.text));
bot.on('edited_message', (msg) => console.log('پیام ویرایش شد:', msg.message_id));
bot.on('callback_query', (cb) => console.log('کلیک دکمه اینلاین:', cb.data));
bot.on('pre_checkout_query', (pcq) => console.log('تایید پرداخت:', pcq.id));
bot.on('successful_payment', (pay, msg) => console.log('پرداخت موفق:', pay.total_amount));
bot.on('error', (err) => console.error('خطای بازو:', err.message));</code></pre>
        </div>
      </section>

      <!-- بخش ۵: ارسال انواع رسانه‌ها -->
      <section id="bale-bot-media">
        <h2>ارسال انواع فایل و رسانه‌ها (Media API & File Uploads)</h2>
        <p>کتابخانه BaleX از <strong>۴ روش مختلف</strong> برای ارسال فایل پشتیبانی می‌کند: شناسه <code>file_id</code>، آدرس اینترنتی <code>URL</code>، مسیر فایل محلی <code>string</code>، و شیء بافر حافظه <code>Buffer</code>.</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (All Media Types & Upload Methods)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const fs = require('fs');

// ۱. ارسال عکس (با ۴ روش تامین منبع فایل)
// الف) با شناسه قبلی موجود در بله (سریع‌ترین روش بدون مصرف پهنای باند)
await bot.sendPhoto(chatId, '123456789:photo_file_id_here', { caption: 'عکس از آرشیو بله' });

// ب) با لینک مستقیم اینترنتی
await bot.sendPhoto(chatId, 'https://example.com/banner.jpg', { caption: 'دانلود مستقیم توسط سرور بله' });

// ج) با آدرس فایل محلی (آپلود خودکار به صورت multipart/form-data)
await bot.sendPhoto(chatId, './assets/logo.png', { caption: 'آپلود لوگو محلی' });

// د) با بافر حافظه
const imageBuffer = fs.readFileSync('./assets/chart.png');
await bot.sendPhoto(chatId, imageBuffer, { caption: 'نمودار تولیدی لحظه‌ای' });

// ۲. ارسال موزیک و فایل صوتی (Audio)
await bot.sendAudio(chatId, './music/track.mp3', {
  caption: 'پادکست شماره ۱',
  performer: 'تیم بله',
  title: 'مصاحبه اختصاصی',
  duration: 180
});

// ۳. ارسال سند و فایل فشرده (Document)
await bot.sendDocument(chatId, './files/report.pdf', {
  caption: 'گزارش مالی سالانه'
});

// ۴. ارسال ویدیو (Video)
await bot.sendVideo(chatId, './videos/tutorial.mp4', {
  caption: 'آموزش ویدیویی کار با بازو',
  duration: 65,
  width: 1280,
  height: 720
});

// ۵. ارسال گیف و انیمیشن (Animation)
await bot.sendAnimation(chatId, './animations/celebrate.gif', {
  caption: 'تبریک سال نو!'
});

// ۶. ارسال پیام صوتی و ویس (Voice)
await bot.sendVoice(chatId, './voices/note.ogg', {
  duration: 12
});

// ۷. ارسال آلبوم رسانه‌ای (Media Group)
await bot.sendMediaGroup(chatId, [
  { type: 'photo', media: './photo1.jpg', caption: 'تصویر اول' },
  { type: 'photo', media: './photo2.jpg' },
  { type: 'video', media: './clip.mp4', caption: 'ویدیوی همراه' }
]);

// ۸. ارسال موقعیت جغرافیایی و لوکیشن زنده (Location)
await bot.sendLocation(chatId, 35.7219, 51.3347, {
  horizontal_accuracy: 15
});

// ۹. ارسال مخاطب (Contact)
await bot.sendContact(chatId, '+989123456789', 'پشتیبانی', {
  last_name: 'فنی'
});

// ۱۰. ارسال وضعیت در حال انجام کار (Chat Action)
await bot.sendChatAction(chatId, 'upload_photo');

// ۱۱. دریافت اطلاعات فایل و دانلود مستقیم از سرور بله
const fileInfo = await bot.getFile('file_id_here');
console.log('آدرس فایل روی CDN بله:', fileInfo.file_path);
const buffer = await bot.downloadFile(fileInfo.file_path, './downloaded_file.png');</code></pre>
        </div>
      </section>

      <!-- بخش ۶: کیبوردهای شیشه‌ای و دکمه‌ها -->
      <section id="bale-bot-keyboards">
        <h2>دکمه‌های شیشه‌ای، کیبوردهای معمولی و مینی‌اپ‌ها (Keyboards)</h2>
        <p>کلاس‌های کاربردی <code>InlineKeyboard</code> و <code>ReplyKeyboard</code> پیاده‌سازی رابط‌های کاربری تعاملی را بسیار ساده و روان کرده‌اند:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Interactive Keyboards & Callbacks)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. کیبورد شیشه‌ای (InlineKeyboard)
const inlineKb = new InlineKeyboard()
  .button('تایید و ثبت سفارش', 'order_confirm_44')
  .button('انصراف', 'order_cancel')
  .row()
  .url('مشاهده جزئیات در کانال', 'https://ble.ir/bale')
  .row()
  .webApp('باز کردن مینی‌اپ فروشگاه', 'https://shop.example.com')
  .copyText('کپی کد معرف', 'REF_998811'); // کپی سریع متن در کلیپ‌بورد کاربر

await bot.sendMessage(chatId, 'لطفاً وضعیت سفارش را تعیین کنید:', {
  reply_markup: inlineKb
});

// ۲. پاسخ‌دهی به کلیک دکمه شیشه‌ای (answerCallbackQuery)
bot.on('callback_query', async (query) => {
  if (query.data === 'order_confirm_44') {
    // ارسال آلرت پاپ‌آپ روی صفحه کاربر
    await bot.answerCallbackQuery(query.id, {
      text: 'سفارش شما با موفقیت ثبت شد!',
      show_alert: true
    });
  } else {
    // پیام ناتیفیکیشن کوچک بالای صفحه
    await bot.answerCallbackQuery(query.id, { text: 'عملیات لغو شد.' });
  }
});

// ۳. کیبورد معمولی چت (ReplyKeyboard) با درخواست شماره و لوکیشن
const replyKb = new ReplyKeyboard({ resize: true, oneTime: true })
  .button('منوی اصلی')
  .button('مشاهده صورت‌حساب')
  .row()
  .requestContact('ارسال شماره تلفن همراه 📱')
  .requestLocation('ارسال لوکیشن تحویل 📍');

await bot.sendMessage(chatId, 'برای احراز هویت شماره یا لوکیشن خود را بفرستید:', {
  reply_markup: replyKb
});

// ۴. حذف کیبورد معمولی با KeyboardRemove
const { KeyboardRemove } = require('balex');
await bot.sendMessage(chatId, 'کیبورد مخفی شد.', {
  reply_markup: new KeyboardRemove()
});</code></pre>
        </div>
      </section>

      <!-- بخش ۷: مدیریت کامل چت‌ها و گروه‌ها -->
      <section id="bale-bot-chat-admin">
        <h2>مدیریت کامل چت‌ها، گروه‌ها و اعضا (Chat Administration)</h2>
        <p>مجموعه کامل متدهای مدیریتی برای اخراج، ارتقای مدیران، تنظیم اطلاعات و لینک‌های دعوت در گروه‌ها و کانال‌های بله:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Chat & Member Administration)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. دریافت اطلاعات کامل چت یا گروه
const chatInfo = await bot.getChat(groupId);
console.log('عنوان گروه:', chatInfo.title, 'توضیحات:', chatInfo.description);

// ۲. تعداد اعضا و لیست مدیران چت
const count = await bot.getChatMembersCount(groupId);
const admins = await bot.getChatAdministrators(groupId);
console.log('تعداد اعضا: ' + count + ' | تعداد مدیران: ' + admins.length);

// ۳. استعلام وضعیت یک عضو در چت
const member = await bot.getChatMember(groupId, targetUserId);
console.log('نقش کاربر:', member.status); // creator, administrator, member, restricted

// ۴. مسدودسازی و اخراج کاربر از گروه (Ban)
await bot.banChatMember(groupId, targetUserId);

// ۵. رفع مسدودیت کاربر (Unban)
await bot.unbanChatMember(groupId, targetUserId);

// ۶. ارتقای کاربر به سطح مدیر با تعیین دسترسی‌ها (Promote)
await bot.promoteChatMember(groupId, targetUserId, {
  can_change_info: true,
  can_delete_messages: true,
  can_invite_users: true,
  can_pin_messages: true
});

// ۷. تغییر مشخصات گروه (عکس، عنوان، توضیحات)
await bot.setChatTitle(groupId, 'انجمن برنامه‌نویسان بله 🚀');
await bot.setChatDescription(groupId, 'گفتگو پیرامون توسعه بازوها و مینی‌اپ‌های بله');
await bot.setChatPhoto(groupId, './assets/group_avatar.png');
// await bot.deleteChatPhoto(groupId); // حذف عکس فعلی گروه

// ۸. پین کردن و برداشتن پین پیام‌ها
await bot.pinChatMessage(groupId, messageId);
await bot.unpinChatMessage(groupId, messageId);
await bot.unpinAllChatMessages(groupId); // حذف همه پین‌ها

// ۹. ایجاد و باطل‌سازی لینک دعوت به چت
const invite = await bot.createChatInviteLink(groupId);
console.log('لینک دعوت جدید:', invite.invite_link);
await bot.revokeChatInviteLink(groupId, invite.invite_link);

// ۱۰. خروج بازو از گروه یا کانال
await bot.leaveChat(groupId);</code></pre>
        </div>
      </section>

      <!-- بخش ۸: ویرایش، حذف پیام‌ها و نظرخواهی -->
      <section id="bale-bot-messages">
        <h2>ویرایش، حذف، فوروارد و پاپ‌آپ نظرخواهی بله (Messages & askReview)</h2>
        <p>عملیات روی پیام‌های ارسال‌شده و متد اختصاصی پلتفرم بله برای ثبت امتیاز کاربر:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Messages & askReview)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. ویرایش متن پیام ارسال شده
await bot.editMessageText(chatId, messageId, 'این متن با موفقیت ویرایش شد! ✏️', {
  parse_mode: 'HTML'
});

// ۲. ویرایش کپشن رسانه
await bot.editMessageCaption(chatId, messageId, 'کپشن جدید ویدیو');

// ۳. ویرایش دکمه‌های شیشه‌ای زیر پیام
const newKb = new InlineKeyboard().button('دکمه جدید', 'btn_updated');
await bot.editMessageReplyMarkup(chatId, messageId, newKb);

// ۴. حذف تکی یا گروهی پیام‌ها
await bot.deleteMessage(chatId, messageId);
await bot.deleteMessages(chatId, [msgId1, msgId2, msgId3]);

// ۵. فوروارد و کپی پیام
await bot.forwardMessage(targetChatId, fromChatId, messageId);
await bot.copyMessage(targetChatId, fromChatId, messageId, { caption: 'کپی بدون تگ فوروارد' });

// ۶. متد اختصاصی بله: درخواست ثبت نظر و امتیاز کاربر (askReview)
// این متد یک دیالوگ بومی ۵ ستاره در کلاینت کاربر بله باز می‌کند تا به بازوی شما امتیاز دهد!
await bot.askReview(chatId);
console.log('دیالوگ ثبت امتیاز بومی بله برای کاربر نمایش داده شد.');</code></pre>
        </div>
      </section>

      <!-- بخش ۹: بسته‌های استیکر -->
      <section id="bale-bot-stickers">
        <h2>ساخت و مدیریت بسته‌های استیکر (Stickers API)</h2>
        <p>بازوهای بله امکان ساخت، آپلود و اضافه کردن استیکرهای اختصاصی را با فایل‌های PNG سایز ۵۱۲x۵۱۲ پیکسل دارند:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Stickers API)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. آپلود فایل استیکر PNG با سایز ۵۱۲x۵۱۲
const stickerFile = await bot.uploadStickerFile(userId, './stickers/emoji1.png');
console.log('فایل استیکر آپلود شد:', stickerFile.file_id);

// ۲. ساخت بسته استیکر جدید
await bot.createNewStickerSet(
  userId,
  'my_cool_stickers_by_mybot',
  'استیکرهای اختصاصی بازو',
  './stickers/emoji1.png',
  '🔥'
);

// ۳. افزودن استیکر جدید به بسته موجود
await bot.addStickerToSet(
  userId,
  'my_cool_stickers_by_mybot',
  './stickers/emoji2.png',
  '🚀'
);</code></pre>
        </div>
      </section>

      <!-- بخش ۱۰: پرداخت و فاکتور الکترونیک بله -->
      <section id="bale-bot-payments">
        <h2>پرداخت و کیف‌پول الکترونیکی بله (Electronic Wallet & Invoices)</h2>
        <p>پلتفرم مالی بله امکان صدور فاکتور ریالی مستقیم و کسر وجه از کیف‌پول یا درگاه شتابی را فراهم می‌کند:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Invoices & Payments)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. ارسال فاکتور پرداخت درون چت
await bot.sendInvoice(
  chatId,
  'اشتراک طلایی ۱ ماهه',
  'دسترسی نامحدود به تمامی امکانات ویژه بازو',
  'order_payload_10023',
  'PROVIDER_TOKEN_HERE',
  'IRR',
  [
    { label: 'مبلغ پلن', amount: 500000 },
    { label: 'تخفیف عیدانه', amount: -50000 }
  ],
  {
    photo_url: 'https://example.com/gold.jpg',
    need_phone_number: true
  }
);

// ۲. ساخت لینک مستقیم پرداخت بدون پیام
const payLink = await bot.createInvoiceLink(
  'خرید جم بازی',
  '۱۰۰۰ جم الماس',
  'gem_purchase_88',
  'PROVIDER_TOKEN_HERE',
  'IRR',
  [{ label: 'قیمت جم', amount: 150000 }]
);
console.log('لینک پرداخت مستقیم:', payLink);

// ۳. پاسخ‌دهی به تایید اولیه خرید (PreCheckoutQuery) ظرف ۱۰ ثانیه
bot.on('pre_checkout_query', async (query) => {
  console.log('درخواست خرید از کاربر:', query.from.id, 'مبلغ:', query.total_amount);
  // موجودی انبار را چک می‌کنیم و تایید می‌کنیم:
  await bot.answerPreCheckoutQuery(query.id, true);
});

// ۴. دریافت نوتیفیکیشن پرداخت نهایی موفق
bot.on('successful_payment', async (payment, msg) => {
  console.log('✅ پرداخت ' + payment.total_amount + ' ریال با شناسه پیگیری ' + payment.provider_payment_charge_id + ' انجام شد.');
  await bot.sendMessage(msg.chat.id, 'پرداخت شما با موفقیت تایید شد! اشتراک شما فعال گردید.');
});

// ۵. استعلام مستقل وضعیت یک تراکنش بانکی با شناسه
const tx = await bot.inquireTransaction('transaction_id_9988');
console.log('وضعیت تراکنش:', tx.status, 'مبلغ نهایی:', tx.amount);</code></pre>
        </div>
      </section>

      <!-- بخش ۱۱: جدول خطاهای HTTP Bot API -->
      <section id="bale-bot-errors">
        <h2>جدول خطاهای HTTP Bot API و راهنمای عیب‌یابی (Bot Error Codes)</h2>
        <p>هنگام بروز خطا در فراخوانی متدهای بازو، شیء خطای <code>Error</code> همراه با کدهای وضعیت استاندارد و توضیحات فارسی/انگلیسی بازگردانده می‌شود:</p>

        <div class="table-container">
          <table class="services-table">
            <thead>
              <tr>
                <th>کد وضعیت HTTP</th>
                <th>نوع خطا</th>
                <th>علت احتمالی در بله</th>
                <th>راهکار رفع مشکل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>400</code></td>
                <td><span class="badge badge-danger">Bad Request</span></td>
                <td>پارامترهای ارسالی نامعتبر، خالی بودن متن پیام، چت نامعتبر، یا خطای سینتکس Markdown/HTML.</td>
                <td>بررسی فرمت متن ارسالی یا استفاده از <code>parse_mode: 'HTML'</code> به جای Markdown.</td>
              </tr>
              <tr>
                <td><code>401</code></td>
                <td><span class="badge badge-danger">Unauthorized</span></td>
                <td>توکن بازو نامعتبر است یا توسط بات‌فادر باطل شده است.</td>
                <td>توکن دریافتی از <code>@botfather</code> را بازبینی کنید.</td>
              </tr>
              <tr>
                <td><code>403</code></td>
                <td><span class="badge badge-warning">Forbidden</span></td>
                <td>کاربر بازو را مسدود کرده است یا بازو از گروه اخراج شده و مجوز ارسال ندارد.</td>
                <td>بررسی دسترسی‌های بازو در گروه یا توقف ارسال به کاربر مسدودکننده.</td>
              </tr>
              <tr>
                <td><code>404</code></td>
                <td><span class="badge badge-warning">Not Found</span></td>
                <td>پیام، چت، یا متد درخواستی یافت نشد.</td>
                <td>بررسی <code>chat_id</code> و <code>message_id</code> های ارسالی.</td>
              </tr>
              <tr>
                <td><code>429</code></td>
                <td><span class="badge badge-warning">Too Many Requests</span></td>
                <td>تجاوز از سقف مجاز ارسال پیام (Rate Limit). آبجکت خطا شامل <code>err.parameters.retry_after</code> است.</td>
                <td>به مدت مشخص شده در <code>retry_after</code> ثانیه منتظر بمانید و سپس درخواست را تکرار کنید.</td>
              </tr>
              <tr>
                <td><code>500 / 502</code></td>
                <td><span class="badge badge-danger">Server Error</span></td>
                <td>خطای موقت در سرورهای بله یا قطعی ارتباط با دیتابیس بله.</td>
                <td>از سیستم تلاش مجدد خودکار (Retry with Exponential Backoff) استفاده کنید.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- بخش ۱۲: کاتالوگ جامع تمامی ۶۲ متد رسمی بات بله -->
      <section id="bale-bot-methods-table">
        <h2>کاتالوگ جامع تمامی ۶۲ متد رسمی بازوی بله (docs.bale.ai)</h2>
        <p>تمامی متدهای استاندارد پلتفرم بات بله در کلاس <code>BaleBot</code> با امضاهای دقیق، گزینه‌ها و تایپ‌های بازگشتی پیاده‌سازی شده‌اند:</p>

        <div class="table-container">
          <table class="services-table">
            <thead>
              <tr>
                <th>دسته‌بندی</th>
                <th>نام متد و پارامترها</th>
                <th>نوع بازگشتی</th>
                <th>توضیحات عملکرد</th>
              </tr>
            </thead>
            <tbody>
              <!-- چرخه حیات -->
              <tr><td><span class="badge badge-rpc">چرخه حیات</span></td><td><code>bot.getMe()</code></td><td><code>Promise&lt;User&gt;</code></td><td>دریافت اطلاعات حساب ربات (نام کاربری، نام، شناسه).</td></tr>
              <tr><td><span class="badge badge-rpc">چرخه حیات</span></td><td><code>bot.logout()</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>خروج از توکن و باطل‌سازی سشن فعلی ربات.</td></tr>
              <tr><td><span class="badge badge-rpc">چرخه حیات</span></td><td><code>bot.close()</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>بستن پردازش بات و لغو درخواست‌های باز.</td></tr>
              <!-- آپدیت و وب‌هوک -->
              <tr><td><span class="badge badge-rpc">آپدیت‌ها</span></td><td><code>bot.getUpdates(options)</code></td><td><code>Promise&lt;Update[]&gt;</code></td><td>دریافت دستی آرایه آپدیت‌ها با offset و limit.</td></tr>
              <tr><td><span class="badge badge-rpc">وب‌هوک</span></td><td><code>bot.setWebhook(urlOrOptions)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>تنظیم آدرس URL وب‌هوک و توکن امنیتی در سرور بله.</td></tr>
              <tr><td><span class="badge badge-rpc">وب‌هوک</span></td><td><code>bot.deleteWebhook()</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>حذف آدرس وب‌هوک و بازگشت به حالت Polling.</td></tr>
              <tr><td><span class="badge badge-rpc">وب‌هوک</span></td><td><code>bot.getWebhookInfo()</code></td><td><code>Promise&lt;WebhookInfo&gt;</code></td><td>استعلام وضعیت جاری وب‌هوک، خطاهای اخیر و اتصالات معلق.</td></tr>
              <tr><td><span class="badge badge-rpc">میدلور</span></td><td><code>bot.createWebhookMiddleware(opts)</code></td><td><code>Function(req, res)</code></td><td>میدلور پردازش وب‌هوک سازگار با Express و Node http.</td></tr>
              <tr><td><span class="badge badge-rpc">پولینگ</span></td><td><code>bot.startPolling(options)</code></td><td><code>void</code></td><td>شروع دریافت خودکار آپدیت‌ها با متد Long Polling.</td></tr>
              <tr><td><span class="badge badge-rpc">پولینگ</span></td><td><code>bot.stopPolling()</code></td><td><code>void</code></td><td>توقف دریافت آپدیت‌ها و لغو تایمرهای پولینگ.</td></tr>
              <!-- پیام‌ها -->
              <tr><td><span class="badge badge-primary">پیام متنی</span></td><td><code>bot.sendMessage(chatId, text, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ارسال پیام متنی با پشتیبانی از Markdown، HTML و کیبورد.</td></tr>
              <tr><td><span class="badge badge-primary">فوروارد</span></td><td><code>bot.forwardMessage(chatId, fromChatId, msgId)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>فوروارد پیام با حفظ نام ارسال‌کننده اصلی.</td></tr>
              <tr><td><span class="badge badge-primary">کپی پیام</span></td><td><code>bot.copyMessage(chatId, fromChatId, msgId, opts)</code></td><td><code>Promise&lt;{message_id}&gt;</code></td><td>کپی پیام بدون برچسب فوروارد.</td></tr>
              <!-- چندرسانه‌ای -->
              <tr><td><span class="badge badge-success">عکس</span></td><td><code>bot.sendPhoto(chatId, photo, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ارسال عکس از طریق file_id، URL، مسیر فایل یا Buffer.</td></tr>
              <tr><td><span class="badge badge-success">صدا</span></td><td><code>bot.sendAudio(chatId, audio, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ارسال فایل صوتی و موسیقی با مشخصات خواننده و عنوان.</td></tr>
              <tr><td><span class="badge badge-success">سند و فایل</span></td><td><code>bot.sendDocument(chatId, doc, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ارسال هرگونه فایل، اسناد PDF، Zip و داده‌ها.</td></tr>
              <tr><td><span class="badge badge-success">ویدیو</span></td><td><code>bot.sendVideo(chatId, video, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ارسال ویدیو همراه با ابعاد و مدت زمان.</td></tr>
              <tr><td><span class="badge badge-success">گیف</span></td><td><code>bot.sendAnimation(chatId, anim, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ارسال انیمیشن و گیف متحرک.</td></tr>
              <tr><td><span class="badge badge-success">ویس</span></td><td><code>bot.sendVoice(chatId, voice, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ارسال پیام صوتی (Voice note) فرمت OGG/Opus.</td></tr>
              <tr><td><span class="badge badge-success">آلبوم</span></td><td><code>bot.sendMediaGroup(chatId, media)</code></td><td><code>Promise&lt;Message[]&gt;</code></td><td>ارسال آلبوم رسانه‌ای متشکل از ۲ الی ۱۰ تصویر یا ویدیو.</td></tr>
              <tr><td><span class="badge badge-success">لوکیشن</span></td><td><code>bot.sendLocation(chatId, lat, lon, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ارسال موقعیت جغرافیایی روی نقشه.</td></tr>
              <tr><td><span class="badge badge-success">مخاطب</span></td><td><code>bot.sendContact(chatId, phone, name, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>اشتراک‌گذاری اطلاعات شماره تلفن و کارت مخاطب.</td></tr>
              <tr><td><span class="badge badge-success">وضعیت کار</span></td><td><code>bot.sendChatAction(chatId, action)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>نمایش وضعیت typing، upload_photo و غیره در هدر چت.</td></tr>
              <tr><td><span class="badge badge-success">دانلود فایل</span></td><td><code>bot.getFile(fileId)</code></td><td><code>Promise&lt;File&gt;</code></td><td>دریافت مسیر فایل و حجم آن جهت دانلود از سرور بله.</td></tr>
              <tr><td><span class="badge badge-success">دانلود فایل</span></td><td><code>bot.downloadFile(fileIdOrPath, dest)</code></td><td><code>Promise&lt;Buffer|string&gt;</code></td><td>دانلود مستقیم باینری فایل از بله و ذخیره در مسیر دلخواه.</td></tr>
              <!-- دکمه‌ها و کلیک‌ها -->
              <tr><td><span class="badge badge-info">دکمه شیشه‌ای</span></td><td><code>bot.answerCallbackQuery(id, opts)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>پاسخ به کلیک دکمه اینلاین با پیام ناتیفیکیشن یا آلرت پاپ‌آپ.</td></tr>
              <!-- متد اختصاصی بله -->
              <tr><td><span class="badge badge-gold">اختصاصی بله</span></td><td><code>bot.askReview(chatId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>باز کردن پنجره دیالوگ بومی ثبت نظر و امتیاز کاربر در بله.</td></tr>
              <!-- ویرایش و حذف -->
              <tr><td><span class="badge badge-primary">ویرایش</span></td><td><code>bot.editMessageText(chatId, msgId, text, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ویرایش متن پیام ارسال‌شده قبلی.</td></tr>
              <tr><td><span class="badge badge-primary">ویرایش</span></td><td><code>bot.editMessageCaption(chatId, msgId, cap, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ویرایش کپشن تصویر یا رسانه ارسال‌شده.</td></tr>
              <tr><td><span class="badge badge-primary">ویرایش</span></td><td><code>bot.editMessageReplyMarkup(chatId, msgId, kb)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>تغییر یا حذف کیبورد شیشه‌ای زیر پیام.</td></tr>
              <tr><td><span class="badge badge-danger">حذف پیام</span></td><td><code>bot.deleteMessage(chatId, messageId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>حذف یک پیام در گفتگو یا گروه.</td></tr>
              <tr><td><span class="badge badge-danger">حذف گروهی</span></td><td><code>bot.deleteMessages(chatId, messageIds)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>حذف همزمان چندین پیام با شناسه آرایه‌ای.</td></tr>
              <!-- مدیریت چت -->
              <tr><td><span class="badge badge-primary">مدیریت چت</span></td><td><code>bot.banChatMember(chatId, userId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>مسدودسازی و اخراج عضو از گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-primary">مدیریت چت</span></td><td><code>bot.unbanChatMember(chatId, userId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>رفع مسدودیت عضو اخراج‌شده قبلی.</td></tr>
              <tr><td><span class="badge badge-primary">مدیریت چت</span></td><td><code>bot.promoteChatMember(chatId, userId, opts)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>ارتقای سطح کاربر به مدیر گروه و تفویض اختیارات.</td></tr>
              <tr><td><span class="badge badge-primary">اطلاعات</span></td><td><code>bot.getChat(chatId)</code></td><td><code>Promise&lt;ChatFullInfo&gt;</code></td><td>دریافت اطلاعات جامع چت، گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-primary">اطلاعات</span></td><td><code>bot.getChatAdministrators(chatId)</code></td><td><code>Promise&lt;ChatMember[]&gt;</code></td><td>دریافت لیست مدیران و اختیارات تفویض شده.</td></tr>
              <tr><td><span class="badge badge-primary">اطلاعات</span></td><td><code>bot.getChatMembersCount(chatId)</code></td><td><code>Promise&lt;number&gt;</code></td><td>تعداد کل اعضای گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-primary">اطلاعات</span></td><td><code>bot.getChatMember(chatId, userId)</code></td><td><code>Promise&lt;ChatMember&gt;</code></td><td>استعلام رتبه و وضعیت یک عضو در چت.</td></tr>
              <tr><td><span class="badge badge-primary">تنظیمات چت</span></td><td><code>bot.setChatPhoto(chatId, photo)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>تنظیم یا تعویض عکس نمایه گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-primary">تنظیمات چت</span></td><td><code>bot.deleteChatPhoto(chatId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>حذف عکس پروفایل فعلی گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-primary">تنظیمات چت</span></td><td><code>bot.setChatTitle(chatId, title)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>تغییر عنوان گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-primary">تنظیمات چت</span></td><td><code>bot.setChatDescription(chatId, desc)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>تغییر بیوگرافی و توضیحات گروه.</td></tr>
              <tr><td><span class="badge badge-primary">پین پیام</span></td><td><code>bot.pinChatMessage(chatId, messageId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>سنجاق کردن پیام در بالای گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-primary">برداشتن پین</span></td><td><code>bot.unpinChatMessage(chatId, messageId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>برداشتن سنجاق یک پیام خاص.</td></tr>
              <tr><td><span class="badge badge-primary">برداشتن پین</span></td><td><code>bot.unPinChatMessage(chatId, messageId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>نام مستعار سازگار با استایل کمل‌کیس docs.bale.ai.</td></tr>
              <tr><td><span class="badge badge-primary">برداشتن پین</span></td><td><code>bot.unpinAllChatMessages(chatId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>پاکسازی کامل همه پیام‌های سنجاق‌شده در چت.</td></tr>
              <tr><td><span class="badge badge-primary">خروج</span></td><td><code>bot.leaveChat(chatId)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>خروج بازو از یک گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-primary">لینک دعوت</span></td><td><code>bot.createChatInviteLink(chatId)</code></td><td><code>Promise&lt;ChatInviteLink&gt;</code></td><td>ایجاد لینک دعوت جدید برای گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-primary">لینک دعوت</span></td><td><code>bot.revokeChatInviteLink(chatId, link)</code></td><td><code>Promise&lt;ChatInviteLink&gt;</code></td><td>باطل‌سازی لینک دعوت فعال قبلی.</td></tr>
              <tr><td><span class="badge badge-primary">لینک دعوت</span></td><td><code>bot.exportChatInviteLink(chatId)</code></td><td><code>Promise&lt;string&gt;</code></td><td>استخراج لینک اصلی دعوت به گروه.</td></tr>
              <!-- استیکر -->
              <tr><td><span class="badge badge-info">استیکر</span></td><td><code>bot.uploadStickerFile(userId, png)</code></td><td><code>Promise&lt;File&gt;</code></td><td>آپلود فایل استیکر PNG با سایز ۵۱۲x۵۱۲.</td></tr>
              <tr><td><span class="badge badge-info">استیکر</span></td><td><code>bot.createNewStickerSet(userId, name, title, png, emojis)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>ساخت بسته استیکر جدید برای ربات.</td></tr>
              <tr><td><span class="badge badge-info">استیکر</span></td><td><code>bot.addStickerToSet(userId, name, png, emojis)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>افزودن استیکر جدید به بسته موجود.</td></tr>
              <!-- پرداخت و کیف‌پول -->
              <tr><td><span class="badge badge-gold">پرداخت بله</span></td><td><code>bot.sendInvoice(chatId, title, desc, payload, token, curr, prices, opts)</code></td><td><code>Promise&lt;Message&gt;</code></td><td>ارسال فاکتور خرید کیف‌پول الکترونیکی بله با مبلغ ریالی.</td></tr>
              <tr><td><span class="badge badge-gold">پرداخت بله</span></td><td><code>bot.createInvoiceLink(title, desc, payload, token, curr, prices, opts)</code></td><td><code>Promise&lt;string&gt;</code></td><td>ساخت لینک مستقیم پرداخت بدون نیاز به ارسال پیام.</td></tr>
              <tr><td><span class="badge badge-gold">پرداخت بله</span></td><td><code>bot.answerPreCheckoutQuery(queryId, ok, errMsg)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>تایید نهایی وضعیت کالا ظرف ۱۰ ثانیه پیش از کسر وجه.</td></tr>
              <tr><td><span class="badge badge-gold">پرداخت بله</span></td><td><code>bot.inquireTransaction(transactionId)</code></td><td><code>Promise&lt;Transaction&gt;</code></td><td>استعلام وضعیت موفقیت، مبلغ و زمان تراکنش بانکی.</td></tr>
              <!-- فراخوانی عمومی و URL -->
              <tr><td><span class="badge badge-rpc">عمومی</span></td><td><code>bot.call(method, params, files)</code></td><td><code>Promise&lt;any&gt;</code></td><td>ارسال مستقیم هر درخواست سفارشی به پلتفرم HTTP بله.</td></tr>
              <tr><td><span class="badge badge-rpc">عمومی</span></td><td><code>bot.getMethodUrl(method)</code></td><td><code>string</code></td><td>تولید آدرس کامل متد همراه با توکن.</td></tr>
              <tr><td><span class="badge badge-rpc">عمومی</span></td><td><code>bot.getFileUrl(filePath)</code></td><td><code>string</code></td><td>تولید آدرس دانلود مستقیم فایل روی سرور بله.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
"""

def get_client_catalog_html():
    return r"""
      <!-- بخش کاتالوگ ۱۰۶ متد سطح بالای یوزربات -->
      <section id="client-methods-catalog">
        <h2>کاتالوگ جامع ۱۰۶ متد کاربردی سطح بالای کلاینت بله (BaleClient)</h2>
        <p>کلاس <code>BaleClient</code> بیش از ۱۰۶ متد سطح بالا و آماده (Convenience Methods) را برای تسریع برنامه‌نویسی و عدم درگیری مستقیم با باینری وایر ارائه می‌دهد. جدول زیر مرجع کامل تمامی این متدها در ۱۴ دسته‌بندی است:</p>

        <div class="table-container">
          <table class="services-table">
            <thead>
              <tr>
                <th>دسته‌بندی</th>
                <th>نام متد و پارامترها</th>
                <th>نوع بازگشتی</th>
                <th>توضیحات و کاربرد</th>
              </tr>
            </thead>
            <tbody>
              <!-- ۱. احراز هویت -->
              <tr><td><span class="badge badge-rpc">احراز هویت</span></td><td><code>client.connect()</code></td><td><code>Promise&lt;void&gt;</code></td><td>برقراری اتصال سوکت با سرورهای پروتکل بله.</td></tr>
              <tr><td><span class="badge badge-rpc">احراز هویت</span></td><td><code>client.disconnect()</code></td><td><code>void</code></td><td>قطع ایمن سوکت و لغو هارت‌بیت‌ها.</td></tr>
              <tr><td><span class="badge badge-rpc">احراز هویت</span></td><td><code>client.sendCode(phoneNumber)</code></td><td><code>Promise&lt;AuthCodeResponse&gt;</code></td><td>ارسال کد تایید پیامکی ۵ رقمی به شماره همراه.</td></tr>
              <tr><td><span class="badge badge-rpc">احراز هویت</span></td><td><code>client.signIn(code, hash)</code></td><td><code>Promise&lt;AuthResult&gt;</code></td><td>تایید کد ۵ رقمی و ورود به حساب کاربری.</td></tr>
              <tr><td><span class="badge badge-rpc">احراز هویت</span></td><td><code>client.signInWithPassword(pass, hash)</code></td><td><code>Promise&lt;AuthResult&gt;</code></td><td>تایید رمز عبور دو مرحله‌ای (2FA) بله.</td></tr>
              <tr><td><span class="badge badge-rpc">احراز هویت</span></td><td><code>client.logout()</code></td><td><code>Promise&lt;void&gt;</code></td><td>خروج کامل از حساب و باطل‌سازی نشست.</td></tr>
              <tr><td><span class="badge badge-rpc">احراز هویت</span></td><td><code>client.isConnected</code></td><td><code>boolean</code></td><td>وضعیت فعال بودن اتصال زنده سوکت.</td></tr>
              <tr><td><span class="badge badge-rpc">احراز هویت</span></td><td><code>client.me</code></td><td><code>User</code></td><td>اطلاعات نمایه کاربر متصل فعلی.</td></tr>

              <!-- ۲. پیام‌رسانی -->
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.sendMessage(peer, text, opts)</code></td><td><code>Promise&lt;SentMessage&gt;</code></td><td>ارسال پیام متنی با پشتیبانی از ریپلای و رفتار انسانی.</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.sendTextMessage(peerId, text, isGroup)</code></td><td><code>Promise&lt;SentMessage&gt;</code></td><td>ارسال سریع پیام متنی با شناسه عددی چت.</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.forwardMessages(toPeer, fromPeer, mids, opts)</code></td><td><code>Promise&lt;void&gt;</code></td><td>فوروارد گروهی پیام‌ها بین گفتگوها.</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.editMessage(peer, messageId, newText)</code></td><td><code>Promise&lt;void&gt;</code></td><td>ویرایش پیام ارسال‌شده در گفتگو.</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.pinMessage(peer, messageId)</code></td><td><code>Promise&lt;void&gt;</code></td><td>پین کردن پیام در گفتگوی خصوصی یا گروه.</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.deleteMessages(peer, mids)</code></td><td><code>Promise&lt;void&gt;</code></td><td>حذف یک یا چند پیام در گفتگو.</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.clearChat(peer)</code></td><td><code>Promise&lt;void&gt;</code></td><td>پاکسازی کامل تاریخچه گفتگو برای دو طرف.</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.loadDialogs(limit, endDate)</code></td><td><code>Promise&lt;DialogsResponse&gt;</code></td><td>دریافت لیست گفتگوهای فعال کاربر.</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.loadHistory(peer, limit, date)</code></td><td><code>Promise&lt;HistoryResponse&gt;</code></td><td>دریافت تاریخچه پیام‌های یک چت مشخص.</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.markAsReceived(peer, date)</code></td><td><code>Promise&lt;void&gt;</code></td><td>اعلام تحویل پیام به سرور (تک‌تیک خاکستری).</td></tr>
              <tr><td><span class="badge badge-primary">پیام‌رسانی</span></td><td><code>client.markAsRead(peer, date)</code></td><td><code>Promise&lt;void&gt;</code></td><td>اعلام خوانده شدن پیام (دو تیک آبی).</td></tr>

              <!-- ۳. رسانه و فایل -->
              <tr><td><span class="badge badge-success">چندرسانه‌ای</span></td><td><code>client.sendPhoto(peer, photo, opts)</code></td><td><code>Promise&lt;SentMessage&gt;</code></td><td>ارسال عکس به کاربر، گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-success">چندرسانه‌ای</span></td><td><code>client.sendVoice(peer, voice, opts)</code></td><td><code>Promise&lt;SentMessage&gt;</code></td><td>ارسال ویس با انیمیشن موج صوتی.</td></tr>
              <tr><td><span class="badge badge-success">چندرسانه‌ای</span></td><td><code>client.sendAudio(peer, audio, opts)</code></td><td><code>Promise&lt;SentMessage&gt;</code></td><td>ارسال فایل صوتی و آهنگ.</td></tr>
              <tr><td><span class="badge badge-success">چندرسانه‌ای</span></td><td><code>client.sendVideo(peer, video, opts)</code></td><td><code>Promise&lt;SentMessage&gt;</code></td><td>ارسال ویدیو همراه با پیش‌نمایش.</td></tr>
              <tr><td><span class="badge badge-success">چندرسانه‌ای</span></td><td><code>client.sendDocument(peer, doc, opts)</code></td><td><code>Promise&lt;SentMessage&gt;</code></td><td>ارسال انواع اسناد و فایل‌های دانلودی.</td></tr>
              <tr><td><span class="badge badge-success">چندرسانه‌ای</span></td><td><code>client.sendSticker(peer, stickerId, hash, packId)</code></td><td><code>Promise&lt;SentMessage&gt;</code></td><td>ارسال استیکر با شناسه باینری.</td></tr>

              <!-- ۴. گروه‌ها -->
              <tr><td><span class="badge badge-primary">گروه</span></td><td><code>client.createGroup(title, userIds)</code></td><td><code>Promise&lt;GroupInfo&gt;</code></td><td>ساخت گروه جدید همراه با افزودن اعضای اولیه.</td></tr>
              <tr><td><span class="badge badge-primary">گروه</span></td><td><code>client.getGroup(groupId)</code></td><td><code>Promise&lt;GroupInfo&gt;</code></td><td>دریافت اطلاعات و اعضای یک گروه.</td></tr>
              <tr><td><span class="badge badge-primary">گروه</span></td><td><code>client.inviteMembers(groupId, userIds)</code></td><td><code>Promise&lt;void&gt;</code></td><td>افزودن اعضای جدید به گروه.</td></tr>
              <tr><td><span class="badge badge-primary">گروه</span></td><td><code>client.kickMember(groupId, userId)</code></td><td><code>Promise&lt;void&gt;</code></td><td>اخراج یک عضو از گروه.</td></tr>
              <tr><td><span class="badge badge-primary">گروه</span></td><td><code>client.setGroupTitle(groupId, title)</code></td><td><code>Promise&lt;void&gt;</code></td><td>تغییر نام و عنوان گروه.</td></tr>
              <tr><td><span class="badge badge-primary">گروه</span></td><td><code>client.leaveGroup(groupId)</code></td><td><code>Promise&lt;void&gt;</code></td><td>ترک گروه توسط کاربر فعلی.</td></tr>

              <!-- ۵. مخاطبین و پروفایل -->
              <tr><td><span class="badge badge-info">مخاطبین</span></td><td><code>client.getUser(userId)</code></td><td><code>Promise&lt;UserInfo&gt;</code></td><td>دریافت مشخصات کامل حساب کاربری.</td></tr>
              <tr><td><span class="badge badge-info">مخاطبین</span></td><td><code>client.getContacts()</code></td><td><code>Promise&lt;Contact[]&gt;</code></td><td>دریافت لیست تمام مخاطبین همگام‌شده در بله.</td></tr>
              <tr><td><span class="badge badge-info">مخاطبین</span></td><td><code>client.importContacts(contacts)</code></td><td><code>Promise&lt;ImportResult&gt;</code></td><td>همگام‌سازی گروهی مخاطبین با دفترچه تلفن.</td></tr>
              <tr><td><span class="badge badge-info">مخاطبین</span></td><td><code>client.addContact(phone, name)</code></td><td><code>Promise&lt;Contact&gt;</code></td><td>افزودن مخاطب جدید با شماره تلفن.</td></tr>
              <tr><td><span class="badge badge-info">مخاطبین</span></td><td><code>client.addContactByUid(uid, accessHash)</code></td><td><code>Promise&lt;Contact&gt;</code></td><td>افزودن مخاطب با شناسه کاربری.</td></tr>
              <tr><td><span class="badge badge-info">مخاطبین</span></td><td><code>client.removeContact(uid, accessHash)</code></td><td><code>Promise&lt;void&gt;</code></td><td>حذف مخاطب از دفترچه تلفن.</td></tr>
              <tr><td><span class="badge badge-info">مخاطبین</span></td><td><code>client.searchContacts(query)</code></td><td><code>Promise&lt;SearchResult&gt;</code></td><td>جستجوی نام و نام‌کاربری در مخاطبین.</td></tr>
              <tr><td><span class="badge badge-info">پروفایل</span></td><td><code>client.editName(name)</code></td><td><code>Promise&lt;void&gt;</code></td><td>تغییر نام نمایشی اکانت کاربر.</td></tr>
              <tr><td><span class="badge badge-info">پروفایل</span></td><td><code>client.editAbout(about)</code></td><td><code>Promise&lt;void&gt;</code></td><td>تغییر بیوگرافی (About) اکانت.</td></tr>
              <tr><td><span class="badge badge-info">پروفایل</span></td><td><code>client.editUsername(username)</code></td><td><code>Promise&lt;void&gt;</code></td><td>تغییر یا ثبت نام‌کاربری عمومی (@username).</td></tr>
              <tr><td><span class="badge badge-info">پروفایل</span></td><td><code>client.checkUsername(username)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>استعلام آزاد بودن یک آیدی در بله.</td></tr>
              <tr><td><span class="badge badge-info">حریم خصوصی</span></td><td><code>client.blockUser(userId)</code></td><td><code>Promise&lt;void&gt;</code></td><td>مسدودسازی یک کاربر (بلاک).</td></tr>
              <tr><td><span class="badge badge-info">حریم خصوصی</span></td><td><code>client.unblockUser(userId)</code></td><td><code>Promise&lt;void&gt;</code></td><td>رفع مسدودیت کاربر مسدودشده.</td></tr>
              <tr><td><span class="badge badge-info">حریم خصوصی</span></td><td><code>client.loadBlockedUsers()</code></td><td><code>Promise&lt;UserInfo[]&gt;</code></td><td>دریافت لیست تمامی کاربران مسدودشده.</td></tr>

              <!-- ۶. واکنش‌ها و پوشه‌ها -->
              <tr><td><span class="badge badge-primary">واکنش</span></td><td><code>client.setReaction(peer, msgId, emoji)</code></td><td><code>Promise&lt;void&gt;</code></td><td>ثبت واکنش ایموجی (ری‌اکشن) روی پیام.</td></tr>
              <tr><td><span class="badge badge-primary">واکنش</span></td><td><code>client.removeReaction(peer, msgId, emoji)</code></td><td><code>Promise&lt;void&gt;</code></td><td>حذف واکنش ثبت‌شده از روی پیام.</td></tr>
              <tr><td><span class="badge badge-primary">واکنش</span></td><td><code>client.getReactions(peer, messageIds)</code></td><td><code>Promise&lt;ReactionInfo[]&gt;</code></td><td>دریافت لیست و آمار واکنش‌های ثبت‌شده.</td></tr>
              <tr><td><span class="badge badge-primary">پوشه‌ها</span></td><td><code>client.loadFolders()</code></td><td><code>Promise&lt;Folder[]&gt;</code></td><td>دریافت لیست پوشه‌بندی چت‌های کاربر.</td></tr>
              <tr><td><span class="badge badge-primary">پوشه‌ها</span></td><td><code>client.createFolder(title, peerIds)</code></td><td><code>Promise&lt;Folder&gt;</code></td><td>ایجاد پوشه جدید برای دسته‌بندی گفتگوها.</td></tr>
              <tr><td><span class="badge badge-primary">پوشه‌ها</span></td><td><code>client.deleteFolder(folderId)</code></td><td><code>Promise&lt;void&gt;</code></td><td>حذف یک پوشه از گفتگوها.</td></tr>

              <!-- ۷. نظرسنجی و کوییز -->
              <tr><td><span class="badge badge-info">نظرسنجی</span></td><td><code>client.sendPoll(peer, question, opts, cfg)</code></td><td><code>Promise&lt;SentMessage&gt;</code></td><td>ارسال نظرسنجی استاندارد در گروه یا کانال.</td></tr>
              <tr><td><span class="badge badge-info">نظرسنجی</span></td><td><code>client.createPoll(question, opts, cfg)</code></td><td><code>Promise&lt;PollInfo&gt;</code></td><td>ایجاد آبجکت نظرسنجی با تنظیمات چندگزینه‌ای یا کوییز.</td></tr>
              <tr><td><span class="badge badge-info">نظرسنجی</span></td><td><code>client.getPollResults(pollId)</code></td><td><code>Promise&lt;PollResults&gt;</code></td><td>دریافت آرای ثبت‌شده و درصد گزینه‌ها.</td></tr>
              <tr><td><span class="badge badge-info">نظرسنجی</span></td><td><code>client.closePoll(pollId)</code></td><td><code>Promise&lt;void&gt;</code></td><td>بستن و پایان مهلت شرکت در نظرسنجی.</td></tr>

              <!-- ۸. پاکت‌های هدیه نقدی -->
              <tr><td><span class="badge badge-gold">پاکت نقدی</span></td><td><code>client.sendGiftPacket(options)</code></td><td><code>Promise&lt;GiftPacketResult&gt;</code></td><td>ارسال پاکت هدیه ریالی با تقسیم مساوی یا رندوم.</td></tr>
              <tr><td><span class="badge badge-gold">پاکت نقدی</span></td><td><code>client.openGiftPacket(options)</code></td><td><code>Promise&lt;OpenGiftResult&gt;</code></td><td>باز کردن و مشاهده محتوای پاکت هدیه نقدی.</td></tr>
              <tr><td><span class="badge badge-gold">پاکت نقدی</span></td><td><code>client.claimGiftPacket(options)</code></td><td><code>Promise&lt;ClaimResult&gt;</code></td><td>برداشت و واریز مبلغ هدیه به کیف‌پول بله.</td></tr>
              <tr><td><span class="badge badge-gold">پاکت نقدی</span></td><td><code>client.getGiftPacketReceivers(options)</code></td><td><code>Promise&lt;Receiver[]&gt;</code></td><td>مشاهده لیست دریافت‌کنندگان و مبالغ واریزشده.</td></tr>
              <tr><td><span class="badge badge-gold">پاکت نقدی</span></td><td><code>client.getGiftPacketPaymentToken(options)</code></td><td><code>Promise&lt;string&gt;</code></td><td>دریافت توکن پرداخت جهت شارژ پاکت نقدی.</td></tr>

              <!-- ۹. پاکت‌های هدیه طلا -->
              <tr><td><span class="badge badge-gold">پاکت طلا</span></td><td><code>client.sendGoldGiftPacket(options)</code></td><td><code>Promise&lt;GoldPacketResult&gt;</code></td><td>ارسال پاکت هدیه طلا بر حسب میلی‌گرم طلا.</td></tr>
              <tr><td><span class="badge badge-gold">پاکت طلا</span></td><td><code>client.openGoldGiftPacket(packetId)</code></td><td><code>Promise&lt;GoldOpenResult&gt;</code></td><td>باز کردن پاکت طلای ارسالی در گفتگو.</td></tr>
              <tr><td><span class="badge badge-gold">پاکت طلا</span></td><td><code>client.claimGoldGiftPacket(packetId)</code></td><td><code>Promise&lt;GoldClaimResult&gt;</code></td><td>دریافت طلا و ثبت در گاوصندوق طلای بله.</td></tr>
              <tr><td><span class="badge badge-gold">پاکت طلا</span></td><td><code>client.getGoldGiftPacketWinners(packetId)</code></td><td><code>Promise&lt;GoldWinner[]&gt;</code></td><td>لیست برندگان و مقادیر طلای برداشته‌شده.</td></tr>

              <!-- ۱۰. مینی‌اپ‌ها -->
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.createMiniAppParams(botUserId, opts)</code></td><td><code>MiniAppParams</code></td><td>تولید بسته پارامترهای استاندارد initData با امضای HMAC-SHA256.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.createInitData(options)</code></td><td><code>string</code></td><td>تولید رشته خام داده‌های اولیه کلاینت.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.signInitData(data, botToken)</code></td><td><code>string</code></td><td>امضای دیجیتال رشته initData با کلید مخفی بات.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.validateInitData(initData, token, maxAge)</code></td><td><code>ValidationResult</code></td><td>اعتبارسنجی سمت سرور صحت هش و تاریخ انقضا.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.parseInitData(initData)</code></td><td><code>ParsedInitData</code></td><td>پارس کردن رشته احراز هویت به شیء جاوااسکریپت.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.buildMiniAppUrl(options)</code></td><td><code>string</code></td><td>تولید URL کامل اجرای مینی‌اپ با پارامترها و تم.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.getMiniAppUrl(options)</code></td><td><code>Promise&lt;string&gt;</code></td><td>استعلام آدرس نهایی مینی‌اپ از سرورهای بله.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.getWebappHash(botUserId, data)</code></td><td><code>Promise&lt;string&gt;</code></td><td>تولید هش امنیتی نشست وب‌اپ بله.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.sendMiniAppData(options)</code></td><td><code>Promise&lt;void&gt;</code></td><td>ارسال داده از مینی‌اپ به ربات میزبان.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.getBotMenuButton(botUserId)</code></td><td><code>Promise&lt;MenuButton&gt;</code></td><td>استعلام وضعیت و لینک دکمه منوی بازو.</td></tr>
              <tr><td><span class="badge badge-rpc">مینی‌اپ</span></td><td><code>client.invokeMiniAppCustomMethod(options)</code></td><td><code>Promise&lt;any&gt;</code></td><td>فراخوانی متدهای اختصاصی سرور مینی‌اپ بله.</td></tr>

              <!-- ۱۱. بانکداری شتاب -->
              <tr><td><span class="badge badge-gold">بانکداری</span></td><td><code>client.inquireDestinationPan(options)</code></td><td><code>Promise&lt;CardInquiryResult&gt;</code></td><td>استعلام نام دارنده کارت و نام بانک مقصد شتاب.</td></tr>
              <tr><td><span class="badge badge-gold">بانکداری</span></td><td><code>client.transferMoneyByCard(options)</code></td><td><code>Promise&lt;TransferResult&gt;</code></td><td>انتقال وجه کارت به کارت شتابی با رمز پویا.</td></tr>
              <tr><td><span class="badge badge-gold">بانکداری</span></td><td><code>client.getCardBalance(options)</code></td><td><code>Promise&lt;CardBalanceResult&gt;</code></td><td>دریافت موجودی واقعی و قابل برداشت کارت بانکی.</td></tr>

              <!-- ۱۲. استوری و زمان‌بندی -->
              <tr><td><span class="badge badge-primary">استوری</span></td><td><code>client.sendStory(options)</code></td><td><code>Promise&lt;StoryResult&gt;</code></td><td>انتشار استوری تصویری یا ویدیویی در بله.</td></tr>
              <tr><td><span class="badge badge-primary">استوری</span></td><td><code>client.deleteStory(storyId)</code></td><td><code>Promise&lt;void&gt;</code></td><td>حذف استوری منتشر شده پیش از موعد.</td></tr>
              <tr><td><span class="badge badge-primary">استوری</span></td><td><code>client.getUserStories(userId)</code></td><td><code>Promise&lt;Story[]&gt;</code></td><td>مشاهده استوری‌های فعال یک کاربر.</td></tr>
              <tr><td><span class="badge badge-primary">استوری</span></td><td><code>client.getStoryViewers(storyId)</code></td><td><code>Promise&lt;Viewer[]&gt;</code></td><td>مشاهده آمار و لیست بازدیدکنندگان استوری.</td></tr>
              <tr><td><span class="badge badge-primary">استوری</span></td><td><code>client.likeStory(storyId, reaction)</code></td><td><code>Promise&lt;void&gt;</code></td><td>ثبت لایک یا ری‌اکشن روی استوری دیگران.</td></tr>
              <tr><td><span class="badge badge-primary">زمان‌بندی</span></td><td><code>client.scheduleMessage(options)</code></td><td><code>Promise&lt;ScheduleTask&gt;</code></td><td>زمان‌بندی پیام برای ارسال خودکار در ساعت مشخص.</td></tr>
              <tr><td><span class="badge badge-primary">زمان‌بندی</span></td><td><code>client.loadScheduledMessages(peer)</code></td><td><code>Promise&lt;ScheduleTask[]&gt;</code></td><td>مشاهده پیام‌های زمان‌بندی‌شده آینده در چت.</td></tr>
              <tr><td><span class="badge badge-primary">زمان‌بندی</span></td><td><code>client.deleteScheduledMessage(peer, taskId)</code></td><td><code>Promise&lt;void&gt;</code></td><td>لغو ارسال پیام زمان‌بندی شده.</td></tr>

              <!-- ۱۳. هوش مصنوعی -->
              <tr><td><span class="badge badge-rpc">هوش مصنوعی</span></td><td><code>client.summarizeLink(link)</code></td><td><code>Promise&lt;string&gt;</code></td><td>خلاصه‌سازی خودکار محتوای لینک با مدل زبانی بله.</td></tr>
              <tr><td><span class="badge badge-rpc">هوش مصنوعی</span></td><td><code>client.askAI(prompt)</code></td><td><code>Promise&lt;string&gt;</code></td><td>پرسش مستقیم از هوش مصنوعی یکپارچه بله.</td></tr>

              <!-- ۱۴. حضور و استیلث ضد بن -->
              <tr><td><span class="badge badge-success">حضور و استیلث</span></td><td><code>client.setOnline(isOnline, timeout)</code></td><td><code>Promise&lt;void&gt;</code></td><td>تنظیم وضعیت آنلاین/آفلاین در کلاینت بله.</td></tr>
              <tr><td><span class="badge badge-success">حضور و استیلث</span></td><td><code>client.sendTyping(peer, durationMs, type)</code></td><td><code>Promise&lt;void&gt;</code></td><td>شبیه‌سازی وضعیت typing، voice، video برای مخاطب.</td></tr>
              <tr><td><span class="badge badge-success">حضور و استیلث</span></td><td><code>client.stopTyping(peer, type)</code></td><td><code>Promise&lt;void&gt;</code></td><td>پایان شبیه‌سازی تایپینگ.</td></tr>
              <tr><td><span class="badge badge-success">حضور و استیلث</span></td><td><code>client.setHumanize(value)</code></td><td><code>void</code></td><td>فعال یا غیرفعال کردن موتور رفتار انسانی.</td></tr>
              <tr><td><span class="badge badge-success">حضور و استیلث</span></td><td><code>client.enableHumanize(config)</code></td><td><code>void</code></td><td>پیکربندی تاخیر رندوم تایپینگ، سین و خواندن.</td></tr>
              <tr><td><span class="badge badge-success">حضور و استیلث</span></td><td><code>client.disableHumanize()</code></td><td><code>void</code></td><td>غیرفعال‌سازی تاخیرها برای ارسال فوری (بات مود).</td></tr>
              <tr><td><span class="badge badge-success">حضور و استیلث</span></td><td><code>client.isHumanized</code></td><td><code>boolean</code></td><td>وضعیت فعال بودن تنظیمات رفتار انسانی.</td></tr>
              <tr><td><span class="badge badge-success">عمومی</span></td><td><code>client.sleep(ms)</code></td><td><code>Promise&lt;void&gt;</code></td><td>تاخیر زمانی در صف درخواست‌ها بدون اشغال CPU.</td></tr>
              <tr><td><span class="badge badge-rpc">پروتکل باینری</span></td><td><code>client.invoke(service, method, payload, meta)</code></td><td><code>Promise&lt;any&gt;</code></td><td>فراخوانی مستقیم و سطح وایر هر متد از ۶۳۶ متد بله.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
"""

def get_toc_html():
    return r"""    <!-- فهرست در این صفحه (TOC شناور سمت چپ) -->
    <aside class="toc-container">
      <div class="toc-title">در این صفحه</div>
      <ul class="toc-list" id="tocList">
        <li class="toc-item"><a href="#intro">معرفی کتابخانه</a></li>
        <li class="toc-item"><a href="#features">ویژگی‌ها</a></li>
        <li class="toc-item"><a href="#installation">نصب و راه‌اندازی</a></li>
        <li class="toc-item"><a href="#quickstart">شروع سریع</a></li>
        <li class="toc-item"><a href="#connection-manage">مدیریت اتصال سوکت</a></li>
        <li class="toc-item"><a href="#auth-start">درخواست پیامک</a></li>
        <li class="toc-item"><a href="#auth-validate">تایید کد ۵ رقمی</a></li>
        <li class="toc-item"><a href="#auth-2fa">تایید دو مرحله‌ای</a></li>
        <li class="toc-item"><a href="#session-restore">بازیابی نشست</a></li>
        <li class="toc-item"><a href="#auth-logout">خروج از حساب</a></li>
        <li class="toc-item"><a href="#send-message">ارسال پیام متنی</a></li>
        <li class="toc-item"><a href="#messaging-read-receipts">تایید تحویل و سین</a></li>
        <li class="toc-item"><a href="#live-updates">سامانه جامع رویدادها (۶۰+ ایونت)</a></li>
        <li class="toc-item"><a href="#load-dialogs">لیست گفتگوها</a></li>
        <li class="toc-item"><a href="#load-history">تاریخچه چت</a></li>
        <li class="toc-item"><a href="#send-photo">ارسال عکس</a></li>
        <li class="toc-item"><a href="#send-voice">ارسال ویس</a></li>
        <li class="toc-item"><a href="#send-audio">ارسال موزیک</a></li>
        <li class="toc-item"><a href="#send-video">ارسال ویدیو</a></li>
        <li class="toc-item"><a href="#send-document">ارسال اسناد و فایل</a></li>
        <li class="toc-item"><a href="#send-sticker">ارسال استیکر</a></li>
        <li class="toc-item"><a href="#edit-message">ویرایش پیام</a></li>
        <li class="toc-item"><a href="#forward-messages">فوروارد پیام</a></li>
        <li class="toc-item"><a href="#pin-message">پین کردن پیام</a></li>
        <li class="toc-item"><a href="#delete-messages">حذف پیام</a></li>
        <li class="toc-item"><a href="#clear-chat">پاکسازی چت</a></li>
        <li class="toc-item"><a href="#group-create">ساخت گروه</a></li>
        <li class="toc-item"><a href="#user-profile">پروفایل و مخاطبین</a></li>
        <li class="toc-item"><a href="#contacts-add">افزودن مخاطب</a></li>
        <li class="toc-item"><a href="#profile-edit">ویرایش پروفایل</a></li>
        <li class="toc-item"><a href="#reactions-set">واکنش و ری‌اکشن</a></li>
        <li class="toc-item"><a href="#folders-manage">پوشه‌های گفتگو</a></li>
        <li class="toc-item"><a href="#polls-send">نظرسنجی و کوییز</a></li>
        <li class="toc-item"><a href="#wallet-credit">کیف پول و امتیازات</a></li>
        <li class="toc-item"><a href="#bot-callback">دکمه شیشه‌ای ربات</a></li>
        <li class="toc-item"><a href="#gift-packet-cash">پاکت هدیه نقدی</a></li>
        <li class="toc-item"><a href="#gift-packet-open">باز کردن پاکت نقدی</a></li>
        <li class="toc-item"><a href="#gift-packet-gold">پاکت هدیه طلا</a></li>
        <li class="toc-item"><a href="#gift-packet-gold-open">باز کردن پاکت طلا</a></li>
        <li class="toc-item"><a href="#miniapp-params">ساخت پارامتر مینی‌اپ</a></li>
        <li class="toc-item"><a href="#miniapp-url">آدرس مینی‌اپ</a></li>
        <li class="toc-item"><a href="#miniapp-hash">هش امنیتی وب‌اپ</a></li>
        <li class="toc-item"><a href="#miniapp-send-data">ارسال داده به ربات</a></li>
        <li class="toc-item"><a href="#story-manage">استوری‌های بله</a></li>
        <li class="toc-item"><a href="#scheduler-manage">پیام زمان‌بندی شده</a></li>
        <li class="toc-item"><a href="#ai-tldr">هوش مصنوعی و خلاصه‌ساز</a></li>
        <li class="toc-item"><a href="#card-inquiry">استعلام کارت شتابی</a></li>
        <li class="toc-item"><a href="#card-transfer">انتقال کارت به کارت</a></li>
        <li class="toc-item"><a href="#card-balance">موجودی کارت</a></li>
        <li class="toc-item"><a href="#presence-controls">وضعیت آنلاین و تایپ</a></li>
        <li class="toc-item"><a href="#stealth-controls">کنترل رفتار انسانی</a></li>
        <li class="toc-item"><a href="#client-methods-catalog">کاتالوگ ۱۰۶ متد BaleClient</a></li>
        <li class="toc-item"><a href="#bale-bot-overview">معرفی بازوی رسمی بله</a></li>
        <li class="toc-item"><a href="#bale-bot-types">ساختار انواع داده‌ای (Types)</a></li>
        <li class="toc-item"><a href="#bale-bot-formatting">فرمت‌بندی متن (Markdown/HTML)</a></li>
        <li class="toc-item"><a href="#bale-bot-polling">دریافت آپدیت (Polling & Webhook)</a></li>
        <li class="toc-item"><a href="#bale-bot-media">ارسال فایل و رسانه‌ها (Media)</a></li>
        <li class="toc-item"><a href="#bale-bot-keyboards">کیبوردها و دکمه‌ها (Buttons)</a></li>
        <li class="toc-item"><a href="#bale-bot-chat-admin">مدیریت چت و اعضا (Chat Admin)</a></li>
        <li class="toc-item"><a href="#bale-bot-messages">ویرایش، حذف و نظرخواهی (askReview)</a></li>
        <li class="toc-item"><a href="#bale-bot-stickers">بسته‌های استیکر (Stickers)</a></li>
        <li class="toc-item"><a href="#bale-bot-payments">پرداخت و کیف‌پول الکترونیکی</a></li>
        <li class="toc-item"><a href="#bale-bot-errors">جدول خطاهای HTTP Bot API</a></li>
        <li class="toc-item"><a href="#bale-bot-methods-table">کاتالوگ ۶۲ متد رسمی BaleBot</a></li>
        <li class="toc-item"><a href="#services-catalog">کاتالوگ ۵۳ سرویس</a></li>
        <li class="toc-item"><a href="#services-explorer">جستجوگر ۶۳۶ متد</a></li>
        <li class="toc-item"><a href="#errors-table">جدول خطاهای سرور</a></li>
        <li class="toc-item"><a href="#faq">سوالات متداول</a></li>
        <li class="toc-item"><a href="#go-overview">ارتباط با Go (Golang)</a></li>
        <li class="toc-item"><a href="#go-stdio-bridge">پل STDIO در Go</a></li>
        <li class="toc-item"><a href="#go-http-bridge">پل HTTP در Go</a></li>
      </ul>
    </aside>"""

def apply_patch():
    with open("build_docs.js", "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Update TOC
    toc_pattern = r'<!-- فهرست در این صفحه \(TOC شناور سمت چپ\) -->[\s\S]*?</aside>'
    code = re.sub(toc_pattern, get_toc_html().strip(), code, count=1)
    print("Replaced TOC.")

    # 2. Insert Client Methods Catalog before services-catalog
    if '<section id="client-methods-catalog">' not in code:
        target_marker = '<section id="services-catalog">'
        code = code.replace(target_marker, get_client_catalog_html() + "\n\n      " + target_marker)
        print("Inserted client-methods-catalog section.")

    # 3. Replace old Bot API section with full expanded Bot API sections
    bot_start = code.find('<!-- بخش اختصاصی بازوهای رسمی بله (Bale HTTP Bot API) -->')
    if bot_start == -1:
        bot_start = code.find('<section id="bale-bot-overview">')
    
    bot_end = code.find('<!-- بخش استوری، زمان‌بندی و هوش مصنوعی -->')
    if bot_end == -1:
        bot_end = code.find('<section id="story-manage">')

    if bot_start != -1 and bot_end != -1:
        code = code[:bot_start] + get_bot_sections_html() + "\n\n      " + code[bot_end:]
        print("Replaced Bot API sections with comprehensive 12-section suite.")
    else:
        print(f"Warning: Could not find bot section markers: bot_start={bot_start}, bot_end={bot_end}")

    with open("build_docs.js", "w", encoding="utf-8") as f:
        f.write(code)
    print("Successfully wrote updated build_docs.js!")

if __name__ == "__main__":
    apply_patch()
