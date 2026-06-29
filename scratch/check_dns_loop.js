const axios = require('axios');
const dns = require('dns').promises;

async function checkDns() {
  const domain = 'richmondjunkpros.com';
  const expectedToken = 'fah-claim=002-02-3cee358e-fb6a-4dc3-85bd-4819f81b84a9';
  console.log(`Checking TXT records for ${domain}...`);
  try {
    const resolver = new dns.Resolver();
    // Use Google DNS or Cloudflare to resolve
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    const records = await resolver.resolveTxt(domain);
    const flatRecords = records.flat();
    console.log('Current TXT records resolved:', flatRecords);
    
    if (flatRecords.includes(expectedToken)) {
      console.log('MATCH FOUND! DNS has propagated.');
      return true;
    }
  } catch (err) {
    console.error('DNS query error:', err.message);
  }
  return false;
}

async function triggerStatus() {
  const url = 'https://t3automations.com/api/check-domain-status';
  console.log('Triggering check-domain-status API...');
  try {
    const res = await axios.post(url, {
      domain: 'richmondjunkpros.com',
      userId: 'richmond_junk_pros'
    });
    console.log('API Response status:', res.data.status);
    console.log('API Response details:', res.data.detail);
    return res.data.status;
  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
  }
  return null;
}

async function main() {
  console.log('Starting monitoring loop for DNS propagation...');
  for (let i = 0; i < 40; i++) {
    const propagated = await checkDns();
    if (propagated) {
      console.log('Bypassing delay, calling status API now...');
      const status = await triggerStatus();
      if (status === 'active' || status === 'provisioning') {
        console.log('Domain is now provisioning/active! Success!');
        break;
      }
    } else {
      console.log(`Not propagated yet. Run ${i+1}/40. Sleeping 15s...`);
      await new Promise(r => setTimeout(r, 15000));
    }
  }
}

main().catch(console.error);
