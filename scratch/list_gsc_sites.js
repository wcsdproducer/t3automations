const { execSync } = require('child_process');

async function main() {
  let accessToken;
  try {
    accessToken = execSync('gcloud auth print-access-token').toString().trim();
  } catch (err) {
    console.error('Error getting token:', err.message);
    return;
  }

  try {
    const url = 'https://www.googleapis.com/webmasters/v3/sites';
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Verified GSC sites:');
    if (data.siteEntry) {
      data.siteEntry.forEach(s => {
        console.log(`- ${s.siteUrl} (Verified: ${s.permissionLevel})`);
      });
    } else {
      console.log('No sites found or error:', data);
    }
  } catch (e) {
    console.error('Error listing sites:', e.message);
  }
}

main().catch(console.error);
