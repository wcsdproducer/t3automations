const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6', 
  });
}

const db = admin.firestore();

async function checkAgent() {
  const agentId = 'agent_3901krgpa3e5eaxs3ncvbhqxjq38';
  console.log(`Searching for agent: ${agentId}`);

  try {
    const agentsSnapshot = await db
      .collectionGroup('agents')
      .where('elevenLabsAgentId', '==', agentId)
      .get();

    if (agentsSnapshot.empty) {
      console.log('Agent NOT found in Firestore.');
      return;
    }

    agentsSnapshot.forEach((doc) => {
      console.log(`Found agent document at: ${doc.ref.path}`);
      console.log('Data:', doc.data());
    });
  } catch (error) {
    console.error('Error finding agent:', error);
  }
}

checkAgent().then(() => process.exit(0)).catch(() => process.exit(1));
