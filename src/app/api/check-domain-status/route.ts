import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

async function lookupARecords(domain: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      { headers: { Accept: 'application/dns-json' }, next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Answer ?? [])
      .filter((r: any) => r.type === 1)
      .map((r: any) => r.data as string);
  } catch (error) {
    console.error('Error resolving DNS A records:', error);
    return [];
  }
}

async function lookupTxtRecords(domain: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT`,
      { headers: { Accept: 'application/dns-json' }, next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Answer ?? [])
      .filter((r: any) => r.type === 16)
      .map((r: any) => {
        let val = r.data as string;
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        return val;
      });
  } catch (error) {
    console.error('Error resolving DNS TXT records:', error);
    return [];
  }
}

async function lookupCnameRecord(cnameDomain: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cnameDomain)}&type=CNAME`,
      { headers: { Accept: 'application/dns-json' }, next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Answer ?? [])
      .filter((r: any) => r.type === 5)
      .map((r: any) => r.data as string);
  } catch (error) {
    console.error('Error resolving DNS CNAME records:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { domain, userId } = await req.json();

    if (!domain || !userId) {
      return NextResponse.json({ error: 'Missing domain or userId' }, { status: 400 });
    }

    // Initialize Google Auth
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      throw new Error('Could not retrieve access token');
    }

    // Call Firebase App Hosting API to get custom domain status
    const url = `https://firebaseapphosting.googleapis.com/v1/projects/studio-1410114603-9e1f6/locations/us-central1/backends/studio/domains/${domain}`;
    
    let appHostingData: any = null;
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      appHostingData = response.data;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // Domain not registered in App Hosting yet
        return NextResponse.json({
          status: 'pending',
          detail: 'Domain is not registered on the App Hosting backend yet. Please ensure it is added via the Firebase Console.',
          dnsRecords: null
        });
      }
      throw err;
    }

    const customDomainStatus = appHostingData.customDomainStatus || {};
    const hostState = customDomainStatus.hostState || 'HOST_STATE_UNSPECIFIED';
    const ownershipState = customDomainStatus.ownershipState || 'OWNERSHIP_STATE_UNSPECIFIED';
    const certState = customDomainStatus.certState || 'CERT_STATE_UNSPECIFIED';
    const requiredDnsUpdates = customDomainStatus.requiredDnsUpdates || [];

    // Parse desired DNS records
    let desiredA: string[] = [];
    let desiredTxt: string = '';
    let desiredCnameHost: string = '';
    let desiredCnameValue: string = '';

    for (const update of requiredDnsUpdates) {
      if (update.desired) {
        for (const desiredItem of update.desired) {
          if (desiredItem.records) {
            for (const record of desiredItem.records) {
              if (record.type === 'A') {
                if (record.rdata && !desiredA.includes(record.rdata)) {
                  desiredA.push(record.rdata);
                }
              } else if (record.type === 'TXT') {
                if (record.rdata && record.rdata.startsWith('fah-claim=')) {
                  if (record.requiredAction === 'ADD' || !desiredTxt) {
                    desiredTxt = record.rdata;
                  }
                }
              } else if (record.type === 'CNAME') {
                if (record.rdata) {
                  desiredCnameValue = record.rdata;
                  // Get relative host name for CNAME
                  if (record.domainName) {
                    let host = record.domainName.replace(/\.$/, '');
                    const root = domain.replace(/\.$/, '');
                    if (host.endsWith('.' + root)) {
                      host = host.slice(0, host.length - root.length - 1);
                    }
                    desiredCnameHost = host;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Retrieve existing domain records from Firestore to preserve active CNAME/TXT configurations
    const docRef = db.doc(`businessProfiles/${userId}/customDomains/${domain}`);
    const docSnap = await docRef.get();
    const existingData = docSnap.exists ? docSnap.data() : {};
    const existingDns = existingData?.dnsRecords || {};

    const dnsRecordsData = {
      aRecords: desiredA.length > 0 ? desiredA : (existingDns.aRecords || ['35.219.200.4']),
      txtRecord: desiredTxt || existingDns.txtRecord || '',
      cnameHost: desiredCnameHost || existingDns.cnameHost || '',
      cnameValue: desiredCnameValue || existingDns.cnameValue || ''
    };

    // Query live DNS records
    const liveARecords = await lookupARecords(domain);
    const isAPointed = liveARecords.some((ip) => dnsRecordsData.aRecords.includes(ip));

    const liveTxtRecords = await lookupTxtRecords(domain);
    const isTxtPointed = liveTxtRecords.some((txt) => txt.trim() === dnsRecordsData.txtRecord.trim());

    let liveCnameRecords: string[] = [];
    let isCnamePointed = false;
    if (dnsRecordsData.cnameHost) {
      liveCnameRecords = await lookupCnameRecord(`${dnsRecordsData.cnameHost}.${domain}`);
      const expectedCnameNormalized = dnsRecordsData.cnameValue.replace(/\.$/, '').toLowerCase().trim();
      isCnamePointed = liveCnameRecords.some((cname) => cname.replace(/\.$/, '').toLowerCase().trim() === expectedCnameNormalized);
    }

    const missing = [];
    if (!isAPointed) missing.push('A record (points to correct IP)');
    if (!isTxtPointed) missing.push('TXT record (ownership claim)');
    if (dnsRecordsData.cnameHost && !isCnamePointed) missing.push('CNAME record (SSL challenge)');

    let newStatus: 'active' | 'pending' | 'misconfigured' | 'provisioning';
    let detail: string;

    if (hostState === 'HOST_ACTIVE' && ownershipState === 'OWNERSHIP_ACTIVE' && certState === 'CERT_ACTIVE') {
      newStatus = 'active';
      detail = 'Domain is live and serving over HTTPS.';
    } else if (missing.length === 0) {
      newStatus = 'provisioning';
      detail = 'All DNS records are correctly in place with your registrar! Google is validating ownership and provisioning the SSL certificate. This typically takes 15 minutes to a few hours.';
    } else {
      newStatus = 'misconfigured';
      detail = `DNS records are misconfigured or propagating. Missing/Incorrect: ${missing.join(', ')}. (Resolved IPs: ${liveARecords.length > 0 ? liveARecords.join(', ') : 'None'}).`;
    }

    // Save update to Firestore
    await docRef.set({
      status: newStatus,
      lastCheckedAt: new Date().toISOString(),
      dnsRecords: dnsRecordsData
    }, { merge: true });

    return NextResponse.json({
      status: newStatus,
      detail,
      resolvedIps: liveARecords,
      dnsRecords: dnsRecordsData
    });
  } catch (err: any) {
    console.error('check-domain-status error:', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
