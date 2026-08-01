import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

// Extract token value from HTML meta tag: <meta name="google-site-verification" content="TOKEN" />
function extractMetaToken(metaTagString: string): string {
  const match = metaTagString.match(/content="([^"]+)"/);
  return match ? match[1] : metaTagString;
}

export async function POST(req: NextRequest) {
  try {
    const { action, userId, domain } = await req.json();

    if (!userId || !domain) {
      return NextResponse.json({ error: 'Missing userId or domain' }, { status: 400 });
    }

    const canonicalSiteUrl = `https://${domain.toLowerCase().trim()}/`;

    // 1. Initialize Google Auth with default scopes
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    let accessToken = tokenResponse.token;

    if (!accessToken) {
      throw new Error('Could not retrieve access token for Google API services.');
    }

    // 2. Generate a scoped token using IAM Credentials API (to bypass Cloud Run metadata server scope restrictions)
    try {
      const projectId = await auth.getProjectId();
      const saEmail = (client as any).email || `firebase-app-hosting-compute@${projectId}.iam.gserviceaccount.com`;
      
      console.log(`[gsc-verify] Attempting to generate scoped access token for ${saEmail}...`);
      const iamUrl = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${saEmail}:generateAccessToken`;
      const iamRes = await axios.post(
        iamUrl,
        {
          scope: [
            'https://www.googleapis.com/auth/siteverification',
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
        console.log(`[gsc-verify] Successfully obtained scoped access token via IAM Credentials API.`);
      }
    } catch (iamErr: any) {
      console.warn(`[gsc-verify] IAM Credentials API call failed: ${iamErr.response ? JSON.stringify(iamErr.response.data) : iamErr.message}. Falling back to default token.`);
    }

    const businessDocRef = db.doc(`businessProfiles/${userId}`);

    // --- Action: Get Token ---
    if (action === 'getToken') {
      console.log(`[gsc-verify] Fetching token for: ${canonicalSiteUrl}`);
      try {
        const tokenRes = await axios.post(
          'https://www.googleapis.com/siteVerification/v1/token',
          {
            verificationMethod: 'META',
            site: {
              identifier: canonicalSiteUrl,
              type: 'SITE',
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const fullMetaString = tokenRes.data.token || '';
        const tokenValue = extractMetaToken(fullMetaString);

        if (!tokenValue) {
          throw new Error('Verification token format unexpected.');
        }

        // Save token to Firestore profile to dynamically render it in page header
        await businessDocRef.set(
          {
            googleSiteVerification: tokenValue,
          },
          { merge: true }
        );

        return NextResponse.json({
          success: true,
          token: tokenValue,
          detail: 'Verification token generated and saved to business profile. Please wait for custom-domain build/cache refresh before verification.',
        });
      } catch (err: any) {
        console.error('[gsc-verify] getToken error:', err.response?.data || err.message);
        return NextResponse.json(
          {
            success: false,
            error: err.response?.data?.error?.message || err.message,
          },
          { status: 500 }
        );
      }
    }

    // --- Action: Verify Ownership & Add Property & Submit Sitemap ---
    if (action === 'verify') {
      console.log(`[gsc-verify] Verifying ownership for: ${canonicalSiteUrl}`);
      try {
        let verifyRes;
        try {
          // A. Trigger ownership verification call
          verifyRes = await axios.post(
            'https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=META',
            {
              site: {
                identifier: canonicalSiteUrl,
                type: 'SITE',
              },
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
        } catch (verifyErr: any) {
          console.error('[gsc-verify] API verification check failed:', verifyErr.response?.data || verifyErr.message);
          return NextResponse.json(
            {
              success: false,
              error: 'Google could not verify ownership. Please ensure your verification tag is live on your site, and wait a few minutes for DNS and SSL to propagate.',
            },
            { status: 400 }
          );
        }

        if (verifyRes.status !== 200 && verifyRes.status !== 201) {
          return NextResponse.json(
            {
              success: false,
              error: 'Google could not verify ownership. Please ensure your verification tag is live on your site, and wait a few minutes for DNS and SSL to propagate.',
            },
            { status: 400 }
          );
        }

        console.log(`[gsc-verify] Ownership verified. Registering in Search Console...`);

        // B. Add the property to Search Console (PUT)
        const gscUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(canonicalSiteUrl)}`;
        await axios.put(
          gscUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log(`[gsc-verify] Property registered in Search Console. Delegating permissions...`);

        // B.1 Delegate Full Owner permission to john@t3kniq.com
        const targetEmail = "john@t3kniq.com";
        const permissionsUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(canonicalSiteUrl)}/permissions/${encodeURIComponent(targetEmail)}`;
        try {
          await axios.put(
            permissionsUrl,
            {
              permissionLevel: "siteOwner",
              userEmail: targetEmail
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log(`[gsc-verify] Successfully delegated siteOwner permissions to ${targetEmail}`);
        } catch (permErr: any) {
          console.error('[gsc-verify] Permission delegation failed:', permErr.response?.data || permErr.message);
          // Gracefully continue since ownership is already verified and property added
        }

        console.log(`[gsc-verify] Property permissions updated. Submitting sitemap...`);

        // C. Submit Sitemap (PUT)
        const sitemapFeedUrl = `${canonicalSiteUrl}sitemap.xml`;
        const sitemapUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(canonicalSiteUrl)}/sitemaps/${encodeURIComponent(sitemapFeedUrl)}`;
        const sitemapRes = await axios.put(
          sitemapUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (sitemapRes.status !== 200 && sitemapRes.status !== 201 && sitemapRes.status !== 204) {
          throw new Error(`Google Sitemap API returned status ${sitemapRes.status}`);
        }

        console.log(`[gsc-verify] Sitemap submitted successfully: ${sitemapFeedUrl}`);

        // Update Firestore profile status
        await businessDocRef.set(
          {
            googleSiteVerified: true,
            sitemapSubmitted: true,
          },
          { merge: true }
        );

        return NextResponse.json({
          success: true,
          detail: 'Ownership verified, site added to Google Search Console, and sitemap successfully submitted!',
        });
      } catch (err: any) {
        console.error('[gsc-verify] verification flow error:', err.response?.data || err.message);
        return NextResponse.json(
          {
            success: false,
            error: err.response?.data?.error?.message || err.message || 'Verification failed.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    console.error('[gsc-verify] general handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
