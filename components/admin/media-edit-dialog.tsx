'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  permanentlyDeleteMediaAction,
  restoreMediaAction,
  trashMediaAction,
  updateMediaAction,
} from '@/app/admin/media-actions';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { type MediaEditorInput, mediaEditorSchema } from '@/lib/cms/validation';

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText: string | null;
  caption: string | null;
  description: string | null;
  deletedAt: string | null;
  referenceCount: number;
  canPermanentlyDelete: boolean;
};

export function MediaEditDialog({
  item,
  open,
  onOpenChange,
}: {
  item: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<MediaEditorInput>({
    resolver: zodResolver(mediaEditorSchema),
    values: item
      ? {
          id: item.id,
          altText: item.altText ?? '',
          caption: item.caption ?? '',
          description: item.description ?? '',
        }
      : undefined,
  });

  async function onSubmit(values: MediaEditorInput) {
    const result = await updateMediaAction(values);
    toast.add({
      title: result.ok ? 'Saved' : 'Unable to save media',
      description: result.message,
      type: result.ok ? 'success' : 'error',
    });
    if (result.ok) {
      onOpenChange(false);
      router.refresh();
    }
  }

  function runAction(
    action: () => Promise<{ ok: boolean; message: string }>,
    options?: {
      successTitle?: string;
      errorTitle?: string;
      closeOnSuccess?: boolean;
    }
  ) {
    startTransition(async () => {
      const result = await action();
      toast.add({
        title: result.ok
          ? (options?.successTitle ?? 'Updated')
          : (options?.errorTitle ?? 'Unable to update media'),
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) {
        if (options?.closeOnSuccess ?? true) {
          onOpenChange(false);
        }
        router.refresh();
      }
    });
  }

  function moveToTrash() {
    if (!item || !window.confirm('Move this media item to trash?')) return;

    startTransition(async () => {
      const result = await trashMediaAction(item.id);

      if (result.ok) {
        toast.add({
          title: 'Moved to trash',
          description:
            'Use Undo now, or open Trash in the View filter to restore later.',
          type: 'success',
          timeout: 10_000,
          actionProps: {
            children: 'Undo',
            onClick: () => {
              void (async () => {
                const restoreResult = await restoreMediaAction(item.id);
                toast.add({
                  title: restoreResult.ok ? 'Restored' : 'Unable to restore',
                  description: restoreResult.message,
                  type: restoreResult.ok ? 'success' : 'error',
                });
                if (restoreResult.ok) router.refresh();
              })();
            },
          },
        });
        onOpenChange(false);
        router.refresh();
        return;
      }

      toast.add({
        title: 'Unable to update media',
        description: result.message,
        type: 'error',
      });
    });
  }

  async function copyUrl() {
    if (!item) return;
    await navigator.clipboard.writeText(item.url);
    toast.add({
      title: 'URL copied',
      description: 'The file URL is on your clipboard.',
      type: 'success',
    });
  }

  if (!item) return null;

  const isImage = item.mimeType.startsWith('image/');

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-2xl overflow-x-hidden'>
        <DialogHeader>
          <DialogTitle className='truncate pr-8'>{item.filename}</DialogTitle>
        </DialogHeader>

        <div className='grid min-w-0 gap-6 md:grid-cols-[12rem_minmax(0,1fr)]'>
          <div className='bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-lg border'>
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.altText ?? item.filename}
                className='size-full object-cover'
              />
            ) : (
              <p className='text-muted-foreground px-4 text-center text-xs'>
                {item.mimeType}
              </p>
            )}
          </div>

          <form
            className='grid min-w-0 gap-4'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormFieldControl
              control={form.control}
              name='altText'
              type='text'
              label='Alt text'
            />
            <FormFieldControl
              control={form.control}
              name='caption'
              type='textarea'
              label='Caption'
              rows={2}
              maxLength={500}
            />
            <FormFieldControl
              control={form.control}
              name='description'
              type='textarea'
              label='Description'
              rows={3}
              maxLength={1000}
            />
            <p className='text-muted-foreground text-xs'>
              {formatBytes(item.sizeBytes)} · Used in {item.referenceCount}{' '}
              place{item.referenceCount === 1 ? '' : 's'}
            </p>
            <DialogFooter className='px-0 sm:flex-wrap sm:justify-start'>
              <Button
                type='button'
                variant='outline'
                onClick={copyUrl}
              >
                <Copy className='size-4' />
                Copy URL
              </Button>
              <Button
                type='submit'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving…' : 'Save details'}
              </Button>
            </DialogFooter>
          </form>
        </div>

        <div className='flex flex-wrap gap-2 border-t pt-4'>
          {item.deletedAt ? (
            <>
              <Button
                type='button'
                variant='outline'
                disabled={isPending}
                onClick={() =>
                  runAction(() => restoreMediaAction(item.id), {
                    successTitle: 'Restored',
                  })
                }
              >
                Restore
              </Button>
              {item.canPermanentlyDelete ? (
                <Button
                  type='button'
                  variant='destructive'
                  disabled={isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Permanently delete this media item? This cannot be undone.'
                      )
                    ) {
                      runAction(() => permanentlyDeleteMediaAction(item.id), {
                        successTitle: 'Permanently deleted',
                      });
                    }
                  }}
                >
                  Delete permanently
                </Button>
              ) : null}
            </>
          ) : (
            <Button
              type='button'
              variant='ghost'
              disabled={isPending}
              onClick={moveToTrash}
            >
              <Trash2 className='size-4' />
              Move to trash
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type { MediaItem };
