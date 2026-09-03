import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { HomeLanding } from '@/components/public/home-landing';
import { PublicContentView } from '@/components/public/public-content-view';
import { SiteMain } from '@/components/public/site-shell';
import { isHomeLandingPage } from '@/lib/cms/home-landing';
import {
  getPublishedPageBySlugPath,
  getPublishedPostBySlug,
} from '@/lib/cms/public-queries';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { sanitizePlainText } from '@/lib/cms/sanitize';

const reservedSegments = new Set([
  'admin',
  'api',
  'category',
  'tag',
  'author',
  'search',
  'sign-in',
  'sign-up',
  'forgot-password',
  'reset-password',
  'verify-email',
]);

type SlugPageProps = {
  params: Promise<{ slug: string[] }>;
};

async function resolvePublicContent(slugPath: string[]) {
  if (slugPath.length === 0 || reservedSegments.has(slugPath[0])) {
    return null;
  }

  if (slugPath.length === 1) {
    const page = await getPublishedPageBySlugPath(slugPath);
    if (page) return page;
    return getPublishedPostBySlug(slugPath[0]);
  }

  return getPublishedPageBySlugPath(slugPath);
}

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await resolvePublicContent(slug);
  if (!content) return {};

  const settings = await getSiteSettings();
  const description =
    sanitizePlainText(content.excerpt) ?? settings.siteDescription;

  return {
    title: content.title,
    description: description ?? undefined,
    openGraph: {
      title: content.title,
      description: description ?? undefined,
      type: 'article',
      images: content.featuredMedia?.url
        ? [{ url: content.featuredMedia.url }]
        : undefined,
    },
  };
}

async function SlugContent({ params }: SlugPageProps) {
  const { slug } = await params;
  const content = await resolvePublicContent(slug);

  if (!content) notFound();

  if (isHomeLandingPage(content)) {
    return (
      <SiteMain className='py-12 lg:py-16'>
        <HomeLanding content={content} />
      </SiteMain>
    );
  }

  return (
    <SiteMain>
      <PublicContentView content={content} />
    </SiteMain>
  );
}

export default function SlugPage(props: SlugPageProps) {
  return (
    <Suspense fallback={<SiteMain>Loading content…</SiteMain>}>
      <SlugContent {...props} />
    </Suspense>
  );
}
