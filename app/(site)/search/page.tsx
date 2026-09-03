import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

import { Pagination } from '@/components/public/pagination';
import { SiteMain } from '@/components/public/site-shell';
import { searchPublishedContent } from '@/lib/cms/public-queries';
import { getPostUrl } from '@/lib/cms/public-urls';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { ContentType } from '@/app/generated/prisma/client';

export const metadata: Metadata = {
  title: 'Search',
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

async function SearchContent({ searchParams }: SearchPageProps) {
  const settings = await getSiteSettings();
  const query = await searchParams;
  const q = query.q?.trim() ?? '';
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const results = await searchPublishedContent({
    query: q,
    page,
    pageSize: settings.postsPerPage,
  });

  return (
    <SiteMain>
      <div className='grid gap-8'>
        <header className='grid gap-4 border-b pb-8'>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>
            Search
          </h1>
          <form
            action='/search'
            className='flex gap-2'
          >
            <input
              type='search'
              name='q'
              defaultValue={q}
              placeholder='Search posts and pages'
              className='border-input h-10 min-w-0 flex-1 rounded-md border bg-transparent px-3 text-sm'
            />
            <button
              type='submit'
              className='bg-primary text-primary-foreground rounded-md px-4 text-sm font-medium'
            >
              Search
            </button>
          </form>
        </header>

        {q ? (
          results.items.length ? (
            <div className='grid gap-6'>
              {results.items.map((item) => (
                <article
                  key={item.id}
                  className='border-b pb-6 last:border-b-0'
                >
                  <h2 className='font-heading text-xl font-semibold'>
                    <Link
                      href={
                        item.type === ContentType.PAGE
                          ? `/${item.slug}`
                          : getPostUrl(item.slug)
                      }
                      className='hover:text-primary'
                    >
                      {item.title}
                    </Link>
                  </h2>
                  {item.excerpt ? (
                    <p className='text-muted-foreground mt-2'>{item.excerpt}</p>
                  ) : null}
                </article>
              ))}
              <Pagination
                page={results.page}
                totalPages={results.totalPages}
                hrefForPage={(nextPage) => {
                  const params = new URLSearchParams({ q });
                  if (nextPage > 1) params.set('page', String(nextPage));
                  return `/search?${params}`;
                }}
              />
            </div>
          ) : (
            <p className='text-muted-foreground'>No results for “{q}”.</p>
          )
        ) : (
          <p className='text-muted-foreground'>Enter a search term to begin.</p>
        )}
      </div>
    </SiteMain>
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={<SiteMain>Loading…</SiteMain>}>
      <SearchContent {...props} />
    </Suspense>
  );
}
