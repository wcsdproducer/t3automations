import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

const testDomains = [
  'tampaepoxycoatings.com',
  'tampabaytreecare.com',
  'tampaconconcretepaving.com', // wait, let's test tampaconcretepaving.com
  'tampaconcretepaving.com'
];

async function verify() {
  console.log('🔍 Verifying custom domain mappings in Firestore...');
  
  for (const domain of testDomains) {
    console.log(`\nDomain: "${domain}"`);
    const snap = await db.collectionGroup('customDomains').where('id', '==', domain).get();
    
    if (snap.empty) {
      console.log('  ❌ Not found in customDomains collectionGroup!');
    } else {
      snap.forEach(doc => {
        console.log(`  ✅ Found doc! ID: ${doc.id}`);
        console.log('  Data:', JSON.stringify(doc.data(), null, 2));
      });
    }

    // Also verify the business profile
    // Let's find the business profile that has this customDomain
    const profileSnap = await db.collection('businessProfiles').where('customDomain', '==', domain).get();
    if (profileSnap.empty) {
      console.log('  ❌ No businessProfile has customDomain set to this domain!');
    } else {
      profileSnap.forEach(doc => {
        console.log(`  ✅ Found businessProfile! ID: ${doc.id}`);
        console.log(`  Name: ${doc.data().businessName}`);
        console.log(`  websiteUrl: ${doc.data().websiteUrl}`);
        console.log(`  template: ${doc.data().defaultLandingPage}`);
      });
    }
  }
}

verify().catch(console.error);
