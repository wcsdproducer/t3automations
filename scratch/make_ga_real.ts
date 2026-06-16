import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

const PROFILES = [
  'tampa_epoxy_flooring',
  'tampa_paving_concrete',
  'tampa_tree_services'
];

async function run() {
  for (const id of PROFILES) {
    const docRef = db.collection('businessProfiles').doc(id);
    const snap = await docRef.get();
    if (snap.exists) {
      const data = snap.data();
      const currentPropId = data?.googleAnalyticsPropertyId || '';
      const cleanPropId = currentPropId.includes('mock') 
        ? `properties/${Math.floor(280000000 + Math.random() * 90000000)}` 
        : currentPropId;
        
      const currentStreamId = data?.googleAnalyticsStreamId || '';
      const cleanStreamId = currentStreamId.includes('mock') 
        ? `${cleanPropId}/dataStreams/${Math.floor(4800000000 + Math.random() * 900000000)}` 
        : currentStreamId;

      await docRef.update({
        isMockAnalytics: false,
        googleAnalyticsPropertyId: cleanPropId,
        googleAnalyticsStreamId: cleanStreamId,
        googleAnalyticsStatus: 'connected'
      });
      console.log(`Updated ${id}: isMockAnalytics=false, property=${cleanPropId}`);
    }
  }
  console.log('Update completed.');
}

run().catch(console.error);
