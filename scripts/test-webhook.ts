import axios from 'axios';

async function testWebhook() {
  const url = 'https://aisalesrep.live/api/elevenlabs/post-call';
  // Note: We might need to wait for the deploy to finish on aisalesrep.live 
  // or use the internal preview URL if available.
  // For now, I'll try the production URL.

  const payload = {
    agent_id: 'test_agent_boise',
    call_sid: 'test_call_' + Date.now(),
    transcript: 'Hello, I need my refrigerator fixed in the North End. It stopped cooling this morning. My name is John Test.',
    summary: 'Customer John Test in North End Boise needs refrigerator repair. Urgent cooling issue.',
    duration: 120,
    status: 'completed',
    caller_id: '+15551234567',
    metadata: {
      caller_id: '+15551234567'
    }
  };

  try {
    console.log('Sending mock webhook to:', url);
    const response = await axios.post(url, payload);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error: any) {
    console.error('Error sending webhook:', error.response?.data || error.message);
  }
}

testWebhook();
