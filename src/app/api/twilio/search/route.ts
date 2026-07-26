import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const areaCode = searchParams.get('areaCode') || '';
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    // Search for available local numbers
    const availableNumbers = await client.availablePhoneNumbers('US').local.list({
      areaCode: areaCode ? parseInt(areaCode, 10) : undefined,
      limit: 5,
    });

    return NextResponse.json({ 
      numbers: availableNumbers.map(n => ({
        phoneNumber: n.phoneNumber,
        friendlyName: n.friendlyName,
        locality: n.locality,
        region: n.region,
        isoCountry: n.isoCountry
      }))
    });
  } catch (error: any) {
    console.error('Error searching Twilio numbers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
