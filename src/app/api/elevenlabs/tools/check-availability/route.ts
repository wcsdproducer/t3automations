import { NextResponse } from 'next/server';
import { db as adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agent_id');
    const body = await req.json();

    const { date } = body; // Expected format: "YYYY-MM-DD"

    // Check Authorization
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.ELEVENLABS_WEBHOOK_SECRET;
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agent_id query parameter' }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required parameter: date. Please provide a date in YYYY-MM-DD format.' 
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

    // Fetch Native Calendar Settings
    const calendarSettingsDoc = await businessProfileRef.collection('settings').doc('calendar').get();
    
    if (!calendarSettingsDoc.exists || !calendarSettingsDoc.data()?.nativeCalendarEnabled) {
      return NextResponse.json({
        success: false,
        message: "Native scheduling is not enabled for this business."
      });
    }

    const settings = calendarSettingsDoc.data() as any;
    const workingHours = settings.workingHours || {};
    const slotDuration = settings.slotDurationMinutes || 30;

    // Determine day of the week from the requested date
    const requestedDate = new Date(date + "T00:00:00"); // Parse as local equivalent assuming UTC for day check
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[requestedDate.getDay()];
    const daySettings = workingHours[dayOfWeek];

    if (!daySettings || !daySettings.active) {
      return NextResponse.json({
        success: true,
        available_slots: [],
        message: `The business is closed on ${dayOfWeek}s.`
      });
    }

    // Generate all potential slots for the day
    const slots: string[] = [];
    const [startHour, startMinute] = daySettings.start.split(':').map(Number);
    const [endHour, endMinute] = daySettings.end.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const formattedTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(formattedTime);

      currentMinute += slotDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    // Fetch existing appointments for this specific date
    const appointmentsSnapshot = await businessProfileRef.collection('appointments')
      .where('date', '==', date)
      .where('status', '==', 'scheduled')
      .get();

    const bookedTimes = appointmentsSnapshot.docs.map(doc => doc.data().time);

    // Filter out booked slots
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

    return NextResponse.json({
      success: true,
      date: date,
      timezone: settings.timezone || "America/New_York",
      available_slots: availableSlots,
      message: availableSlots.length > 0 
        ? `Found ${availableSlots.length} available slots.` 
        : `No available slots remaining on this date.`
    });

  } catch (error) {
    console.error('Error in check-availability webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
  }
}
