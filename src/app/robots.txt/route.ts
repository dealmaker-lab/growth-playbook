const BASE_URL = 'https://growth-playbook-six.vercel.app';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function GET() {
  const body = `User-agent: *
Allow: ${basePath}/
Sitemap: ${BASE_URL}${basePath}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
