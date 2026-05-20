import { NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';
import { triggerLeadAlerts } from '@/lib/alerts';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agent_id');
    const body = await req.json();

    // Parameters sent from ElevenLabs voice agent
    const { name, email, phone, date, time, service, bookingType } = body;

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

    // Retrieve Business Profile
    const profileDoc = await businessProfileRef.get();
    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
    }

    const profile = profileDoc.data() || {};
    const businessName = profile.businessName || 'Our Business';
    const monthlyLeadCap = profile.monthlyLeadCap || 0;

    // 1. Throttling/Waitlist Check
    let isThrottled = false;
    if (monthlyLeadCap > 0) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const leadsCountSnapshot = await businessProfileRef.collection('leads')
        .where('createdAt', '>=', firstDayOfMonth)
        .get();

      if (leadsCountSnapshot.size >= monthlyLeadCap) {
        isThrottled = true;
      }
    }

    // Set appointment status based on throttling or voice agent request
    const finalBookingStatus = (isThrottled || bookingType === 'waitlist') ? 'waitlist' : 'scheduled';

    // 2. Handle CRM Lead creation/updating
    const leadsRef = businessProfileRef.collection('leads');
    const existingLeads = await leadsRef.where('phone', '==', phone).limit(1).get();

    let leadId = '';
    const leadNotes = `Inbound call booking. Status: ${finalBookingStatus}. Date: ${date}, Time: ${time}. Service: ${service || 'General'}`;

    if (existingLeads.empty) {
      // Create new lead
      const newLead = await leadsRef.add({
        name: name || '',
        email: email || '',
        phone: phone,
        source: 'inbound-call',
        status: finalBookingStatus === 'waitlist' ? 'contacted' : 'qualified',
        notes: leadNotes,
        agentSummary: leadNotes,
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
        notes: leadDoc.data().notes + `\n\n[Booking Sync] ${leadNotes}`,
        updatedAt: new Date(),
      });
    }

    // 3. Verify slot availability (only for scheduled, closed-booking verification)
    if (finalBookingStatus === 'scheduled') {
      const calendarSettingsDoc = await businessProfileRef.collection('settings').doc('calendar').get();
      if (calendarSettingsDoc.exists && calendarSettingsDoc.data()?.nativeCalendarEnabled) {
        const conflictSnapshot = await businessProfileRef.collection('appointments')
          .where('date', '==', date)
          .where('time', '==', time)
          .where('status', '==', 'scheduled')
          .get();

        if (!conflictSnapshot.empty) {
          return NextResponse.json({
            success: false,
            message: `The slot ${time} on ${date} is already booked. Please choose another time or request to be added to the waitlist.`
          });
        }
      }
    }

    // 4. Cal.com External Calendar Booking Creation
    const calendarSettingsDoc = await businessProfileRef.collection('settings').doc('calendar').get();
    const settings = calendarSettingsDoc.exists ? calendarSettingsDoc.data() : null;
    const nativeCalendarEnabled = settings?.nativeCalendarEnabled !== false;
    const bookingLink = profile.bookingLink || settings?.bookingUrl || '';

    let calBookingReference = '';

    if (finalBookingStatus === 'scheduled' && !nativeCalendarEnabled && bookingLink.includes('cal.com')) {
      const calComApiKey = process.env.CAL_COM_API_KEY;
      if (calComApiKey) {
        try {
          // Parseusername and event typeslug from URL
          const urlParts = bookingLink.replace('https://cal.com/', '').split('/');
          const username = urlParts[0];
          const eventSlug = urlParts[1] || '';

          // Fetch event details to get eventTypeId
          const eventResponse = await fetch(
            `https://api.cal.com/v1/event-types?apiKey=${calComApiKey}&username=${username}`,
            { headers: { 'Content-Type': 'application/json' } }
          );

          if (eventResponse.ok) {
            const eventData = await eventResponse.json();
            const matchingEvent = eventData.eventtypes?.find((ev: any) => ev.slug === eventSlug);
            const eventTypeId = matchingEvent?.id;

            if (eventTypeId) {
              // Create booking on Cal.com
              const bookResponse = await fetch(
                `https://api.cal.com/v1/bookings?apiKey=${calComApiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    eventTypeId,
                    start: `${date}T${time}:00.000Z`, // Parse matching timezone
                    end: `${date}T${time}:30:00.000Z`,
                    responses: {
                      name,
                      email: email || `${phone.replace(/\D/g, '')}@t3leads.com`,
                      phone
                    },
                    metadata: { leadId, siteId: businessProfileRef.id }
                  })
                }
              );

              if (bookResponse.ok) {
                const bookData = await bookResponse.json();
                calBookingReference = bookData.booking?.uid || '';
                console.log(`[Calendar Sync] Successfully created Cal.com booking: ${calBookingReference}`);
              }
            }
          }
        } catch (calError) {
          console.error('[Calendar Sync] Cal.com Booking Creation failed:', calError);
        }
      }
    }

    // 5. Save the appointment locally in Firestore
    const appointmentsRef = businessProfileRef.collection('appointments');
    await appointmentsRef.add({
      leadId,
      name,
      email: email || '',
      phone,
      date,
      time,
      service: service || 'General',
      status: finalBookingStatus, // 'scheduled' or 'waitlist'
      calBookingReference,
      createdAt: new Date(),
    });

    // 6. Trigger real-time lead forwarding alerts to renter
    triggerLeadAlerts(businessProfileRef.id, {
      name,
      email,
      phone,
      source: `inbound-call-${finalBookingStatus}`,
      notes: leadNotes
    }).catch(err => {
      console.error('[Alerts Error] Failed to trigger alerts for calendar booking:', err);
    });

    // 7. Return confirmation details
    const bookingRefCode = calBookingReference || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    if (finalBookingStatus === 'waitlist') {
      return NextResponse.json({
        success: true,
        bookingType: 'waitlist',
        message: `Successfully added ${name} to the priority waitlist for ${date} at ${time}.`,
        booking_reference: bookingRefCode
      });
    }

    return NextResponse.json({
      success: true,
      bookingType: 'scheduled',
      message: `Successfully booked appointment for ${name} on ${date} at ${time}.`,
      booking_reference: bookingRefCode
    });

  } catch (error) {
    console.error('Error in book-calendar tool webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
  }
}
