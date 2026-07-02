import axios from 'axios';

async function testFormSubmission() {
  const businessId = 'boiseapplianceexperts_com';
  // Note: Since 'use server' actions are harder to test via raw HTTP without session/CSRF,
  // I'll check if I can hit the API directly if I have one, or just trust the server action logic
  // which I already audited and it uses admin SDK.
  
  // Instead, I'll simulate a CHAT lead capture, which hits an API route.
  const url = 'http://localhost:9003/api/chat'; 
  
  const payload = {
    businessProfileId: businessId,
    messages: [
      { role: 'user', content: 'Hi, I need to book a repair for my fridge. My name is Alice Test and my phone is +12085559999. It is leaking water.' }
    ]
  };

  console.log('Sending mock chat message to:', url);
  try {
    const response = await axios.post(url, payload);
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testFormSubmission().catch(console.error);
