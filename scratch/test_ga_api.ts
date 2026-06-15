import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

async function testGA() {
  try {
    console.log('Initializing GoogleAuth...');
    const auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/analytics.edit',
        'https://www.googleapis.com/auth/analytics',
      ],
    });
    
    console.log('Getting client...');
    const client = await auth.getClient();
    console.log('Getting access token...');
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;
    
    if (!accessToken) {
      console.error('No access token returned.');
      return;
    }
    
    console.log('Token successfully retrieved.');
    
    console.log('Fetching Google Analytics accounts...');
    const accountsRes = await axios.get('https://analyticsadmin.googleapis.com/v1beta/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    console.log('Accounts response:', JSON.stringify(accountsRes.data, null, 2));
  } catch (err: any) {
    console.error('Failed testGA:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message || err);
    }
  }
}

testGA().catch(console.error);
