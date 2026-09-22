/**
 * BaleBot - Official Bale HTTP Bot API Client
 * High-performance, zero-dependency client for Bale bots (https://docs.bale.ai/)
 * Supports Long Polling, Webhooks, Keyboards, Media, and Electronic Wallet / Invoices.
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const { URL } = require("url");
const { EventEmitter } = require("events");

/**
 * Helper to build multipart/form-data payload without external dependencies
 */
function buildMultipart(fields = {}, files = {}) {
  const boundary = "----BaleBotFormBoundary" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const chunks = [];

  // Text / JSON fields
  for (const [key, val] of Object.entries(fields)) {
    if (val === undefined || val === null) continue;
    const strVal = typeof val === "object" ? JSON.stringify(val) : String(val);
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${strVal}\r\n`
    ));
  }

  // Files
  for (const [fieldName, fileObj] of Object.entries(files)) {
    if (!fileObj) continue;
    let fileName = "file.dat";
    let fileData = fileObj;
    let contentType = "application/octet-stream";

    if (Buffer.isBuffer(fileObj)) {
      fileData = fileObj;
    } else if (typeof fileObj === "object" && fileObj.data) {
      fileData = Buffer.isBuffer(fileObj.data) ? fileObj.data : Buffer.from(fileObj.data);
      fileName = fileObj.filename || fileObj.name || fileName;
      contentType = fileObj.contentType || contentType;
    } else if (typeof fileObj === "string") {
      // Check if it is a local file path
      if (fs.existsSync(fileObj)) {
        fileData = fs.readFileSync(fileObj);
        fileName = fileObj.split("/").pop() || fileName;
      } else {
        fileData = Buffer.from(fileObj);
      }
    }

    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n`
    ));
    chunks.push(fileData);
    chunks.push(Buffer.from("\r\n"));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  const payload = Buffer.concat(chunks);

  return {
    payload,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": payload.length
    }
  };
}

/**
 * Main BaleBot Client Class
 */
class BaleBot extends EventEmitter {
  /**
   * @param {string} token - Bot token provided by @botfather on Bale (e.g. "123456789:abcd...")
   * @param {Object} [options]
   * @param {string} [options.baseUrl="https://tapi.bale.ai"] - Bale Bot API base URL
   * @param {number} [options.timeout=30000] - Request timeout in ms
   */
  constructor(token, options = {}) {
    super();
    if (!token || typeof token !== "string") {
      throw new Error("BaleBot requires a valid bot token from @botfather");
    }

    this.token = token.trim();
    this.baseUrl = (options.baseUrl || "https://tapi.bale.ai").replace(/\/+$/, "");
    this.timeout = options.timeout || 30000;

    // Polling state
    this._isPolling = false;
    this._pollingOffset = 0;
    this._pollingTimer = null;
    this._pollingAbortController = null;
    this._me = null;
  }

  /**
   * Construct full URL for a bot API method
   * @param {string} method
   * @returns {string}
   */
  getMethodUrl(method) {
    return `${this.baseUrl}/bot${this.token}/${method}`;
  }

  /**
   * Construct full URL for downloading a file
   * @param {string} filePath
   * @returns {string}
   */
  getFileUrl(filePath) {
    return `${this.baseUrl}/file/bot${this.token}/${filePath.replace(/^\/+/, "")}`;
  }

