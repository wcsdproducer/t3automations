const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function main() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;

  const domain = 'richmondjunkpros.com';
  const deleteUrl = `https://firebaseapphosting.googleapis.com/v1/projects/studio-1410114603-9e1f6/locations/us-central1/backends/studio/domains/${domain}`;
  const createUrl = `https://firebaseapphosting.googleapis.com/v1beta/projects/studio-1410114603-9e1f6/locations/us-central1/backends/studio/domains?domainId=${domain}`;

  console.log(`Deleting domain ${domain} from App Hosting...`);
  try {
    const delRes = await axios.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('Delete output:', delRes.data);
  } catch (err) {
    console.error('Delete failed:', err.response ? err.response.data : err.message);
  }

  console.log(`Waiting for deletion of ${domain} to complete...`);
  while (true) {
    try {
      await axios.get(deleteUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('Domain still exists, sleeping 5s...');
      await new Promise(r => setTimeout(r, 5000));
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('Domain deleted successfully! Proceeding to recreate...');
        break;
      } else {
        throw err;
      }
    }
  }

  console.log(`Re-creating domain ${domain} in App Hosting...`);
  try {
    const createRes = await axios.post(createUrl, {}, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Create output:', createRes.data);
  } catch (err) {
    console.error('Create failed:', err.response ? createRes.data : err.message);
  }
}

main().catch(console.error);
