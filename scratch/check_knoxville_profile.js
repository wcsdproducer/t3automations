const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

async function main() {
  const db = admin.firestore();
  const docRef = db.collection('businessProfiles').doc('knoxville_pest_experts');
  const snap = await docRef.get();
  if (snap.exists) {
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log('knoxville_pest_experts profile not found.');
    // Let's list all profiles to see if there is another ID
    const allSnap = await db.collection('businessProfiles').get();
    for (const doc of allSnap.docs) {
      const data = doc.data();
      if (data.customDomain === 'knoxvillepestexperts.com') {
        console.log(`Matched other profile: ${doc.id}`);
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }
}

main().catch(console.error);
