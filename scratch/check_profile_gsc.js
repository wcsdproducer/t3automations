const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

require('dotenv').config();

const saKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './service-account.json';
let app;
if (fs.existsSync(saKeyPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(saKeyPath, 'utf8'));
  app = initializeApp({ credential: cert(serviceAccount) });
} else {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
     const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
     app = initializeApp({ credential: cert(serviceAccount) });
  } else {
     app = initializeApp();
  }
}

const db = getFirestore();

async function run() {
  const profileId = 'tampa_tree_services';
  console.log(`Fetching profile: ${profileId}`);
  
  const doc = await db.collection('businessProfiles').doc(profileId).get();
  if (!doc.exists) {
    console.log("Profile not found!");
    return;
  }
  
  console.log("Profile Data:", JSON.stringify(doc.data(), null, 2));
  
  const subSnap = await db.collection(`businessProfiles/${profileId}/customDomains`).get();
  console.log("Custom Domains:");
  subSnap.forEach(d => {
    console.log(d.id, "=>", JSON.stringify(d.data(), null, 2));
  });
}

run().catch(console.error);
