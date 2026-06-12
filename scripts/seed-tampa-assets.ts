import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

const LANDLORD_UID = '6Nw77zkDqFdKearSTGxW7YMNFIf2'; // john@t3kniq.com

const TAMPA_ASSETS = [
  {
    id: 'tampa_epoxy_flooring',
    businessName: 'Tampa Epoxy Flooring Pros',
    service: 'Epoxy Flooring',
    monthlyRentPrice: 750,
    colorPalette: 'deep-midnight',
    fontPair: 'modern-corporate',
    tagline: 'Stunning Epoxy Floors. Built to Last.'
  },
  {
    id: 'tampa_tree_services',
    businessName: 'Tampa Tree Care Specialists',
    service: 'Tree Services',
    monthlyRentPrice: 850,
    colorPalette: 'earthy-green',
    fontPair: 'friendly-local',
    tagline: 'Professional Tree Services in Tampa Bay'
  },
  {
    id: 'tampa_paving_concrete',
    businessName: 'Tampa Concrete & Paving',
    service: 'Paving & Concrete',
    monthlyRentPrice: 900,
    colorPalette: 'professional-blue',
    fontPair: 'modern-corporate',
    tagline: 'Premium Concrete & Paving Solutions'
  },
  {
    id: 'tampa_water_damage',
    businessName: 'Tampa Water Damage Restoration',
    service: 'Water Damage Restoration',
    monthlyRentPrice: 1200, // Water damage is extremely high ticket!
    colorPalette: 'deep-midnight',
    fontPair: 'tech-forward',
    tagline: '24/7 Emergency Water Damage Restoration'
  }
];

async function seed() {
  console.log('🌱 Seeding high-ticket Tampa Bay Rank & Rent assets in Firestore...');

  for (const asset of TAMPA_ASSETS) {
    try {
      console.log(`\n🏢 Provisioning profile: ${asset.businessName} (${asset.id})`);

      const profileRef = db.collection('businessProfiles').doc(asset.id);
      
      const profileData = {
        id: asset.id,
        businessName: asset.businessName,
        contactEmail: `tampa-${asset.id.split('_').slice(1).join('-')}@t3kniq-partners.com`,
        service: asset.service,
        phoneNumber: '', // Available to route a new Twilio number
        defaultLandingPage: 'template-3', // Direct Response
        ownerId: LANDLORD_UID,
        currentRenterId: null, // Available for rent!
        isPubliclyListed: true,
        monthlyRentPrice: asset.monthlyRentPrice,
        niche: asset.service,
        leadForwardingEnabled: false,
        colorPalette: asset.colorPalette,
        fontPair: asset.fontPair,
        websiteConfig: null, // Will fall back to our high-quality custom static copy
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await profileRef.set(profileData, { merge: true });
      console.log(`  ✅ Written businessProfiles/${asset.id}`);

      // Seed default assistant skeleton
      const agentRef = db.collection(`businessProfiles/${asset.id}/agents`).doc('default');
      const agentData = {
        id: 'default',
        businessProfileId: asset.id,
        elevenLabsAgentId: '', // To be filled when voice agent is deployed
        name: `${asset.businessName} AI Assistant`,
        systemPrompt: `You are a helpful, professional scheduling voice agent for ${asset.businessName}. Your goal is to gather caller name, phone number, location, and interest, and book them for a service consultation.`,
        firstMessage: `Hello, thanks for calling ${asset.businessName}! How can I help you today?`,
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
        status: 'active',
        createdAt: new Date().toISOString()
      };

      await agentRef.set(agentData, { merge: true });
      console.log(`  ✅ Written businessProfiles/${asset.id}/agents/default`);

    } catch (e: any) {
      console.error(`  ❌ Error seeding ${asset.id}:`, e.message);
    }
  }

  console.log('\n🎉 Finished seeding high-ticket Tampa Bay assets!');
}

seed().catch(console.error);
