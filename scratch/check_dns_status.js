const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6',
    storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app',
  });
}

const db = admin.firestore();
const BASE_URL = 'https://t3automations.com';

async function checkDnsAndGenerateSeo() {
  const sites = [
    { profileId: 'tampa_epoxy_flooring', domain: 'tampaepoxycoatings.com' },
    { profileId: 'tampa_paving_concrete', domain: 'tampaconcretepaving.com' },
    { profileId: 'knoxvillepestexperts_com', domain: 'knoxvillepestexperts.com' },
  ];

  for (const site of sites) {
    console.log(`\n========== ${site.domain} ==========`);
    
    // Check DNS via the app's API
    try {
      const res = await fetch(`${BASE_URL}/api/check-domain-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: site.domain, userId: site.profileId }),
      });
      const data = await res.json();
      console.log(`DNS Check: ${data.status} — ${data.detail || ''}`);
    } catch (err) {
      console.log(`DNS Check failed: ${err.message}`);
    }
  }

  // Now re-read and report current statuses
  console.log('\n\n========== UPDATED STATUS ==========');
  for (const site of sites) {
    const domDoc = await db.doc(`businessProfiles/${site.profileId}/customDomains/${site.domain}`).get();
    const data = domDoc.data();
    console.log(`${site.domain}: status = ${data?.status}`);
  }
}

checkDnsAndGenerateSeo().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
