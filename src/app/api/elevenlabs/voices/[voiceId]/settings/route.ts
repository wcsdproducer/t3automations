import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ voiceId: string }> }
) {
  try {
    const { voiceId } = await params;
    const body = await request.json();
    const { stability, similarityBoost } = body;

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key is not configured.' }, { status: 500 });
    }

    // Attempt to update the voice settings on ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}/settings`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stability,
        similarity_boost: similarityBoost,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Failed to update voice settings on ElevenLabs. Note that premade voices cannot be edited.', errorData);
      // We will still return 200 so that Firestore can save the settings as a fallback for runtime overriding.
      return NextResponse.json({ success: false, details: errorData });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating ElevenLabs voice settings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
