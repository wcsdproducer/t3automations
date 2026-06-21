const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function main() {
  const docId = 'tampa_epoxy_flooring';
  const token = '32YMGQPP4GgWSVoSlWv97BFagWuDNewCljiVQBhqNC4';
  
  console.log(`Setting googleSiteVerification for ${docId}...`);
  const docRef = db.collection('businessProfiles').doc(docId);
  await docRef.update({
    googleSiteVerification: token,
    updatedAt: new Date().toISOString()
  });
  console.log('Updated successfully!');
}

main().catch(console.error);
