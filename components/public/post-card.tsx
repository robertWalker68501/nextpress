import Link from 'next/link';
import { format } from 'date-fns';

import { getPostUrl, authorSlugFromName } from '@/lib/cms/public-urls';

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
