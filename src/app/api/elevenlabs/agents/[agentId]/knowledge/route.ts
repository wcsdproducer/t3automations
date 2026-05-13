import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { agentId: string } }) {
  try {
    const { agentId } = await params;
    const formData = await request.formData();

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: 'Missing ElevenLabs API Key' }, { status: 500 });
    }

    // Pass the formData directly to ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/knowledge`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("ElevenLabs Knowledge Error:", errorData || response.statusText);
      return NextResponse.json({ error: 'Failed to add knowledge to ElevenLabs', details: errorData }, { status: response.status });
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : { success: true };
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error adding knowledge to ElevenLabs:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
