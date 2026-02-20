// scripts/generate-vapid-keys.js
/**
 * VAPID Key Generator
 * -------------------
 * Run this script once to generate VAPID keys for Web Push.
 * 
 * Usage: node scripts/generate-vapid-keys.js
 * 
 * Add the output to your .env.local file.
 */

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n🔐 VAPID Keys Generated!\n');
console.log('Add these to your .env.local file:\n');
console.log('# Web Push VAPID Keys');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('VAPID_SUBJECT=mailto:support@fypfinder.com');
console.log('\n⚠️  Keep VAPID_PRIVATE_KEY secret! Never expose it in client code.\n');
