import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function run() {
  console.log('Retrieving all businessProfiles in Firestore...');
  const snap = await db.collection('businessProfiles').get();
  console.log(`Found ${snap.size} profiles.`);
  for (const doc of snap.docs) {
    const data = doc.data();
    console.log(`ID: ${doc.id}`);
    console.log(`  Name: ${data.businessName}`);
    console.log(`  Contact Email: ${data.contactEmail}`);
    console.log(`  Service: ${data.service}`);
    console.log(`  Custom Domain: ${data.customDomain}`);
    console.log(`  Website URL: ${data.websiteUrl}`);
    console.log('-----------------------------------');
  }
}

run().catch(console.error);
