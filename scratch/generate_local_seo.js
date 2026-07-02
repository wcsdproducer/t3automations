const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6',
    storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app',
  });
}

const db = admin.firestore();

async function generateLocalSeo(userId) {
  console.log(`\n── Generating Local SEO for: ${userId} ──`);
  
  const profileRef = db.collection('businessProfiles').doc(userId);
  const profileDoc = await profileRef.get();
  
  if (!profileDoc.exists) {
    console.log('  ❌ Profile not found');
    return;
  }
  
  const profile = profileDoc.data();
  const targetCity = profile.targetCity || '';
  const serviceName = profile.service || profile.niche || 'Local Services';
  
  if (!targetCity) {
    console.log('  ❌ No targetCity set');
    return;
  }
  
  console.log(`  City: ${targetCity}, Service: ${serviceName}`);
  
  // Use Vertex AI Gemini to generate surrounding cities and neighborhoods
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;
  
  const projectId = 'studio-1410114603-9e1f6';
  const location = 'us-central1';
  const model = 'gemini-2.5-flash';
  
  const prompt = `You are a local SEO expert specializing in geo-targeting schemas.
List the major surrounding cities/towns and distinct neighborhoods for the following location:
- Location: ${targetCity}

Provide accurate, real local names. Do not hallucinate.

Return your answer as a JSON object with exactly these two keys:
- "surroundingCities": an array of 5-8 surrounding city/town names (strings)
- "neighborhoods": an array of 6-10 major neighborhood/suburb/district names (strings)

Return ONLY the JSON object, no markdown formatting or extra text.`;

  console.log('  Calling Vertex AI Gemini...');
  
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
  
  const aiRes = await axios.post(url, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    }
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });
  
  const responseText = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let geoData;
  try {
    geoData = JSON.parse(responseText);
  } catch (e) {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      geoData = JSON.parse(jsonMatch[1]);
    } else {
      console.log('  ❌ Failed to parse AI response:', responseText.substring(0, 200));
      return;
    }
  }
  
  console.log(`  ✅ AI generated: ${geoData.surroundingCities?.length || 0} cities, ${geoData.neighborhoods?.length || 0} neighborhoods`);
  
  // Format Google Maps search URLs
  const surroundingCities = (geoData.surroundingCities || []).map(name => ({
    name,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${serviceName}`)}`,
  }));
  
  const neighborhoods = (geoData.neighborhoods || []).map(name => ({
    name,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${targetCity} ${serviceName}`)}`,
  }));
  
  // Generate cross-linking network links from other owned sites
  console.log('  Generating network interlinking...');
  const allProfilesSnap = await db.collection('businessProfiles').get();
  const networkLinks = [];
  
  for (const doc of allProfilesSnap.docs) {
    if (doc.id !== userId) {
      const data = doc.data();
      if (data.customDomain && data.customDomain.trim().length > 0) {
        const domain = data.customDomain.trim();
        const businessName = data.businessName || 'Partner Business';
        const niche = data.service || data.niche || 'Local Services';
        const city = data.targetCity || 'Tampa, FL';
        
        networkLinks.push({
          anchor: `${niche} in ${city.split(',')[0]} (${businessName})`,
          url: `https://${domain}`,
        });
      }
    }
  }
  
  // Limit to 4 random partner websites
  const shuffledNetwork = networkLinks.sort(() => 0.5 - Math.random()).slice(0, 4);
  
  const localSeoData = {
    surroundingCities,
    neighborhoods,
    networkLinks: shuffledNetwork,
    generatedAt: new Date().toISOString(),
  };
  
  console.log(`  Network links: ${shuffledNetwork.length}`);
  
  // Update Firestore
  await profileRef.update({
    localSeoData,
    updatedAt: new Date().toISOString(),
  });
  
  console.log(`  ✅ Local SEO data saved to Firestore`);
}

async function main() {
  console.log('========================================');
  console.log('  GENERATING LOCAL SEO FOR ALL SITES');
  console.log('========================================');
  
  const sites = [
    'tampa_epoxy_flooring',
    'tampa_paving_concrete',
    'knoxvillepestexperts_com',
    'richmond_junk_pros',
  ];
  
  for (const site of sites) {
    await generateLocalSeo(site);
  }
  
  console.log('\n========================================');
  console.log('  DONE');
  console.log('========================================');
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
