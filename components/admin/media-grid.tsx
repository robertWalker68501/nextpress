'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileIcon, ImageIcon, Music, Video } from 'lucide-react';

import { restoreMediaAction } from '@/app/admin/media-actions';
import {
  MediaEditDialog,
  type MediaItem,
} from '@/components/admin/media-edit-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { toast } from '@/components/ui/toast';

function MediaPreview({
  mimeType,
  url,
  alt,
}: {
  mimeType: string;
  url: string;
  alt: string;
}) {
  if (mimeType.startsWith('image/')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className='size-full object-cover'
      />
    );
  }

  const Icon = mimeType.startsWith('video/')
    ? Video
    : mimeType.startsWith('audio/')
      ? Music
      : FileIcon;

  return (
    <div className='text-muted-foreground flex size-full flex-col items-center justify-center gap-2 p-4 text-center'>
      <Icon className='size-8' />
      <span className='text-xs'>{mimeType}</span>
    </div>
  );
}

export function MediaGrid({
  items,
  canPermanentlyDelete,
}: {
  items: MediaItem[];
  canPermanentlyDelete: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<MediaItem | null>(null);

  function restoreItem(item: MediaItem, event: React.MouseEvent) {
    event.stopPropagation();
    startTransition(async () => {
      const result = await restoreMediaAction(item.id);
      toast.add({
        title: result.ok ? 'Restored' : 'Unable to restore',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <Empty className='border'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <ImageIcon />
          </EmptyMedia>
          <EmptyTitle>No media found</EmptyTitle>
          <EmptyDescription>
            Upload a file or adjust your filters to see library items here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {items.map((item) => (
          <article
            key={item.id}
            className='group bg-card hover:border-primary/40 overflow-hidden rounded-xl border transition-colors'
          >
            <button
              type='button'
              className='block w-full text-left'
              onClick={() => setSelected({ ...item, canPermanentlyDelete })}
            >
              <div className='bg-muted aspect-square overflow-hidden'>
                <MediaPreview
                  mimeType={item.mimeType}
                  url={item.url}
                  alt={item.altText ?? item.filename}
                />
              </div>
              <div className='space-y-2 p-3'>
                <div className='flex items-start justify-between gap-2'>
                  <p className='line-clamp-2 text-sm font-medium'>
                    {item.filename}
                  </p>
                  {item.deletedAt ? (
                    <Badge variant='secondary'>Trash</Badge>
                  ) : null}
                </div>
                <p className='text-muted-foreground text-xs'>
                  {formatBytes(item.sizeBytes)}
                </p>
              </div>
            </button>
            {item.deletedAt ? (
              <div className='px-3 pb-3'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='w-full'
                  disabled={isPending}
                  onClick={(event) => restoreItem(item, event)}
                >
                  Restore
                </Button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <MediaEditDialog
        item={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
