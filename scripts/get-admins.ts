import { db } from '../src/lib/firebase-admin';

async function checkAdmins() {
  const ids = [
    '6Nw77zkDqFdKearSTGxW7YMNFIf2', // Platform Administrator
    'hkQbBIcZ6BODamj1qi4mRtCNQNp1', // T3 Automations
    'hrFjbsiMW4ex2RpVaHYhkOmgmp72', // Test Landlord Admin
  ];

  for (const id of ids) {
    const userDoc = await db.collection('users').doc(id).get();
    const profileDoc = await db.collection('businessProfiles').doc(id).get();
    console.log(`\nID: ${id}`);
    console.log('User:', userDoc.exists ? userDoc.data() : 'NOT FOUND');
    console.log('Profile:', profileDoc.exists ? profileDoc.data() : 'NOT FOUND');
  }
}

checkAdmins().catch(console.error);
