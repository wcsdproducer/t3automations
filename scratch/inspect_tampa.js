const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function main() {
  const docRef = db.collection('businessProfiles').doc('tampa_tree_services');
  const snap = await docRef.get();
  if (snap.exists) {
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log('tampa_tree_services not found');
  }
}

main().catch(console.error);
