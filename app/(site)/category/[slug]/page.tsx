import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostList } from '@/components/public/post-card';
import { Pagination } from '@/components/public/pagination';
import { SiteMain } from '@/components/public/site-shell';
import { listPublishedPostsByTerm } from '@/lib/cms/public-queries';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { TermType } from '@/app/generated/prisma/client';

type ArchivePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getArchive(slug: string, page: number, termType: TermType) {
  const settings = await getSiteSettings();
  return listPublishedPostsByTerm({
    termType,
    slug,
    page,
    pageSize: settings.postsPerPage,
  });
}

export async function generateMetadata({
  params,
}: ArchivePageProps): Promise<Metadata> {
  const { slug } = await params;
  const archive = await getArchive(slug, 1, TermType.CATEGORY);
  if (!archive) return { title: 'Category' };

  return {
    title: archive.term.name,
    description: archive.term.description ?? undefined,
  };
}

async function CategoryContent({ params, searchParams }: ArchivePageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const archive = await getArchive(slug, page, TermType.CATEGORY);

  if (!archive) notFound();

  return (
    <SiteMain>
      <div className='grid gap-8'>
        <header className='border-b pb-8'>
          <p className='text-muted-foreground text-sm'>Category</p>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>
            {archive.term.name}
          </h1>
          {archive.term.description ? (
            <p className='text-muted-foreground mt-3'>
              {archive.term.description}
            </p>
          ) : null}
        </header>
        <PostList items={archive.items} />
        <Pagination
          page={archive.page}
          totalPages={archive.totalPages}
          hrefForPage={(nextPage) =>
            nextPage > 1
              ? `/category/${slug}?page=${nextPage}`
              : `/category/${slug}`
          }
        />
      </div>
    </SiteMain>
  );
}

export default function CategoryPage(props: ArchivePageProps) {
  return (
    <Suspense fallback={<SiteMain>Loading…</SiteMain>}>
      <CategoryContent {...props} />
    </Suspense>
  );
}
