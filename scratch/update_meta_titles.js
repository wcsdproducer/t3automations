const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6',
    storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app',
  });
}

const db = admin.firestore();

const updates = [
  {
    id: 'tampa_tree_services',
    metaTitle: 'Tampa Tree Care Specialists | Expert Tree Trimming & Removal',
    metaDescription: 'Professional tree trimming, removal, stump grinding & emergency storm services in Tampa, FL. Licensed arborists with same-day service. Call for a free estimate!',
  },
  {
    id: 'boiseapplianceexperts_com',
    metaTitle: 'Boise Appliance Experts | Same-Day Appliance Repair Service',
    metaDescription: 'Fast, reliable appliance repair in Boise, ID. Refrigerator, washer, dryer, oven & dishwasher repair by licensed technicians. 90-day warranty. Call now!',
  },
  {
    id: 'tampa_epoxy_flooring',
    metaTitle: 'Tampa Epoxy Flooring Pros | Garage & Commercial Epoxy Coatings',
    metaDescription: 'Premium epoxy flooring installation in Tampa, FL. Garage floors, commercial coatings & decorative finishes. 10-year anti-peel warranty. Free estimates!',
  },
  {
    id: 'tampa_paving_concrete',
    metaTitle: 'Tampa Concrete & Paving | Driveways, Patios & Foundations',
    metaDescription: 'Expert concrete and paving services in Tampa, FL. Driveways, patios, sidewalks, foundations & decorative concrete. Licensed & bonded. Free quotes!',
  },
  {
    id: 'knoxvillepestexperts_com',
    metaTitle: 'Knoxville Pest Experts | Safe & Effective Pest Control',
    metaDescription: 'Child & pet-safe pest control in Knoxville, TN. Termite, roach, ant, mosquito & rodent extermination. Same-day service available. Call for a free inspection!',
  },
  {
    id: 'richmond_junk_pros',
    metaTitle: 'Richmond Junk Pros | Fast & Affordable Junk Removal',
    metaDescription: 'Professional junk removal in Richmond, VA. Furniture, appliance, yard debris & construction cleanup. Same-day & next-day pickup available. Free estimates!',
  },
];

async function updateMeta() {
  for (const u of updates) {
    const ref = db.doc(`businessProfiles/${u.id}`);
    const doc = await ref.get();
    const current = doc.data();
    
    const currentTitle = current?.metaTitle || '';
    const currentDesc = current?.metaDescription || '';
    
    if (currentTitle === u.metaTitle && currentDesc === u.metaDescription) {
      console.log(`✅ ${u.id} — already set correctly`);
    } else {
      await ref.update({
        metaTitle: u.metaTitle,
        metaDescription: u.metaDescription,
      });
      console.log(`🔄 ${u.id}`);
      console.log(`   Title: "${currentTitle}" → "${u.metaTitle}"`);
      console.log(`   Desc:  "${currentDesc.substring(0, 40)}..." → "${u.metaDescription.substring(0, 40)}..."`);
    }
  }
  console.log('\n✅ All meta titles and descriptions updated.');
}

updateMeta().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
