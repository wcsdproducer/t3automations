const { POST } = require('../src/app/api/check-domain-status/route');

// Mock request/response
class MockRequest {
  constructor(body) {
    this.bodyData = body;
  }
  async json() {
    return this.bodyData;
  }
}

const domainsToCheck = [
  { domain: 'tampaconcretepaving.com', userId: 'tampa_paving_concrete' },
  { domain: 'tampaepoxycoatings.com', userId: 'tampa_epoxy_flooring' },
  { domain: 'tampabaytreecare.com', userId: 'tampa_tree_services' },
  { domain: 'cleansweepcleaningcompany.com', userId: '8LqCDzbJF5eGl2nHJl1lIDMdXm93' }
];

async function main() {
  process.env.NODE_ENV = 'development';
  console.log("Starting validation run for all 4 renter domains...");
  
  for (const item of domainsToCheck) {
    console.log(`\n--------------------------------------------`);
    console.log(`Checking domain: ${item.domain} (User: ${item.userId})`);
    try {
      const req = new MockRequest(item);
      const res = await POST(req);
      const data = await res.json();
      console.log(`HTTP Status:`, res.status);
      console.log(`Domain Status:`, data.status);
      console.log(`Detail:`, data.detail);
      console.log(`DNS Records saved:`, JSON.stringify(data.dnsRecords, null, 2));
    } catch (e) {
      console.error(`Error checking ${item.domain}:`, e);
    }
  }
  console.log(`\nValidation run completed!`);
}

main().catch(console.error);
