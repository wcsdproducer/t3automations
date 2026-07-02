const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'studio-1410114603-9e1f6', storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app' });
}
const db = admin.firestore();

async function generateLocalSeo(userId) {
  console.log(`\n── Generating Local SEO for: ${userId} ──`);
  const profileRef = db.collection('businessProfiles').doc(userId);
  const profileDoc = await profileRef.get();
  const profile = profileDoc.data();
  const targetCity = profile.targetCity || '';
  const serviceName = profile.service || 'Local Services';
  if (!targetCity) { console.log('  ❌ No targetCity'); return; }
  console.log(`  City: ${targetCity}, Service: ${serviceName}`);

  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/studio-1410114603-9e1f6/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`;

  const aiRes = await axios.post(url, {
    contents: [{ role: 'user', parts: [{ text: `You are a local SEO expert. List surrounding cities/towns and neighborhoods for: ${targetCity}. Return JSON: {"surroundingCities": ["..."], "neighborhoods": ["..."]}. 5-8 cities, 6-10 neighborhoods. Real names only.` }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024, responseMimeType: 'application/json' }
  }, { headers: { Authorization: `Bearer ${tokenRes.token}`, 'Content-Type': 'application/json' } });

  const geoData = JSON.parse(aiRes.data.candidates[0].content.parts[0].text);
  console.log(`  ✅ ${geoData.surroundingCities?.length} cities, ${geoData.neighborhoods?.length} neighborhoods`);

  const surroundingCities = (geoData.surroundingCities || []).map(name => ({ name, mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${serviceName}`)}` }));
  const neighborhoods = (geoData.neighborhoods || []).map(name => ({ name, mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${targetCity} ${serviceName}`)}` }));

  const allProfiles = await db.collection('businessProfiles').get();
  const networkLinks = [];
  for (const doc of allProfiles.docs) {
    if (doc.id !== userId) {
      const data = doc.data();
      if (data.customDomain?.trim()) {
        networkLinks.push({ anchor: `${data.service || 'Local Services'} in ${(data.targetCity || '').split(',')[0]} (${data.businessName || 'Partner'})`, url: `https://${data.customDomain.trim()}` });
      }
    }
  }
  const shuffled = networkLinks.sort(() => 0.5 - Math.random()).slice(0, 4);

  await profileRef.update({ localSeoData: { surroundingCities, neighborhoods, networkLinks: shuffled, generatedAt: new Date().toISOString() }, updatedAt: new Date().toISOString() });
  console.log(`  ✅ Saved to Firestore`);
}

async function main() {
  await generateLocalSeo('tampa_tree_services');
  await generateLocalSeo('boiseapplianceexperts_com');
}
main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
