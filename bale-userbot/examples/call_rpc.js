/**
 * Example demonstrating invoking arbitrary RPC methods across all 53 services
 * Run: node examples/call_rpc.js
 */

const { BaleClient, FileSession, servicesCatalog } = require('../index');

async function main() {
  console.log('=== Bale RPC Service Explorer ===\n');

  console.log(`Total Extracted Services: ${servicesCatalog.metadata.totalServices}`);
  console.log(`Total Extracted Methods: ${servicesCatalog.metadata.totalMethods}\n`);

  // Print summary of top services
  console.log('Sample Services available:');
  const serviceNames = Object.keys(servicesCatalog.services).slice(0, 10);
  for (const sName of serviceNames) {
    const sData = servicesCatalog.services[sName];
    console.log(` - client.${sData.namespace} (${sName}): ${sData.methodCount} methods`);
  }

  const session = new FileSession('./session.json');
  const client = new BaleClient({ session });

  // Example showing dynamic invocation syntax:
  console.log('\nMethod calling syntax:');
  console.log(' 1. Via namespace shortcut:');
  console.log('    await client.messaging.sendMessage(payload);');
  console.log('    await client.users.loadFullUsers(payload);');
  console.log('    await client.groups.loadFullGroups(payload);');
  console.log(' 2. Via generic invoke:');
  console.log('    await client.invoke("bale.messaging.v2.Messaging", "SendMessage", payload);');
}

main().catch(console.error);
