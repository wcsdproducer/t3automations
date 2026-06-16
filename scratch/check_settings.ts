import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function run() {
  const settingsSnap = await db.collection('settings').get();
  console.log('Settings:');
  for (const doc of settingsSnap.docs) {
    console.log(doc.id, doc.data());
  }

  const agencySnap = await db.collection('agency').get();
  console.log('Agency:');
  for (const doc of agencySnap.docs) {
    console.log(doc.id, doc.data());
  }
}

run().catch(console.error);
