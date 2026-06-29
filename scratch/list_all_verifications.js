const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function main() {
  const all = await db.collection('businessProfiles').get();
  console.log('Available profiles:');
  all.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id}`);
    console.log(`  Name: ${data.businessName}`);
    console.log(`  Custom Domain: ${data.customDomain || data.websiteUrl}`);
    console.log(`  googleSiteVerification: ${data.googleSiteVerification}`);
    console.log(`  googleSiteVerified: ${data.googleSiteVerified}`);
    console.log(`  sitemapSubmitted: ${data.sitemapSubmitted}`);
    console.log('-----------------------------------');
  });
}

main().catch(console.error);
