const { GoogleAuth } = require('google-auth-library');

async function main() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/userinfo.email']
  });
  const client = await auth.getClient();
  try {
    const res = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });
    console.log('User Info Email:', res.data.email);
  } catch (e) {
    console.error('Error fetching user info email:', e.message);
  }
}

main().catch(console.error);
