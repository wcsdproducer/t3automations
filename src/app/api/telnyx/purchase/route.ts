import { NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';
const telnyx = require('telnyx');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, uid } = body;

    if (!phoneNumber || !uid) {
      return NextResponse.json({ error: 'Missing phone number or uid' }, { status: 400 });
    }

    if (!process.env.TELNYX_API_KEY) {
      throw new Error('Missing TELNYX_API_KEY');
    }

    const telnyxClient = telnyx(process.env.TELNYX_API_KEY);

    // Purchase the number via Telnyx Number Orders
    const orderResponse = await telnyxClient.numberOrders.create({
      phone_numbers: [{ phone_number: phoneNumber }],
      customer_reference: `T3kniQ-User-${uid}`
    });

    // Save the number to Firestore for this user
    await adminDb.collection('businessProfiles').doc(uid).collection('phoneNumbers').doc(phoneNumber).set({
      phoneNumber,
      provider: 'telnyx',
      status: 'purchased',
      orderId: orderResponse.data.id,
      purchasedAt: new Date(),
    });

    return NextResponse.json({ success: true, order: orderResponse.data });
  } catch (error: any) {
    console.error('Error purchasing Telnyx number:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
