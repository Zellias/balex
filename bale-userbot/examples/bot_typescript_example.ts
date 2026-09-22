/**
 * BaleBot - TypeScript Example (https://docs.bale.ai/)
 * Demonstrates strict types, autocomplete, and event handling for official Bale bots.
 */

import {
  BaleBot,
  InlineKeyboard,
  ReplyKeyboard,
  KeyboardRemove
} from "bale-userbot";

import type {
  BotMessage,
  BotCallbackQuery,
  BotPreCheckoutQuery,
  BotSuccessfulPayment,
  BotUser,
  BotTransaction
} from "bale-userbot";

async function main() {
  const token = process.env.BALE_BOT_TOKEN || "123456789:abcdIuZmK5qNEm2A1BhUaAg7MPJv1O9KCcBQB2ro";
  const bot = new BaleBot(token);

  // 1. Typed message handler
  bot.on("message", async (msg: BotMessage) => {
    console.log("Message from:", msg.chat.id, msg.text);

    if (msg.text === "/start") {
      const kb = new InlineKeyboard()
        .button("تست اینلاین", "btn_test")
        .url("وب‌سایت بله", "https://ble.ir")
        .row()
        .webApp("مینی‌اپ", "https://miniapp.example.com")
        .copyText("کپی متن", "COPY_ME");

      await bot.sendMessage(msg.chat.id, "سلام از بازوی تایپ‌اسکریپتی بله!", {
        reply_markup: kb
      });
    }
  });

  // 2. Callback query
  bot.on("callback_query", async (query: BotCallbackQuery) => {
    await bot.answerCallbackQuery(query.id, { text: "کلیک ثبت شد!" });
  });

  // 3. Electronic Wallet Payments
  bot.on("pre_checkout_query", async (query: BotPreCheckoutQuery) => {
    await bot.answerPreCheckoutQuery(query.id, true);
  });

  bot.on("successful_payment", async (payment: BotSuccessfulPayment, msg: BotMessage) => {
    console.log("Payment success:", payment.total_amount);
  });

  // 4. Inquire Transaction
  // const tx: BotTransaction = await bot.inquireTransaction("tx_12345");
  // console.log("Transaction status:", tx.status);
}

main().catch(console.error);
