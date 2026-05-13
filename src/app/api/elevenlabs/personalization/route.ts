import { NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agent_id, called_number, caller_id, call_sid } = body;

    if (!agent_id && !called_number) {
      return NextResponse.json({ error: 'Missing agent_id or called_number' }, { status: 400 });
    }

    // Default dynamic variables to return if profile isn't found
    const defaultDynamicVariables = {
      business_name: "our business",
      booking_url: "not available at the moment",
      service: "our services",
    };

    // Find the business profile and agent based on the agent_id or called_number
    // We will query the businessProfiles to find the nested agent
    // Since we need to query across all users, we might need a collectionGroup query or check specific users.
    // Assuming businessProfiles -> agents is a subcollection. We can use a collectionGroup query.

    const agentsSnapshot = await adminDb.collectionGroup('agents')
      .where('elevenLabsAgentId', '==', agent_id || '')
      .limit(1)
      .get();

    let businessProfileData: any = null;

    if (!agentsSnapshot.empty) {
      const agentDoc = agentsSnapshot.docs[0];
      const businessProfileRef = agentDoc.ref.parent.parent;
      
      if (businessProfileRef) {
        const profileDoc = await businessProfileRef.get();
        if (profileDoc.exists) {
          businessProfileData = profileDoc.data();
        }
      }
    } else if (called_number) {
      // Fallback: try by called_number if telnyxPhoneNumber matches
      const agentsByPhoneSnapshot = await adminDb.collectionGroup('agents')
        .where('telnyxPhoneNumber', '==', called_number)
        .limit(1)
        .get();

      if (!agentsByPhoneSnapshot.empty) {
        const agentDoc = agentsByPhoneSnapshot.docs[0];
        const businessProfileRef = agentDoc.ref.parent.parent;
        
        if (businessProfileRef) {
          const profileDoc = await businessProfileRef.get();
          if (profileDoc.exists) {
            businessProfileData = profileDoc.data();
          }
        }
      }
    }

    if (businessProfileData) {
      return NextResponse.json({
        dynamic_variables: {
          business_name: businessProfileData.businessName || defaultDynamicVariables.business_name,
          booking_url: businessProfileData.bookingUrl || defaultDynamicVariables.booking_url,
          service: businessProfileData.service || defaultDynamicVariables.service,
        }
      });
    }

    return NextResponse.json({
      dynamic_variables: defaultDynamicVariables
    });

  } catch (error) {
    console.error('Error in personalization webhook:', error);
    // Return empty dynamic variables rather than a 500 so the call can still proceed
    return NextResponse.json({
      dynamic_variables: {
        business_name: "our business",
        booking_url: "not available at the moment",
        service: "our services",
      }
    });
  }
}
