import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
  });
}

const db = getFirestore();

async function seedCalls() {
  const userId = '6Nw77zkDqFdKearSTGxW7YMNFIf2';
  const agentsSnap = await db.collection(`businessProfiles/${userId}/agents`).get();
  if (agentsSnap.empty) {
    console.log('No agents found. Creating one...');
    const agentRef = db.collection(`businessProfiles/${userId}/agents`).doc('solar-london');
    await agentRef.set({
      elevenLabsAgentId: 'mock-agent-123',
      twilioPhoneNumber: '+15551234567',
      name: 'Solar London',
      systemPrompt: 'You are an agent...',
      firstMessage: 'Hello!',
      voiceId: '123',
      status: 'active',
      createdAt: FieldValue.serverTimestamp()
    });
  }
  
  const agentId = 'solar-london';
  const conversationsRef = db.collection(`businessProfiles/${userId}/agents/${agentId}/conversations`);

  console.log('Seeding calls...');
  
  // Create calls over the last 7 days
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random number of calls between 1 and 5
    const numCalls = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < numCalls; j++) {
      const callTime = new Date(date);
      callTime.setHours(Math.floor(Math.random() * 8) + 9); // between 9am and 5pm
      
      const duration = Math.floor(Math.random() * 300) + 60; // 60s to 360s
      
      const docRef = conversationsRef.doc();
      await docRef.set({
        callSid: `CA${Math.random().toString(36).substring(2, 15)}`,
        agentId: agentId,
        callerNumber: '+15559876543',
        duration: duration,
        transcript: 'Customer: Hello, I want solar panels. Agent: Great!',
        summary: 'Customer wants solar panels.',
        outcome: Math.random() > 0.2 ? 'answered' : 'missed',
        leadCaptured: Math.random() > 0.5,
        leadId: null,
        startedAt: callTime.toISOString()
      });
    }
  }
  
  console.log('Done!');
}

seedCalls().catch(console.error);
