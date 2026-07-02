const BASE_URL = 'https://t3automations.com';

async function completeRemainingSteps() {
  console.log('========================================');
  console.log('  COMPLETING REMAINING LAUNCH STEPS');
  console.log('========================================\n');

  // Sites needing GSC verification
  const needGsc = [
    { profileId: 'knoxvillepestexperts_com', domain: 'knoxvillepestexperts.com', name: 'Knoxville Pest Experts' },
    { profileId: 'tampa_epoxy_flooring', domain: 'tampaepoxycoatings.com', name: 'Tampa Epoxy Flooring' },
    { profileId: 'tampa_paving_concrete', domain: 'tampaconcretepaving.com', name: 'Tampa Concrete & Paving' },
  ];

  for (const site of needGsc) {
    console.log(`\n── ${site.name} (${site.domain}) ──`);
    
    // Step 3a: Get GSC verification token
    try {
      console.log('  [Step 3a] Getting GSC verification token...');
      const tokenRes = await fetch(`${BASE_URL}/api/gsc/verify-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getToken', userId: site.profileId, domain: site.domain }),
      });
      const tokenData = await tokenRes.json();
      if (tokenRes.ok) {
        console.log('  ✅ GSC token generated and stored');
      } else {
        console.log(`  ⚠️  GSC token: ${tokenData.error || JSON.stringify(tokenData)}`);
      }
    } catch (err) {
      console.log(`  ❌ GSC token error: ${err.message}`);
    }

    // Step 3b: Verify GSC ownership
    try {
      console.log('  [Step 3b] Verifying GSC ownership...');
      const verifyRes = await fetch(`${BASE_URL}/api/gsc/verify-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', userId: site.profileId, domain: site.domain }),
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        console.log(`  ✅ GSC verified: ${verifyData.detail || 'OK'}`);
      } else {
        console.log(`  ⚠️  GSC verify: ${verifyData.error || JSON.stringify(verifyData)}`);
      }
    } catch (err) {
      console.log(`  ❌ GSC verify error: ${err.message}`);
    }
  }

  // Sites needing sitemap submission  
  const needSitemap = [
    { profileId: 'knoxvillepestexperts_com', domain: 'knoxvillepestexperts.com', name: 'Knoxville Pest Experts' },
    { profileId: 'tampa_epoxy_flooring', domain: 'tampaepoxycoatings.com', name: 'Tampa Epoxy Flooring' },
    { profileId: 'tampa_paving_concrete', domain: 'tampaconcretepaving.com', name: 'Tampa Concrete & Paving' },
  ];

  console.log('\n\n── SITEMAP SUBMISSIONS ──');
  for (const site of needSitemap) {
    try {
      console.log(`\n  [Step 4] Submitting sitemap for ${site.name}...`);
      const sitemapUrl = `https://${site.domain}/sitemap.xml`;
      
      // The GSC verify endpoint with action 'submitSitemap' or we can use the verify endpoint
      // Looking at the code, sitemap submission happens via the GSC verify-site API
      const res = await fetch(`${BASE_URL}/api/gsc/verify-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submitSitemap', userId: site.profileId, domain: site.domain }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`  ✅ Sitemap submitted: ${data.detail || 'OK'}`);
      } else {
        console.log(`  ⚠️  Sitemap: ${data.error || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`  ❌ Sitemap error: ${err.message}`);
    }
  }

  // Generate Local SEO & Interlinking for sites that need it
  console.log('\n\n── LOCAL SEO GENERATION ──');
  const needLocalSeo = [
    { profileId: 'tampa_epoxy_flooring', name: 'Tampa Epoxy Flooring' },
    { profileId: 'tampa_paving_concrete', name: 'Tampa Concrete & Paving' },
  ];

  for (const site of needLocalSeo) {
    try {
      console.log(`\n  [Step 5] Generating local SEO for ${site.name}...`);
      // Call server action endpoint — this requires the Next.js server action format
      // We'll handle this differently since it's a server action
      console.log('  ℹ️  Local SEO generation requires the UI (server action). Will be triggered via Firestore update.');
    } catch (err) {
      console.log(`  ❌ Local SEO error: ${err.message}`);
    }
  }

  console.log('\n========================================');
  console.log('  DONE');
  console.log('========================================');
}

completeRemainingSteps().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
