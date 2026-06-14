const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function main() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;
  console.log("Token successfully retrieved:", accessToken ? "Yes (length: " + accessToken.length + ")" : "No");

  const url = `https://firebaseapphosting.googleapis.com/v1/projects/studio-1410114603-9e1f6/locations/us-central1/backends/studio/domains`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  console.log("Found domains:");
  for (const domain of response.data.domains || []) {
    console.log(`- ${domain.name.split('/').pop()}: type=${domain.type}`);
    if (domain.customDomainStatus) {
      console.log(`  Status: host=${domain.customDomainStatus.hostState}, ownership=${domain.customDomainStatus.ownershipState}, cert=${domain.customDomainStatus.certState}`);
      if (domain.customDomainStatus.requiredDnsUpdates) {
        console.log(`  Required DNS updates:`);
        console.log(JSON.stringify(domain.customDomainStatus.requiredDnsUpdates, null, 2));
      }
    }
  }
}

main().catch(console.error);
