import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import { getPostUrl, authorSlugFromName } from '@/lib/cms/public-urls';

export type PostCardItem = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: Date | null;
  author?: { name: string; displayName: string | null } | null;
  featuredMedia?: { url: string; altText: string | null } | null;
};

type PostCardProps = {
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: Date | null;
  authorName?: string | null;
};

export function PostCard({
  title,
  slug,
  excerpt,
  publishedAt,
  authorName,
}: PostCardProps) {
  return (
    <article className='border-b pb-8 last:border-b-0 last:pb-0'>
      <h2 className='font-heading text-2xl font-semibold tracking-tight'>
        <Link
          href={getPostUrl(slug)}
          className='hover:text-primary'
        >
          {title}
        </Link>
      </h2>
      <p className='text-muted-foreground mt-2 text-sm'>
        {publishedAt ? format(publishedAt, 'MMMM d, yyyy') : null}
        {authorName ? (
          <>
            {' '}
            ·{' '}
            <Link
              href={`/author/${authorSlugFromName(authorName)}`}
              className='hover:text-foreground'
            >
              {authorName}
            </Link>
          </>
        ) : null}
      </p>
      {excerpt ? (
        <p className='text-muted-foreground mt-3 leading-7'>{excerpt}</p>
      ) : null}
    </article>
  );
}

export function PostList({
  items,
}: {
  items: Array<{
    title: string;
    slug: string;
    excerpt?: string | null;
    publishedAt?: Date | null;
    author?: { name: string; displayName: string | null } | null;
  }>;
}) {
  return (
    <div className='grid gap-8'>
      {items.map((item) => (
        <PostCard
          key={item.slug}
          title={item.title}
          slug={item.slug}
          excerpt={item.excerpt}
          publishedAt={item.publishedAt}
          authorName={item.author?.displayName ?? item.author?.name ?? null}
        />
      ))}
    </div>
  );
}

export function PostCardGrid({
  items,
  headingLevel = 'h2',
}: {
  items: PostCardItem[];
  headingLevel?: 'h2' | 'h3';
}) {
  const TitleTag = headingLevel;

  return (
    <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
      {items.map((post) => {
        const authorName =
          post.author?.displayName ?? post.author?.name ?? null;

        return (
          <article
            key={post.id ?? post.slug}
            className='bg-card overflow-hidden rounded-2xl border shadow-xs'
          >
            {post.featuredMedia ? (
              <Link
                href={getPostUrl(post.slug)}
                className='block'
              >
                <Image
                  src={post.featuredMedia.url}
                  alt={post.featuredMedia.altText ?? post.title}
                  width={1200}
                  height={800}
                  sizes='(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw'
                  className='aspect-16/10 w-full object-cover'
                />
              </Link>
            ) : null}
            <div className='grid gap-3 p-6'>
              {post.publishedAt ? (
                <p className='text-muted-foreground text-sm'>
                  <time dateTime={post.publishedAt.toISOString()}>
                    {format(post.publishedAt, 'MMMM d, yyyy')}
                  </time>
                  {authorName ? (
                    <>
                      {' '}
                      ·{' '}
                      <Link
                        href={`/author/${authorSlugFromName(authorName)}`}
                        className='hover:text-foreground'
                      >
                        {authorName}
                      </Link>
                    </>
                  ) : null}
                </p>
              ) : null}
              <TitleTag className='font-heading text-xl font-semibold tracking-tight'>
                <Link
                  href={getPostUrl(post.slug)}
                  className='hover:text-primary'
                >
                  {post.title}
                </Link>
              </TitleTag>
              {post.excerpt ? (
                <p className='text-muted-foreground leading-7'>
                  {post.excerpt}
                </p>
              ) : null}
              <Link
                href={getPostUrl(post.slug)}
                className='text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline'
              >
                Continue reading
                <ArrowRight className='size-4' />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
