const { execSync } = require('child_process');

async function main() {
  let accessToken;
  try {
    accessToken = execSync('gcloud auth print-access-token').toString().trim();
  } catch (err) {
    console.error('Error getting token:', err.message);
    return;
  }

  const siteUrl = 'https://tampabaytreecare.com/';
  const serviceAccountEmail = 'firebase-app-hosting-backend@studio-1410114603-9e1f6.iam.gserviceaccount.com';
  
  console.log(`Adding ${serviceAccountEmail} as full user to GSC property ${siteUrl}...`);
  
  try {
    // GSC permissions endpoint URL format:
    // POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/permissions
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/permissions`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permissionLevel: 'full',
        role: 'full',
        userEmail: serviceAccountEmail
      })
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error('Error adding user:', e.message);
  }
}

main().catch(console.error);
