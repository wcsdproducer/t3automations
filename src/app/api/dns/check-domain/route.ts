import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

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

    // Clean up domain list
    const domains = domainListStr
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(d => d.length > 0 && d.includes('.'));

    if (domains.length === 0) {
      return NextResponse.json({ error: 'No valid domains provided' }, { status: 400 });
    }

    const url = `https://api.namecheap.com/xml.response?ApiUser=${namecheapUser}&ApiKey=${namecheapKey}&UserName=${namecheapUsername}&ClientIp=${namecheapClientIp}&Command=namecheap.domains.check&DomainList=${domains.join(',')}`;

    const response = await axios.get(url, { timeout: 8000 });
    const xml = response.data;

    // Check for API errors
    if (xml.includes('<Error ')) {
      const errorMsg = xml.match(/<Error[^>]*>([^<]+)<\/Error>/)?.[1] || 'Namecheap API Error';
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    const results: { domain: string; available: boolean; premium: boolean }[] = [];
    const matchRegex = /<DomainCheckResult\s+Domain="([^"]+)"\s+Available="([^"]+)"(?:\s+IsPremiumName="([^"]+)")?/g;
    let match;

    while ((match = matchRegex.exec(xml)) !== null) {
      results.push({
        domain: match[1],
        available: match[2] === 'true',
        premium: match[3] === 'true'
      });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('[check-domain] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
