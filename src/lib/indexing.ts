import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

export const INDEXNOW_KEY = 't3indexnow2026key9a8b7c6d5e4f';

/**
 * Ping IndexNow (Bing, Yahoo, DuckDuckGo, ChatGPT Search, Yandex, Seznam)
 * for instant crawling of newly published or updated URLs.
 */
export async function notifyIndexNow(domain: string, urls: string[]): Promise<{ ok: boolean; status?: number; error?: string }> {
  const cleanDomain = domain.toLowerCase().trim().replace(/:\d+$/, '');
  if (!cleanDomain || urls.length === 0) return { ok: false, error: 'Missing domain or URLs' };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: cleanDomain,
        key: INDEXNOW_KEY,
        keyLocation: `https://${cleanDomain}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    return { ok: res.ok || res.status === 202, status: res.status };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'IndexNow request failed' };
  }
}

/**
 * Resubmit https://{domain}/sitemap.xml directly to Google Search Console
 * using the Firebase App Hosting compute service account via IAM Credentials.
 */
export async function resubmitGscSitemap(domain: string): Promise<{ ok: boolean; error?: string }> {
  const cleanDomain = domain.toLowerCase().trim().replace(/:\d+$/, '');
  if (!cleanDomain) return { ok: false, error: 'Missing domain' };

  try {
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const baseToken = (await client.getAccessToken()).token;
    if (!baseToken) return { ok: false, error: 'No GCP access token' };

    const projectId = await auth.getProjectId();
    const saEmail = (client as any).email || `firebase-app-hosting-compute@${projectId}.iam.gserviceaccount.com`;

    let accessToken = baseToken;
    try {
      const iamRes = await axios.post(
        `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${saEmail}:generateAccessToken`,
        { scope: ['https://www.googleapis.com/auth/webmasters'] },
        { headers: { Authorization: `Bearer ${baseToken}`, 'Content-Type': 'application/json' } }
      );
      if (iamRes.data?.accessToken) {
        accessToken = iamRes.data.accessToken;
      }
    } catch {
      // Fallback to default token if IAM impersonation not needed
    }

    const siteUrl = `https://${cleanDomain}/`;
    const feedUrl = `https://${cleanDomain}/sitemap.xml`;
    await axios.put(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedUrl)}`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.response?.data?.error?.message || err?.message || 'GSC sitemap ping failed' };
  }
}
