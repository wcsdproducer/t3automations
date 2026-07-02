import { db } from '../src/lib/firebase-admin';

async function testPersonalization() {
  const agentId = "Y8yM8UvWk0ZfX7xS3b5n"; // Replace with a real one from your DB or mock
  const callerPhone = "+12085550123";
  
  console.log('--- Testing Personalization Webhook Logic ---');
  
  // 1. Find agent and profile
  const agentsSnapshot = await db.collectionGroup('agents')
    .where('elevenLabsAgentId', '==', agentId)
    .limit(1)
    .get();

  if (agentsSnapshot.empty) {
    console.log('Agent not found. Please ensure agentId is correct.');
    return;
  }

  const agentDoc = agentsSnapshot.docs[0];
  const businessProfileRef = agentDoc.ref.parent.parent;
  if (!businessProfileRef) return;

  const profileDoc = await businessProfileRef.get();
  const profileData = profileDoc.data();
  console.log('Business Profile Found:', profileData?.businessName);

  // 2. Lookup lead
  const leadsSnapshot = await businessProfileRef.collection('leads')
    .where('phone', '==', callerPhone)
    .limit(1)
    .get();

  if (!leadsSnapshot.empty) {
    const lead = leadsSnapshot.docs[0].data();
    console.log('Lead Found:', lead.name);
    console.log('Personalization Context:', {
      customer_name: lead.name,
      is_returning: true,
      last_interaction: lead.notes?.slice(0, 50) + '...'
    });
  } else {
    console.log('No lead found for', callerPhone);
  }
}

testPersonalization().catch(console.error);
