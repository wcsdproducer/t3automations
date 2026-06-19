require('dotenv').config();
const axios = require('axios');

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!APIFY_TOKEN || !GEMINI_API_KEY) {
  console.error("Missing keys.");
  process.exit(1);
}

async function testFlash() {
  const actorId = "alizarin_refrigerator-owner~nanobanana-flash";
  const input = {
    googleApiKey: GEMINI_API_KEY,
    prompt: "A professional photorealistic 4K photo of a luxury residential garage floor finished with premium glossy grey and black decorative flake epoxy coating. A clean modern garage interior with warm lighting, no cars, reflection of the overhead lights on the seamless floor, high-end details.",
    numberOfImages: 1,
    aspectRatio: "1:1",
    demoMode: false
  };

  console.log("Calling nanobanana-flash WITH googleApiKey...");
  try {
    const runRes = await axios.post(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
      input,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const runId = runRes.data.data.id;
    const datasetId = runRes.data.data.defaultDatasetId;
    console.log(`Run started: ${runId}, Dataset: ${datasetId}`);

    // Wait and check
    let status = "RUNNING";
    while (status === "RUNNING" || status === "READY") {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const res = await axios.get(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
      status = res.data.data.status;
      console.log(`Status: ${status}`);
    }

    if (status === "SUCCEEDED") {
      const itemsRes = await axios.get(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
      console.log("Success! Items:", JSON.stringify(itemsRes.data, null, 2));
    } else {
      console.log("Failed. Log follows:");
      const logRes = await axios.get(`https://api.apify.com/v2/actor-runs/${runId}/log?token=${APIFY_TOKEN}`);
      console.log(logRes.data);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testFlash();
