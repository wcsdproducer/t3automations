const { GoogleAuth } = require('google-auth-library');

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
  const auth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/siteverification'
    ]
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;
  
  if (!accessToken) {
    console.error('Could not get access token');
    return;
  }
  console.log('Access token retrieved for SA');

  await addSite(accessToken, 'sc-domain:tampabaytreecare.com');
  await addSite(accessToken, 'https://tampabaytreecare.com/');
}

main().catch(console.error);
