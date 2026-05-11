/**
 * One-time script: registers aisalesrep.live as the custom domain
 * for user 6Nw77zkDqFdKearSTGxW7YMNFIf2 in Firestore.
 * Run: npx ts-node --project tsconfig.scripts.json scripts/register-custom-domain.ts
 */
import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize with service account or application default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function registerDomain() {
  const userId = '6Nw77zkDqFdKearSTGxW7YMNFIf2';
  const domain = 'aisalesrep.live';

  const domainRef = db
    .collection('businessProfiles')
    .doc(userId)
    .collection('customDomains')
    .doc(domain);

  await domainRef.set({
    id: domain,
    businessProfileId: userId,
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ Registered ${domain} → businessProfiles/${userId}`);

  // Also write the primary customDomain field on the profile for quick lookups
  await db.collection('businessProfiles').doc(userId).update({
    customDomain: domain,
  });

  console.log(`✅ Set customDomain field on businessProfile`);
}

registerDomain().catch(console.error);
