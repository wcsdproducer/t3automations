const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Use default credential (since we're running locally with GCLOUD CLI configured or FIREBASE_CONFIG)
try {
  initializeApp();
} catch (e) {
  // If no default config, try without arguments which works in firebase environment
  console.log("App already initialized or using default context");
}

async function updatePhoneNumber() {
  const db = getFirestore(); // or default
  try {
    const agentsRef = db.collection('businessProfiles').doc('6Nw77zkDqFdKearSTGxW7YMNFIf2').collection('agents');
    const agentsSnapshot = await agentsRef.get();
    
    if (agentsSnapshot.empty) {
      console.log('No agents found for this user.');
      // Create a dummy one
      await agentsRef.doc('agent_123').set({
        telnyxPhoneNumber: '+18135381216',
        name: 'T3 AI Agent',
        status: 'active'
      });
      console.log('Created new agent with phone number.');
      return;
    }
    
    for (const doc of agentsSnapshot.docs) {
      console.log(`Updating agent ${doc.id}`);
      await agentsRef.doc(doc.id).update({
        telnyxPhoneNumber: '+18135381216'
      });
    }
    console.log('Phone number updated successfully.');
  } catch (error) {
    console.error('Error updating phone number:', error);
  }
}

updatePhoneNumber();
