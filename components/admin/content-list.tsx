import Link from 'next/link';
import { FileText } from 'lucide-react';

import {
  ContentStatus,
  ContentType,
  UserRole,
} from '@/app/generated/prisma/client';
import { ContentFilters } from '@/components/admin/content-filters';
import { ContentRowActions } from '@/components/admin/content-row-actions';
import { ContentStatusBadge } from '@/components/admin/content-status-badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { requireCapability } from '@/lib/auth/session';
import { listContentForAdmin } from '@/lib/cms/content-queries';

type ContentListQuery = {
  page?: string;
  q?: string;
  status?: string;
};

function parseStatus(value?: string) {
  return Object.values(ContentStatus).find((status) => status === value);
}

export async function ContentList({
  type,
  query,
}: {
  type: ContentType;
  query: ContentListQuery;
}) {
  const actor = await requireCapability('editContent');
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const status = parseStatus(query.status);
  const result = await listContentForAdmin({
    actor,
    type,
    page,
    search: query.q?.trim() || undefined,
    status,
  });
  const segment = type === ContentType.POST ? 'posts' : 'pages';
  const singular = type === ContentType.POST ? 'post' : 'page';
  const title = type === ContentType.POST ? 'Posts' : 'Pages';

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (status) params.set('status', status);
    if (nextPage > 1) params.set('page', String(nextPage));
    const search = params.toString();
    return `/admin/${segment}${search ? `?${search}` : ''}`;
  }

  return (
    <div className='grid gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>
            {title}
          </h1>
          <p className='text-muted-foreground mt-1'>
            Create, review, publish, and organize {title.toLowerCase()}.
          </p>
        </div>
        <Link
          className={buttonVariants()}
          href={`/admin/${segment}/new`}
        >
          Add {singular}
        </Link>
      </div>

      <ContentFilters
        search={query.q}
        status={status}
      />

      {result.items.length === 0 ? (
        <Empty className='border'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No {title.toLowerCase()} found</EmptyTitle>
            <EmptyDescription>
              Create a new {singular} or change the current filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='overflow-hidden rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>
                  <span className='sr-only'>Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      className='font-medium hover:underline'
                      href={`/admin/${segment}/${item.id}`}
                    >
                      {item.title}
                    </Link>
                    <p className='text-muted-foreground mt-0.5 text-xs'>
                      /{item.slug}
                    </p>
                  </TableCell>
                  <TableCell>
                    {item.author.displayName ?? item.author.name}
                  </TableCell>
                  <TableCell>
                    <ContentStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                    }).format(item.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <ContentRowActions
                      id={item.id}
                      status={item.status}
                      editHref={`/admin/${segment}/${item.id}`}
                      canPermanentlyDelete={
                        actor.role === UserRole.ADMINISTRATOR
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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

export type { ContentListQuery };
