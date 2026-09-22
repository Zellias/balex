import sys
import re

with open("build_docs.js", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update repo links
content = content.replace("github.com/exactslash/balex", "github.com/Zellias/balex")
content = content.replace("require('bale-userbot')", "require('balex')")

# 2. Update Sidebar
new_sidebar = """    <!-- سایدبار راست (فهرست ناوبری) -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-group">
        <div class="sidebar-title">شروع به کار</div>
        <a href="#intro" class="sidebar-link active">معرفی کتابخانه BaleX</a>
        <a href="#features" class="sidebar-link">ویژگی‌های برجسته</a>
        <a href="#installation" class="sidebar-link">نصب و راه‌اندازی</a>
        <a href="#quickstart" class="sidebar-link">شروع سریع (Quickstart)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">مدیریت اتصال و نشست</div>
        <a href="#connection-manage" class="sidebar-link">اتصال و قطع سوکت (connect / disconnect)</a>
        <a href="#auth-start" class="sidebar-link">درخواست کد (sendCode)</a>
        <a href="#auth-validate" class="sidebar-link">تایید پیامک (signIn)</a>
        <a href="#auth-2fa" class="sidebar-link">تایید دو مرحله‌ای (signInWithPassword)</a>
        <a href="#session-restore" class="sidebar-link">بازیابی و ذخیره نشست (Session)</a>
        <a href="#auth-logout" class="sidebar-link">خروج از حساب (logout)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">پیام‌رسانی و رویدادها</div>
        <a href="#send-message" class="sidebar-link">ارسال پیام و نقل‌قول (sendMessage)</a>
        <a href="#messaging-read-receipts" class="sidebar-link">تایید تحویل و سین (markAsRead)</a>
        <a href="#live-updates" class="sidebar-link">کاتالوگ جامع رویدادها (۶۰+ ایونت زنده)</a>
        <a href="#load-dialogs" class="sidebar-link">لیست گفتگوها (loadDialogs)</a>
        <a href="#load-history" class="sidebar-link">تاریخچه چت (loadHistory)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">ارسال چندرسانه‌ای (Media)</div>
        <a href="#send-photo" class="sidebar-link">ارسال عکس (sendPhoto)</a>
        <a href="#send-voice" class="sidebar-link">ارسال ویس و صدا (sendVoice)</a>
        <a href="#send-audio" class="sidebar-link">ارسال موزیک و آهنگ (sendAudio)</a>
        <a href="#send-video" class="sidebar-link">ارسال ویدیو (sendVideo)</a>
        <a href="#send-document" class="sidebar-link">ارسال فایل و اسناد (sendDocument)</a>
        <a href="#send-sticker" class="sidebar-link">ارسال استیکر (sendSticker)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">مدیریت پیام‌ها و گفتگوها</div>
        <a href="#edit-message" class="sidebar-link">ویرایش پیام (editMessage)</a>
        <a href="#forward-messages" class="sidebar-link">فوروارد پیام‌ها (forwardMessages)</a>
        <a href="#pin-message" class="sidebar-link">پین کردن پیام (pinMessage)</a>
        <a href="#delete-messages" class="sidebar-link">حذف پیام‌ها (deleteMessages)</a>
        <a href="#clear-chat" class="sidebar-link">پاکسازی گفتگو (clearChat)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">مدیریت گروه‌ها و کانال‌ها</div>
        <a href="#group-create" class="sidebar-link">ساخت گروه جدید (createGroup)</a>
        <a href="#group-invite" class="sidebar-link">افزودن عضو (inviteMembers)</a>
        <a href="#group-kick" class="sidebar-link">اخراج عضو (kickMember)</a>
        <a href="#group-title" class="sidebar-link">تغییر عنوان گروه (setGroupTitle)</a>
        <a href="#group-leave" class="sidebar-link">ترک گروه (leaveGroup)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">کاربران، مخاطبین و پروفایل</div>
        <a href="#user-profile" class="sidebar-link">پروفایل کاربر (getUser)</a>
        <a href="#group-profile" class="sidebar-link">اطلاعات گروه (getGroup)</a>
        <a href="#contacts-list" class="sidebar-link">مخاطبین بله (getContacts)</a>
        <a href="#contacts-add" class="sidebar-link">افزودن مخاطب (addContact)</a>
        <a href="#contacts-import" class="sidebar-link">همگام‌سازی گروهی (importContacts)</a>
        <a href="#contacts-remove" class="sidebar-link">حذف مخاطب (removeContact)</a>
        <a href="#contacts-search" class="sidebar-link">جستجوی مخاطبین (searchContacts)</a>
        <a href="#profile-edit" class="sidebar-link">ویرایش نام و بیو (editName / editAbout)</a>
        <a href="#username-edit" class="sidebar-link">نام‌کاربری (editUsername / check)</a>
        <a href="#users-block" class="sidebar-link">مسدودسازی (blockUser / unblock)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">واکنش‌ها و پوشه‌ها</div>
        <a href="#reactions-set" class="sidebar-link">ثبت واکنش ایموجی (setReaction)</a>
        <a href="#reactions-remove" class="sidebar-link">حذف واکنش (removeReaction)</a>
        <a href="#reactions-get" class="sidebar-link">لیست واکنش‌ها (getReactions)</a>
        <a href="#folders-manage" class="sidebar-link">پوشه‌های گفتگو (Folders)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">پاکت‌های هدیه (Gift Packets)</div>
        <a href="#gift-packet-cash" class="sidebar-link">ارسال پاکت هدیه نقدی (sendGiftPacket)</a>
        <a href="#gift-packet-open" class="sidebar-link">باز کردن پاکت نقدی (openGiftPacket)</a>
        <a href="#gift-packet-gold" class="sidebar-link">ارسال پاکت هدیه طلا (sendGoldGiftPacket)</a>
        <a href="#gift-packet-gold-open" class="sidebar-link">باز کردن پاکت طلا (openGoldGiftPacket)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">مینی‌اپ‌ها و وب‌اپ‌ها (Mini Apps)</div>
        <a href="#miniapp-params" class="sidebar-link">ساخت پارامترهای مینی‌اپ (createMiniAppParams)</a>
        <a href="#miniapp-url" class="sidebar-link">دریافت آدرس مینی‌اپ (getMiniAppUrl)</a>
        <a href="#miniapp-hash" class="sidebar-link">هش امنیتی وب‌اپ (getWebappHash)</a>
        <a href="#miniapp-send-data" class="sidebar-link">ارسال داده به ربات (sendMiniAppData)</a>
        <a href="#miniapp-menu" class="sidebar-link">دکمه منو و متد سفارشی (Menu & Custom)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">نظرسنجی، استوری و زمان‌بندی</div>
        <a href="#polls-send" class="sidebar-link">ارسال نظرسنجی و کوییز (sendPoll)</a>
        <a href="#polls-manage" class="sidebar-link">مدیریت نظرسنجی (createPoll / close)</a>
        <a href="#story-manage" class="sidebar-link">استوری بله (sendStory / getStories)</a>
        <a href="#scheduler-manage" class="sidebar-link">پیام زمان‌بندی شده (scheduleMessage)</a>
        <a href="#ai-tldr" class="sidebar-link">هوش مصنوعی و خلاصه‌ساز (AI & TLDR)</a>
        <a href="#wallet-credit" class="sidebar-link">کیف پول و امتیازات (Wallet)</a>
        <a href="#bot-callback" class="sidebar-link">دکمه شیشه‌ای ربات (sendInlineCallback)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">بانکداری و خدمات مالی شتابی</div>
        <a href="#card-inquiry" class="sidebar-link">استعلام کارت مقصد (inquireDestinationPan)</a>
        <a href="#card-transfer" class="sidebar-link">انتقال وجه کارت به کارت (transferMoney)</a>
        <a href="#card-balance" class="sidebar-link">موجودی کارت (getCardBalance)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">موتور حضور و ضد مسدودی</div>
        <a href="#presence-controls" class="sidebar-link">وضعیت آنلاین و تایپینگ (Presence)</a>
        <a href="#stealth-controls" class="sidebar-link">کنترل رفتار انسانی (Humanize)</a>
        <a href="#stealth-engine" class="sidebar-link">معماری ضد مسدودی</a>
        <a href="#anti-ban-tips" class="sidebar-link">نکات طلایی ضد بن</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">کاتالوگ متدهای یوزربات</div>
        <a href="#client-methods-catalog" class="sidebar-link">جدول جامع ۱۰۶ متد BaleClient</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">بازوهای رسمی بله (docs.bale.ai)</div>
        <a href="#bale-bot-overview" class="sidebar-link">معرفی و احراز هویت با BotFather</a>
        <a href="#bale-bot-types" class="sidebar-link">ساختار انواع داده‌ای (Bale Types)</a>
        <a href="#bale-bot-formatting" class="sidebar-link">فرمت‌بندی متن (Markdown & HTML)</a>
        <a href="#bale-bot-polling" class="sidebar-link">دریافت آپدیت‌ها و وب‌هوک (Polling)</a>
        <a href="#bale-bot-media" class="sidebar-link">ارسال انواع فایل و رسانه (Media)</a>
        <a href="#bale-bot-keyboards" class="sidebar-link">دکمه‌های شیشه‌ای و کیبورد (Buttons)</a>
        <a href="#bale-bot-chat-admin" class="sidebar-link">مدیریت چت، اعضا و لینک‌ها (Admin)</a>
        <a href="#bale-bot-messages" class="sidebar-link">ویرایش، حذف و نظرخواهی (askReview)</a>
        <a href="#bale-bot-stickers" class="sidebar-link">بسته‌های استیکر (Stickers)</a>
        <a href="#bale-bot-payments" class="sidebar-link">پرداخت و فاکتور الکترونیک (Invoices)</a>
        <a href="#bale-bot-errors" class="sidebar-link">جدول خطاهای HTTP Bot API</a>
        <a href="#bale-bot-methods-table" class="sidebar-link">کاتالوگ ۶۲ متد رسمی BaleBot</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">پروتکل باینری و کاتالوگ خدمات</div>
        <a href="#wire-protocol" class="sidebar-link">معماری باینری Protobuf و gRPC</a>
        <a href="#generic-rpc" class="sidebar-link">فراخوانی عمومی RPC (invoke)</a>
        <a href="#services-catalog" class="sidebar-link">کاتالوگ ۵۳ سرویس در ۱۰ حوزه</a>
        <a href="#services-explorer" class="sidebar-link">جستجوگر تعاملی ۶۳۶ متد</a>
        <a href="#errors-table" class="sidebar-link">جدول خطاهای سرور بله</a>
        <a href="#faq" class="sidebar-link">سوالات متداول (FAQ)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">اتصال و اجرا با Go (Golang)</div>
        <a href="#go-overview" class="sidebar-link">ارتباط کتابخانه با Go</a>
        <a href="#go-stdio-bridge" class="sidebar-link">پل پرسرعت STDIO (os/exec)</a>
        <a href="#go-http-bridge" class="sidebar-link">پل HTTP میکرو‌سرویس</a>
      </div>
    </aside>"""

sidebar_pattern = r'<!-- سایدبار راست \(فهرست ناوبری\) -->[\s\S]*?</aside>'
content = re.sub(sidebar_pattern, new_sidebar, content, count=1)
print("Updated sidebar navigation.")

with open("build_docs.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Saved partial update to build_docs.js")
