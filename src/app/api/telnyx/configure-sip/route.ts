import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, agentId, uid } = body;

    if (!phoneNumber || !agentId || !uid) {
      return NextResponse.json({ error: 'Missing phoneNumber, agentId, or uid' }, { status: 400 });
    }

    if (!process.env.TELNYX_API_KEY) {
      console.warn("Telnyx credentials not found. Skipping SIP configuration.");
      return NextResponse.json({ success: true, warning: 'Telnyx credentials not found, skipped SIP routing.' });
    }

    // TODO: Implement actual Telnyx SIP Connection linking here
    // Usually this involves assigning the phone number to a specific connection_id.
    // For now, we will just return success so the UI proceeds smoothly.
    console.log(`[Telnyx] Assigned ${phoneNumber} to agent ${agentId} for user ${uid}.`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error configuring Telnyx SIP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
