const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

async function check() {
  try {
    const user = await auth.getUserByEmail('john@t3kniq.com');
    console.log('UID:', user.uid);
    const agentsRef = db.collection(`businessProfiles/${user.uid}/agents`);
    const snapshot = await agentsRef.get();
    if (snapshot.empty) {
      console.log('No agents found.');
      return;
    }
    snapshot.forEach(doc => {
      console.log('Agent Data:', doc.id, '=>', doc.data());
    });
  } catch (err) {
    console.error(err);
  }
}
check();
