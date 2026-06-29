const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function main() {
  const profileRef = db.collection('businessProfiles').doc('knoxvillepestexperts_com');
  const snap = await profileRef.get();
  if (snap.exists) {
    console.log('Profile Data:');
    console.log(JSON.stringify(snap.data(), null, 2));
    
    console.log('\nCustom Domains Subcollection:');
    const sub = await profileRef.collection('customDomains').get();
    sub.forEach(doc => {
      console.log(`- ${doc.id}:`, JSON.stringify(doc.data(), null, 2));
    });
  } else {
    console.log('knoxvillepestexperts_com not found');
  }
}

main().catch(console.error);
