import { Suspense } from 'react';
import type { Metadata } from 'next';

import { PostList } from '@/components/public/post-card';
import { Pagination } from '@/components/public/pagination';
import { PublicContentView } from '@/components/public/public-content-view';
import { SiteMain } from '@/components/public/site-shell';
import {
  getPublishedContentById,
  listPublishedPosts,
} from '@/lib/cms/public-queries';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { sanitizePlainText } from '@/lib/cms/sanitize';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: settings.siteTitle,
    description: settings.siteDescription || settings.siteTagline,
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription || settings.siteTagline,
      type: 'website',
    },
  };
}

type HomePageProps = {
  searchParams: Promise<{ page?: string }>;
};

async function HomeContent({ searchParams }: HomePageProps) {
  const settings = await getSiteSettings();
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);

  if (settings.showOnFront === 'page' && settings.pageOnFront) {
    const frontPage = await getPublishedContentById(settings.pageOnFront);
    if (frontPage) {
      return (
        <SiteMain>
          <PublicContentView content={frontPage} />
        </SiteMain>
      );
    }
  }

  const posts = await listPublishedPosts({
    page,
    pageSize: settings.postsPerPage,
  });

  return (
    <SiteMain>
      <div className='grid gap-10'>
        <header className='grid gap-2 border-b pb-8'>
          <h1 className='font-heading text-4xl font-bold tracking-tight'>
            {settings.siteTitle}
          </h1>
          {settings.siteTagline ? (
            <p className='text-muted-foreground text-lg'>
              {sanitizePlainText(settings.siteTagline)}
            </p>
          ) : null}
        </header>

        <PostList items={posts.items} />

        <Pagination
          page={posts.page}
          totalPages={posts.totalPages}
          hrefForPage={(nextPage) =>
            nextPage > 1 ? `/?page=${nextPage}` : '/'
          }
        />
      </div>
    </SiteMain>
  );
}

export default function HomePage(props: HomePageProps) {
  return (
    <Suspense fallback={<SiteMain>Loading…</SiteMain>}>
      <HomeContent {...props} />
    </Suspense>
  );
}
