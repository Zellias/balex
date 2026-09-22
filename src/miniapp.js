/**
 * Bale Mini App Engine & Parameter Generator
 *
 * Provides utilities for Mini App developers and bot creators:
 * - Generate launch URLs with encrypted/signed tgWebAppData
 * - Create, sign, parse, and cryptographically validate initData
 * - Full alignment with Telegram & Bale WebApp protocol
 * - Mini App postMessage bridge constants and helpers
 */

const crypto = require('crypto');

/**
 * Screen presentation modes for Bale Mini Apps
 */
const ScreenMode = {
  FULLSCREEN: 0,
  FULL_SIZE: 1,
  COMPACT: 2
};

/**
 * Bale Mini App bridge event types (iframe <-> host messaging)
 */
const MiniAppEvent = {
  // Host -> MiniApp
  SETUP_BACK_BUTTON: 'web_app_setup_back_button',
  SETUP_SETTINGS_BUTTON: 'web_app_setup_settings_button',
  READ_TEXT_FROM_CLIPBOARD: 'web_app_read_text_from_clipboard',
  EXPAND: 'web_app_expand',
  READY: 'web_app_ready',
  CLOSE: 'web_app_close',
  ADD_TO_HOME_SCREEN: 'web_app_add_to_home_screen',
  CHECK_HOME_SCREEN: 'web_app_check_home_screen',
  SET_BACKGROUND_COLOR: 'web_app_set_background_color',
  SET_HEADER_COLOR: 'web_app_set_header_color',
  SET_BOTTOM_BAR_COLOR: 'web_app_set_bottom_bar_color',
  IFRAME_CLICKED: 'web_app_iframe_clicked',
  SETUP_CLOSING_BEHAVIOR: 'web_app_setup_closing_behavior',
  REQUEST_PHONE: 'web_app_request_phone',
  OPEN_LINK: 'web_app_open_link',
  SEND_DATA: 'web_app_data_send',
  OPEN_SCAN_QR_POPUP: 'web_app_open_scan_qr_popup',
  INVOKE_CUSTOM_METHOD: 'web_app_invoke_custom_method',
  OPEN_INVOICE: 'web_app_open_invoice',

  // MiniApp -> Host callbacks
  CLIPBOARD_TEXT_RECEIVED: 'clipboardTextReceived',
  SETTINGS_BUTTON_PRESSED: 'settingsButtonPressed',
  BACK_BUTTON_PRESSED: 'backButtonPressed',
  CONTACT_REQUESTED: 'contactRequested',
  RELOAD_IFRAME: 'reloadIframe',
  QR_TEXT_RECEIVED: 'qrTextReceived',
  SCAN_QR_POPUP_CLOSED: 'scanQrPopupClosed',
  CUSTOM_METHOD_INVOKED: 'customMethodInvoked',
  HOME_SCREEN_CHECKED: 'homeScreenChecked',
  HOME_SCREEN_ADDED: 'homeScreenAdded',
  HOME_SCREEN_FAILED: 'homeScreenFailed',
  INVOICE_CLOSED: 'InvoiceClosed',
  WEB_INVOICE_CLOSED: 'webInvoiceClosed'
};

/**
 * Default Bale Theme Parameters
 */
const DefaultThemeParams = {
  bgColor: '#16181f',
  secondaryBgColor: '#1c1f28',
  textColor: '#f3f4f6',
  hintColor: '#9ca3af',
  linkColor: '#10b981',
  buttonColor: '#10b981',
  buttonTextColor: '#ffffff',
  headerBgColor: '#16181f',
  accentTextColor: '#10b981',
  sectionBgColor: '#1c1f28',
  sectionHeaderTextColor: '#10b981',
  sectionSeparatorColor: '#2b303e',
  subtitleTextColor: '#9ca3af',
  destructiveTextColor: '#ef4444',
  bottomBarBgColor: '#16181f'
};

// In-memory cache for HMAC secret keys derived from bot tokens
const secretKeyCache = new Map();

function getSecretKey(botToken) {
  let key = secretKeyCache.get(botToken);
  if (!key) {
    key = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    if (secretKeyCache.size >= 1000) {
      const oldest = secretKeyCache.keys().next().value;
      secretKeyCache.delete(oldest);
    }
    secretKeyCache.set(botToken, key);
  }
  return key;
}

class MiniAppUtils {
  /**
   * Cryptographically sign initData parameters using HMAC-SHA256 according to Telegram/Bale standard.
   *
   * 1. secretKey = HMAC_SHA256("WebAppData", botToken)
   * 2. dataCheckString = sorted pairs of "key=value" joined by newline
   * 3. hash = HMAC_SHA256_HEX(secretKey, dataCheckString)
   *
   * @param {Object} dataObj - Key-value dictionary of parameters
   * @param {string} botToken - Bale Bot token
   * @returns {string} Hexadecimal HMAC signature
   */
  static signInitData(dataObj, botToken) {
    if (!botToken) {
      throw new Error('botToken is required to sign initData');
    }

    const secretKey = getSecretKey(botToken);

    const pairs = [];
    for (const key of Object.keys(dataObj).sort()) {
      if (key === 'hash') continue;
      const val = typeof dataObj[key] === 'object' ? JSON.stringify(dataObj[key]) : String(dataObj[key]);
      pairs.push(`${key}=${val}`);
    }

    const checkString = pairs.join('\n');
    return crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
  }

