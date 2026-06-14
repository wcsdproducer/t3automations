const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'studio-1410114603-9e1f6'
});
const db = admin.firestore();

async function main() {
  const profileId = '8LqCDzbJF5eGl2nHJl1lIDMdXm93';
  const legacyDocId = 'DSNHSnxjGtyUbId8mKzK';
  const targetDocId = 'cleansweepcleaningcompany.com';

  const legacyRef = db.doc(`businessProfiles/${profileId}/customDomains/${legacyDocId}`);
  const targetRef = db.doc(`businessProfiles/${profileId}/customDomains/${targetDocId}`);

  const snap = await legacyRef.get();
  if (!snap.exists) {
    console.log("Legacy document not found! Might be already migrated.");
    return;
  }

  const data = snap.data();
  console.log("Legacy data:", data);

  const newData = {
    ...data,
    id: targetDocId,
    domain: targetDocId,
    domainName: targetDocId, // keep domainName just in case
    updatedAt: new Date().toISOString()
  };

  console.log("Migrating to target document ID:", targetDocId);
  await targetRef.set(newData);
  console.log("New document set successfully!");

  console.log("Deleting legacy document ID:", legacyDocId);
  await legacyRef.delete();
  console.log("Legacy document deleted successfully!");
}

main().catch(console.error);
