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
    let businessProfileId: string | null = null;

    if (!agentsSnapshot.empty) {
      const agentDoc = agentsSnapshot.docs[0];
      const businessProfileRef = agentDoc.ref.parent.parent;
      
      if (businessProfileRef) {
        businessProfileId = businessProfileRef.id;
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
          businessProfileId = businessProfileRef.id;
          const profileDoc = await businessProfileRef.get();
          if (profileDoc.exists) {
            businessProfileData = profileDoc.data();
          }
        }
      }
    }

    if (businessProfileData && businessProfileId) {
      // --- NEW: Lead Lookup for Personalization ---
      let customerName = "";
      let isReturning = false;
      let lastInteractionSummary = "";

      if (caller_id) {
        try {
          const leadsSnapshot = await adminDb.collection(`businessProfiles/${businessProfileId}/leads`)
            .where('phone', '==', caller_id)
            .limit(1)
            .get();

          if (!leadsSnapshot.empty) {
            const lead = leadsSnapshot.docs[0].data();
            customerName = lead.name || "";
            isReturning = true;
            lastInteractionSummary = lead.agentSummary || lead.notes?.slice(0, 100) || "";
          }
        } catch (leadError) {
          console.error('Error looking up lead for personalization:', leadError);
        }
      }

      return NextResponse.json({
        dynamic_variables: {
          business_name: businessProfileData.businessName || defaultDynamicVariables.business_name,
          booking_url: businessProfileData.bookingUrl || defaultDynamicVariables.booking_url,
          service: businessProfileData.service || defaultDynamicVariables.service,
          customer_name: customerName,
          is_returning_customer: isReturning,
          last_interaction_summary: lastInteractionSummary,
        }
      });
    }

    return NextResponse.json({
      dynamic_variables: {
        ...defaultDynamicVariables,
        customer_name: "",
        is_returning_customer: false,
        last_interaction_summary: "",
      }
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