  /**
   * Create standard signed or unsigned `initData` query string for Mini Apps.
   *
   * @param {Object} params
   * @param {string} [params.botToken] - Bot token for HMAC signature
   * @param {Object} [params.user] - User profile object { id, first_name, last_name, username, language_code }
   * @param {string|number} [params.queryId] - Optional query ID (e.g. from inline callback)
   * @param {number} [params.authDate] - Timestamp in seconds (defaults to now)
   * @param {string} [params.startParam] - Deep link parameter passed to bot
   * @param {string} [params.chatType] - 'sender' | 'private' | 'group' | 'supergroup' | 'channel'
   * @param {string|number} [params.chatInstance] - Unique chat instance ID
   * @param {boolean} [params.canSendAfter] - Whether bot can message user
   * @param {Object} [params.receiver] - Peer receiver object
   * @returns {string} URL-encoded initData string
   */
  static createInitData({
    botToken,
    user,
    queryId,
    authDate = Math.floor(Date.now() / 1000),
    startParam,
    chatType,
    chatInstance,
    canSendAfter,
    receiver
  } = {}) {
    const data = {};

    if (queryId) data.query_id = String(queryId);
    if (user) data.user = typeof user === 'string' ? user : JSON.stringify(user);
    if (receiver) data.receiver = typeof receiver === 'string' ? receiver : JSON.stringify(receiver);
    if (chatType) data.chat_type = String(chatType);
    if (chatInstance) data.chat_instance = String(chatInstance);
    if (startParam) data.start_param = String(startParam);
    if (canSendAfter !== undefined) data.can_send_after = String(canSendAfter);
    data.auth_date = String(authDate);

    if (botToken) {
      data.hash = MiniAppUtils.signInitData(data, botToken);
    }

    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(data)) {
      searchParams.set(k, v);
    }

    return searchParams.toString();
  }

  /**
   * Cryptographically validate initData string against bot token.
   *
   * @param {string} initDataString - The URL-encoded initData string
   * @param {string} botToken - Bale Bot token
   * @param {number} [maxAgeSeconds=86400] - Optional max age (default 24h, set 0 to disable age check)
   * @returns {{ valid: boolean, reason?: string, data?: Object }}
   */
  static validateInitData(initDataString, botToken, maxAgeSeconds = 86400) {
    if (!initDataString || !botToken) {
      return { valid: false, reason: 'Missing initData or botToken' };
    }

    try {
      const searchParams = new URLSearchParams(initDataString);
      const hash = searchParams.get('hash');
      if (!hash) {
        return { valid: false, reason: 'Missing hash parameter' };
      }

      const pairs = [];
      const parsedData = {};
      for (const [key, val] of searchParams.entries()) {
        parsedData[key] = val;
        if (key !== 'hash') {
          pairs.push(`${key}=${val}`);
        }
      }

      pairs.sort();
      const checkString = pairs.join('\n');
      const secretKey = getSecretKey(botToken);
      const expectedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

      if (expectedHash !== hash) {
        return { valid: false, reason: 'Hash signature mismatch' };
      }

      if (maxAgeSeconds > 0 && parsedData.auth_date) {
        const authDate = parseInt(parsedData.auth_date, 10);
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > maxAgeSeconds) {
          return { valid: false, reason: 'initData has expired', data: parsedData };
        }
      }

      return { valid: true, data: MiniAppUtils.parseInitData(initDataString) };
    } catch (err) {
      return { valid: false, reason: `Validation error: ${err.message}` };
    }
  }

  /**
   * Parse initData URL string into structured object with JSON-parsed user and metadata.
   *
   * @param {string} initDataString
   * @returns {Object} Structured data object
   */
  static parseInitData(initDataString) {
    if (!initDataString) return {};
    const searchParams = new URLSearchParams(initDataString);
    const result = {};

    for (const [key, value] of searchParams.entries()) {
      if (key === 'user' || key === 'receiver') {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      } else if (key === 'auth_date') {
        result[key] = parseInt(value, 10);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Build complete Mini App launch URL with encoded `tgWebAppData` hash fragment.
   *
   * @param {Object} options
   * @param {string} options.webAppUrl - Base URL of the mini app web service
   * @param {string} [options.initData] - Pre-built initData string (or generated via options below)
   * @param {string} [options.botToken] - Bot token for signing initData
   * @param {Object} [options.user] - User object { id, first_name, username, ... }
   * @param {string} [options.startParam] - Deep link parameter
   * @param {Object} [options.themeParams] - Custom theme params
   * @returns {string} Ready-to-use launch URL with hash parameters
   */
  static buildMiniAppUrl({
    webAppUrl,
    initData,
    botToken,
    user,
    startParam,
    themeParams = DefaultThemeParams
  }) {
    if (!webAppUrl) {
      throw new Error('webAppUrl is required');
    }

    const finalInitData = initData || (botToken && user ? MiniAppUtils.createInitData({ botToken, user, startParam }) : '');

    const hashParams = new URLSearchParams();
    if (finalInitData) {
      hashParams.set('tgWebAppData', finalInitData);
    }
    hashParams.set('tgWebAppVersion', '7.0');
    hashParams.set('tgWebAppPlatform', 'weba');

    if (themeParams) {
      hashParams.set('tgWebAppThemeParams', JSON.stringify(themeParams));
    }

    const url = new URL(webAppUrl);
    url.hash = hashParams.toString();
    return url.toString();
  }
}

module.exports = {
  MiniAppUtils,
  ScreenMode,
  MiniAppEvent,
  DefaultThemeParams
};
