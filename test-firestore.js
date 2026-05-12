require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
}
const db = getFirestore();
db.collectionGroup('customDomains').where('id', '==', 'aisalesrep.live').get().then(snap => {
    console.log("Documents found:", snap.size);
    snap.forEach(doc => console.log(doc.id, "=>", doc.data()));
}).catch(console.error);
