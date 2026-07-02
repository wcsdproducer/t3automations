async function checkDeployment() {
  const sites = [
    'https://tampabaytreecare.com/',
    'https://boiseapplianceexperts.com/',
    'https://tampaepoxycoatings.com/',
    'https://tampaconcretepaving.com/',
    'https://knoxvillepestexperts.com/',
    'https://richmondjunkpros.com/',
  ];

  let allReady = true;

  for (const url of sites) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      
      const hasCanonical = html.includes('rel="canonical"');
      const hasOG = html.includes('og:title');
      const hasTwitter = html.includes('twitter:card');
      const hasJsonLd = html.includes('application/ld+json');
      
      const ready = hasCanonical && hasOG && hasTwitter && hasJsonLd;
      if (!ready) allReady = false;
      
      console.log(`${ready ? '✅' : '⏳'} ${url.replace('https://', '').replace('/', '')}`);
      console.log(`   canonical: ${hasCanonical ? '✅' : '❌'}  OG: ${hasOG ? '✅' : '❌'}  Twitter: ${hasTwitter ? '✅' : '❌'}  JSON-LD: ${hasJsonLd ? '✅' : '❌'}`);
    } catch (err) {
      console.log(`❌ ${url} — ${err.message}`);
      allReady = false;
    }
  }
  
  console.log(`\n${allReady ? '🟢 ALL SITES DEPLOYED' : '🔴 SOME SITES NOT YET DEPLOYED'}`);
  return allReady;
}

checkDeployment().then(ready => process.exit(ready ? 0 : 1));
