/**
 * Bale Session Storage & Persistence
 * Manages user authentication tokens, userId, and device hashes.
 */

const fs = require('fs');
const crypto = require('crypto');

class Session {
  constructor() {
    this.token = null;
    this.userId = null;
    this.phone = null;
    this.user = null;
    this.deviceHash = crypto.randomBytes(16).toString('hex');
  }

  setAuth({ token, user, phone }) {
    if (token) this.token = token;
    if (user) {
      this.user = user;
      if (user.id) this.userId = user.id;
    }
    if (phone) this.phone = phone;
    this.save();
  }

  isLoggedIn() {
    return Boolean(this.token || this.userId);
  }

  clear() {
    this.token = null;
    this.userId = null;
    this.phone = null;
    this.user = null;
    this.save();
  }

  save() {
    // Abstract
  }

  load() {
    // Abstract
  }

  toJSON() {
    return {
      token: this.token,
      userId: this.userId,
      phone: this.phone,
      user: this.user,
      deviceHash: this.deviceHash
    };
  }

  fromJSON(data) {
    if (!data) return;
    if (data.token) this.token = data.token;
    if (data.userId) this.userId = data.userId;
    if (data.phone) this.phone = data.phone;
    if (data.user) this.user = data.user;
    if (data.deviceHash) this.deviceHash = data.deviceHash;
  }
}

/**
 * StringSession
 * Compact, portable base64 string session.
 */
class StringSession extends Session {
  constructor(sessionString = '') {
    super();
    if (sessionString) {
      try {
        const json = Buffer.from(sessionString, 'base64').toString('utf8');
        this.fromJSON(JSON.parse(json));
      } catch (e) {
        console.warn('Failed to parse StringSession:', e.message);
      }
    }
  }

  save() {
    return this.exportString();
  }

  exportString() {
    const json = JSON.stringify(this.toJSON());
    return Buffer.from(json, 'utf8').toString('base64');
  }
}

/**
 * FileSession
 * Persists session data automatically to a local JSON file.
 */
class FileSession extends Session {
  constructor(filePath = './session.json') {
    super();
    this.filePath = filePath;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.fromJSON(JSON.parse(raw));
      }
    } catch (e) {
      console.warn(`Could not load session file ${this.filePath}:`, e.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.toJSON(), null, 2), 'utf8');
    } catch (e) {
      console.warn(`Could not save session file ${this.filePath}:`, e.message);
    }
  }
}

module.exports = {
  Session,
  StringSession,
  FileSession
};
