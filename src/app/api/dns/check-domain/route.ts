import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import dns from 'dns';
import { promisify } from 'util';

const resolveNsAsync = promisify(dns.resolveNs);
const resolveSoaAsync = promisify(dns.resolveSoa);

async function checkDomainViaDns(domain: string): Promise<boolean> {
  try {
    // Try resolving NS records
    await resolveNsAsync(domain);
    return false; // Has NS records, so it is taken
  } catch (e: any) {
    if (e.code === 'ENOTFOUND') {
      try {
        // Fallback check SOA (some domains might only have SOA)
        await resolveSoaAsync(domain);
        return false; // SOA exists, so it is taken
      } catch (e2) {
        return true; // No NS or SOA found, likely available
      }
    }
    return false; // Other errors usually mean it is registered but DNS is misconfigured
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainListStr = searchParams.get('domains');

    if (!domainListStr) {
      return NextResponse.json({ error: 'Missing domains query parameter' }, { status: 400 });
    }

    const namecheapUser = process.env.NAMECHEAP_API_USER;
    const namecheapKey = process.env.NAMECHEAP_API_KEY;
    const namecheapUsername = process.env.NAMECHEAP_USERNAME;
    let namecheapClientIp = process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1';

    // Clean up domain list
    const domains = domainListStr
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(d => d.length > 0 && d.includes('.'));

    if (domains.length === 0) {
      return NextResponse.json({ error: 'No valid domains provided' }, { status: 400 });
    }

    // Dynamically detect public outbound IP of the server
    try {
      const ipRes = await axios.get('https://api.ipify.org?format=json', { timeout: 3000 });
      if (ipRes.data && ipRes.data.ip) {
        namecheapClientIp = ipRes.data.ip;
      }
    } catch (ipErr) {
      console.warn('[check-domain] Failed to dynamically detect outbound IP, using env/fallback:', ipErr);
    }

    if (!namecheapUser || !namecheapKey || !namecheapUsername) {
      return NextResponse.json({
        error: 'Namecheap API is not fully configured on the server.'
      }, { status: 500 });
    }

    const url = `https://api.namecheap.com/xml.response?ApiUser=${namecheapUser}&ApiKey=${namecheapKey}&UserName=${namecheapUsername}&ClientIp=${namecheapClientIp}&Command=namecheap.domains.check&DomainList=${domains.join(',')}`;

    let results: { domain: string; available: boolean; premium: boolean }[] = [];
    let useFallback = false;

    try {
      const response = await axios.get(url, { timeout: 8000 });
      const xml = response.data;

      // Check for API errors (like IP whitelist restrictions)
      if (xml.includes('<Error ')) {
        const errorMsg = xml.match(/<Error[^>]*>([^<]+)<\/Error>/)?.[1] || 'Namecheap API Error';
        console.warn(`[check-domain] Namecheap API error: "${errorMsg}". Falling back to DNS lookup.`);
        useFallback = true;
      } else {
        const matchRegex = /<DomainCheckResult\s+Domain="([^"]+)"\s+Available="([^"]+)"(?:\s+IsPremiumName="([^"]+)")?/g;
        let match;
        while ((match = matchRegex.exec(xml)) !== null) {
          results.push({
            domain: match[1],
            available: match[2] === 'true',
            premium: match[3] === 'true'
          });
        }
      }
    } catch (apiErr: any) {
      console.warn('[check-domain] Namecheap API HTTP call failed, using DNS fallback:', apiErr.message);
      useFallback = true;
    }

    // Execute DNS lookup fallback if Namecheap API failed (e.g. due to IP authorization restriction on Cloud Run)
    if (useFallback || results.length === 0) {
      console.log(`[check-domain] Executing DNS lookup fallback for ${domains.length} domains...`);
      const fallbackPromises = domains.map(async (d) => {
        const available = await checkDomainViaDns(d);
        return {
          domain: d,
          available,
          premium: false
        };
      });
      results = await Promise.all(fallbackPromises);
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('[check-domain] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
