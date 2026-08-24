export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;
  if (!domain) return new Response('Missing domain parameter', { status: 400 });

  const cleanDomain = domain.toLowerCase().trim().replace(/:\d+$/, ''); // Remove port if any

  const robotsTxt = `User-agent: *
Allow: /

# AI & Search Crawlers for GEO
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: https://${cleanDomain}/sitemap.xml
`;

  return new Response(robotsTxt.trim(), {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600'
    },
  });
}
