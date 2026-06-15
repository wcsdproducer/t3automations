import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

const TARGET_IDS = [
  'jjIga7v1wyWPKCrYHDw0X8m7Rrx2', // Tampa Concrete Paving
  'x6nOQEoiLgYqAXNHm6HN0i27cqf2'  // Tampa Bay Tree Care
];

async function deleteCollection(ref: admin.firestore.CollectionReference) {
  const snap = await ref.get();
  for (const doc of snap.docs) {
    // recursively delete subcollections if any
    const subcollections = await doc.ref.listCollections();
    for (const subcol of subcollections) {
      await deleteCollection(subcol);
    }
    await doc.ref.delete();
    console.log(`Deleted document ${doc.ref.path}`);
  }
}

async function deleteProfile(id: string) {
  console.log(`Checking profile ${id}...`);
  const docRef = db.collection('businessProfiles').doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    console.log(`Profile ${id} does not exist in businessProfiles.`);
    return;
  }
  
  const data = docSnap.data();
  console.log(`Profile ${id} exists: name="${data?.businessName}", service="${data?.service}", domain="${data?.customDomain}"`);
  
  // List and delete subcollections
  const subcollections = await docRef.listCollections();
  for (const col of subcollections) {
    console.log(`Deleting subcollection: ${col.path}`);
    await deleteCollection(col);
  }
  
  // Delete the document itself
  await docRef.delete();
  console.log(`Deleted businessProfiles/${id}`);
}

async function run() {
  for (const id of TARGET_IDS) {
    await deleteProfile(id);
  }
  
  // Also let's check if there are any documents under businessProfiles/{userId}/customDomains collection group or similar
  // Wait, let's query the customDomains subcollection under these business profiles specifically or via collectionGroup
  console.log('Finished deletion.');
}

run().catch(console.error);
