require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-service-account.json'))
  });
}
const db = admin.firestore();
async function main() {
  const uid = '6Nw77zkDqFdKearSTGxW7YMNFIf2';
  const phoneNumber = '+18135551234';
  
  await db.collection('businessProfiles').doc(uid).collection('phoneNumbers').doc(phoneNumber).set({
    phoneNumber,
    provider: 'telnyx',
    status: 'purchased',
    orderId: 'mock-order',
    purchasedAt: new Date(),
  });
  
  await db.collection('businessProfiles').doc(uid).update({
    telnyxPhoneNumber: phoneNumber
  });
  console.log('done');
}
main().catch(console.error);
