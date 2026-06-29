const axios = require('axios');
const cheerio = require('cheerio');

const namecheapUser = 'wcsdproducer';
const namecheapKey = 'ba964ee0cc484c5e8975de904ea62832';
const namecheapUsername = 'wcsdproducer';

const domain = 'richmondjunkpros.com';
const parts = domain.split('.');
const tld = parts.pop();
const sld = parts.join('.');

const desiredToken = 'fah-claim=002-02-3cee358e-fb6a-4dc3-85bd-4819f81b84a9';
const desiredAAddress = '35.219.200.5';

async function main() {
  // 1. Detect public IP of the local machine
  let localIp = '127.0.0.1';
  try {
    const ipRes = await axios.get('https://api.ipify.org?format=json', { timeout: 3000 });
    localIp = ipRes.data.ip;
    console.log('Local Public IP:', localIp);
  } catch (e) {
    console.error('Failed to get public IP:', e.message);
    return;
  }

  // 2. Fetch existing hosts
  const getHostsUrl = `https://api.namecheap.com/xml.response?ApiUser=${namecheapUser}&ApiKey=${namecheapKey}&UserName=${namecheapUsername}&ClientIp=${localIp}&Command=namecheap.domains.dns.getHosts&SLD=${sld}&TLD=${tld}`;
  const getHostsRes = await axios.get(getHostsUrl);
  const $ = cheerio.load(getHostsRes.data, { xmlMode: true });

  const errorEl = $('Error');
  if (errorEl.length > 0) {
    console.error('Namecheap error:', errorEl.text());
    return;
  }

  let existingHosts = [];
  $('host').each((_, el) => {
    existingHosts.push({
      Name: $(el).attr('Name') || '',
      Type: $(el).attr('Type') || '',
      Address: $(el).attr('Address') || '',
      MXPref: $(el).attr('MXPref') || '10',
      TTL: $(el).attr('TTL') || '1799'
    });
  });

  console.log('Existing hosts before update:', existingHosts);

  // 3. Update records:
  // Remove old root A records, www A records, and old fah-claim TXT records.
  existingHosts = existingHosts.filter(h => {
    if (h.Type === 'A' && (h.Name === '@' || h.Name === 'www')) return false;
    if (h.Type === 'TXT' && h.Name === '@' && h.Address.includes('fah-claim')) return false;
    if (h.Name === 'www' && h.Type === 'CNAME' && h.Address.includes('parkingpage.namecheap.com')) return false;
    if (h.Name === '@' && (h.Type === 'URL' || h.Type === 'URL301' || h.Type === 'FRAME') && h.Address.includes(domain)) return false;
    return true;
  });

  // Add the required Firebase records
  existingHosts.push({
    Name: '@',
    Type: 'A',
    Address: desiredAAddress,
    MXPref: '10',
    TTL: '1799'
  });
  existingHosts.push({
    Name: 'www',
    Type: 'A',
    Address: desiredAAddress,
    MXPref: '10',
    TTL: '1799'
  });
  existingHosts.push({
    Name: '@',
    Type: 'TXT',
    Address: desiredToken,
    MXPref: '10',
    TTL: '1799'
  });

  console.log('Updated hosts to send:', existingHosts);

  // 4. Construct setHosts API parameters
  const params = new URLSearchParams();
  params.append('ApiUser', namecheapUser);
  params.append('ApiKey', namecheapKey);
  params.append('UserName', namecheapUsername);
  params.append('ClientIp', localIp);
  params.append('Command', 'namecheap.domains.dns.setHosts');
  params.append('SLD', sld);
  params.append('TLD', tld);

  existingHosts.forEach((host, index) => {
    const idx = index + 1;
    params.append(`HostName${idx}`, host.Name);
    params.append(`RecordType${idx}`, host.Type);
    params.append(`Address${idx}`, host.Address);
    params.append(`MXPref${idx}`, host.MXPref);
    params.append(`TTL${idx}`, host.TTL);
  });

  // 5. Send setHosts request
  const setHostsUrl = `https://api.namecheap.com/xml.response`;
  const setHostsRes = await axios.post(setHostsUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  console.log("Raw Namecheap Response:", setHostsRes.data);
  const $set = cheerio.load(setHostsRes.data, { xmlMode: true });
  const setErrorEl = $set('Error');
  if (setErrorEl.length > 0) {
    console.error('Namecheap setHosts failed:', setErrorEl.text());
  } else {
    console.log('DNS records updated successfully in Namecheap!');
  }
}

main().catch(console.error);
