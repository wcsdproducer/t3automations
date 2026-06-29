const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize admin SDK using service account credentials from env or direct config
// Let's read service account from firebase-admin config if available
// In Next.js, it uses service account config. Let's see if we can check env
require('dotenv').config();

const saKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './service-account.json';
let app;
if (fs.existsSync(saKeyPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(saKeyPath, 'utf8'));
  app = initializeApp({
    credential: cert(serviceAccount)
  });
} else {
  // If no service account key, fall back to default init (app hosting environment uses default)
  // But locally we probably have a key or environment variables. Let's check environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
     const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
     app = initializeApp({
       credential: cert(serviceAccount)
     });
  } else {
     // Default initialization
     app = initializeApp();
  }
}

const db = getFirestore();

async function run() {
  console.log("Looking up custom domain knoxvillepestexperts.com via profiles...");
  const profilesSnap = await db.collection('businessProfiles').get();
  console.log(`Found ${profilesSnap.size} profiles to check...`);

  for (const profileDoc of profilesSnap.docs) {
    const customDomainsSnap = await profileDoc.ref.collection('customDomains').get();
    for (const domainDoc of customDomainsSnap.docs) {
      const data = domainDoc.data();
      const domainName = (data.domain || data.domainName || data.id || "").toLowerCase().trim();
      if (domainName === 'knoxvillepestexperts.com') {
        console.log(`Matched profile ID: ${profileDoc.id}`);
        await updateProfile(profileDoc.id);
        return;
      }
    }
  }
  console.log("No matching custom domain found across all profiles.");
}

async function updateProfile(profileId) {
  console.log(`Found profile: ${profileId}`);
  const profileRef = db.collection('businessProfiles').doc(profileId);
  const doc = await profileRef.get();
  if (!doc.exists) {
    console.log("Business profile does not exist!");
    return;
  }
  
  console.log("Current Profile Data:", doc.data());
  console.log("Updating defaultLandingPage to 'pest-control'...");
  await profileRef.update({
    defaultLandingPage: 'pest-control',
    service: 'Pest Control'
  });
  console.log("Updated successfully!");
}

run().catch(console.error);
