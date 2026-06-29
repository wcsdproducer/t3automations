const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function main() {
  const auth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/siteverification',
      'https://www.googleapis.com/auth/webmasters',
    ],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;

  const siteUrl = 'https://tampabaytreecare.com/';
  console.log(`Getting token for ${siteUrl} using service account...`);

  try {
    const res = await axios.post(
      'https://www.googleapis.com/siteVerification/v1/token',
      {
        verificationMethod: 'META',
        site: {
          identifier: siteUrl,
          type: 'SITE',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Result:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

main().catch(console.error);
