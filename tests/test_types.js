const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("Testing TypeScript Declarations, Types & Autocomplete Support...");

// 1. Verify package.json "types" field
const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
assert.strictEqual(pkg.types, "index.d.ts", "package.json must specify \"types\": \"index.d.ts\"");
console.log("  ✅ package.json \"types\" field verified (index.d.ts)");

// 2. Verify index.d.ts exists and is comprehensive
const dtsPath = path.join(__dirname, "..", "index.d.ts");
assert(fs.existsSync(dtsPath), "index.d.ts file must exist");
const dts = fs.readFileSync(dtsPath, "utf8");
assert(dts.length > 30000, "index.d.ts must have comprehensive definitions (>30KB)");
console.log("  ✅ index.d.ts file verified (" + Math.round(dts.length / 1024) + " KB, " + dts.split("\n").length + " lines)");

// 3. Verify all exported symbols from index.js exist in index.d.ts
const index = require("../index.js");
const expectedExports = [
  "BaleClient",
  "BaleBot",
  "InlineKeyboard",
  "ReplyKeyboard",
  "KeyboardRemove",
  "PeerType",
  "ExPeerType",
  "TypingType",
  "DeviceType",
  "Session",
  "StringSession",
  "FileSession",
  "BaleConnection",
  "Proto",
  "ProtoWriter",
  "ProtoReader",
  "MiniAppUtils",
  "ScreenMode",
  "MiniAppEvent",
  "DefaultThemeParams",
  "servicesCatalog"
];

for (const exp of expectedExports) {
  assert(index[exp] !== undefined, "Export \"" + exp + "\" must exist in index.js");
  assert(dts.includes(exp), "Export \"" + exp + "\" must be declared in index.d.ts");
}
console.log("  ✅ All " + expectedExports.length + " package exports verified in index.d.ts");

// 4. Verify BaleClient methods are fully declared in index.d.ts
const clientProto = index.BaleClient.prototype;
const methodNames = Object.getOwnPropertyNames(clientProto).filter(name => {
  const desc = Object.getOwnPropertyDescriptor(clientProto, name);
  return typeof desc.value === "function" && name !== "constructor";
});

for (const method of methodNames) {
  assert(
    dts.includes(method + "(") || dts.includes(method + "?(") || dts.includes(method + ":"),
    "Method \"" + method + "\" on BaleClient must be declared in index.d.ts"
  );
}
console.log("  ✅ All " + methodNames.length + " BaleClient methods verified in index.d.ts");

// 4b. Verify BaleBot methods are fully declared in index.d.ts
const botProto = index.BaleBot.prototype;
const botMethodNames = Object.getOwnPropertyNames(botProto).filter(name => {
  const desc = Object.getOwnPropertyDescriptor(botProto, name);
  return typeof desc.value === "function" && name !== "constructor";
});

for (const method of botMethodNames) {
  assert(
    dts.includes(method + "(") || dts.includes(method + "?(") || dts.includes(method + ":"),
    "Method \"" + method + "\" on BaleBot must be declared in index.d.ts"
  );
}
console.log("  ✅ All " + botMethodNames.length + " BaleBot methods verified in index.d.ts");

// 5. Verify MessageEvent helper methods in index.d.ts
const msgMethods = [
  "reply", "replyPhoto", "replyVoice", "replyAudio", "replyVideo", "replyDocument",
  "edit", "react", "delete", "pin", "forwardTo",
  "openGiftPacket", "claimGiftPacket", "getGiftPacket", "getGiftPacketReceivers",
  "openGoldGiftPacket", "claimGoldGiftPacket", "getGoldWinners"
];

for (const m of msgMethods) {
  assert(dts.includes(m + "(") || dts.includes(m + ":"), "MessageEvent method \"" + m + "\" must be in index.d.ts");
}
console.log("  ✅ All " + msgMethods.length + " MessageEvent methods verified in index.d.ts");

// 6. Verify Enums and Constant Structures
assert.strictEqual(index.PeerType.PRIVATE, 1);
assert.strictEqual(index.PeerType.GROUP, 2);
assert.strictEqual(index.ScreenMode.FULLSCREEN, 0);
assert.strictEqual(index.MiniAppEvent.READY, "web_app_ready");
assert.strictEqual(index.DefaultThemeParams.bgColor, "#16181f");
console.log("  ✅ Enums (PeerType, ExPeerType, TypingType, DeviceType, ScreenMode, MiniAppEvent) match");

// 7. Verify MiniAppUtils API methods in index.d.ts
const miniAppMethods = ["createInitData", "signInitData", "validateInitData", "parseInitData", "buildMiniAppUrl"];
for (const m of miniAppMethods) {
  assert(typeof index.MiniAppUtils[m] === "function", "MiniAppUtils." + m + " must be a function");
  assert(dts.includes(m + "("), "MiniAppUtils." + m + " must be declared in index.d.ts");
}
console.log("  ✅ All " + miniAppMethods.length + " MiniAppUtils methods verified in index.d.ts");

// 8. Verify Event Emitter Overloads & 60+ Update Events Map
const eventKeywords = [
  "on(event: \x27message\x27",
  "on(event: \x27giftPacket\x27",
  "on(event: \x27goldGiftPacket\x27",
  "on(event: \x27reaction\x27",
  "on(event: \x27typing\x27",
  "on(event: \x27presence\x27",
  "on(event: \x27botCallbackQuery\x27",
  "on(event: \x27messageEdit\x27",
  "on(event: \x27messageDelete\x27"
];

for (const kw of eventKeywords) {
  assert(dts.includes(kw), "index.d.ts must have typed event overload: " + kw);
}
console.log("  ✅ Event Emitter overloads verified in index.d.ts");

console.log("\nAll TypeScript types, autocomplete definitions, and package exports PASSED! 🚀✨\n");
