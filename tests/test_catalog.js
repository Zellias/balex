/**
 * Tests verifying the extracted Protobuf RPC catalog
 */

const assert = require('assert');
const catalog = require('../src/generated/services.json');

function testCatalog() {
  console.log('Testing Extracted Protobuf Catalog...');

  assert.strictEqual(catalog.metadata.protocolVersion, 1);
  assert.strictEqual(catalog.metadata.apiVersion, 171248);
  assert.strictEqual(catalog.metadata.totalServices, 53);
  assert.strictEqual(catalog.metadata.totalMethods, 636);

  console.log(`  ✅ Verified 53 services and 636 methods count`);

  // Verify critical services exist
  const requiredServices = [
    'bale.messaging.v2.Messaging',
    'bale.auth.v1.Auth',
    'bale.groups.v1.Groups',
    'bale.users.v1.Users',
    'bale.meet.v1.Meet',
    'bale.kifpool.v1.Kifpool',
    'bale.advertisement.v1.Advertisement',
    'bale.story.v1.Story',
    'bale.wallet.v1.Wallet',
    'bale.market.v1.Market',
    'bale.search.v1.Search',
    'bale.presence.v1.Presence'
  ];

  for (const sName of requiredServices) {
    assert(catalog.services[sName], `Missing expected service: ${sName}`);
    assert(catalog.services[sName].methods.length > 0, `Service ${sName} has no methods`);
  }
  console.log(`  ✅ All 12 critical core services verified`);

  // Verify messaging methods
  const messaging = catalog.services['bale.messaging.v2.Messaging'];
  const methodNames = messaging.methods.map(m => m.methodName);
  assert(methodNames.includes('SendMessage'));
  assert(methodNames.includes('ForwardMessages'));
  assert(methodNames.includes('LoadHistory'));
  assert(methodNames.includes('LoadDialogs'));
  assert(methodNames.includes('DeleteMessage'));
  console.log(`  ✅ Messaging methods verified (${messaging.methods.length} methods)`);

  // Verify auth methods
  const auth = catalog.services['bale.auth.v1.Auth'];
  const authMethods = auth.methods.map(m => m.methodName);
  assert(authMethods.includes('StartPhoneAuth'));
  assert(authMethods.includes('ValidateCode'));
  assert(authMethods.includes('ValidatePassword'));
  assert(authMethods.includes('SignUp'));
  assert(authMethods.includes('SignOut'));
  console.log(`  ✅ Auth methods verified (${auth.methods.length} methods)`);

  console.log('\nProtobuf Catalog verification passed! ✨');
}

testCatalog();
