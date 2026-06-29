const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

async function checkStatus(accessToken) {
  const url = `https://firebaseapphosting.googleapis.com/v1/projects/studio-1410114603-9e1f6/locations/us-central1/backends/studio/domains`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const richmond = (response.data.domains || []).find(d => d.name.endsWith('richmondjunkpros.com'));
  if (richmond && richmond.customDomainStatus) {
    const status = richmond.customDomainStatus;
    console.log(`[${new Date().toISOString()}] host=${status.hostState}, ownership=${status.ownershipState}, cert=${status.certState}`);
    return status;
  }
  console.log(`[${new Date().toISOString()}] Richmond domain not found in App Hosting response.`);
  return null;
}

async function triggerProductionSync() {
  const url = 'https://t3automations.com/api/check-domain-status';
  try {
    const res = await axios.post(url, {
      domain: 'richmondjunkpros.com',
      userId: 'richmond_junk_pros'
    });
    console.log(`[Production Sync API] Status: ${res.data.status}`);
  } catch (err) {
    // ignore
  }
}

async function main() {
  const token = await getAccessToken();
  console.log('Starting active check loop for richmondjunkpros.com...');
  for (let i = 0; i < 40; i++) {
    const status = await checkStatus(token);
    if (status && status.ownershipState === 'OWNERSHIP_ACTIVE') {
      console.log('SUCCESS! ownershipState is OWNERSHIP_ACTIVE.');
      // Force sync with the production DB
      await triggerProductionSync();
      break;
    }
    // Hitting production endpoint to make sure we keep syncing/querying
    await triggerProductionSync();
    console.log(`Wait ${i+1}/40. Sleeping 20s...`);
    await new Promise(r => setTimeout(r, 20000));
  }
}

main().catch(console.error);
