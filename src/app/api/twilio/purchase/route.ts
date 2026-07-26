import { NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, uid } = body;

    if (!phoneNumber || !uid) {
      return NextResponse.json({ error: 'Missing phoneNumber or uid' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    // Purchase the number
    const purchasedNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: phoneNumber,
    });

    // Save the number to Firestore for this user
    await adminDb.collection('businessProfiles').doc(uid).collection('phoneNumbers').doc(phoneNumber).set({
      phoneNumber,
      provider: 'twilio',
      status: 'purchased',
      sid: purchasedNumber.sid,
      purchasedAt: new Date(),
    });

    return NextResponse.json({ success: true, sid: purchasedNumber.sid });
  } catch (error: any) {
    console.error('Error purchasing Twilio number:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
