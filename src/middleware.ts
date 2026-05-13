import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
          '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
        ],
};

export default function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';

  // Get the path
  const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${
          searchParams.length > 0 ? `?${searchParams}` : ''
    }`;

  // If the host is the main domain or a development environment, allow normal routing
  // Update this with the actual root domains of the app
  // Root/first-party domains - pass through to normal Next.js routing.
  // All other hostnames are treated as client custom domains and rewritten
  // to /custom-domain/[hostname] for landing-page serving.
  const rootDomains = [
        'localhost:9002',
        'localhost:9003',
        'localhost:3000',
        'studio--studio-1410114603-9e1f6.us-central1.hosted.app',
        't3automations.com',
        't3kniq.com',
        'a.run.app',
      ];

  const isRootDomain = rootDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));

  if (isRootDomain) {
        return NextResponse.next();
  }

  // Otherwise, it's a custom domain, rewrite to our custom-domain dynamic route
  return NextResponse.rewrite(new URL(`/custom-domain/${hostname}${path}`, req.url));
}
