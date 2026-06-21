import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { domain, userId } = await req.json();

    if (!domain || !userId) {
      return NextResponse.json({ error: 'Missing domain or userId' }, { status: 400 });
    }

    const namecheapUser = process.env.NAMECHEAP_API_USER;
    const namecheapKey = process.env.NAMECHEAP_API_KEY;
    const namecheapUsername = process.env.NAMECHEAP_USERNAME;
    const namecheapClientIp = process.env.NAMECHEAP_CLIENT_IP;

    if (!namecheapUser || !namecheapKey || !namecheapUsername || !namecheapClientIp) {
      return NextResponse.json({ 
        error: 'Namecheap API is not fully configured on the server. Please check environment variables.' 
      }, { status: 500 });
    }

    // 1. Fetch required DNS updates from Firebase App Hosting
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      throw new Error('Could not retrieve access token for Firebase API.');
    }

    const appHostingUrl = `https://firebaseapphosting.googleapis.com/v1/projects/studio-1410114603-9e1f6/locations/us-central1/backends/studio/domains/${domain}`;
    const response = await axios.get(appHostingUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const customDomainStatus = response.data.customDomainStatus || {};
    const requiredDnsUpdates = customDomainStatus.requiredDnsUpdates || [];

    let requiredA: string[] = [];
    let requiredTxt: string = '';
    let requiredCnameHost: string = '';
    let requiredCnameValue: string = '';

    for (const update of requiredDnsUpdates) {
      if (update.desired) {
        for (const desiredItem of update.desired) {
          if (desiredItem.records) {
            for (const record of desiredItem.records) {
              if (record.type === 'A') {
                if (record.rdata && !requiredA.includes(record.rdata)) {
                  requiredA.push(record.rdata);
                }
              } else if (record.type === 'TXT') {
                requiredTxt = record.rdata || '';
              } else if (record.type === 'CNAME') {
                // Remove trailing dot from values
                const cleanHost = (update.domainName || '').replace(/\.$/, '');
                // Firebase challenge host is usually sub.domain.com or _acme-challenge.sub.domain.com
                // We need to extract the relative record label (relative to the base domain)
                let relativeHost = cleanHost;
                if (cleanHost.endsWith(domain)) {
                  relativeHost = cleanHost.replace(new RegExp(`\\.?${domain}$`), '');
                }
                requiredCnameHost = relativeHost || '@';
                requiredCnameValue = (record.rdata || '').replace(/\.$/, '');
              }
            }
          }
        }
      }
    }

    if (requiredA.length === 0 && !requiredTxt && !requiredCnameValue) {
      return NextResponse.json({ 
        error: 'No DNS records currently requested by Firebase for this domain. Make sure registration has started.' 
      }, { status: 400 });
    }

    // 2. Parse Domain into SLD and TLD
    const parts = domain.split('.');
    if (parts.length < 2) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }
    const tld = parts.pop()!;
    const sld = parts.join('.');

    // 3. Fetch existing hosts from Namecheap (to avoid deleting existing user records)
    const getHostsUrl = `https://api.namecheap.com/xml.response?ApiUser=${namecheapUser}&ApiKey=${namecheapKey}&UserName=${namecheapUsername}&ClientIp=${namecheapClientIp}&Command=namecheap.domains.dns.getHosts&SLD=${sld}&TLD=${tld}`;
    const getHostsRes = await axios.get(getHostsUrl);
    
    const $ = cheerio.load(getHostsRes.data, { xmlMode: true });
    
    // Check for API errors
    const errorEl = $('Error');
    if (errorEl.length > 0) {
      throw new Error(errorEl.text() || 'Namecheap API returned an error retrieving hosts.');
    }

    let existingHosts: Array<{ Name: string; Type: string; Address: string; MXPref: string; TTL: string }> = [];
    $('host').each((_, el) => {
      existingHosts.push({
        Name: $(el).attr('Name') || '',
        Type: $(el).attr('Type') || '',
        Address: $(el).attr('Address') || '',
        MXPref: $(el).attr('MXPref') || '10',
        TTL: $(el).attr('TTL') || '1799'
      });
    });

    // 4. Merge required Firebase records into existing lists
    // Filter out old records that overlap with our new entries (e.g. old root A records, or old challenge TXT/CNAME records)
    existingHosts = existingHosts.filter(h => {
      // Keep other records (like MX records, or subdomains not managed by Firebase)
      if (h.Type === 'A' && (h.Name === '@' || h.Name === 'www')) return false;
      if (h.Type === 'TXT' && h.Name === '@' && h.Address.includes('fah-claim')) return false;
      if (h.Type === 'CNAME' && h.Name === requiredCnameHost) return false;
      return true;
    });

    // Add our new Firebase records
    // A Records
    for (const ip of requiredA) {
      existingHosts.push({
        Name: '@',
        Type: 'A',
        Address: ip,
        MXPref: '10',
        TTL: '1799'
      });
      existingHosts.push({
        Name: 'www',
        Type: 'A',
        Address: ip,
        MXPref: '10',
        TTL: '1799'
      });
    }

    // TXT Claim Record
    if (requiredTxt) {
      existingHosts.push({
        Name: '@',
        Type: 'TXT',
        Address: requiredTxt,
        MXPref: '10',
        TTL: '1799'
      });
    }

    // CNAME Verification Record
    if (requiredCnameHost && requiredCnameValue) {
      existingHosts.push({
        Name: requiredCnameHost,
        Type: 'CNAME',
        Address: requiredCnameValue,
        MXPref: '10',
        TTL: '1799'
      });
    }

    // 5. Submit setHosts request to Namecheap
    const setParams = new URLSearchParams();
    setParams.append('ApiUser', namecheapUser);
    setParams.append('ApiKey', namecheapKey);
    setParams.append('UserName', namecheapUsername);
    setParams.append('ClientIp', namecheapClientIp);
    setParams.append('Command', 'namecheap.domains.dns.setHosts');
    setParams.append('SLD', sld);
    setParams.append('TLD', tld);

    existingHosts.forEach((host, idx) => {
      const num = idx + 1;
      setParams.append(`HostName${num}`, host.Name);
      setParams.append(`RecordType${num}`, host.Type);
      setParams.append(`Address${num}`, host.Address);
      setParams.append(`MXPref${num}`, host.MXPref);
      setParams.append(`TTL${num}`, host.TTL);
    });

    const setHostsUrl = `https://api.namecheap.com/xml.response`;
    const setHostsRes = await axios.post(setHostsUrl, setParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const $set = cheerio.load(setHostsRes.data, { xmlMode: true });
    const setErrorEl = $set('Error');
    if (setErrorEl.length > 0) {
      throw new Error(setErrorEl.text() || 'Namecheap API returned an error updating hosts.');
    }

    const successEl = $set('DomainDNSSetHostsResult');
    if (successEl.length === 0 || successEl.attr('IsSuccess') !== 'true') {
      throw new Error('Namecheap setHosts call failed or did not report success.');
    }

    return NextResponse.json({
      success: true,
      detail: `Successfully configured ${existingHosts.length} records on Namecheap for ${domain}.`
    });
  } catch (error: any) {
    console.error('[configure-namecheap] error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error while configuring Namecheap records.' 
    }, { status: 500 });
  }
}
