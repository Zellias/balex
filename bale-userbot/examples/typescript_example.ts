/**
 * BaleX / Bale Userbot - TypeScript Example
 * Demonstrates strict type safety, event listener autocomplete,
 * and high-level method signatures.
 */

import {
  BaleClient,
  PeerType,
  DeviceType,
  ScreenMode,
  MiniAppEvent,
  DefaultThemeParams,
  MiniAppUtils,
  StringSession
} from "bale-userbot";

import type {
  MessageEvent,
  CashGiftPacketOpenedUpdate,
  GoldGiftPacketOpenedUpdate,
  ReactionUpdate,
  UserPresenceUpdate,
  UserTypingUpdate,
  OpenGiftPacketResponse,
  BaleEventMap
} from "bale-userbot";

async function main() {
  // 1. Initialize client with typed configuration
  const client = new BaleClient({
    session: new StringSession(),
    humanize: {
      enabled: true,
      minTypingDelayMs: 1200,
      maxTypingDelayMs: 3500,
      readingSpeedCpm: 600,
      errorRate: 0.01,
      jitterPercent: 20
    },
    device: {
      type: DeviceType.Web,
      model: "MacBook Pro / Chrome 128",
      appVersion: "3.2.0",
      langCode: "fa"
    },
    autoReconnect: true
  });

  // 2. Strongly-typed event handlers with IDE autocomplete
  client.on("message", async (msg: MessageEvent) => {
    console.log(`[Message] from: ${msg.senderId}, text: "${msg.text}"`);

    // Cash Gift Packet handling
    if (msg.hasGiftPacket) {
      console.log("🎁 Received Cash Gift Packet! Claiming...");
      const result: OpenGiftPacketResponse = await msg.claimGiftPacket();
      console.log(`Claimed ${result.amount} ${result.currency}`);
      return;
    }

    // Gold Gift Packet handling
    if (msg.hasGoldGiftPacket) {
      console.log("🥇 Received Gold Gift Packet! Claiming...");
      const goldResult = await msg.claimGoldGiftPacket();
      console.log(`Claimed ${goldResult.amount} grams of gold!`);
      return;
    }

    // Natural humanized reply
    if (msg.text === "/ping") {
      await msg.reply("pong! 🏓", {
        simulateTyping: true,
        humanize: true
      });
    }
  });

  // 3. Typed event updates
  client.on("giftPacket", (update: CashGiftPacketOpenedUpdate) => {
    console.log(`🎁 Gift packet opened: ${update.amount} by user ${update.userId}`);
  });

  client.on("reaction", (update: ReactionUpdate) => {
    console.log(`Reaction ${update.reaction} on message ${update.messageId}`);
  });

  client.on("presence", (update: UserPresenceUpdate) => {
    console.log(`User ${update.userId} presence: ${update.state}`);
  });

  // 4. Mini App Telegram/Bale WebApp Bridge
  const initData = MiniAppUtils.createInitData({
    botToken: "BOT_TOKEN_HERE",
    queryId: "query_abc123",
    user: {
      id: 12345678,
      first_name: "John",
      username: "johndoe"
    }
  });

  const launchUrl = MiniAppUtils.buildMiniAppUrl({
    webAppUrl: "https://miniapp.example.com",
    initData,
    themeParams: DefaultThemeParams
  });
  console.log("Mini App Launch URL:", launchUrl);

  // 5. Connect
  // await client.connect();
  console.log("Client ready with full TypeScript support!");
}

main().catch(console.error);
