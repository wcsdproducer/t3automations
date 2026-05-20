import { NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';
import { triggerLeadAlerts } from '@/lib/alerts';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      agent_id, 
      call_sid, 
      transcript, 
      summary, 
      duration, 
      status, 
      caller_id, 
      metadata,
      recording_url
    } = body;

    if (!agent_id || !call_sid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the business profile holding this agent
    const agentsSnapshot = await adminDb.collectionGroup('agents')
      .where('elevenLabsAgentId', '==', agent_id)
      .limit(1)
      .get();

    if (agentsSnapshot.empty) {
      return NextResponse.json({ error: 'Agent not found in registry' }, { status: 404 });
    }

    const agentDoc = agentsSnapshot.docs[0];
    const agentData = agentDoc.data();
    const businessProfileRef = agentDoc.ref.parent.parent;

    if (!businessProfileRef) {
      return NextResponse.json({ error: 'Invalid business profile hierarchy' }, { status: 500 });
    }

    // Write the conversation log
    const conversationRef = agentDoc.ref.collection('conversations').doc(call_sid);
    await conversationRef.set({
      callSid: call_sid,
      agentId: agent_id,
      callerNumber: caller_id || metadata?.caller_id || 'unknown',
      duration: duration || 0,
      transcript: transcript || '',
      summary: summary || '',
      outcome: status || 'completed',
      startedAt: new Date(),
      recordingUrl: recording_url || '',
    });

    // Handle CRM Lead creation/updating
    const callerNumber = caller_id || metadata?.caller_id;
    if (callerNumber && callerNumber !== 'unknown') {
      const leadsRef = businessProfileRef.collection('leads');
      const existingLeads = await leadsRef.where('phone', '==', callerNumber).limit(1).get();

      if (existingLeads.empty) {
        // Create new lead
        const newLead = {
          name: 'Anonymous Caller',
          phone: callerNumber,
          email: '',
          source: 'inbound-call',
          status: 'new',
          notes: summary || 'Created from inbound call.',
          agentSummary: summary || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await leadsRef.add(newLead);

        // Trigger lead alerts in background
        triggerLeadAlerts(businessProfileRef.id, newLead).catch(err => {
          console.error('Failed to trigger call lead alert:', err);
        });
      } else {
        // Update existing lead
        const leadDoc = existingLeads.docs[0];
        const updatedLeadData = {
          status: 'contacted',
          agentSummary: summary || leadDoc.data().agentSummary,
          notes: leadDoc.data().notes + '\n\n' + (summary || ''),
          updatedAt: new Date(),
        };
        await leadDoc.ref.update(updatedLeadData);

        // Trigger update alert
        triggerLeadAlerts(businessProfileRef.id, {
          name: leadDoc.data().name || 'Anonymous Caller',
          phone: callerNumber,
          email: leadDoc.data().email || '',
          source: 'inbound-call-return',
          notes: `Returned Caller. Summary: ${summary || 'No new summary.'}`
        }).catch(err => {
          console.error('Failed to trigger call update alert:', err);
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in post-call webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
