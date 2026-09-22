/**
 * BaleBot Unit Test Suite
 * Tests HTTP Bot API client, keyboards, polling, webhooks, and payments
 */

const http = require("http");
const assert = require("assert");
const { BaleBot, InlineKeyboard, ReplyKeyboard, KeyboardRemove, buildMultipart } = require("../src/bot");

console.log("Testing BaleBot HTTP Bot API & Features...");

// 1. Instantiation & URL generation
const bot = new BaleBot("123456789:abcdIuZmK5qNEm2A1BhUaAg7MPJv1O9KCcBQB2ro");
assert.strictEqual(
  bot.getMethodUrl("sendMessage"),
  "https://tapi.bale.ai/bot123456789:abcdIuZmK5qNEm2A1BhUaAg7MPJv1O9KCcBQB2ro/sendMessage"
);
assert.strictEqual(
  bot.getFileUrl("documents/file_123.pdf"),
  "https://tapi.bale.ai/file/bot123456789:abcdIuZmK5qNEm2A1BhUaAg7MPJv1O9KCcBQB2ro/documents/file_123.pdf"
);
console.log("  ✅ BaleBot instantiation and URL generation passed");

// 2. Keyboard Builders
const inlineKb = new InlineKeyboard()
  .button("کلیک کنید", "btn_1")
  .url("سایت بله", "https://ble.ir")
  .row()
  .webApp("اجرای مینی‌اپ", "https://miniapp.example.com")
  .copyText("کپی کردن متن", "TEXT_TO_COPY")
  .toJSON();

assert.strictEqual(inlineKb.inline_keyboard.length, 2);
assert.strictEqual(inlineKb.inline_keyboard[0][0].text, "کلیک کنید");
assert.strictEqual(inlineKb.inline_keyboard[0][0].callback_data, "btn_1");
assert.strictEqual(inlineKb.inline_keyboard[0][1].url, "https://ble.ir");
assert.strictEqual(inlineKb.inline_keyboard[1][0].web_app.url, "https://miniapp.example.com");
assert.strictEqual(inlineKb.inline_keyboard[1][1].copy_text.text, "TEXT_TO_COPY");

const replyKb = new ReplyKeyboard({ resize: true, oneTime: true })
  .button("منوی اصلی")
  .row()
  .requestContact("ارسال شماره موبایل")
  .requestLocation("ارسال موقعیت مکانی")
  .toJSON();

assert.strictEqual(replyKb.keyboard.length, 2);
assert.strictEqual(replyKb.keyboard[0][0].text, "منوی اصلی");
assert.strictEqual(replyKb.keyboard[1][0].request_contact, true);
assert.strictEqual(replyKb.keyboard[1][1].request_location, true);
assert.strictEqual(replyKb.resize_keyboard, true);
assert.strictEqual(replyKb.one_time_keyboard, true);
assert.strictEqual(KeyboardRemove.remove_keyboard, true);
console.log("  ✅ InlineKeyboard, ReplyKeyboard, and KeyboardRemove passed");

// 3. Multipart / form-data builder
const multipart = buildMultipart(
  { chat_id: 12345, caption: "عکس تستی" },
  { photo: Buffer.from("fake-image-bytes") }
);
assert(multipart.headers["Content-Type"].includes("multipart/form-data; boundary="));
assert(multipart.payload.length > 0);
assert(multipart.payload.toString("utf8").includes("Content-Disposition: form-data; name=\"chat_id\""));
assert(multipart.payload.toString("utf8").includes("Content-Disposition: form-data; name=\"photo\"; filename=\"file.dat\""));
console.log("  ✅ Multipart form-data encoder passed");

// 4. Update Dispatcher & Events
let msgReceived = false;
let cbReceived = false;
let preCheckoutReceived = false;
let paymentReceived = false;

bot.on("message", (msg) => {
  if (msg.text === "/start") msgReceived = true;
});
bot.on("callback_query", (cq) => {
  if (cq.data === "btn_1") cbReceived = true;
});
bot.on("pre_checkout_query", (pcq) => {
  if (pcq.id === "pcq_123") preCheckoutReceived = true;
});
bot.on("successful_payment", (sp, msg) => {
  if (sp.total_amount === 50000) paymentReceived = true;
});

bot.handleUpdate({
  update_id: 1,
  message: { message_id: 101, text: "/start", chat: { id: 555 } }
});
bot.handleUpdate({
  update_id: 2,
  callback_query: { id: "cq_1", data: "btn_1", from: { id: 555 } }
});
bot.handleUpdate({
  update_id: 3,
  pre_checkout_query: { id: "pcq_123", from: { id: 555 }, total_amount: 50000 }
});
bot.handleUpdate({
  update_id: 4,
  message: {
    message_id: 102,
    chat: { id: 555 },
    successful_payment: { currency: "IRR", total_amount: 50000, invoice_payload: "order_1" }
  }
});

