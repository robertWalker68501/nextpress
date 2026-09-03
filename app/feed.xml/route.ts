import { getFeedEntries } from '@/lib/cms/public-queries';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { getPostUrl } from '@/lib/cms/public-urls';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET() {
  const settings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const entries = await getFeedEntries(20);

  const items = entries
    .map((entry) => {
      const link = new URL(getPostUrl(entry.slug), baseUrl).toString();
      const pubDate =
        entry.publishedAt?.toUTCString() ?? new Date().toUTCString();
      const description = entry.excerpt ?? '';
      const author = entry.author.displayName ?? entry.author.name;

      return `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <description>${escapeXml(description)}</description>
      <author>${escapeXml(author)}</author>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(settings.siteTitle)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(settings.siteDescription || settings.siteTagline)}</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
