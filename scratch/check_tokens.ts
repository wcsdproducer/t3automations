import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function run() {
  console.log('Checking collections for tokens or auth...');
  const collections = await db.listCollections();
  for (const col of collections) {
    console.log(`Collection: ${col.id}`);
  }
  
  // Check users collection
  const usersSnap = await db.collection('users').get();
  for (const doc of usersSnap.docs) {
    console.log(`User ${doc.id}:`, Object.keys(doc.data()));
    const subcols = await doc.ref.listCollections();
    for (const sub of subcols) {
      console.log(`  Subcollection: ${sub.id}`);
    }
  }
}

run().catch(console.error);
