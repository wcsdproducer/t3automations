import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

const PLACEHOLDER_SITE_IDS = [
  'DKo8vmHdIPVSc3skZkMWL2S5IB83', // Dallas Junk Removal
  'tampa_water_damage'            // Tampa Water Damage Restoration
];

async function deleteCollection(collectionRef: admin.firestore.CollectionReference) {
  const snapshot = await collectionRef.get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function deleteSiteRecursively(siteId: string) {
  console.log(`\n🧹 Deleting site ${siteId} recursively...`);
  
  const siteRef = db.collection('businessProfiles').doc(siteId);

  // Subcollections to delete
  const subcollections = [
    'customDomains',
    'agents',
    'leads',
    'appointments',
    'blogs',
    'settings'
  ];

  for (const sub of subcollections) {
    try {
      const colRef = siteRef.collection(sub);
      const snapshot = await colRef.get();
      if (!snapshot.empty) {
        console.log(`  Deleting subcollection "${sub}" (${snapshot.size} docs)...`);
        await deleteCollection(colRef);
      }
    } catch (e: any) {
      console.error(`  Error deleting subcollection ${sub}:`, e.message);
    }
  }

  // Delete the parent document
  await siteRef.delete();
  console.log(`  ✅ Parent doc businessProfiles/${siteId} deleted!`);
}

async function run() {
  for (const siteId of PLACEHOLDER_SITE_IDS) {
    await deleteSiteRecursively(siteId);
  }
  console.log('\n🎉 Placeholder sites removal completed!');
}

run().catch(console.error);
