import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

const DOMAIN_MAPPINGS = [
  {
    profileId: 'tampa_epoxy_flooring',
    domain: 'tampaepoxycoatings.com'
  },
  {
    profileId: 'tampa_tree_services',
    domain: 'tampabaytreecare.com'
  },
  {
    profileId: 'tampa_paving_concrete',
    domain: 'tampaconcretepaving.com'
  }
];

async function registerDomains() {
  console.log('🔗 Registering purchased custom domains for Tampa high-ticket profiles...');

  for (const mapping of DOMAIN_MAPPINGS) {
    try {
      console.log(`\n🌐 Registering ${mapping.domain} → businessProfiles/${mapping.profileId}`);

      // 1. Create subcollection customDomains doc
      const domainRef = db
        .collection('businessProfiles')
        .doc(mapping.profileId)
        .collection('customDomains')
        .doc(mapping.domain);

      await domainRef.set({
        id: mapping.domain,
        businessProfileId: mapping.profileId,
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Update the main business profile fields (customDomain and websiteUrl)
      await db.collection('businessProfiles').doc(mapping.profileId).update({
        customDomain: mapping.domain,
        websiteUrl: `https://${mapping.domain}`
      });

      console.log(`  ✅ Successfully linked and configured ${mapping.domain}!`);

    } catch (e: any) {
      console.error(`  ❌ Error registering domain for ${mapping.profileId}:`, e.message);
    }
  }

  console.log('\n🎉 Custom domain registration completed successfully!');
}

registerDomains().catch(console.error);
