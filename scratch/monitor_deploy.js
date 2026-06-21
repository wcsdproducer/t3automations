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

  const url = `https://firebaseapphosting.googleapis.com/v1beta/projects/${projectId}/locations/${location}/backends/${backendId}/builds`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (res.data.builds) {
    const sortedBuilds = res.data.builds.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    const latest = sortedBuilds[0];
    const buildId = latest.name.split('/').pop();
    const createTime = new Date(latest.createTime);
    const now = new Date();
    const isRecent = (now - createTime) < 20 * 60 * 1000; // created in last 20 mins
    
    console.log(JSON.stringify({
      buildId,
      state: latest.state,
      createTime: latest.createTime,
      isRecent,
      now: now.toISOString()
    }));
  } else {
    console.log(JSON.stringify({ error: 'No builds found' }));
  }
}

main().catch(err => {
  console.log(JSON.stringify({ error: err.message }));
});
