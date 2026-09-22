/**
 * Interactive Login Example for Bale Userbot
 * Run: node examples/login.js
 */

const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const { BaleClient, FileSession } = require('../index');

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log('=== Bale Userbot Login ===\n');

  const session = new FileSession('./session.json');
  const client = new BaleClient({ session });

  client.on('status', (st) => console.log(`[Connection Status] ${st}`));
  client.on('error', (err) => console.error(`[Connection Error]`, err.message));

  try {
    console.log('Connecting to Bale server...');
    await client.connect();
    console.log('Connected!\n');

    const phone = await rl.question('Enter phone number (e.g. +989123456789): ');
    console.log(`Sending code to ${phone}...`);

    const authRes = await client.sendCode(phone.trim());
    console.log(`Code sent! (Transaction Hash: ${authRes.transactionHash.slice(0, 10)}...)`);

    const code = await rl.question('Enter the SMS verification code received: ');
    console.log('Verifying code...');

    try {
      const loginRes = await client.signIn(code.trim());
      console.log('\n🎉 Successfully logged in!');
      if (loginRes.user) {
        console.log(`Logged in as: ${loginRes.user.name || 'Bale User'} (ID: ${loginRes.user.id})`);
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('password')) {
        console.log('2FA Password is required for this account.');
        const pwd = await rl.question('Enter your 2FA password: ');
        const pwdRes = await client.signInWithPassword(pwd);
        console.log('\n🎉 Successfully logged in with 2FA!');
        if (pwdRes.user) {
          console.log(`Logged in as: ${pwdRes.user.name || 'Bale User'} (ID: ${pwdRes.user.id})`);
        }
      } else {
        throw err;
      }
    }

    console.log(`Session saved to ./session.json`);
    console.log(`StringSession: ${session.exportString()}`);

  } catch (err) {
    console.error('\n❌ Login failed:', err.message);
  } finally {
    rl.close();
    client.disconnect();
  }
}

main();
