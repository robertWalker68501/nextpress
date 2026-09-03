import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ContentBody } from '@/components/public/content-body';
import { Pagination } from '@/components/public/pagination';
import { PostCardGrid } from '@/components/public/post-card';
import { PostsPerPageSelect } from '@/components/public/posts-per-page-select';
import { SiteMain } from '@/components/public/site-shell';
import { BLOG_PAGE_SLUG, getBlogUrl, parseBlogPageSize } from '@/lib/cms/blog';
import {
  getPublishedPageBySlug,
  listPublishedPosts,
} from '@/lib/cms/public-queries';
import { sanitizePlainText } from '@/lib/cms/sanitize';
import { getSiteSettings } from '@/lib/cms/site-settings';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPageBySlug(BLOG_PAGE_SLUG);
  const settings = await getSiteSettings();
  const description =
    (sanitizePlainText(page?.excerpt) ?? settings.siteDescription) ||
    'All published posts.';

  return {
    title: page?.title ?? 'Blog',
    description,
  };
}

type BlogPageProps = {
  searchParams: Promise<{ page?: string; perPage?: string }>;
};

async function BlogContent({ searchParams }: BlogPageProps) {
  const settings = await getSiteSettings();
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const perPage = parseBlogPageSize(query.perPage, settings.postsPerPage);
  const [blogPage, posts] = await Promise.all([
    getPublishedPageBySlug(BLOG_PAGE_SLUG),
    listPublishedPosts({
      page,
      pageSize: perPage,
    }),
  ]);
  const title = blogPage?.title ?? 'Blog';
  const excerpt =
    sanitizePlainText(blogPage?.excerpt) ??
    'Every published story, newest first.';

  const rangeStart = posts.total === 0 ? 0 : (posts.page - 1) * perPage + 1;
  const rangeEnd = Math.min(posts.page * perPage, posts.total);

  return (
    <SiteMain>
      <div className='grid gap-10'>
        <header className='grid gap-4 border-b pb-8'>
          <div className='grid gap-2'>
            <h1 className='font-heading text-4xl font-bold tracking-tight'>
              {title}
            </h1>
            {excerpt ? (
              <p className='text-muted-foreground text-lg'>{excerpt}</p>
            ) : null}
          </div>
          {blogPage?.body ? <ContentBody html={blogPage.body} /> : null}
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <p className='text-muted-foreground text-sm'>
              {posts.total === 0
                ? 'No posts yet.'
                : `Showing ${rangeStart}–${rangeEnd} of ${posts.total}`}
            </p>
            <PostsPerPageSelect
              value={perPage}
              defaultPerPage={settings.postsPerPage}
            />
          </div>
        </header>

        {posts.items.length ? (
          <PostCardGrid items={posts.items} />
        ) : (
          <p className='text-muted-foreground'>
            No posts have been published yet.
          </p>
        )}

        <Pagination
          page={posts.page}
          totalPages={posts.totalPages}
          hrefForPage={(nextPage) =>
            getBlogUrl({
              page: nextPage,
              perPage,
              defaultPerPage: settings.postsPerPage,
            })
          }
        />
      </div>
    </SiteMain>
  );
}

export default function BlogPage(props: BlogPageProps) {
  return (
    <Suspense fallback={<SiteMain>Loading…</SiteMain>}>
      <BlogContent {...props} />
    </Suspense>
  );
}
