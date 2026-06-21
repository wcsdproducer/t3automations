const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function main() {
  const docId = 'tampa_tree_services';
  const token = 'FuWCynGBmZtAvKfU6DxP2sSS4SkqE4NU-SMI4UqFW6s';
  
  console.log(`Setting googleSiteVerification for ${docId}...`);
  
  const docRef = db.collection('businessProfiles').doc(docId);
  const snap = await docRef.get();
  
  if (!snap.exists) {
    console.error(`Document businessProfiles/${docId} does not exist!`);
    
    // Let's print out all business profiles to see what we have
    const all = await db.collection('businessProfiles').get();
    console.log('Available profiles:');
    all.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.data().businessName} (${doc.data().websiteUrl || doc.data().domain})`);
    });
    return;
  }
  
  await docRef.update({
    googleSiteVerification: token,
    updatedAt: new Date().toISOString()
  });
  
  console.log('Updated successfully!');
}

main().catch(console.error);
