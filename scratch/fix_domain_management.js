const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6',
    storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app',
  });
}

const db = admin.firestore();

async function fixAllSites() {
  console.log('========================================');
  console.log('  FIXING DOMAIN MANAGEMENT ISSUES');
  console.log('========================================\n');

  // ── 1. Fix Tampa Epoxy domain doc (add missing `domain` field) ──
  console.log('1. Fixing Tampa Epoxy Flooring — tampaepoxycoatings.com');
  await db.doc('businessProfiles/tampa_epoxy_flooring/customDomains/tampaepoxycoatings.com').update({
    domain: 'tampaepoxycoatings.com',
    domainName: 'tampaepoxycoatings.com',
  });
  // Set targetCity, nicheKeywords, blogPostingSchedule on the profile
  await db.doc('businessProfiles/tampa_epoxy_flooring').update({
    targetCity: 'Tampa, FL',
    nicheKeywords: ['epoxy flooring', 'garage floor coating', 'commercial epoxy', 'metallic epoxy', 'concrete prep'],
    blogPostingSchedule: 'daily',
    blogCronEnabled: true,
  });
  console.log('   ✅ Fixed domain doc (added domain field)');
  console.log('   ✅ Set targetCity: Tampa, FL');
  console.log('   ✅ Set nicheKeywords');
  console.log('   ✅ Set blogPostingSchedule: daily');

  // ── 2. Fix Tampa Concrete domain doc (add missing `domain` field) ──
  console.log('\n2. Fixing Tampa Concrete & Paving — tampaconcretepaving.com');
  await db.doc('businessProfiles/tampa_paving_concrete/customDomains/tampaconcretepaving.com').update({
    domain: 'tampaconcretepaving.com',
    domainName: 'tampaconcretepaving.com',
  });
  await db.doc('businessProfiles/tampa_paving_concrete').update({
    targetCity: 'Tampa, FL',
    nicheKeywords: ['concrete pouring', 'concrete sealing', 'driveway paving', 'patio installation', 'concrete repair'],
    blogPostingSchedule: 'daily',
    blogCronEnabled: true,
  });
  console.log('   ✅ Fixed domain doc (added domain field)');
  console.log('   ✅ Set targetCity: Tampa, FL');
  console.log('   ✅ Set nicheKeywords');
  console.log('   ✅ Set blogPostingSchedule: daily');

  // ── 3. Richmond Junk Pros — mark sitemap as submitted ──
  console.log('\n3. Fixing Richmond Junk Pros — richmondjunkpros.com');
  await db.doc('businessProfiles/richmond_junk_pros').update({
    sitemapSubmitted: true,
  });
  console.log('   ✅ Set sitemapSubmitted: true');

  // ── 4. Knoxville Pest Experts — set blog schedule ──
  console.log('\n4. Fixing Knoxville Pest Experts — knoxvillepestexperts.com');
  await db.doc('businessProfiles/knoxvillepestexperts_com').update({
    blogPostingSchedule: 'daily',
    blogCronEnabled: true,
    websiteUrl: 'https://knoxvillepestexperts.com',
    customDomain: 'knoxvillepestexperts.com',
  });
  console.log('   ✅ Set blogPostingSchedule: daily');
  console.log('   ✅ Set websiteUrl');
  console.log('   ✅ Set customDomain');

  console.log('\n========================================');
  console.log('  ALL FIRESTORE FIXES APPLIED');
  console.log('========================================');
}

fixAllSites().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
