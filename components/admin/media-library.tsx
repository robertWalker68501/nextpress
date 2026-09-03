import Link from 'next/link';

import { UserRole } from '@/app/generated/prisma/client';
import { MediaFilters } from '@/components/admin/media-filters';
import { MediaGrid } from '@/components/admin/media-grid';
import { MediaUploadPanel } from '@/components/admin/media-upload-panel';
import { buttonVariants } from '@/components/ui/button';
import { requireCapability } from '@/lib/auth/session';
import {
  listMediaForAdmin,
  type MediaTypeFilter,
} from '@/lib/cms/media-queries';

type MediaListQuery = {
  page?: string;
  q?: string;
  type?: string;
  trash?: string;
};

function parseType(value?: string): MediaTypeFilter {
  if (
    value === 'image' ||
    value === 'video' ||
    value === 'audio' ||
    value === 'document'
  ) {
    return value;
  }
  return 'all';
}

export async function MediaLibrary({
  query,
  basePath = '/admin/media',
  ownerOnly = false,
  title = 'Media',
  description = 'Upload, organize, and reuse files across your site.',
}: {
  query: MediaListQuery;
  basePath?: string;
  ownerOnly?: boolean;
  title?: string;
  description?: string;
}) {
  const actor = await requireCapability('uploadFiles');
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const includeTrash = query.trash === 'true';
  const type = parseType(query.type);
  const result = await listMediaForAdmin({
    actor,
    page,
    search: query.q?.trim() || undefined,
    type,
    includeTrash,
    ownerOnly,
  });

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (type !== 'all') params.set('type', type);
    if (includeTrash) params.set('trash', 'true');
    if (nextPage > 1) params.set('page', String(nextPage));
    const search = params.toString();
    return `${basePath}${search ? `?${search}` : ''}`;
  }

  return (
    <div className='grid gap-6'>
      <div>
        <h1 className='font-heading text-3xl font-bold tracking-tight'>
          {title}
        </h1>
        <p className='text-muted-foreground mt-1'>{description}</p>
      </div>

      {!includeTrash ? <MediaUploadPanel /> : null}

      <MediaFilters
        search={query.q}
        type={type}
        includeTrash={includeTrash}
      />

      <MediaGrid
        canPermanentlyDelete={actor.role === UserRole.ADMINISTRATOR}
        items={result.items.map((item) => ({
          id: item.id,
          filename: item.filename,
          url: item.url,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          altText: item.altText,
          caption: item.caption,
          description: item.description,
          deletedAt: item.deletedAt?.toISOString() ?? null,
          referenceCount: item._count.featuredOn + item._count.menuItems,
          canPermanentlyDelete: actor.role === UserRole.ADMINISTRATOR,
        }))}
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

export type { MediaListQuery };
