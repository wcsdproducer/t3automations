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
  // Use Cloudflare DNS-over-HTTPS for reliable resolution
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
    { headers: { Accept: 'application/dns-json' }, next: { revalidate: 0 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.Answer ?? [])
    .filter((r: any) => r.type === 1) // type 1 = A record
    .map((r: any) => r.data as string);
}

export async function POST(req: NextRequest) {
  try {
    const { domain, userId } = await req.json();

    if (!domain || !userId) {
      return NextResponse.json({ error: 'Missing domain or userId' }, { status: 400 });
    }

    // Resolve the root domain A records
    const aRecords = await lookupARecords(domain);

    // Check if any of the resolved IPs match Firebase App Hosting
    const isPointing = aRecords.some((ip) => FIREBASE_IPS.has(ip));

    // Determine new status
    const newStatus: 'active' | 'pending' | 'misconfigured' =
      aRecords.length === 0
        ? 'pending'          // DNS not propagated yet
        : isPointing
          ? 'active'         // Correctly pointing at Firebase
          : 'misconfigured'; // Pointing somewhere else

    // Update Firestore
    const db = getAdminFirestore();
    await db
      .doc(`businessProfiles/${userId}/customDomains/${domain}`)
      .set({ status: newStatus, lastCheckedAt: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ status: newStatus, resolvedIps: aRecords });
  } catch (err: any) {
    console.error('check-domain-status error:', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
