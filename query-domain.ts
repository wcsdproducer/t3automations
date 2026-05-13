import { db } from './src/lib/firebase-admin';

async function run() {
  console.log('Querying domains without index...');
  const domainRecords = await db.collectionGroup('customDomains').get();
  
  let targetProfileId = null;
  domainRecords.forEach(doc => {
    if (doc.data().domain === 'aisalesrep.live') {
      targetProfileId = doc.ref.parent.parent?.id || null;
    }
  });

  if (!targetProfileId) {
    console.log('No domain found');
    return;
  }

  console.log('Profile ID:', targetProfileId);
  const profileRef = db.collection('businessProfiles').doc(targetProfileId);
  
  const leads = await profileRef.collection('leads').get();
  console.log(`Found ${leads.size} leads.`);
  leads.forEach(l => console.log('Lead:', l.data()));
}

run().catch(console.error);
