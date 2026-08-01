import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;
  if (!domain) return new Response('Missing domain parameter', { status: 400 });

  const verificationContent = 'google-site-verification: google0d0f48a865c38e34.html';

  return new Response(verificationContent, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    },
  });
}
