import { db } from '../src/lib/firebase-admin';

async function listUsers() {
  console.log('--- Users ---');
  const usersSnap = await db.collection('users').get();
  usersSnap.forEach(doc => {
    console.log(doc.id, '=>', doc.data().email, doc.data().role);
  });

  console.log('\n--- Business Profiles ---');
  const profilesSnap = await db.collection('businessProfiles').get();
  profilesSnap.forEach(doc => {
    console.log(doc.id, '=>', doc.data().businessName, 'owner:', doc.data().ownerId, 'renter:', doc.data().currentRenterId);
  });
}

listUsers().catch(console.error);
