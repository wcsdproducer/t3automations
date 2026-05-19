import { NextResponse } from 'next/server';

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// The "ElevenLabs SIP" connection ID on Telnyx (pre-created)
const TELNYX_SIP_CONNECTION_ID = '2963263301619812344';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, agentId, uid } = body;

    if (!phoneNumber || !agentId || !uid) {
      return NextResponse.json({ error: 'Missing phoneNumber, agentId, or uid' }, { status: 400 });
    }

    if (!TELNYX_API_KEY) {
      console.warn('[SIP Config] Telnyx API key not found. Skipping SIP configuration.');
      return NextResponse.json({ success: false, error: 'Telnyx credentials not configured.' }, { status: 500 });
    }

    if (!ELEVENLABS_API_KEY) {
      console.warn('[SIP Config] ElevenLabs API key not found. Skipping SIP configuration.');
      return NextResponse.json({ success: false, error: 'ElevenLabs credentials not configured.' }, { status: 500 });
    }

    // ─── Step 1: Find the Telnyx phone number ID ───
    console.log(`[SIP Config] Looking up Telnyx number ${phoneNumber}...`);
    const searchRes = await fetch(
      `https://api.telnyx.com/v2/phone_numbers?filter[phone_number]=${encodeURIComponent(phoneNumber)}`,
      { headers: { 'Authorization': `Bearer ${TELNYX_API_KEY}` } }
    );
    const searchData = await searchRes.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      console.error(`[SIP Config] Phone number ${phoneNumber} not found on Telnyx.`);
      return NextResponse.json({ error: `Phone number ${phoneNumber} not found on Telnyx account.` }, { status: 404 });
    }

    const telnyxNumberId = searchData.data[0].id;
    console.log(`[SIP Config] Found Telnyx number ID: ${telnyxNumberId}`);

    // ─── Step 2: Assign the number to the ElevenLabs SIP connection ───
    console.log(`[SIP Config] Assigning to SIP connection ${TELNYX_SIP_CONNECTION_ID}...`);
    const updateRes = await fetch(
      `https://api.telnyx.com/v2/phone_numbers/${telnyxNumberId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TELNYX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connection_id: TELNYX_SIP_CONNECTION_ID,
        }),
      }
    );

    if (!updateRes.ok) {
      const errorData = await updateRes.json().catch(() => ({}));
      console.error('[SIP Config] Failed to assign number to SIP connection:', errorData);
      return NextResponse.json({ 
        error: `Failed to assign number to SIP connection: ${JSON.stringify(errorData)}` 
      }, { status: 500 });
    }

    const updatedNumber = await updateRes.json();
    console.log(`[SIP Config] ✅ Number assigned to SIP connection. Connection ID: ${updatedNumber.data?.connection_id}`);

    // ─── Step 3: Register the number as a SIP phone in ElevenLabs ───
    console.log(`[SIP Config] Registering ${phoneNumber} in ElevenLabs for agent ${agentId}...`);
    const elRes = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        provider: 'sip_trunk',
        label: `T3 Tenant ${uid.slice(-6)}`,
        agent_id: agentId,
      }),
    });

    if (!elRes.ok) {
      const elError = await elRes.json().catch(() => ({}));
      // If it already exists, that's acceptable — try to update it instead
      if (elRes.status === 409 || elRes.status === 422) {
        console.log(`[SIP Config] Phone already registered in ElevenLabs, attempting update...`);
        
        // Get the existing phone number entry
        const listRes = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
          headers: { 'xi-api-key': ELEVENLABS_API_KEY },
        });
        const listData = await listRes.json();
        const phonesList = listData.phone_numbers || listData || [];
        const existing = Array.isArray(phonesList) 
          ? phonesList.find((p: any) => p.phone_number === phoneNumber)
          : null;

        if (existing?.phone_number_id) {
          // Update to point to the correct agent
          const patchRes = await fetch(
            `https://api.elevenlabs.io/v1/convai/phone-numbers/${existing.phone_number_id}`,
            {
              method: 'PATCH',
              headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ agent_id: agentId }),
            }
          );
          if (patchRes.ok) {
            console.log(`[SIP Config] ✅ Updated existing ElevenLabs phone to point to agent ${agentId}`);
          } else {
            console.warn('[SIP Config] Could not update existing phone entry:', await patchRes.text());
          }
        }
      } else {
        console.error('[SIP Config] Failed to register phone in ElevenLabs:', elError);
        // Don't fail the whole operation — Telnyx routing is already set up
        return NextResponse.json({ 
          success: true, 
          warning: 'Telnyx routing configured but ElevenLabs registration failed.',
          elError 
        });
      }
    } else {
      const elData = await elRes.json();
      console.log(`[SIP Config] ✅ Registered in ElevenLabs. Phone ID: ${elData.phone_number_id}`);
    }

    console.log(`[SIP Config] ✅ Full SIP routing configured for ${phoneNumber} → agent ${agentId}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[SIP Config] Error configuring SIP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
