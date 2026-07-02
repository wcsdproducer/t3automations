const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6',
    storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app',
  });
}

const db = admin.firestore();

async function inspectBrokenDomains() {
  const profiles = ['tampa_epoxy_flooring', 'tampa_paving_concrete'];
  
  for (const profileId of profiles) {
    console.log(`\n========== ${profileId} ==========`);
    
    // Get the profile
    const profileDoc = await db.collection('businessProfiles').doc(profileId).get();
    const profile = profileDoc.data();
    console.log('Business Name:', profile?.businessName);
    console.log('Service:', profile?.service);
    console.log('Custom Domain (profile field):', profile?.customDomain);
    console.log('Website URL:', profile?.websiteUrl);
    console.log('GSC Verification:', profile?.googleSiteVerification);
    console.log('Sitemap Submitted:', profile?.sitemapSubmitted);
    console.log('Target City:', profile?.targetCity);
    console.log('Niche Keywords:', profile?.nicheKeywords);
    console.log('Blog Schedule:', profile?.blogPostingSchedule);
    
    // Get all domain docs
    const domainsSnap = await db.collection(`businessProfiles/${profileId}/customDomains`).get();
    console.log(`\nCustom Domain Docs (${domainsSnap.size}):`);
    for (const domDoc of domainsSnap.docs) {
      console.log(`  Doc ID: "${domDoc.id}"`);
      console.log(`  Full data:`, JSON.stringify(domDoc.data(), null, 2));
    }
  }
  
  // Also check knoxville and richmond for completeness
  const others = ['knoxvillepestexperts_com', 'richmond_junk_pros'];
  for (const profileId of others) {
    console.log(`\n========== ${profileId} ==========`);
    const profileDoc = await db.collection('businessProfiles').doc(profileId).get();
    const profile = profileDoc.data();
    console.log('Business Name:', profile?.businessName);
    console.log('Custom Domain (profile field):', profile?.customDomain);
    console.log('Website URL:', profile?.websiteUrl);
    console.log('GSC Verification:', profile?.googleSiteVerification);
    console.log('Sitemap Submitted:', profile?.sitemapSubmitted);
    console.log('Target City:', profile?.targetCity);
    console.log('Blog Schedule:', profile?.blogPostingSchedule);
    
    const domainsSnap = await db.collection(`businessProfiles/${profileId}/customDomains`).get();
    console.log(`Custom Domain Docs (${domainsSnap.size}):`);
    for (const domDoc of domainsSnap.docs) {
      console.log(`  Doc ID: "${domDoc.id}"`);
      console.log(`  Full data:`, JSON.stringify(domDoc.data(), null, 2));
    }
  }
}

inspectBrokenDomains().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
