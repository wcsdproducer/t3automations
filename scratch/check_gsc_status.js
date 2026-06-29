const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const fs = require('fs');

require('dotenv').config();

const saKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './service-account.json';

async function run() {
  console.log("Authenticating with Google Search Console API...");
  console.log("Authenticating with Google Search Console API via ADC...");
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  let accessToken = tokenRes.token;

  // Generate a scoped token using IAM Credentials API
  try {
    const projectId = await auth.getProjectId();
    const serviceAccountEmail = client.email || client.credentials?.client_email || `firebase-app-hosting-compute@${projectId}.iam.gserviceaccount.com`;
    console.log(`Attempting to generate scoped access token for ${serviceAccountEmail}...`);
    const iamUrl = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`;
    const iamRes = await axios.post(
      iamUrl,
      {
        scope: [
          'https://www.googleapis.com/auth/webmasters.readonly',
          'https://www.googleapis.com/auth/webmasters'
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (iamRes.data && iamRes.data.accessToken) {
      accessToken = iamRes.data.accessToken;
      console.log(`Successfully obtained scoped access token via IAM Credentials API.`);
    }
  } catch (iamErr) {
    console.warn(`IAM Credentials API call failed: ${iamErr.response ? JSON.stringify(iamErr.response.data) : iamErr.message}`);
  }

  if (!accessToken) {
    console.error("Failed to get access token.");
    return;
  }

  console.log("Fetching registered sites from Search Console...");
  const sitesRes = await axios.get('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const sites = sitesRes.data.siteEntry || [];
  console.log("Registered Properties in GSC:");
  console.log(JSON.stringify(sites, null, 2));

  const targetDomains = ['tampabaytreecare.com', 'knoxvillepestexperts.com'];

  for (const targetDomain of targetDomains) {
    console.log(`\n--------------------------------------------\nChecking domain: ${targetDomain}`);
    
    const searchKeys = [
      `sc-domain:${targetDomain}`.toLowerCase(),
      `https://${targetDomain}/`.toLowerCase(),
      `https://www.${targetDomain}/`.toLowerCase()
    ];

    const matchedProperty = sites.find(s => 
      searchKeys.includes(s.siteUrl.toLowerCase())
    );

    if (!matchedProperty) {
      console.log(`Property "${targetDomain}" is NOT registered/verified in this GSC account.`);
      continue;
    }

    const siteUrl = matchedProperty.siteUrl;
    console.log(`Matched site URL: ${siteUrl}`);
    console.log(`Permission level: ${matchedProperty.permissionLevel}`);

    // Check Sitemaps
    console.log(`Fetching sitemaps for ${siteUrl}...`);
    try {
      const sitemapsRes = await axios.get(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log("Sitemaps Response:");
      console.log(JSON.stringify(sitemapsRes.data, null, 2));
    } catch (err) {
      console.error("Failed to fetch sitemaps:", err.response ? err.response.data : err.message);
    }

    // Query Search Analytics
    console.log(`Querying Search Analytics (last 30 days)...`);
    try {
      const queryUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
      const analyticsRes = await axios.post(
        queryUrl,
        {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          dimensions: ['query'],
          rowLimit: 10
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );
      console.log("Search Analytics query response:");
      console.log(JSON.stringify(analyticsRes.data, null, 2));
    } catch (err) {
      console.error("Failed to query Search Analytics:", err.response ? err.response.data : err.message);
    }
  }
}

run().catch(console.error);
