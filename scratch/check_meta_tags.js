async function checkMetaTags() {
  const sites = [
    'https://knoxvillepestexperts.com/',
    'https://tampaepoxycoatings.com/',
    'https://tampaconcretepaving.com/',
  ];

  for (const url of sites) {
    console.log(`\n── ${url} ──`);
    try {
      const res = await fetch(url);
      const html = await res.text();
      
      // Check for google-site-verification meta tag
      const match = html.match(/<meta\s+name=["']google-site-verification["']\s+content=["']([^"']+)["']/i);
      if (match) {
        console.log(`  ✅ Found verification meta tag: ${match[1]}`);
      } else {
        console.log('  ❌ No google-site-verification meta tag found');
        // Check if there's any meta tags at all
        const metaTags = html.match(/<meta[^>]*>/gi);
        console.log(`  Total meta tags found: ${metaTags ? metaTags.length : 0}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
  }
}

checkMetaTags().then(() => process.exit(0));
