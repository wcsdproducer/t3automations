const { db } = require('./src/lib/firebase-admin');

async function insertTestAgent() {
  const businessId = 'test_business_' + Date.now();
  const agentId = 'agent_3901krgpa3e5eaxs3ncvbhqxjq38';
  
  await db.collection('businessProfiles').doc(businessId).set({
    businessName: 'T3 Test Business',
    contactEmail: 'test@t3automations.com',
    createdAt: new Date()
  });

  await db.collection('businessProfiles').doc(businessId).collection('agents').doc(agentId).set({
    elevenLabsAgentId: agentId,
    name: 'Test Voice Agent',
    status: 'active',
    createdAt: new Date()
  });

  console.log(`Successfully created test agent ${agentId} under business ${businessId}`);
}

insertTestAgent().catch(console.error);
