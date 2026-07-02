const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6',
    storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app',
  });
}

const db = admin.firestore();
const BASE_URL = 'https://t3automations.com';

async function retryEpoxy() {
  const profileId = 'tampa_epoxy_flooring';
  const domain = 'tampaepoxycoatings.com';
  
  console.log('── Tampa Epoxy Flooring ──');
  console.log('Checking existing GSC verification state...');
  
  const profileDoc = await db.doc(`businessProfiles/${profileId}`).get();
  const profile = profileDoc.data();
  console.log('Current googleSiteVerification:', profile?.googleSiteVerification);
  console.log('Current googleSiteVerified:', profile?.googleSiteVerified);
  
  // The old token FEyzrNb5KtV8QZ6K4AwF5u3wE5skiI59hnSY4LrjYxI may have been claimed by a different account
  // Let's get a fresh token first
  console.log('\nGetting fresh GSC token...');
  const tokenRes = await fetch(`${BASE_URL}/api/gsc/verify-site`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getToken', userId: profileId, domain: domain }),
  });
  const tokenData = await tokenRes.json();
  console.log('Token response:', JSON.stringify(tokenData));
  
  // Wait a moment for the token to propagate
  console.log('\nWaiting 3 seconds for Firestore propagation...');
  await new Promise(r => setTimeout(r, 3000));
  
  // Re-read the profile
  const updatedDoc = await db.doc(`businessProfiles/${profileId}`).get();
  console.log('Updated googleSiteVerification:', updatedDoc.data()?.googleSiteVerification);
  
  // Check the live site for the new token
  console.log('\nChecking live site for updated meta tag...');
  const liveRes = await fetch(`https://${domain}/`);
  const html = await liveRes.text();
  const match = html.match(/<meta\s+name=["']google-site-verification["']\s+content=["']([^"']+)["']/i);
  console.log('Live meta tag token:', match ? match[1] : 'NOT FOUND');
  
  // Try verification again
  console.log('\nRetrying GSC verification...');
  const verifyRes = await fetch(`${BASE_URL}/api/gsc/verify-site`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', userId: profileId, domain: domain }),
  });
  const verifyData = await verifyRes.json();
  console.log('Verification result:', JSON.stringify(verifyData));
}

retryEpoxy().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
