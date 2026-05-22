const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function run() {
  const doc = await db.collection('businessProfiles').doc('6Nw77zkDqFdKearSTGxW7YMNFIf2').get();
  console.log(doc.data());
  process.exit(0);
}
run();
