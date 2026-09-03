import { ContentType, TermType } from '@/app/generated/prisma/client';
import { getSitemapEntries } from '@/lib/cms/public-queries';
import { buildPagePublicPath } from '@/lib/cms/page-path';
import { getCategoryUrl, getPostUrl, getTagUrl } from '@/lib/cms/public-urls';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const { content, terms } = await getSitemapEntries();

  const urls = [
    { loc: baseUrl, lastmod: new Date().toISOString() },
    ...content.map((entry) => ({
      loc: new URL(
        entry.type === ContentType.PAGE
          ? buildPagePublicPath(entry)
          : getPostUrl(entry.slug),
        baseUrl
      ).toString(),
      lastmod: entry.updatedAt.toISOString(),
    })),
    ...terms.map((term) => ({
      loc: new URL(
        term.type === TermType.CATEGORY
          ? getCategoryUrl(term.slug)
          : getTagUrl(term.slug),
        baseUrl
      ).toString(),
      lastmod: term.updatedAt.toISOString(),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
