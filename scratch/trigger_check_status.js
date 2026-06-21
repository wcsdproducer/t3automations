const axios = require('axios');

async function main() {
  const url = 'https://t3automations.com/api/check-domain-status';
  try {
    const res = await axios.post(url, {
      domain: 'knoxvillepestexperts.com',
      userId: 'knoxvillepestexperts_com'
    });
    console.log('API Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
  }
}

main();
