require('dotenv').config();
const axios = require('axios');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}
const db = admin.firestore();

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!APIFY_TOKEN || !GEMINI_API_KEY) {
  console.error("Missing APIFY_TOKEN or GEMINI_API_KEY in environment variables.");
  process.exit(1);
}

// 9 Image definitions for our 3 Tampa local service profiles
const IMAGES_TO_GENERATE = [
  {
    profileId: 'tampa_epoxy_flooring',
    type: 'hero',
    prompt: "A professional photorealistic 4K photo of a luxury residential garage floor finished with premium glossy grey and black decorative flake epoxy coating. A clean modern garage interior with warm lighting, no cars, reflection of the overhead lights on the seamless floor, high-end details.",
  },
  {
    profileId: 'tampa_epoxy_flooring',
    type: 'about',
    prompt: "A professional 4K photo of a local flooring contractor wearing safety gear, applying a clear glossy protective polyaspartic coating over a decorative flake garage floor using a roller. Clear daylight, focus on the clean floor and texture.",
  },
  {
    profileId: 'tampa_epoxy_flooring',
    type: 'gallery',
    prompt: "A stunning photorealistic 4K photo of a luxury home interior with a seamless metallic epoxy floor that looks like flowing blue and white liquid marble, high-end modern furniture, reflective glossy surface.",
  },
  {
    profileId: 'tampa_paving_concrete',
    type: 'hero',
    prompt: "A professional photorealistic 4K photo of a high-end residential driveway paved with premium concrete pavers in a herringbone pattern. Sunny day in Tampa, Florida, palm trees in the background, a luxury house facade, clean and perfect landscaping.",
  },
  {
    profileId: 'tampa_paving_concrete',
    type: 'about',
    prompt: "A professional 4K photo of local construction workers laying brick pavers carefully on a compacted sand base for a patio. Focus on hands, pavers, and tools, bright sunny day, professional work.",
  },
  {
    profileId: 'tampa_paving_concrete',
    type: 'gallery',
    prompt: "A stunning photorealistic 4K photo of a luxury backyard concrete pool deck paved with natural travertine pavers, sparkling swimming pool with clear turquoise water, palm trees, sunny Florida vibe.",
  },
  {
    profileId: 'tampa_tree_services',
    type: 'hero',
    prompt: "A professional photorealistic 4K photo of an arborist climbing a mature grand oak tree using ropes and safety harness to prune high branches. Sunny day in a residential neighborhood in Tampa, Florida, tree care industry safety gear, leaves filtering sunlight.",
  },
  {
    profileId: 'tampa_tree_services',
    type: 'about',
    prompt: "A professional 4K photo of a friendly local tree care crew wearing helmets and high-visibility vests standing in front of a modern wood chipper truck in a clean residential yard. Bright day, professional service crew.",
  },
  {
    profileId: 'tampa_tree_services',
    type: 'gallery',
    prompt: "A professional photorealistic 4K photo of a clean yard after stump grinding, where a tree stump was completely shredded into neat wood mulch chips, background showing a healthy green lawn.",
  }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateImage(imageDef) {
  const actorId = "alizarin_refrigerator-owner~nanobanana-pro";
  console.log(`\nGenerating [${imageDef.type}] image for [${imageDef.profileId}]...`);
  console.log(`Prompt: "${imageDef.prompt}"`);

  const input = {
    googleApiKey: GEMINI_API_KEY,
    prompt: imageDef.prompt,
    numberOfImages: 1,
    resolution: "1024x1024",
    style: "photorealistic",
    demoMode: false
  };

  try {
    // 1. Start the Actor Run
    const runRes = await axios.post(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
      input,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const runId = runRes.data.data.id;
    const datasetId = runRes.data.data.defaultDatasetId;
    console.log(`Actor started. Run ID: ${runId}, Dataset ID: ${datasetId}`);

    // 2. Poll for Completion
    let status = "RUNNING";
    while (status === "RUNNING" || status === "READY") {
      await sleep(10000); // Wait 10s
      const statusRes = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
      );
      status = statusRes.data.data.status;
      console.log(`Status: ${status}`);
    }

    if (status !== "SUCCEEDED") {
      throw new Error(`Apify Actor Run failed with status: ${status}`);
    }

    // 3. Get Dataset Items
    const itemsRes = await axios.get(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
    );

    const items = itemsRes.data;
    console.log('Dataset items:', JSON.stringify(items, null, 2));

    if (items && items.length > 0 && items[0].url) {
      return items[0].url;
    } else if (items && items.length > 0 && items[0].imageUrl) {
      return items[0].imageUrl;
    } else if (items && items.length > 0 && items[0].imageUrls && items[0].imageUrls[0]) {
      return items[0].imageUrls[0];
    } else {
      console.error("No image URL found in dataset items:", items);
      return null;
    }
  } catch (error) {
    console.error(`Error generating image:`, error.message || error);
    if (error.response) {
      console.error(`Details:`, JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function main() {
  const results = {};

  for (const imageDef of IMAGES_TO_GENERATE) {
    const url = await generateImage(imageDef);
    if (url) {
      console.log(`SUCCESS! Generated Image URL: ${url}`);
      if (!results[imageDef.profileId]) {
        results[imageDef.profileId] = {};
      }
      results[imageDef.profileId][imageDef.type] = url;
    } else {
      console.log(`FAILED to generate image for ${imageDef.profileId} - ${imageDef.type}`);
    }
    await sleep(2000); // Brief cooldown
  }

  console.log("\nAll generation runs completed. Summary of generated URLs:");
  console.log(JSON.stringify(results, null, 2));

  // Update Firestore configs with the new high-quality image URLs
  for (const profileId of Object.keys(results)) {
    const urls = results[profileId];
    console.log(`\nUpdating Firestore document for [${profileId}]...`);
    const docRef = db.collection('businessProfiles').doc(profileId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      const currentConfig = data.websiteConfig || {};
      
      const newImages = {
        hero: urls.hero ? [{
          id: `${profileId}-hero-new`,
          description: currentConfig.hero?.title || `${profileId} Hero`,
          imageUrl: urls.hero,
          imageHint: currentConfig.serviceCategory || "service hero"
        }] : currentConfig.images?.hero,
        about: urls.about ? {
          id: `${profileId}-about-new`,
          description: currentConfig.about?.title || `${profileId} About`,
          imageUrl: urls.about,
          imageHint: currentConfig.serviceCategory || "service about"
        } : currentConfig.images?.about,
        gallery: urls.gallery ? [{
          id: `${profileId}-gallery-new`,
          description: `${profileId} Gallery`,
          imageUrl: urls.gallery,
          imageHint: currentConfig.serviceCategory || "service gallery"
        }] : currentConfig.images?.gallery
      };

      await docRef.update({
        'websiteConfig.images': newImages
      });
      console.log(`Firestore updated successfully for [${profileId}].`);
    }
  }
}

main().catch(console.error);
