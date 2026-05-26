import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

async function testGA() {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/analytics.edit', 'https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/analytics'],
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;
    if (!token) {
      throw new Error('Failed to retrieve access token');
    }

    console.log('Querying token info...');
    const response = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
    console.log('Token info:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error('API Error Response:', error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGA();
