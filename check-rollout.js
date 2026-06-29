const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function checkRollout() {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      console.error('Failed to get access token');
      return;
    }

    const projectId = 'studio-1410114603-9e1f6';
    const location = 'us-central1';
    const backendId = 'studio';

    const url = `https://firebaseapphosting.googleapis.com/v1beta/projects/${projectId}/locations/${location}/backends/${backendId}/rollouts`;
    const buildsUrl = `https://firebaseapphosting.googleapis.com/v1beta/projects/${projectId}/locations/${location}/backends/${backendId}/builds`;
    
    console.log('Fetching builds and rollouts...');
    const [buildsResponse, rolloutsResponse] = await Promise.all([
      axios.get(buildsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }),
      axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
    ]);

    if (buildsResponse.data.builds && buildsResponse.data.builds.length > 0) {
      const sortedBuilds = buildsResponse.data.builds.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      console.log('Top 3 most recent builds:');
      sortedBuilds.slice(0, 3).forEach(b => {
        console.log(`- ID: ${b.name.split('/').pop()}`);
        console.log(`  State: ${b.state}`);
        console.log(`  Create Time: ${b.createTime}`);
      });
    }

    if (rolloutsResponse.data.rollouts && rolloutsResponse.data.rollouts.length > 0) {
      const sortedRollouts = rolloutsResponse.data.rollouts.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      console.log('\nTop 3 most recent rollouts:');
      sortedRollouts.slice(0, 3).forEach(r => {
        console.log(`- ID: ${r.name.split('/').pop()}`);
        console.log(`  State: ${r.state}`);
        console.log(`  Create Time: ${r.createTime}`);
      });
    } else {
      console.log('No rollouts found.');
    }
  } catch (err) {
    console.error('Error fetching rollouts:', err.response ? err.response.data : err.message);
  }
}

checkRollout();
