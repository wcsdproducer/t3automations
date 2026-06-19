const { execSync } = require('child_process');

async function main() {
  let accessToken;
  try {
    accessToken = execSync('gcloud auth print-access-token').toString().trim();
  } catch (err) {
    console.error('Error getting access token from gcloud:', err.message);
    process.exit(1);
  }

  const projectId = 'studio-1410114603-9e1f6';
  const location = 'us-central1';
  const backendId = 'studio';

  console.log('Fetching backend details...');
  try {
    const url = `https://firebaseapphosting.googleapis.com/v1beta/projects/${projectId}/locations/${location}/backends/${backendId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    console.log('Backend Traffic config:', JSON.stringify(data.traffic, null, 2));
    
    // Also list rollouts
    console.log('Fetching rollouts...');
    const rolloutsUrl = `https://firebaseapphosting.googleapis.com/v1beta/projects/${projectId}/locations/${location}/backends/${backendId}/rollouts`;
    const rolloutsRes = await fetch(rolloutsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const rolloutsData = await rolloutsRes.json();
    console.log('Rollouts count:', rolloutsData.rollouts?.length || 0);
    if (rolloutsData.rollouts) {
      const sorted = rolloutsData.rollouts.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      for (const rollout of sorted.slice(0, 5)) {
        console.log(`- Rollout ID: ${rollout.name.split('/').pop()}`);
        console.log(`  Build: ${rollout.build.split('/').pop()}`);
        console.log(`  Create Time: ${rollout.createTime}`);
        console.log(`  State: ${rollout.state}`);
      }
    }
  } catch (e) {
    console.error('Error fetching backend/rollouts:', e.message);
  }
}

main().catch(console.error);
