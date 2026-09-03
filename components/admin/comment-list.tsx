import Link from 'next/link';

import { CommentStatus } from '@/app/generated/prisma/client';
import { CommentListPanel } from '@/components/admin/comment-list-panel';
import { buttonVariants } from '@/components/ui/button';
import { requireCapability } from '@/lib/auth/session';
import { listCommentsForAdmin } from '@/lib/cms/comment-queries';

type CommentListQuery = {
  page?: string;
  q?: string;
  status?: string;
};

function parseStatus(value?: string) {
  return Object.values(CommentStatus).find((status) => status === value);
}

export async function CommentList({ query }: { query: CommentListQuery }) {
  await requireCapability('moderateComments');
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const status = parseStatus(query.status);
  const result = await listCommentsForAdmin({
    page,
    search: query.q?.trim() || undefined,
    status,
  });

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (status) params.set('status', status);
    if (nextPage > 1) params.set('page', String(nextPage));
    const search = params.toString();
    return `/admin/comments${search ? `?${search}` : ''}`;
  }

  return (
    <div className='grid gap-6'>
      <CommentListPanel
        items={result.items.map((item) => ({
          id: item.id,
          body: item.body,
          status: item.status,
          authorName: item.authorName,
          authorEmail: item.authorEmail,
          createdAt: item.createdAt.toISOString(),
          contentTitle: item.content.title,
        }))}
        search={query.q}
        status={status}
      />

      {result.totalPages > 1 ? (
        <nav
          className='flex items-center justify-between'
          aria-label='Pagination'
        >
          <p className='text-muted-foreground text-sm'>
            Page {result.page} of {result.totalPages}
          </p>
          <div className='flex gap-2'>
            {result.page > 1 ? (
              <Link
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
                href={pageHref(result.page - 1)}
              >
                Previous
              </Link>
            ) : null}
            {result.page < result.totalPages ? (
              <Link
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
                href={pageHref(result.page + 1)}
              >
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

export type { CommentListQuery };
