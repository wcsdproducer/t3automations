const { GoogleAuth } = require('google-auth-library');

async function main() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  console.log('Client class:', client.constructor.name);
  console.log('Client Email:', client.email);
  console.log('Credentials:', client.credentials);
  
  try {
    const projectId = await auth.getProjectId();
    console.log('Project ID:', projectId);
  } catch (e) {
    console.error('Error getting project ID:', e.message);
  }
}

main().catch(console.error);
