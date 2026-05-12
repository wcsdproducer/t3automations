import { admin } from './src/lib/firebase-admin';

async function run() {
  const snap = await admin.firestore().collectionGroup('customDomains').where('id', '==', 'aisalesrep.live').get();
  console.log('Docs found:', snap.size);
  snap.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}

run().catch(console.error);
