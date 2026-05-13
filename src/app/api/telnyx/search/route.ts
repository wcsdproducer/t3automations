import { NextResponse } from 'next/server';
const telnyx = require('telnyx');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const areaCode = searchParams.get('areaCode') || '';
    
    if (!process.env.TELNYX_API_KEY) {
      throw new Error('Missing TELNYX_API_KEY');
    }

    const telnyxClient = telnyx(process.env.TELNYX_API_KEY);

    
    // Search for available numbers
    const response = await telnyxClient.availablePhoneNumbers.list({
      filter: {
        features: ['voice'],
        national_destination_code: areaCode || undefined,
        country_code: 'US',
        limit: 5,
      }
    });

    return NextResponse.json({ numbers: response.data });
  } catch (error: any) {
    console.error('Error searching Telnyx numbers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
