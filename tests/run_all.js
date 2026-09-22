const { spawnSync } = require("child_process");
const path = require("path");

const suites = [
  { name: "Protobuf Wire & Framing", cmd: "tests/test_proto.js" },
  { name: "Protobuf Catalog", cmd: "tests/test_catalog.js" },
  { name: "Client & Features", cmd: "tests/test_client.js" },
  { name: "Media & Groups", cmd: "tests/test_media_and_groups.js" },
  { name: "All Features & Updates", cmd: "tests/test_all_features.js" },
  { name: "Gift Packets & Mini Apps", cmd: "tests/test_giftpacket_and_miniapp.js" },
  { name: "Official Bot API (docs.bale.ai)", cmd: "tests/test_bot.js" },
  { name: "Go IPC & Bridge Protocol", cmd: "tests/test_bridge.js" },
  { name: "TypeScript & Autocomplete Verification", cmd: "tests/test_types.js" }
];

console.log("==================================================");
console.log("  Running Bale Userbot Test Suites & Type Check");
console.log("==================================================");

let allPassed = true;
const rootDir = path.resolve(__dirname, "..");

for (const suite of suites) {
  console.log("\n▶ Running: " + suite.name + "...");
  const scriptPath = path.resolve(rootDir, suite.cmd);
  const proc = spawnSync("node", [scriptPath], { stdio: "inherit", cwd: rootDir });

  if (proc.status !== 0) {
    console.error("❌ " + suite.name + " FAILED with status: " + proc.status);
    allPassed = false;
    process.exit(proc.status || 1);
  } else {
    console.log("✅ " + suite.name + " PASSED! ✨");
  }
}

console.log("\n==================================================");
console.log("  🎉 ALL 7 TEST SUITES & TYPE CHECKS PASSED 100%!");
console.log("==================================================");
