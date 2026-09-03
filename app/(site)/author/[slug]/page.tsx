import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostList } from '@/components/public/post-card';
import { Pagination } from '@/components/public/pagination';
import { SiteMain } from '@/components/public/site-shell';
import { listPublishedPostsByAuthor } from '@/lib/cms/public-queries';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { sanitizePlainText } from '@/lib/cms/sanitize';

type AuthorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getSiteSettings();
  const archive = await listPublishedPostsByAuthor({
    authorSlug: slug,
    page: 1,
    pageSize: settings.postsPerPage,
  });
  if (!archive) return { title: 'Author' };

  const name = archive.author.displayName ?? archive.author.name;
  return {
    title: name,
    description: sanitizePlainText(archive.author.bio) ?? undefined,
  };
}

async function AuthorContent({ params, searchParams }: AuthorPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const settings = await getSiteSettings();
  const archive = await listPublishedPostsByAuthor({
    authorSlug: slug,
    page,
    pageSize: settings.postsPerPage,
  });

  if (!archive) notFound();

  const name = archive.author.displayName ?? archive.author.name;

  return (
    <SiteMain>
      <div className='grid gap-8'>
        <header className='border-b pb-8'>
          <p className='text-muted-foreground text-sm'>Author</p>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>{name}</h1>
          {archive.author.bio ? (
            <p className='text-muted-foreground mt-3'>{archive.author.bio}</p>
          ) : null}
        </header>
        <PostList items={archive.items} />
        <Pagination
          page={archive.page}
          totalPages={archive.totalPages}
          hrefForPage={(nextPage) =>
            nextPage > 1 ? `/author/${slug}?page=${nextPage}` : `/author/${slug}`
          }
        />
      </div>
    </SiteMain>
  );
}

export default function AuthorPage(props: AuthorPageProps) {
  return (
    <Suspense fallback={<SiteMain>Loading…</SiteMain>}>
      <AuthorContent {...props} />
    </Suspense>
  );
}
