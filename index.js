/**
 * Bale Userbot Library for Node.js
 *
 * A modern, lightweight userbot and client library for the Bale messaging platform.
 * Supports all 53 Protobuf services and 636 RPC methods.
 */

const { BaleClient } = require('./src/client');
const { Proto, PeerType, ExPeerType, TypingType, DeviceType, ProtoWriter, ProtoReader } = require('./src/proto');
const { Session, StringSession, FileSession } = require('./src/session');
const { BaleConnection } = require('./src/connection');
const { MiniAppUtils, ScreenMode, MiniAppEvent, DefaultThemeParams } = require('./src/miniapp');
const { BaleBot, InlineKeyboard, ReplyKeyboard, KeyboardRemove } = require('./src/bot');
const { startStdioMode, startHttpMode, handleCommand, executeMethod } = require('./src/bridge');
const servicesCatalog = require('./src/generated/services.json');

module.exports = {
  BaleClient,
  BaleBot,
  InlineKeyboard,
  ReplyKeyboard,
  KeyboardRemove,
  startStdioMode,
  startHttpMode,
  handleCommand,
  executeMethod,
  PeerType,
  ExPeerType,
  TypingType,
  DeviceType,
  Session,
  StringSession,
  FileSession,
  BaleConnection,
  Proto,
  ProtoWriter,
  ProtoReader,
  MiniAppUtils,
  ScreenMode,
  MiniAppEvent,
  DefaultThemeParams,
  servicesCatalog
};
