const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function main() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;

  const projectId = 'studio-1410114603-9e1f6';
  const location = 'us-central1';
  const backendId = 'studio';

  const url = `https://firebaseapphosting.googleapis.com/v1beta/projects/${projectId}/locations/${location}/backends/${backendId}/builds/build-2026-06-20-001`;
  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
  }
}

main().catch(err => {
  console.error(err);
});
