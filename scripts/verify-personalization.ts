import admin from 'firebase-admin';
import { config } from 'dotenv';
config();

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function verifyPersonalization() {
  const callerPhone = "+12085550100"; // One of the test leads I created
  const businessId = "boiseapplianceexperts_com";

  console.log('--- Verifying Personalization for', callerPhone, '---');

  // Lead Lookup logic from route.ts
  let customerName = "";
  let isReturning = false;
  let lastInteractionSummary = "";

  const leadsSnapshot = await db.collection(`businessProfiles/${businessId}/leads`)
    .where('phone', '==', callerPhone)
    .limit(1)
    .get();

  if (!leadsSnapshot.empty) {
    const lead = leadsSnapshot.docs[0].data();
    customerName = lead.name || "";
    isReturning = true;
    lastInteractionSummary = lead.agentSummary || lead.notes?.slice(0, 100) || "";
    
    console.log('✅ Lead Recognized:', customerName);
    console.log('✅ Returning Customer:', isReturning);
    console.log('✅ Last Interaction:', lastInteractionSummary);
  } else {
    console.log('❌ Lead not found.');
  }
}

verifyPersonalization().catch(console.error);
