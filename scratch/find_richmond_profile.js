const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

async function main() {
  const db = admin.firestore();
  const snap = await db.collection('businessProfiles').get();
  console.log(`Found ${snap.size} profiles.`);
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.customDomain === 'richmondjunkpros.com' || (data.websiteUrl && data.websiteUrl.includes('richmondjunkpros.com'))) {
      console.log(`MATCH FOUND!`);
      console.log(`ID: ${doc.id}`);
      console.log(JSON.stringify(data, null, 2));
    }
    const subSnap = await doc.ref.collection('customDomains').get();
    for (const subDoc of subSnap.docs) {
      if (subDoc.id === 'richmondjunkpros.com') {
        console.log(`SUBCOLLECTION MATCH FOUND!`);
        console.log(`Profile ID: ${doc.id}`);
        console.log(`Domain Doc ID: ${subDoc.id}`);
        console.log(JSON.stringify(subDoc.data(), null, 2));
      }
    }
  }
}

main().catch(console.error);
