import { execSync } from 'child_process';
import axios from 'axios';

async function run() {
  try {
    console.log('Retrieving gcloud access token...');
    const token = execSync('gcloud auth print-access-token').toString().trim();
    if (!token) {
      console.error('Failed to retrieve access token.');
      return;
    }
    console.log('Access token successfully retrieved.');

    console.log('Fetching Google Analytics accounts...');
    const accountsRes = await axios.get('https://analyticsadmin.googleapis.com/v1beta/accounts', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const accounts = accountsRes.data.accounts || [];
    console.log(`Found ${accounts.length} Google Analytics accounts.`);
    
    for (const account of accounts) {
      console.log(`\nAccount: ${account.displayName} (${account.name})`);
      
      console.log(`Fetching properties for ${account.name}...`);
      const propsRes = await axios.get('https://analyticsadmin.googleapis.com/v1beta/properties', {
        headers: { Authorization: `Bearer ${token}` },
        params: { filter: `parent:${account.name}` }
      });
      
      const properties = propsRes.data.properties || [];
      console.log(`  Found ${properties.length} properties:`);
      for (const prop of properties) {
        console.log(`  - Property: ${prop.displayName} (${prop.name})`);
        
        console.log(`    Fetching data streams for ${prop.name}...`);
        const streamsRes = await axios.get(`https://analyticsadmin.googleapis.com/v1beta/${prop.name}/dataStreams`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const streams = streamsRes.data.dataStreams || [];
        for (const stream of streams) {
          console.log(`      * Stream: ${stream.displayName} (${stream.name}) -> Measurement ID: ${stream.webStreamData?.measurementId}`);
        }
      }
    }
  } catch (err: any) {
    console.error('Error listing GA properties:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message || err);
    }
  }
}

run().catch(console.error);
