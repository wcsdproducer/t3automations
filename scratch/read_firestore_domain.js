const { admin } = require('../src/lib/firebase-admin');

async function main() {
  const db = admin.firestore();
  const docRef = db.doc('businessProfiles/tampa_tree_services/customDomains/tampabaytreecare.com');
  const snap = await docRef.get();
  if (snap.exists) {
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log('Document not found');
  }
}

main().catch(console.error);