assert(msgReceived, "Message event must be emitted");
assert(cbReceived, "CallbackQuery event must be emitted");
assert(preCheckoutReceived, "PreCheckoutQuery event must be emitted");
assert(paymentReceived, "SuccessfulPayment event must be emitted");
console.log("  ✅ Update dispatcher and typed event emissions passed");

// 5. Mock HTTP Server for API Methods & Polling
async function runHttpTests() {
  const recordedRequests = [];
  let updateOffsetRequested = 0;

  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      recordedRequests.push({ url: req.url, method: req.method, body });

      res.setHeader("Content-Type", "application/json");

      if (req.url.endsWith("/getMe")) {
        res.end(JSON.stringify({
          ok: true,
          result: { id: 123456789, is_bot: true, first_name: "TestBot", username: "test_bot" }
        }));
      } else if (req.url.endsWith("/sendMessage")) {
        const parsed = JSON.parse(body);
        res.end(JSON.stringify({
          ok: true,
          result: { message_id: 999, text: parsed.text, chat: { id: parsed.chat_id } }
        }));
      } else if (req.url.endsWith("/sendInvoice")) {
        const parsed = JSON.parse(body);
        res.end(JSON.stringify({
          ok: true,
          result: { message_id: 1000, invoice: { title: parsed.title, total_amount: 25000 } }
        }));
      } else if (req.url.endsWith("/inquireTransaction")) {
        res.end(JSON.stringify({
          ok: true,
          result: { transaction_id: "tx_999", status: "SUCCESS", amount: 25000 }
        }));
      } else if (req.url.endsWith("/getUpdates")) {
        const parsed = JSON.parse(body);
        updateOffsetRequested = parsed.offset;
        res.end(JSON.stringify({
          ok: true,
          result: [
            { update_id: 10, message: { message_id: 1, text: "hello from poll" } }
          ]
        }));
      } else if (req.url.endsWith("/errorMethod")) {
        res.end(JSON.stringify({
          ok: false,
          error_code: 400,
          description: "Bad Request: Chat not found"
        }));
      } else {
        res.end(JSON.stringify({ ok: true, result: true }));
      }
    });
  });

  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const mockBaseUrl = `http://127.0.0.1:${port}`;

  const testBot = new BaleBot("test_token", { baseUrl: mockBaseUrl });

  // Test getMe
  const me = await testBot.getMe();
  assert.strictEqual(me.username, "test_bot");
  assert.strictEqual(me.is_bot, true);

  // Test sendMessage
  const sentMsg = await testBot.sendMessage(1234, "سلام بله!", { parse_mode: "Markdown" });
  assert.strictEqual(sentMsg.text, "سلام بله!");
  assert.strictEqual(sentMsg.message_id, 999);

  // Test sendInvoice
  const invRes = await testBot.sendInvoice(
    1234,
    "محصول تستی",
    "توضیحات فاکتور",
    "order_100",
    "PROVIDER_TOKEN",
    "IRR",
    [{ label: "قیمت", amount: 25000 }]
  );
  assert.strictEqual(invRes.invoice.title, "محصول تستی");

  // Test inquireTransaction
  const tx = await testBot.inquireTransaction("tx_999");
  assert.strictEqual(tx.status, "SUCCESS");
  assert.strictEqual(tx.amount, 25000);

  // Test Error handling
  let errorCaught = false;
  try {
    await testBot.call("errorMethod");
  } catch (err) {
    errorCaught = true;
    assert.strictEqual(err.error_code, 400);
    assert(err.message.includes("Chat not found"));
  }
  assert(errorCaught, "API call should throw on ok: false");

  // Test Webhook Middleware
  const webhookHandler = testBot.createWebhookMiddleware({ secretToken: "my_secret" });
  let middlewareHandled = false;
  testBot.once("message", (m) => {
    if (m.text === "webhook_msg") middlewareHandled = true;
  });

  const fakeReq = {
    method: "POST",
    headers: { "x-bale-bot-api-secret-token": "my_secret" },
    body: { update_id: 99, message: { text: "webhook_msg" } }
  };
  const fakeRes = {
    statusCode: 0,
    end: () => {}
  };
  webhookHandler(fakeReq, fakeRes);
  assert.strictEqual(fakeRes.statusCode, 200);
  assert(middlewareHandled, "Webhook middleware must dispatch update");

  // Test Polling Loop
  let pollingMsgHandled = false;
  testBot.once("message", (m) => {
    if (m.text === "hello from poll") pollingMsgHandled = true;
  });
  testBot.startPolling({ interval: 50, timeout: 0 });

  await new Promise(resolve => setTimeout(resolve, 200));
  testBot.stopPolling();
  assert(pollingMsgHandled, "Polling loop must dispatch message");
  assert.strictEqual(testBot._pollingOffset, 11, "Polling offset must increment to update_id + 1");

  server.close();
  console.log("  ✅ Mock HTTP Server API calls, error handling, webhooks & polling passed");

  console.log("\nAll BaleBot HTTP Bot API tests PASSED! 🚀✨\n");
}

runHttpTests().catch(err => {
  console.error("❌ BaleBot tests failed:", err);
  process.exit(1);
});
