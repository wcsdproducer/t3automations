import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Firebase App Hosting A record IPs
const FIREBASE_IPS = new Set(['35.219.200.10', '35.219.200.6']);

// Initialize Firebase Admin if not already done
function getAdminFirestore() {
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)) });
  }
  return getFirestore();
}

async function lookupARecords(domain: string): Promise<string[]> {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
    { headers: { Accept: 'application/dns-json' }, next: { revalidate: 0 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.Answer ?? [])
    .filter((r: any) => r.type === 1)
    .map((r: any) => r.data as string);
}

/**
 * Attempts an actual HTTPS request to the domain.
 * Returns true only if we get a valid HTTP response (SSL handshake succeeded).
 */
async function checkHttpsReachable(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`https://${domain}/`, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    // Any HTTP status means SSL handshake succeeded and Firebase is responding
    return res.status > 0;
  } catch {
    // SSL_ERROR, timeout, connection refused — cert not ready
    return false;
  }
}

// Status priority:
//   1. No A records at all                       → "pending"
//   2. A records exist but don't point to Firebase → "misconfigured"
//   3. A records correct but HTTPS fails (no cert) → "provisioning"
//   4. A records correct AND HTTPS works           → "active"

export async function POST(req: NextRequest) {
  try {
    const { domain, userId } = await req.json();

    if (!domain || !userId) {
      return NextResponse.json({ error: 'Missing domain or userId' }, { status: 400 });
    }

    // Step 1: Resolve DNS
    const aRecords = await lookupARecords(domain);
    const isPointing = aRecords.some((ip) => FIREBASE_IPS.has(ip));

    let newStatus: 'active' | 'pending' | 'misconfigured' | 'provisioning';
    let detail: string;

    if (aRecords.length === 0) {
      // DNS not propagated at all
      newStatus = 'pending';
      detail = 'DNS records not detected yet. Propagation can take up to 48 hours.';
    } else if (!isPointing) {
      // DNS exists but wrong IPs
      newStatus = 'misconfigured';
      detail = `DNS resolves to ${aRecords.join(', ')} instead of Firebase App Hosting IPs.`;
    } else {
      // DNS is correct — now check if HTTPS actually works (SSL cert provisioned)
      const httpsOk = await checkHttpsReachable(domain);

      if (httpsOk) {
        newStatus = 'active';
        detail = 'Domain is live and serving over HTTPS.';
      } else {
        newStatus = 'provisioning';
        detail = 'DNS is correctly configured. SSL certificate is being provisioned by Firebase — this usually takes 15 minutes to a few hours.';
      }
    }

    // Update Firestore
    const db = getAdminFirestore();
    await db
      .doc(`businessProfiles/${userId}/customDomains/${domain}`)
      .set({ status: newStatus, lastCheckedAt: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ status: newStatus, detail, resolvedIps: aRecords });
  } catch (err: any) {
    console.error('check-domain-status error:', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
