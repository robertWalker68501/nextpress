import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostList } from '@/components/public/post-card';
import { Pagination } from '@/components/public/pagination';
import { SiteMain } from '@/components/public/site-shell';
import { listPublishedPostsByTerm } from '@/lib/cms/public-queries';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { TermType } from '@/app/generated/prisma/client';

type TagPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const archive = await listPublishedPostsByTerm({
    termType: TermType.TAG,
    slug,
    page: 1,
    pageSize: settings.postsPerPage,
  });
  if (!archive) return { title: 'Tag' };

  return { title: `#${archive.term.name}` };
}

async function TagContent({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const settings = await getSiteSettings();
  const archive = await listPublishedPostsByTerm({
    termType: TermType.TAG,
    slug,
    page,
    pageSize: settings.postsPerPage,
  });

  if (!archive) notFound();

  return (
    <SiteMain>
      <div className='grid gap-8'>
        <header className='border-b pb-8'>
          <p className='text-muted-foreground text-sm'>Tag</p>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>
            #{archive.term.name}
          </h1>
        </header>
        <PostList items={archive.items} />
        <Pagination
          page={archive.page}
          totalPages={archive.totalPages}
          hrefForPage={(nextPage) =>
            nextPage > 1 ? `/tag/${slug}?page=${nextPage}` : `/tag/${slug}`
          }
        />
      </div>
    </SiteMain>
  );
}

export default function TagPage(props: TagPageProps) {
  return (
    <Suspense fallback={<SiteMain>Loading…</SiteMain>}>
      <TagContent {...props} />
    </Suspense>
  );
}
