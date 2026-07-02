import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config();

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

interface Area {
  name: string;
}

interface NetworkLink {
  anchor: string;
  url: string;
}

const NETWORK_LINKS: NetworkLink[] = [
  { anchor: 'Appliance Repair in Boise (Boise Appliance Experts)', url: 'https://boiseapplianceexperts.com' },
  { anchor: 'Pest Control in Knoxville (Knoxville Pest Experts)', url: 'https://knoxvillepestexperts.com' },
  { anchor: 'Junk Removal in Richmond (Richmond Junk Pros)', url: 'https://richmondjunkpros.com' },
  { anchor: 'Epoxy Flooring in Tampa (Tampa Epoxy Flooring Pros)', url: 'https://tampaepoxycoatings.com' },
  { anchor: 'Paving & Concrete in Tampa (Tampa Concrete & Paving)', url: 'https://tampaconcretepaving.com' },
  { anchor: 'Tree Services in Tampa (Tampa Tree Care Specialists)', url: 'https://tampabaytreecare.com' },
  { anchor: 'AI Sales & Automation (T3 Automations)', url: 'https://aisalesrep.live' }
];

const GEO_DATA: Record<string, { city: string, state: string, neighborhoods: string[], surroundingCities: string[] }> = {
  boise: {
    city: 'Boise',
    state: 'ID',
    neighborhoods: [
      'North End', 'Boise Bench', 'Southeast Boise', 'Northeast Boise', 'Northwest Boise',
      'Boise Heights', 'West Boise', 'East End', 'Collister', 'Harris Ranch',
      'Warm Springs Mesa', 'Hidden Springs', 'South Boise Village', 'Central Rim',
      'West Hills', 'Sunset', 'Veterans Park', 'Winstead Park', 'Liberty Park', 'Morris Hill'
    ],
    surroundingCities: [
      'Meridian', 'Eagle', 'Garden City', 'Star', 'Nampa', 'Kuna', 'Caldwell',
      'Middleton', 'Emmett', 'Hidden Springs', 'Mountain Home', 'Ontario', 'Payette'
    ]
  },
  knoxville: {
    city: 'Knoxville',
    state: 'TN',
    neighborhoods: [
      'Downtown', 'West Knoxville', 'Bearden', 'Sequoyah Hills', 'Fountain City',
      'South Knoxville', 'North Knoxville', 'Rocky Hill', 'Cedar Bluff', 'Parkridge',
      'Fourth and Gill', 'Old City', 'Oakwood', 'Lincoln Park', 'Holston Hills',
      'Whittle Springs', 'Lonsdale', 'Mechanicsville', 'Burlington', 'Vestal'
    ],
    surroundingCities: [
      'Farragut', 'Oak Ridge', 'Maryville', 'Powell', 'Hardin Valley', 'Lenoir City',
      'Alcoa', 'Clinton', 'Seymour', 'Louisville', 'Sevierville', 'Pigeon Forge', 'Gatlinburg'
    ]
  },
  richmond: {
    city: 'Richmond',
    state: 'VA',
    neighborhoods: [
      'The Fan', 'Carytown', 'Scott\'s Addition', 'Church Hill', 'Museum District',
      'Manchester', 'Ginter Park', 'Bellevue', 'Stratford Hills', 'Westover Hills',
      'Jackson Ward', 'Monroe Ward', 'Oregon Hill', 'Byrd Park', 'Carillon',
      'Stony Point', 'Woodland Heights', 'Forest Hill', 'Northside', 'West End'
    ],
    surroundingCities: [
      'Short Pump', 'Midlothian', 'Glen Allen', 'Ashland', 'Mechanicsville',
      'Bon Air', 'Tuckahoe', 'Sandston', 'Chesterfield', 'Henrico', 'Hopewell',
      'Petersburg', 'Colonial Heights'
    ]
  },
  tampa: {
    city: 'Tampa',
    state: 'FL',
    neighborhoods: [
      'Hyde Park', 'Ybor City', 'Seminole Heights', 'Westshore', 'Channelside',
      'New Tampa', 'Tampa Palms', 'Hunter\'s Green', 'South Tampa', 'Downtown Tampa',
      'Carrollwood', 'Westchase', 'Davis Islands', 'Palma Ceia', 'Ballast Point',
      'Sulphur Springs', 'Tampa Heights', 'Riverside Heights', 'Old Seminole Heights',
      'Forest Hills', 'North Tampa', 'University Square', 'Temple Terrace', 'Busch Gardens Area'
    ],
    surroundingCities: [
      'Wesley Chapel', 'Dunedin', 'Clearwater', 'Plant City', 'St. Petersburg',
      'Brandon', 'Riverview', 'Lutz', 'Apollo Beach', 'Gibsonton', 'Zephyrhills',
      'Land O\' Lakes', 'Oldsmar', 'Safety Harbor', 'Palm Harbor', 'Tarpon Springs'
    ]
  }
};

const TARGET_PROFILES: Record<string, { geo: string, niche: string }> = {
  boiseapplianceexperts_com: { geo: 'boise', niche: 'Appliance Repair' },
  knoxvillepestexperts_com: { geo: 'knoxville', niche: 'Pest Control' },
  richmond_junk_pros: { geo: 'richmond', niche: 'Junk Removal' },
  tampa_epoxy_flooring: { geo: 'tampa', niche: 'Epoxy Flooring' },
  tampa_paving_concrete: { geo: 'tampa', niche: 'Paving & Concrete' },
  tampa_tree_services: { geo: 'tampa', niche: 'Tree Services' }
};

async function expandGeoSilos() {
  console.log('🚀 Starting Geo-Silo Expansion for 6 target domains...');

  for (const [profileId, info] of Object.entries(TARGET_PROFILES)) {
    console.log(`\nProcessing ${profileId}...`);
    const geo = GEO_DATA[info.geo];
    const niche = info.niche;

    const neighborhoods = geo.neighborhoods.map(name => ({
      name,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${geo.city}, ${geo.state} ${niche}`)}`
    }));

    const surroundingCities = geo.surroundingCities.map(name => ({
      name,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${geo.state} ${niche}`)}`
    }));

    const networkLinks = NETWORK_LINKS.filter(link => !link.url.includes(profileId.replace('_', '.')));

    const localSeoData = {
      generatedAt: new Date().toISOString(),
      neighborhoods,
      surroundingCities,
      networkLinks
    };

    try {
      await db.collection('businessProfiles').doc(profileId).update({
        localSeoData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`  ✅ Successfully expanded Geo-Silo for ${profileId}!`);
      console.log(`     - Neighborhoods: ${neighborhoods.length}`);
      console.log(`     - Surrounding Cities: ${surroundingCities.length}`);
      console.log(`     - Network Links: ${networkLinks.length}`);
    } catch (e: any) {
      console.error(`  ❌ Error updating ${profileId}:`, e.message);
    }
  }

  console.log('\n🎉 Geo-Silo Expansion completed!');
}

expandGeoSilos().catch(console.error);
