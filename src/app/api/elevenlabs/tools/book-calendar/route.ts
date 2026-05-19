import { NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agent_id');
    const body = await req.json();

    // The agent is expected to send these parameters
    const { name, email, phone, date, time, service } = body;

    // Check Authorization
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.ELEVENLABS_WEBHOOK_SECRET;
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agent_id query parameter' }, { status: 400 });
    }

    if (!date || !time || !name || !phone) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required booking details: date, time, name, or phone.' 
      }, { status: 400 });
    }

    // Find the business profile holding this agent
    const agentsSnapshot = await adminDb.collectionGroup('agents')
      .where('elevenLabsAgentId', '==', agentId)
      .limit(1)
      .get();

    if (agentsSnapshot.empty) {
      return NextResponse.json({ error: 'Agent not found in registry' }, { status: 404 });
    }

    const agentDoc = agentsSnapshot.docs[0];
    const businessProfileRef = agentDoc.ref.parent.parent;

    if (!businessProfileRef) {
      return NextResponse.json({ error: 'Invalid business profile hierarchy' }, { status: 500 });
    }

    // Handle CRM Lead creation/updating
    const leadsRef = businessProfileRef.collection('leads');
    const existingLeads = await leadsRef.where('phone', '==', phone).limit(1).get();

    let leadId = '';
    if (existingLeads.empty) {
      // Create new lead
      const newLead = await leadsRef.add({
        name: name || '',
        email: email || '',
        phone: phone,
        source: 'inbound-call',
        status: 'new',
        notes: `Booked an appointment for ${date} at ${time}. Service: ${service || 'General'}`,
        agentSummary: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      leadId = newLead.id;
    } else {
      // Update existing lead
      const leadDoc = existingLeads.docs[0];
      leadId = leadDoc.id;
      await leadDoc.ref.update({
        name: leadDoc.data().name || name || '',
        email: leadDoc.data().email || email || '',
        status: 'contacted',
        notes: leadDoc.data().notes + `\n\nBooked an appointment for ${date} at ${time}. Service: ${service || 'General'}`,
        updatedAt: new Date(),
      });
    }

    // Native Calendar verification: ensure slot is free
    const calendarSettingsDoc = await businessProfileRef.collection('settings').doc('calendar').get();
    if (calendarSettingsDoc.exists && calendarSettingsDoc.data()?.nativeCalendarEnabled) {
      // Check for existing appointments at this date/time
      const conflictSnapshot = await businessProfileRef.collection('appointments')
        .where('date', '==', date)
        .where('time', '==', time)
        .where('status', '==', 'scheduled')
        .get();

      if (!conflictSnapshot.empty) {
        return NextResponse.json({
          success: false,
          message: `The time slot ${time} on ${date} is already booked. Please ask the user to pick another time.`
        });
      }
    }

    // Save the appointment
    const appointmentsRef = businessProfileRef.collection('appointments');
    await appointmentsRef.add({
      leadId,
      name,
      email: email || '',
      phone,
      date,
      time,
      service: service || 'General',
      status: 'scheduled',
      createdAt: new Date(),
    });

    // Return a response that the AI can use to confirm the booking to the caller
    return NextResponse.json({
      success: true,
      message: `Successfully booked appointment for ${name} on ${date} at ${time}.`,
      booking_reference: Math.random().toString(36).substring(2, 8).toUpperCase()
    });

  } catch (error) {
    console.error('Error in book-calendar tool webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
  }
}
