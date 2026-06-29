const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function main() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;

  const domain = 'knoxvillepestexperts.com';
  const url = `https://firebaseapphosting.googleapis.com/v1/projects/studio-1410114603-9e1f6/locations/us-central1/backends/studio/domains/${domain}`;

  console.log(`Checking domain status for ${domain}...`);
  for (let i = 0; i < 12; i++) { // Check for up to 60 seconds
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = response.data;
      const status = data.customDomainStatus || {};
      console.log(`Status check ${i+1}:`);
      console.log(`  hostState: ${status.hostState}`);
      console.log(`  ownershipState: ${status.ownershipState}`);
      console.log(`  certState: ${status.certState}`);
      
      if (status.ownershipState === 'OWNERSHIP_ACTIVE') {
        console.log('Ownership verified successfully!');
        break;
      }
    } catch (err) {
      console.error('Check failed:', err.response ? err.response.data : err.message);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

main().catch(console.error);
