import * as admin from 'firebase-admin';

async function cleanup() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'studio-1410114603-9e1f6'
    });
  }

  const db = admin.firestore();
  
  console.log('Cleaning up test data for boiseapplianceexperts_com...');

  // Delete leads
  const leads = await db.collection('businessProfiles').doc('boiseapplianceexperts_com').collection('leads').get();
  for (const doc of leads.docs) {
    await doc.ref.delete();
  }
  console.log(`Deleted ${leads.size} leads.`);

  // Delete conversations
  const convs = await db.collection('businessProfiles').doc('boiseapplianceexperts_com').collection('agents').doc('default').collection('conversations').get();
  for (const doc of convs.docs) {
    await doc.ref.delete();
  }
  console.log(`Deleted ${convs.size} conversations.`);

  // Reset agent ID
  await db.collection('businessProfiles').doc('boiseapplianceexperts_com').collection('agents').doc('default').update({
    elevenLabsAgentId: ''
  });
  console.log('Reset elevenLabsAgentId to empty.');

  console.log('Cleanup complete.');
}

cleanup().catch(console.error);
