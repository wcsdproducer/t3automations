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
  console.log("Listing all profiles and their custom domains...");
  const snap = await db.collection('businessProfiles').get();
  
  for (const doc of snap.docs) {
    const profile = doc.data();
    console.log(`\nProfile: ${profile.id} (${profile.businessName || 'Unnamed'})`);
    console.log(`- Service: ${profile.service}`);
    console.log(`- Sitemap Submitted: ${profile.sitemapSubmitted || false}`);
    console.log(`- Google Site Verified: ${profile.googleSiteVerified || false}`);
    console.log(`- Created At:`, profile.createdAt);
    
    const domainsSnap = await doc.ref.collection('customDomains').get();
    domainsSnap.forEach(d => {
      const data = d.data();
      console.log(`  * Domain: ${data.domain} (Status: ${data.status}, Created At: ${data.createdAt})`);
    });
  }
}

run().catch(console.error);
