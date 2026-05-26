const { db } = require('../src/lib/firebase-admin');

async function test() {
  try {
    console.log('Querying businessProfiles...');
    const snapshot = await db.collection('businessProfiles').get();
    console.log('Found profiles count:', snapshot.size);
    snapshot.forEach(doc => {
      console.log(`ID: ${doc.id}`);
      console.log(`Data:`, JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
