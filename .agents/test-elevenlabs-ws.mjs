import WebSocket from 'ws';

const agentId = 'agent_3901krgpa3e5eaxs3ncvbhqxjq38'; // the user's agent id
const apiKey = process.env.ELEVENLABS_API_KEY;

async function test() {
  const urlRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
    headers: { 'xi-api-key': apiKey }
  });
  if (!urlRes.ok) {
    console.error('Failed to get signed URL:', await urlRes.text());
    return;
  }
  const { signed_url } = await urlRes.json();
  console.log('Got signed URL. Connecting WebSocket...');

  const ws = new WebSocket(signed_url);
  
  ws.on('open', () => {
    console.log('WebSocket opened successfully!');
    // Send initial configuration message
    ws.send(JSON.stringify({
      type: 'conversation_initiation_client_data'
    }));
  });

  ws.on('message', (data) => {
    console.log('Message received:', data.toString());
  });

  ws.on('close', (code, reason) => {
    console.log('WebSocket closed:', code, reason.toString());
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
}

test();
