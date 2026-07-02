const admin = require('firebase-admin');

// Initialize using the same config as the app (Application Default Credentials)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6',
    storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app',
  });
}

const db = admin.firestore();

async function auditAllSites() {
  // Get all business profiles
  const profilesSnap = await db.collection('businessProfiles').get();
  
  const results = [];
  
  for (const profileDoc of profilesSnap.docs) {
    const profile = profileDoc.data();
    const profileId = profileDoc.id;
    
    // Get custom domains
    const domainsSnap = await db.collection(`businessProfiles/${profileId}/customDomains`).get();
    const domains = domainsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Determine step completion
    const stepStatus = {
      'Step 1 - Domain Mapping': domains.length > 0 ? '✅ DONE' : '❌ NOT DONE',
      'Step 2 - DNS/Registrar': domains.some(d => d.status === 'active') ? '✅ DONE' : (domains.some(d => d.status === 'pending' || d.status === 'provisioning') ? '⏳ PENDING' : '❌ NOT DONE'),
      'Step 3 - Google Ownership (GSC)': profile.googleSiteVerification ? '✅ DONE' : '❌ NOT DONE',
      'Step 4 - Sitemap & Indexing': profile.sitemapSubmitted ? '✅ DONE' : '❌ NOT DONE',
      'Step 5 - Local Schema & Keywords': (profile.localSeoSchema || (profile.nicheKeywords && profile.nicheKeywords.length > 0 && profile.targetCity)) ? '✅ DONE' : '❌ NOT DONE',
      'Step 6 - AI Blog Strategy': profile.blogPostingSchedule ? '✅ DONE' : '❌ NOT DONE',
    };
    
    const completedCount = Object.values(stepStatus).filter(v => v === '✅ DONE').length;
    
    results.push({
      profileId,
      businessName: profile.businessName || 'N/A',
      service: profile.service || 'N/A',
      domains: domains.map(d => `${d.domain} (${d.status})`),
      targetCity: profile.targetCity || 'NOT SET',
      nicheKeywords: profile.nicheKeywords || [],
      googleSiteVerification: profile.googleSiteVerification || null,
      sitemapSubmitted: profile.sitemapSubmitted || false,
      localSeoSchema: !!profile.localSeoSchema,
      blogPostingSchedule: profile.blogPostingSchedule || null,
      blogCronEnabled: profile.blogCronEnabled || false,
      stepStatus,
      completedCount,
      totalSteps: 6,
      percentage: Math.round((completedCount / 6) * 100),
    });
  }
  
  // Sort by completion percentage
  results.sort((a, b) => a.percentage - b.percentage);
  
  console.log('\n========================================');
  console.log('  T3 AUTOMATIONS — DOMAIN MANAGEMENT AUDIT');
  console.log('========================================\n');
  
  for (const site of results) {
    console.log(`\n📍 ${site.businessName} (${site.profileId})`);
    console.log(`   Service: ${site.service}`);
    console.log(`   Domains: ${site.domains.length > 0 ? site.domains.join(', ') : 'NONE'}`);
    console.log(`   Target City: ${site.targetCity}`);
    console.log(`   Progress: ${site.completedCount}/${site.totalSteps} (${site.percentage}%)`);
    console.log('   ---');
    for (const [step, status] of Object.entries(site.stepStatus)) {
      console.log(`   ${status} ${step}`);
    }
  }
  
  console.log('\n\n========================================');
  console.log('  SUMMARY');
  console.log('========================================');
  console.log(`Total sites: ${results.length}`);
  console.log(`Fully complete (100%): ${results.filter(r => r.percentage === 100).length}`);
  console.log(`Partially complete: ${results.filter(r => r.percentage > 0 && r.percentage < 100).length}`);
  console.log(`Not started (0%): ${results.filter(r => r.percentage === 0).length}`);
}

auditAllSites().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
