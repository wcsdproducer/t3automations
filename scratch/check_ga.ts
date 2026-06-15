import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

const db = admin.firestore();

async function run() {
  const snap = await db.collection('businessProfiles').get();
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.businessName || data.businessName.includes('Platform') || data.businessName.includes('Test')) continue;
    console.log(`Profile ID: ${doc.id}`);
    console.log(`  Name: ${data.businessName}`);
    console.log(`  GA Measurement ID: ${data.googleAnalyticsMeasurementId}`);
    console.log(`  GA Property ID: ${data.googleAnalyticsPropertyId}`);
    console.log(`  GA Status: ${data.googleAnalyticsStatus}`);
    console.log(`  Is Mock: ${data.isMockAnalytics}`);
    console.log('-----------------------------------');
  }
}

run().catch(console.error);
