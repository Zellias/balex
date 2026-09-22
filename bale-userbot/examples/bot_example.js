/**
 * BaleBot - Official Bale HTTP Bot API Example
 * Demonstrates Long Polling, Inline & Reply Keyboards, Mini Apps, and Payments.
 * Documentation: https://docs.bale.ai/
 */

const { BaleBot, InlineKeyboard, ReplyKeyboard } = require("../index");

// 1. Initialize with your token from @botfather on Bale
const token = process.env.BALE_BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
const bot = new BaleBot(token);

// 2. Register message listener
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  console.log(`[Received Message] from ${chatId}: "${text}"`);

  // /start command
  if (text === "/start") {
    // Reply with a welcoming message and inline keyboard
    const kb = new InlineKeyboard()
      .button("📚 مشاهده مستندات", "docs_click")
      .url("🌐 کانال رسمی بله", "https://ble.ir/bale")
      .row()
      .webApp("🚀 اجرای مینی‌اپ", "https://miniapp.example.com")
      .copyText("📋 کپی کد معرف", "REF12345");

    await bot.sendMessage(chatId, "سلام! به بازوی رسمی بله خوش آمدید.\nیکی از گزینه‌های زیر را انتخاب کنید:", {
      parse_mode: "Markdown",
      reply_markup: kb
    });
    return;
  }

  // Menu command with Reply Keyboard
  if (text === "/menu") {
    const menuKb = new ReplyKeyboard({ resize: true })
      .button("🎁 خرید اشتراک")
      .button("📞 ارتباط با ما")
      .row()
      .requestContact("📱 ارسال شماره تلفن")
      .requestLocation("📍 ارسال موقعیت");

    await bot.sendMessage(chatId, "منوی اصلی بازو:", {
      reply_markup: menuKb
    });
    return;
  }

  // Invoice / Payment demo (Bale Electronic Wallet)
  if (text === "🎁 خرید اشتراک" || text === "/buy") {
    await bot.sendInvoice(
      chatId,
      "اشتراک ویژه ۱ ماهه",
      "دسترسی به تمامی قابلیت‌های پیشرفته بازوی بله",
      "order_vip_1month",
      "PROVIDER_TOKEN_HERE",
      "IRR",
      [
        { label: "هزینه اشتراک", amount: 500000 },
        { label: "تخفیف ویژه", amount: -50000 }
      ],
      {
        photo_url: "https://example.com/vip.jpg"
      }
    );
    return;
  }

  // Echo other messages
  if (text) {
    await bot.sendMessage(chatId, `پیام شما دریافت شد: "${text}"`, {
      reply_to_message_id: msg.message_id
    });
  }
});

// 3. Register callback query listener (Inline buttons)
bot.on("callback_query", async (query) => {
  console.log(`[Callback Query] id: ${query.id}, data: ${query.data}`);

  if (query.data === "docs_click") {
    await bot.answerCallbackQuery(query.id, {
      text: "مستندات بله در https://docs.bale.ai در دسترس است.",
      show_alert: true
    });
  } else {
    await bot.answerCallbackQuery(query.id, {
      text: "عملیات با موفقیت انجام شد."
    });
  }
});

// 4. Register pre-checkout query listener (Before payment completes)
bot.on("pre_checkout_query", async (pcq) => {
  console.log(`[PreCheckout] ID: ${pcq.id}, Amount: ${pcq.total_amount} ${pcq.currency}`);
  // Confirm payment
  await bot.answerPreCheckoutQuery(pcq.id, true);
});

// 5. Register successful payment listener
bot.on("successful_payment", async (payment, msg) => {
  console.log(`🎉 Payment received: ${payment.total_amount} ${payment.currency} for payload: ${payment.invoice_payload}`);
  await bot.sendMessage(msg.chat.id, "پرداخت شما با موفقیت انجام شد! اشتراک شما فعال گردید. ✅");
});

// 6. Handle errors
bot.on("error", (err) => {
  console.error("Bot Error:", err.message);
});

// 7. Start receiving updates via Long Polling
async function start() {
  const me = await bot.getMe();
  console.log(`Bot started as @${me.username} (${me.first_name})!`);
  bot.startPolling({ interval: 300, timeout: 20 });
}

if (process.env.BALE_BOT_TOKEN) {
  start().catch(console.error);
} else {
  console.log("BaleBot example created! Set BALE_BOT_TOKEN environment variable to run live.");
}
