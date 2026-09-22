const { spawnSync } = require("child_process");

const suites = [
  { name: "Protobuf Wire & Framing", cmd: "tests/test_proto.js" },
  { name: "Protobuf Catalog", cmd: "tests/test_catalog.js" },
  { name: "Client & Features", cmd: "tests/test_client.js" },
  { name: "Media & Groups", cmd: "tests/test_media_and_groups.js" },
  { name: "All Features & Updates", cmd: "tests/test_all_features.js" },
  { name: "Gift Packets & Mini Apps", cmd: "tests/test_giftpacket_and_miniapp.js" },
  { name: "TypeScript & Autocomplete Verification", cmd: "./node_modules/typescript/bin/tsc", args: ["--noEmit", "--target", "ES2022", "--moduleResolution", "node", "tests/test_types.ts"] }
];

console.log("==================================================");
console.log("  Running Bale Userbot Test Suites & Type Check");
console.log("==================================================");

let allPassed = true;
for (const suite of suites) {
  console.log("\n▶ Running: " + suite.name + "...");
  const args = suite.args || [suite.cmd];
  const proc = suite.args 
    ? spawnSync("node", [suite.cmd, ...suite.args], { stdio: "inherit" })
    : spawnSync("node", args, { stdio: "inherit" });

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
