const BASE_URL = 'https://t3automations.com';

async function retryVerification() {
  const sites = [
    { profileId: 'knoxvillepestexperts_com', domain: 'knoxvillepestexperts.com', name: 'Knoxville Pest Experts' },
    { profileId: 'tampa_epoxy_flooring', domain: 'tampaepoxycoatings.com', name: 'Tampa Epoxy Flooring' },
  ];

  for (const site of sites) {
    console.log(`\n── ${site.name} (${site.domain}) ──`);
    
    try {
      console.log('  Verifying GSC ownership + sitemap submission...');
      const verifyRes = await fetch(`${BASE_URL}/api/gsc/verify-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', userId: site.profileId, domain: site.domain }),
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        console.log(`  ✅ ${verifyData.detail || 'OK'}`);
      } else {
        console.log(`  ⚠️  ${verifyData.error || JSON.stringify(verifyData)}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
  }
}

retryVerification().then(() => process.exit(0));
