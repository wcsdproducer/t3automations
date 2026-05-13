import { NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, agentId, uid } = body;

    if (!phoneNumber || !agentId || !uid) {
      return NextResponse.json({ error: 'Missing phoneNumber, agentId, or uid' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      // If no Twilio credentials, return a dummy success for now or gracefully skip
      console.warn("Twilio credentials not found. Skipping SIP configuration.");
      return NextResponse.json({ success: true, warning: 'Twilio credentials not found, skipped SIP routing.' });
    }

    const client = twilio(accountSid, authToken);

    // 1. Find the Twilio incoming phone number SID
    const incomingNumbers = await client.incomingPhoneNumbers.list({ phoneNumber });
    if (incomingNumbers.length === 0) {
      return NextResponse.json({ error: 'Phone number not found in Twilio account' }, { status: 404 });
    }
    const incomingNumber = incomingNumbers[0];

    // 2. Create or find a TwiML App or directly set the VoiceUrl
    // For ElevenLabs SIP, we can just use a TwiML Bin or return TwiML from another route.
    // Alternatively, we can use Twilio SIP Domains.
    // The simplest way without hosting a TwiML endpoint is setting VoiceUrl to an echo URL
    // Or we can create an endpoint in our app to serve the TwiML. Let's assume we have a TwiML endpoint
    // e.g. /api/twilio/twiml?agentId=...
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aisalesrep.live'; // Adjust as needed
    const voiceUrl = `${baseUrl}/api/twilio/twiml?agentId=${agentId}`;

    await client.incomingPhoneNumbers(incomingNumber.sid).update({
      voiceUrl: voiceUrl,
      voiceMethod: 'POST'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error configuring Twilio SIP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
