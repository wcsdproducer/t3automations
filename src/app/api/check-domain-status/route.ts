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
    const isPointing = liveARecords.some((ip) => dnsRecordsData.aRecords.includes(ip));

    let newStatus: 'active' | 'pending' | 'misconfigured' | 'provisioning';
    let detail: string;

    if (hostState === 'HOST_ACTIVE' && ownershipState === 'OWNERSHIP_ACTIVE' && certState === 'CERT_ACTIVE') {
      newStatus = 'active';
      detail = 'Domain is live and serving over HTTPS.';
    } else if (hostState === 'HOST_ACTIVE' && ownershipState === 'OWNERSHIP_ACTIVE') {
      newStatus = 'provisioning';
      detail = 'DNS is correctly configured. SSL certificate is being provisioned by Firebase — this usually takes 15 minutes to a few hours.';
    } else if (liveARecords.length === 0) {
      newStatus = 'pending';
      detail = 'DNS records not detected yet. Propagation can take up to 48 hours.';
    } else if (!isPointing) {
      newStatus = 'misconfigured';
      detail = `DNS resolves to ${liveARecords.join(', ')} instead of the expected IP(s): ${dnsRecordsData.aRecords.join(', ')}.`;
    } else if (ownershipState !== 'OWNERSHIP_ACTIVE') {
      newStatus = 'misconfigured';
      detail = 'A records point to the correct IP, but domain ownership verification is pending. Please configure the TXT record.';
    } else {
      newStatus = 'provisioning';
      detail = 'DNS configuration is correct. Google is validating ownership and provisioning SSL.';
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
