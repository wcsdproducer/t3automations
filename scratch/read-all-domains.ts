import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function run() {
  console.log('Retrieving all custom domains in Firestore...');
  const snap = await db.collectionGroup('customDomains').get();
  console.log(`Found ${snap.size} domain documents.`);
  for (const doc of snap.docs) {
    console.log(`Path: ${doc.ref.path}`);
    console.log(JSON.stringify(doc.data(), null, 2));
    console.log('-----------------------------------');
  }
}

run().catch(console.error);
