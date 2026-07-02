import admin from 'firebase-admin';
import { config } from 'dotenv';
config();

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function createTestData() {
  const businessId = 'boiseapplianceexperts_com';
  console.log(`Creating test data for ${businessId}...`);

  const leadsRef = db.collection(`businessProfiles/${businessId}/leads`);
  const conversationsRef = db.collection(`businessProfiles/${businessId}/agents/default/conversations`);

  // Create 5 leads
  const names = ['John Smith', 'Sarah Miller', 'Mike Jones', 'Alice Cooper', 'Bob Brown'];
  for (let i = 0; i < 5; i++) {
    await leadsRef.add({
      name: names[i],
      phone: `+1208555010${i}`,
      email: `${names[i].toLowerCase().replace(' ', '.')}@example.com`,
      source: i % 2 === 0 ? 'landing-page' : 'inbound-call',
      status: 'new',
      notes: 'Test lead created for dashboard verification.',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - i * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date())
    });
  }

  // Create 10 calls
  for (let i = 0; i < 10; i++) {
    await conversationsRef.add({
      callSid: `test_call_${Date.now()}_${i}`,
      agentId: 'default',
      callerNumber: `+1208555010${i % 5}`,
      duration: 60 + Math.random() * 300,
      transcript: 'Test transcript for call ' + i,
      summary: 'Test summary for call ' + i,
      outcome: i % 3 === 0 ? 'missed' : 'answered',
      leadCaptured: i % 2 === 0,
      startedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - i * 12 * 60 * 60 * 1000))
    });
  }

  console.log('✅ Test data created successfully!');
}

createTestData().catch(console.error);
