const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6',
    storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app',
  });
}

const db = admin.firestore();

async function setAll3xDaily() {
  const liveSites = [
    'tampa_tree_services',
    'boiseapplianceexperts_com',
    'tampa_epoxy_flooring',
    'tampa_paving_concrete',
    'knoxvillepestexperts_com',
    'richmond_junk_pros',
  ];

  for (const profileId of liveSites) {
    const profileDoc = await db.doc(`businessProfiles/${profileId}`).get();
    const profile = profileDoc.data();
    const current = profile?.blogPostingSchedule;
    
    if (current === '3x-daily') {
      console.log(`✅ ${profile?.businessName} — already 3x-daily`);
    } else {
      await db.doc(`businessProfiles/${profileId}`).update({
        blogPostingSchedule: '3x-daily',
        blogCronEnabled: true,
      });
      console.log(`🔄 ${profile?.businessName} — changed from "${current || 'unset'}" → 3x-daily`);
    }
  }
}

setAll3xDaily().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
