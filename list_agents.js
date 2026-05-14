const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./t3kniq-firebase-adminsdk.json'); // Let's check if there is a service account

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function main() {
    const agentsRef = db.collection('businessProfiles').doc('6Nw77zkDqFdKearSTGxW7YMNFIf2').collection('agents');
    const snapshot = await agentsRef.get();
    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });
}
main().catch(console.error);
