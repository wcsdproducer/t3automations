const { execSync } = require('child_process');

async function addSite(accessToken, siteId) {
  console.log(`Adding site: ${siteId}`);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteId)}`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Length': '0'
      }
    });
    console.log(`Status for ${siteId}:`, res.status);
    const text = await res.text();
    console.log(`Response for ${siteId}:`, text);
  } catch (e) {
    console.error(`Error adding ${siteId}:`, e.message);
  }
}

async function main() {
  let accessToken;
  try {
    accessToken = execSync('gcloud auth print-access-token').toString().trim();
  } catch (err) {
    console.error('Error getting token:', err.message);
    return;
  }

  // Add domain property
  await addSite(accessToken, 'sc-domain:tampabaytreecare.com');
  // Add URL-prefix property
  await addSite(accessToken, 'https://tampabaytreecare.com/');
}

main().catch(console.error);
