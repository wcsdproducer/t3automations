import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, systemPrompt, voiceId, firstMessage } = body;

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: 'Missing ElevenLabs API Key' }, { status: 500 });
    }

    const payload = {
      name: name || "Voice Agent",
      conversation_config: {
        agent: {
          first_message: firstMessage || "Hello! How can I assist you today?",
          prompt: {
            prompt: systemPrompt || "You are a helpful assistant.",
            llm: "gemini-1.5-flash"
          }
        },
        tts: {
          voice_id: voiceId || "21m00Tcm4TlvDq8ikWAM"
        }
      }
    };

    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("ElevenLabs Create Error:", errorData || response.statusText);
      return NextResponse.json({ error: 'Failed to create agent on ElevenLabs', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating ElevenLabs agent:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