  /**
   * Universal HTTP API invoker
   * @param {string} method
   * @param {Object} [params={}]
   * @param {Object} [files=null]
   * @returns {Promise<any>}
   */
  async call(method, params = {}, files = null) {
    const urlStr = this.getMethodUrl(method);
    const url = new URL(urlStr);

    let body;
    let headers = {
      "User-Agent": "BaleBot-NodeJS/1.0",
      "Accept": "application/json"
    };

    if (files && Object.keys(files).length > 0) {
      const multi = buildMultipart(params, files);
      body = multi.payload;
      Object.assign(headers, multi.headers);
    } else {
      body = Buffer.from(JSON.stringify(params), "utf8");
      headers["Content-Type"] = "application/json; charset=utf-8";
      headers["Content-Length"] = body.length;
    }

    const transport = url.protocol === "http:" ? http : https;

    return new Promise((resolve, reject) => {
      const req = transport.request(url, {
        method: "POST",
        headers,
        timeout: this.timeout
      }, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const rawText = Buffer.concat(chunks).toString("utf8");
          try {
            const data = JSON.parse(rawText);
            if (data.ok) {
              resolve(data.result);
            } else {
              const err = new Error(data.description || "Bale Bot API call failed");
              err.error_code = data.error_code;
              err.parameters = data.parameters;
              err.method = method;
              reject(err);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response for ${method}: ${rawText.slice(0, 200)}`));
          }
        });
      });

      req.on("error", (err) => reject(err));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Request timeout (${this.timeout}ms) on ${method}`));
      });

      req.write(body);
      req.end();
    });
  }

  // ==========================================
  // Bot Authentication & Info
  // ==========================================

  /**
   * Get basic information about the bot.
   * @returns {Promise<Object>} User object representing the bot
   */
  async getMe() {
    const me = await this.call("getMe");
    this._me = me;
    return me;
  }

  /**
   * Log out from the cloud Bot API server.
   */
  async logout() {
    return this.call("logout");
  }

  /**
   * Close the bot instance before moving it to another local server.
   */
  async close() {
    return this.call("close");
  }

  // ==========================================
  // Receiving Updates (Long Polling & Webhook)
  // ==========================================

  /**
   * Receive incoming updates using long polling.
   * @param {Object} [options]
   * @param {number} [options.offset] - Identifier of the first update to be returned
   * @param {number} [options.limit=100] - Max updates to retrieve (1-100)
   * @param {number} [options.timeout=0] - Long polling timeout in seconds
   * @returns {Promise<Array<Object>>}
   */
  async getUpdates(options = {}) {
    return this.call("getUpdates", options);
  }

  /**
   * Set webhook URL to receive updates.
   * @param {string|Object} urlOrOptions - Webhook HTTPS URL or options object
   * @returns {Promise<boolean>}
   */
  async setWebhook(urlOrOptions) {
    const params = typeof urlOrOptions === "string" ? { url: urlOrOptions } : urlOrOptions;
    return this.call("setWebhook", params);
  }

  /**
   * Remove webhook integration.
   * @returns {Promise<boolean>}
   */
  async deleteWebhook() {
    return this.call("deleteWebhook");
  }

  /**
   * Get current webhook status.
   * @returns {Promise<Object>} WebhookInfo object
   */
  async getWebhookInfo() {
    return this.call("getWebhookInfo");
  }

  /**
   * Start long polling loop to receive real-time updates.
   * Emits: update, message, edited_message, callback_query, pre_checkout_query, error
   * @param {Object} [options]
   * @param {number} [options.interval=300] - Interval between polls in ms
   * @param {number} [options.limit=100] - Max updates per request
   * @param {number} [options.timeout=20] - Long polling timeout in seconds
   */
  startPolling(options = {}) {
    if (this._isPolling) return;
    this._isPolling = true;

    const interval = options.interval || 300;
    const timeout = options.timeout !== undefined ? options.timeout : 20;
    const limit = options.limit || 100;

    const poll = async () => {
      if (!this._isPolling) return;
      try {
        const updates = await this.getUpdates({
          offset: this._pollingOffset,
          limit,
          timeout
        });

        if (Array.isArray(updates) && updates.length > 0) {
          for (const update of updates) {
            if (update.update_id >= this._pollingOffset) {
              this._pollingOffset = update.update_id + 1;
            }
            this.handleUpdate(update);
          }
        }
      } catch (err) {
        this.emit("error", err);
      } finally {
        if (this._isPolling) {
          this._pollingTimer = setTimeout(poll, interval);
        }
      }
    };

    poll();
    this.emit("polling_started");
  }

  /**
   * Stop long polling loop.
   */
  stopPolling() {
    this._isPolling = false;
    if (this._pollingTimer) {
      clearTimeout(this._pollingTimer);
      this._pollingTimer = null;
    }
    this.emit("polling_stopped");
  }

  /**
   * Dispatch single Update object into typed bot events.
   * @param {Object} update
   */
  handleUpdate(update) {
    if (!update || typeof update !== "object") return;

    this.emit("update", update);

    if (update.message) {
      this.emit("message", update.message);
      if (update.message.successful_payment) {
        this.emit("successful_payment", update.message.successful_payment, update.message);
      }
    }
    if (update.edited_message) {
      this.emit("edited_message", update.edited_message);
    }
    if (update.callback_query) {
      this.emit("callback_query", update.callback_query);
    }
    if (update.pre_checkout_query) {
      this.emit("pre_checkout_query", update.pre_checkout_query);
    }
  }

  /**
   * Create an HTTP request listener / middleware compatible with Express, Koa, or native http.createServer
   * @param {Object} [options]
   * @param {string} [options.secretToken] - Optional secret token for authentication
   * @returns {Function} (req, res) => void
   */
  createWebhookMiddleware(options = {}) {
    return (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
      }

      if (options.secretToken) {
        const receivedToken = req.headers["x-bale-bot-api-secret-token"] || req.headers["x-telegram-bot-api-secret-token"];
        if (receivedToken !== options.secretToken) {
          res.statusCode = 403;
          res.end("Forbidden: Invalid secret token");
          return;
        }
      }

      // If body is already parsed by body-parser
      if (req.body && typeof req.body === "object") {
        this.handleUpdate(req.body);
        res.statusCode = 200;
        res.end("OK");
        return;
      }

      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        try {
          const raw = Buffer.concat(chunks).toString("utf8");
          const update = JSON.parse(raw);
          this.handleUpdate(update);
          res.statusCode = 200;
          res.end("OK");
        } catch (err) {
          res.statusCode = 400;
          res.end("Bad Request");
        }
      });
    };
  }

  // ==========================================
  // Messaging Operations
  // ==========================================

  /**
   * Send text message.
   * @param {number|string} chatId - Target chat / user ID
   * @param {string} text - Text of the message
   * @param {Object} [options]
   * @param {string} [options.parse_mode] - Markdown or HTML
   * @param {number} [options.reply_to_message_id]
   * @param {Object} [options.reply_markup] - InlineKeyboardMarkup or ReplyKeyboardMarkup
   * @returns {Promise<Object>} Message object
   */
  async sendMessage(chatId, text, options = {}) {
    return this.call("sendMessage", {
      chat_id: chatId,
      text,
      ...options
    });
  }

  /**
   * Forward message of any kind.
   * @param {number|string} chatId
   * @param {number|string} fromChatId
   * @param {number} messageId
   * @returns {Promise<Object>}
   */
  async forwardMessage(chatId, fromChatId, messageId) {
    return this.call("forwardMessage", {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId
    });
  }

  /**
   * Copy message of any kind.
   * @param {number|string} chatId
   * @param {number|string} fromChatId
   * @param {number} messageId
   * @param {Object} [options]
   * @returns {Promise<Object>} MessageId
   */
  async copyMessage(chatId, fromChatId, messageId, options = {}) {
    return this.call("copyMessage", {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId,
      ...options
    });
  }

  /**
   * Send photo.
   * @param {number|string} chatId
   * @param {string|Buffer|Object} photo - file_id, URL, Buffer, or file path
   * @param {Object} [options]
   * @param {string} [options.caption]
   * @returns {Promise<Object>}
   */
  async sendPhoto(chatId, photo, options = {}) {
    if (Buffer.isBuffer(photo) || (typeof photo === "string" && fs.existsSync(photo))) {
      return this.call("sendPhoto", { chat_id: chatId, ...options }, { photo });
    }
    return this.call("sendPhoto", { chat_id: chatId, photo, ...options });
  }

  /**
   * Send audio file.
   * @param {number|string} chatId
   * @param {string|Buffer|Object} audio
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async sendAudio(chatId, audio, options = {}) {
    if (Buffer.isBuffer(audio) || (typeof audio === "string" && fs.existsSync(audio))) {
      return this.call("sendAudio", { chat_id: chatId, ...options }, { audio });
    }
    return this.call("sendAudio", { chat_id: chatId, audio, ...options });
  }

  /**
   * Send general file / document.
   * @param {number|string} chatId
   * @param {string|Buffer|Object} document
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async sendDocument(chatId, document, options = {}) {
    if (Buffer.isBuffer(document) || (typeof document === "string" && fs.existsSync(document))) {
      return this.call("sendDocument", { chat_id: chatId, ...options }, { document });
    }
    return this.call("sendDocument", { chat_id: chatId, document, ...options });
  }

  /**
   * Send video file.
   * @param {number|string} chatId
   * @param {string|Buffer|Object} video
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async sendVideo(chatId, video, options = {}) {
    if (Buffer.isBuffer(video) || (typeof video === "string" && fs.existsSync(video))) {
      return this.call("sendVideo", { chat_id: chatId, ...options }, { video });
    }
    return this.call("sendVideo", { chat_id: chatId, video, ...options });
  }

  /**
   * Send animation / GIF.
   * @param {number|string} chatId
   * @param {string|Buffer|Object} animation
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async sendAnimation(chatId, animation, options = {}) {
    if (Buffer.isBuffer(animation) || (typeof animation === "string" && fs.existsSync(animation))) {
      return this.call("sendAnimation", { chat_id: chatId, ...options }, { animation });
    }
    return this.call("sendAnimation", { chat_id: chatId, animation, ...options });
  }

  /**
   * Send voice note (.ogg / audio).
   * @param {number|string} chatId
   * @param {string|Buffer|Object} voice
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async sendVoice(chatId, voice, options = {}) {
    if (Buffer.isBuffer(voice) || (typeof voice === "string" && fs.existsSync(voice))) {
      return this.call("sendVoice", { chat_id: chatId, ...options }, { voice });
    }
    return this.call("sendVoice", { chat_id: chatId, voice, ...options });
  }

  /**
   * Send group of photos, videos, documents or audios as an album.
   * @param {number|string} chatId
   * @param {Array<Object>} media - Array of InputMediaPhoto, InputMediaVideo, etc.
   * @returns {Promise<Array<Object>>}
   */
  async sendMediaGroup(chatId, media) {
    return this.call("sendMediaGroup", {
      chat_id: chatId,
      media
    });
  }

  /**
   * Send point on the map.
   * @param {number|string} chatId
   * @param {number} latitude
   * @param {number} longitude
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async sendLocation(chatId, latitude, longitude, options = {}) {
    return this.call("sendLocation", {
      chat_id: chatId,
      latitude,
      longitude,
      ...options
    });
  }

  /**
   * Send phone contact.
   * @param {number|string} chatId
   * @param {string} phoneNumber
   * @param {string} firstName
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async sendContact(chatId, phoneNumber, firstName, options = {}) {
    return this.call("sendContact", {
      chat_id: chatId,
      phone_number: phoneNumber,
      first_name: firstName,
      ...options
    });
  }

  /**
   * Tell the user that something is happening on the bot side.
   * @param {number|string} chatId
   * @param {string} action - typing, upload_photo, record_video, upload_video, record_audio, upload_audio, upload_document, find_location
   * @returns {Promise<boolean>}
   */
  async sendChatAction(chatId, action = "typing") {
    return this.call("sendChatAction", {
      chat_id: chatId,
      action
    });
  }

  /**
   * Get basic info about a file and prepare it for downloading.
   * @param {string} fileId
   * @returns {Promise<Object>} File object { file_id, file_size, file_path }
   */
  async getFile(fileId) {
    return this.call("getFile", { file_id: fileId });
  }

  /**
   * Download a file from Bale servers directly to a local path or Buffer
   * @param {string} filePathOrFileId
   * @param {string} [destinationPath]
   * @returns {Promise<Buffer|string>}
   */
  async downloadFile(filePathOrFileId, destinationPath = null) {
    let filePath = filePathOrFileId;
    if (!filePath.includes("/")) {
      const fileObj = await this.getFile(filePathOrFileId);
      if (!fileObj.file_path) {
        throw new Error("File path not found in Bale File response");
      }
      filePath = fileObj.file_path;
    }

    const downloadUrl = new URL(this.getFileUrl(filePath));
    const transport = downloadUrl.protocol === "http:" ? http : https;

    return new Promise((resolve, reject) => {
      transport.get(downloadUrl, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download file from Bale: HTTP ${res.statusCode}`));
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          if (destinationPath) {
            fs.writeFileSync(destinationPath, buffer);
            resolve(destinationPath);
          } else {
            resolve(buffer);
          }
        });
      }).on("error", reject);
    });
  }

  // ==========================================
  // Interactivity & Callbacks
  // ==========================================

  /**
   * Send answer to callback queries sent from inline keyboards.
   * @param {string} callbackQueryId
   * @param {Object} [options]
   * @param {string} [options.text] - Notification text
   * @param {boolean} [options.show_alert] - Show alert modal instead of toast
   * @param {string} [options.url]
   * @returns {Promise<boolean>}
   */
  async answerCallbackQuery(callbackQueryId, options = {}) {
    return this.call("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      ...options
    });
  }

  /**
   * Ask user for review / rating (Exclusive to Bale platform).
   * @param {number|string} chatId
   * @returns {Promise<boolean>}
   */
  async askReview(chatId) {
    return this.call("askReview", {
      chat_id: chatId
    });
  }

  // ==========================================
  // Message Editing & Deleting
  // ==========================================

  /**
   * Edit text and game messages.
   * @param {number|string} chatId
   * @param {number} messageId
   * @param {string} text
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async editMessageText(chatId, messageId, text, options = {}) {
    return this.call("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      ...options
    });
  }

  /**
   * Edit caption of messages.
   * @param {number|string} chatId
   * @param {number} messageId
   * @param {string} caption
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async editMessageCaption(chatId, messageId, caption, options = {}) {
    return this.call("editMessageCaption", {
      chat_id: chatId,
      message_id: messageId,
      caption,
      ...options
    });
  }

  /**
   * Edit message reply markup (inline keyboard).
   * @param {number|string} chatId
   * @param {number} messageId
   * @param {Object} replyMarkup
   * @returns {Promise<Object>}
   */
  async editMessageReplyMarkup(chatId, messageId, replyMarkup) {
    return this.call("editMessageReplyMarkup", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: replyMarkup
    });
  }

  /**
   * Delete a message.
   * @param {number|string} chatId
   * @param {number} messageId
   * @returns {Promise<boolean>}
   */
  async deleteMessage(chatId, messageId) {
    return this.call("deleteMessage", {
      chat_id: chatId,
      message_id: messageId
    });
  }

  /**
   * Delete multiple messages simultaneously.
   * @param {number|string} chatId
   * @param {number[]} messageIds
   * @returns {Promise<boolean>}
   */
  async deleteMessages(chatId, messageIds) {
    return this.call("deleteMessages", {
      chat_id: chatId,
      message_ids: Array.isArray(messageIds) ? messageIds : [messageIds]
    });
  }

  // ==========================================
  // Chat Administration (Groups & Channels)
  // ==========================================

  /**
   * Ban a user in a group, supergroup or channel.
   * @param {number|string} chatId
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  async banChatMember(chatId, userId) {
    return this.call("banChatMember", { chat_id: chatId, user_id: userId });
  }

  /**
   * Unban a previously banned user.
   * @param {number|string} chatId
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  async unbanChatMember(chatId, userId) {
    return this.call("unbanChatMember", { chat_id: chatId, user_id: userId });
  }

  /**
   * Promote or demote user in a chat.
   * @param {number|string} chatId
   * @param {number} userId
   * @param {Object} [options]
   * @returns {Promise<boolean>}
   */
  async promoteChatMember(chatId, userId, options = {}) {
    return this.call("promoteChatMember", {
      chat_id: chatId,
      user_id: userId,
      ...options
    });
  }

  /**
   * Set a new profile photo for the chat.
   * @param {number|string} chatId
   * @param {string|Buffer} photo
   * @returns {Promise<boolean>}
   */
  async setChatPhoto(chatId, photo) {
    if (Buffer.isBuffer(photo) || (typeof photo === "string" && fs.existsSync(photo))) {
      return this.call("setChatPhoto", { chat_id: chatId }, { photo });
    }
    return this.call("setChatPhoto", { chat_id: chatId, photo });
  }

  /**
   * Delete a chat photo.
   * @param {number|string} chatId
   * @returns {Promise<boolean>}
   */
  async deleteChatPhoto(chatId) {
    return this.call("deleteChatPhoto", { chat_id: chatId });
  }

  /**
   * Change title of chat.
   * @param {number|string} chatId
   * @param {string} title
   * @returns {Promise<boolean>}
   */
  async setChatTitle(chatId, title) {
    return this.call("setChatTitle", { chat_id: chatId, title });
  }

  /**
   * Change description of chat.
   * @param {number|string} chatId
   * @param {string} description
   * @returns {Promise<boolean>}
   */
  async setChatDescription(chatId, description) {
    return this.call("setChatDescription", { chat_id: chatId, description });
  }

  /**
   * Pin message in chat.
   * @param {number|string} chatId
   * @param {number} messageId
   * @returns {Promise<boolean>}
   */
  async pinChatMessage(chatId, messageId) {
    return this.call("pinChatMessage", { chat_id: chatId, message_id: messageId });
  }

  /**
   * Unpin message in chat.
   * @param {number|string} chatId
   * @param {number} [messageId]
   * @returns {Promise<boolean>}
   */
  async unpinChatMessage(chatId, messageId = undefined) {
    return this.call("unpinChatMessage", { chat_id: chatId, message_id: messageId });
  }

  /**
   * Alias for unpinChatMessage to match docs.bale.ai casing.
   */
  async unPinChatMessage(chatId, messageId = undefined) {
    return this.unpinChatMessage(chatId, messageId);
  }

  /**
   * Clear full list of pinned messages in chat.
   * @param {number|string} chatId
   * @returns {Promise<boolean>}
   */
  async unpinAllChatMessages(chatId) {
    return this.call("unpinAllChatMessages", { chat_id: chatId });
  }

  /**
   * Leave a group, supergroup or channel.
   * @param {number|string} chatId
   * @returns {Promise<boolean>}
   */
  async leaveChat(chatId) {
    return this.call("leaveChat", { chat_id: chatId });
  }

  /**
   * Get up to date information about the chat.
   * @param {number|string} chatId
   * @returns {Promise<Object>} ChatFullInfo object
   */
  async getChat(chatId) {
    return this.call("getChat", { chat_id: chatId });
  }

  /**
   * Get list of administrators in a chat.
   * @param {number|string} chatId
   * @returns {Promise<Array<Object>>}
   */
  async getChatAdministrators(chatId) {
    return this.call("getChatAdministrators", { chat_id: chatId });
  }

  /**
   * Get number of members in a chat.
   * @param {number|string} chatId
   * @returns {Promise<number>}
   */
  async getChatMembersCount(chatId) {
    return this.call("getChatMembersCount", { chat_id: chatId });
  }

  /**
   * Get information about a member of a chat.
   * @param {number|string} chatId
   * @param {number} userId
   * @returns {Promise<Object>} ChatMember
   */
  async getChatMember(chatId, userId) {
    return this.call("getChatMember", { chat_id: chatId, user_id: userId });
  }

  /**
   * Create an additional invite link for a chat.
   * @param {number|string} chatId
   * @returns {Promise<Object>}
   */
  async createChatInviteLink(chatId) {
    return this.call("createChatInviteLink", { chat_id: chatId });
  }

  /**
   * Revoke an invite link generated by the bot.
   * @param {number|string} chatId
   * @param {string} inviteLink
   * @returns {Promise<Object>}
   */
  async revokeChatInviteLink(chatId, inviteLink) {
    return this.call("revokeChatInviteLink", { chat_id: chatId, invite_link: inviteLink });
  }

  /**
   * Export an invite link for a chat.
   * @param {number|string} chatId
   * @returns {Promise<string>}
   */
  async exportChatInviteLink(chatId) {
    return this.call("exportChatInviteLink", { chat_id: chatId });
  }

  // ==========================================
  // Stickers
  // ==========================================

  /**
   * Upload a PNG file with a sticker for later use.
   * @param {number} userId
   * @param {string|Buffer} pngSticker
   * @returns {Promise<Object>} File
   */
  async uploadStickerFile(userId, pngSticker) {
    if (Buffer.isBuffer(pngSticker) || (typeof pngSticker === "string" && fs.existsSync(pngSticker))) {
      return this.call("uploadStickerFile", { user_id: userId }, { png_sticker: pngSticker });
    }
    return this.call("uploadStickerFile", { user_id: userId, png_sticker: pngSticker });
  }

  /**
   * Create a new sticker set owned by a user.
   * @param {number} userId
   * @param {string} name
   * @param {string} title
   * @param {string|Buffer} pngSticker
   * @param {string} emojis
   * @returns {Promise<boolean>}
   */
  async createNewStickerSet(userId, name, title, pngSticker, emojis) {
    const params = { user_id: userId, name, title, emojis };
    if (Buffer.isBuffer(pngSticker) || (typeof pngSticker === "string" && fs.existsSync(pngSticker))) {
      return this.call("createNewStickerSet", params, { png_sticker: pngSticker });
    }
    return this.call("createNewStickerSet", { ...params, png_sticker: pngSticker });
  }

  /**
   * Add a new sticker to a set created by the bot.
   * @param {number} userId
   * @param {string} name
   * @param {string|Buffer} pngSticker
   * @param {string} emojis
   * @returns {Promise<boolean>}
   */
  async addStickerToSet(userId, name, pngSticker, emojis) {
    const params = { user_id: userId, name, emojis };
    if (Buffer.isBuffer(pngSticker) || (typeof pngSticker === "string" && fs.existsSync(pngSticker))) {
      return this.call("addStickerToSet", params, { png_sticker: pngSticker });
    }
    return this.call("addStickerToSet", { ...params, png_sticker: pngSticker });
  }

  // ==========================================
  // Payments & Electronic Wallet (کیف‌پول الکترونیکی بله)
  // ==========================================

  /**
   * Send an invoice to ask the user for payment via Bale Electronic Wallet.
   * @param {number|string} chatId
   * @param {string} title - Product name
   * @param {string} description - Product description
   * @param {string} payload - Bot-defined invoice payload
   * @param {string} providerToken - Payment provider token
   * @param {string} currency - Three-letter ISO 4217 currency code (e.g. IRR)
   * @param {Array<Object>} prices - Breakdown of prices (LabeledPrice[])
   * @param {Object} [options]
   * @returns {Promise<Object>} Message object with invoice
   */
  async sendInvoice(chatId, title, description, payload, providerToken, currency, prices, options = {}) {
    return this.call("sendInvoice", {
      chat_id: chatId,
      title,
      description,
      payload,
      provider_token: providerToken,
      currency,
      prices,
      ...options
    });
  }

  /**
   * Create an invoice link for direct payments.
   * @param {string} title
   * @param {string} description
   * @param {string} payload
   * @param {string} providerToken
   * @param {string} currency
   * @param {Array<Object>} prices
   * @param {Object} [options]
   * @returns {Promise<string>} Invoice URL
   */
  async createInvoiceLink(title, description, payload, providerToken, currency, prices, options = {}) {
    return this.call("createInvoiceLink", {
      title,
      description,
      payload,
      provider_token: providerToken,
      currency,
      prices,
      ...options
    });
  }

  /**
   * Respond to a pre-checkout query before completing the electronic wallet payment.
   * @param {string} preCheckoutQueryId
   * @param {boolean} ok - Specify True if everything is alright
   * @param {string} [errorMessage] - Required if ok is False
   * @returns {Promise<boolean>}
   */
  async answerPreCheckoutQuery(preCheckoutQueryId, ok = true, errorMessage = undefined) {
    return this.call("answerPreCheckoutQuery", {
      pre_checkout_query_id: preCheckoutQueryId,
      ok,
      error_message: errorMessage
    });
  }

  /**
   * Inquire the status and details of a specific payment transaction (Exclusive to Bale).
   * @param {string} transactionId - Unique transaction ID
   * @returns {Promise<Object>} Transaction object
   */
  async inquireTransaction(transactionId) {
    return this.call("inquireTransaction", {
      transaction_id: transactionId
    });
  }
}

// ==========================================
// Keyboard Builders
// ==========================================

/**
 * Fluent builder for InlineKeyboardMarkup
 */
class InlineKeyboard {
  constructor() {
    this.inline_keyboard = [[]];
  }

  /**
   * Add a callback button
   * @param {string} text
   * @param {string} callbackData
   */
  button(text, callbackData) {
    const currentRow = this.inline_keyboard[this.inline_keyboard.length - 1];
    currentRow.push({ text, callback_data: callbackData });
    return this;
  }

  /**
   * Add a URL button
   * @param {string} text
   * @param {string} url
   */
  url(text, url) {
    const currentRow = this.inline_keyboard[this.inline_keyboard.length - 1];
    currentRow.push({ text, url });
    return this;
  }

  /**
   * Add a WebApp / MiniApp button
   * @param {string} text
   * @param {string} webAppUrl
   */
  webApp(text, webAppUrl) {
    const currentRow = this.inline_keyboard[this.inline_keyboard.length - 1];
    currentRow.push({ text, web_app: { url: webAppUrl } });
    return this;
  }

  /**
   * Add a Copy Text button (Bale specific)
   * @param {string} text
   * @param {string} copyText
   */
  copyText(text, copyText) {
    const currentRow = this.inline_keyboard[this.inline_keyboard.length - 1];
    currentRow.push({ text, copy_text: { text: copyText } });
    return this;
  }

  /**
   * Start a new row of buttons
   */
  row() {
    this.inline_keyboard.push([]);
    return this;
  }

  /**
   * Convert to JSON payload
   */
  toJSON() {
    return {
      inline_keyboard: this.inline_keyboard.filter(r => r.length > 0)
    };
  }
}

/**
 * Fluent builder for ReplyKeyboardMarkup
 */
class ReplyKeyboard {
  constructor(options = {}) {
    this.keyboard = [[]];
    this.resize_keyboard = options.resize !== undefined ? options.resize : true;
    this.one_time_keyboard = options.oneTime !== undefined ? options.oneTime : false;
  }

  /**
   * Add a text button
   * @param {string} text
   */
  button(text) {
    const currentRow = this.keyboard[this.keyboard.length - 1];
    currentRow.push({ text });
    return this;
  }

  /**
   * Add a request contact button
   * @param {string} text
   */
  requestContact(text) {
    const currentRow = this.keyboard[this.keyboard.length - 1];
    currentRow.push({ text, request_contact: true });
    return this;
  }

  /**
   * Add a request location button
   * @param {string} text
   */
  requestLocation(text) {
    const currentRow = this.keyboard[this.keyboard.length - 1];
    currentRow.push({ text, request_location: true });
    return this;
  }

  /**
   * Start a new row of buttons
   */
  row() {
    this.keyboard.push([]);
    return this;
  }

  /**
   * Set resize_keyboard property
   * @param {boolean} [resize=true]
   */
  resize(resize = true) {
    this.resize_keyboard = resize;
    return this;
  }

  /**
   * Set one_time_keyboard property
   * @param {boolean} [oneTime=true]
   */
  oneTime(oneTime = true) {
    this.one_time_keyboard = oneTime;
    return this;
  }

  /**
   * Convert to JSON payload
   */
  toJSON() {
    return {
      keyboard: this.keyboard.filter(r => r.length > 0),
      resize_keyboard: this.resize_keyboard,
      one_time_keyboard: this.one_time_keyboard
    };
  }
}

/**
 * Helper to remove custom reply keyboard
 */
const KeyboardRemove = {
  remove_keyboard: true
};

module.exports = {
  BaleBot,
  InlineKeyboard,
  ReplyKeyboard,
  KeyboardRemove,
  buildMultipart
};
