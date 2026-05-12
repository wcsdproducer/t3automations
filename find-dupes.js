const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'studio-1410114603-9e1f6' });
const db = admin.firestore();
async function run() {
  try {
    const snap = await db.collectionGroup('customDomains').where('id', '==', 'aisalesrep.live').limit(1).get();
    console.log(`Found ${snap.docs.length} documents.`);
    snap.docs.forEach(doc => console.log(doc.ref.path, doc.data()));
  } catch(e) {
    console.error(e);
  }
}
run();
