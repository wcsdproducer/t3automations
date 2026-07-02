import { admin } from '../src/lib/firebase-admin';

async function testLeadWrite() {
  const businessId = 'boiseapplianceexperts_com';
  const db = admin.firestore();
  
  const leadRef = db
    .collection('businessProfiles')
    .doc(businessId)
    .collection('leads')
    .doc();

  const newLead = {
    id: leadRef.id,
    name: 'Manual Test Lead',
    email: 'manual@test.com',
    phone: '+12085550000',
    source: 'manual-test',
    status: 'new',
    notes: 'Testing manual write to verify CRM connectivity.',
    agentSummary: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  console.log('Writing test lead to Firestore...');
  await leadRef.set(newLead);
  console.log('✅ Lead written successfully with ID:', leadRef.id);
}

testLeadWrite().catch(console.error);
