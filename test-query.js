const { admin, db } = require('./src/lib/firebase-admin');

async function test() {
  try {
    console.log('Querying agents...');
    const snapshot = await db.collectionGroup('agents').where('elevenLabsAgentId', '==', 'agent_3901krgpa3e5eaxs3ncvbhqxjq38').get();
    console.log('Found:', snapshot.size);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
