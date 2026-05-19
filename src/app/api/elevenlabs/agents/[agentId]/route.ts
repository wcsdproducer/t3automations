import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const { systemPrompt, voiceId, firstMessage, userId } = body;

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: 'Missing ElevenLabs API Key' }, { status: 500 });
    }

    const formattedName = userId ? `Tenant Agent (UID: ${userId.slice(-6)})` : "Voice Agent";

    const payload = {
      name: formattedName,
      conversation_config: {
        agent: {
          first_message: firstMessage,
          prompt: {
            prompt: systemPrompt,
            llm: "gemini-1.5-flash"
          }
        },
        tts: {
          voice_id: voiceId
        }
      }
    };

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("ElevenLabs Update Error:", errorData || response.statusText);
      return NextResponse.json({ error: 'Failed to update agent on ElevenLabs', details: errorData }, { status: response.status });
    }

    // According to docs, PATCH might return empty body or the agent object
    const text = await response.text();
    const data = text ? JSON.parse(text) : { success: true };
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating ElevenLabs agent:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
