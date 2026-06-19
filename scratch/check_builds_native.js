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

  console.log('Fetching builds list...');
  try {
    const url = `https://firebaseapphosting.googleapis.com/v1beta/projects/${projectId}/locations/${location}/backends/${backendId}/builds`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    console.log('Builds count:', data.builds?.length || 0);
    if (data.builds) {
      const sortedBuilds = data.builds.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      for (const build of sortedBuilds.slice(0, 5)) {
        console.log(`- Build ID: ${build.name.split('/').pop()}`);
        console.log(`  State: ${build.state}`);
        console.log(`  Commit SHA: ${build.source?.codebase?.commitSha}`);
        console.log(`  Create Time: ${build.createTime}`);
        console.log(`  Update Time: ${build.updateTime}`);
      }
    }
  } catch (e) {
    console.error('Error fetching builds:', e.message);
  }
}

main().catch(console.error);
