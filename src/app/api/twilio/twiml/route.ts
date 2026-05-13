export async function POST(request: Request) {
  const url = new URL(request.url);
  const agentId = url.searchParams.get('agentId');

  if (!agentId) {
    return new Response('Missing agentId', { status: 400 });
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${agentId}@sip.elevenlabs.ai</Sip>
  </Dial>
</Response>`;

  return new Response(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
