const axios = require('axios');

async function main() {
  const url = 'https://t3automations.com/api/check-domain-status';
  try {
    const res = await axios.post(url, {
      domain: 'richmondjunkpros.com',
      userId: 'richmond_junk_pros'
    });
    console.log('API Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
  }
}

main();
