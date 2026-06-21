const { execSync } = require('child_process');

async function main() {
  let accessToken;
  try {
    accessToken = execSync('gcloud auth print-access-token').toString().trim();
  } catch (err) {
    console.error('Error getting token:', err.message);
    return;
  }

  const siteUrl = 'https://tampabaytreecare.com';
  console.log(`Requesting GSC site verification token for: ${siteUrl}`);
  
  try {
    const tokenUrl = 'https://www.googleapis.com/siteVerification/v1/token';
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verificationMethod: 'META',
        site: {
          identifier: siteUrl,
          type: 'SITE'
        }
      })
    });
    
    console.log('Status:', tokenRes.status);
    const data = await tokenRes.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main().catch(console.error);
