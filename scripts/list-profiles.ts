import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function test() {
  try {
    console.log('Querying businessProfiles for studio-1410114603-9e1f6...');
    const snapshot = await db.collection('businessProfiles').get();
    console.log('Found profiles count:', snapshot.size);
    snapshot.forEach(doc => {
      console.log(`ID: ${doc.id}`);
      console.log(`Business Name: ${doc.data().businessName}`);
      console.log(`Owner ID: ${doc.data().ownerId}`);
      console.log(`Renter ID: ${doc.data().currentRenterId}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
