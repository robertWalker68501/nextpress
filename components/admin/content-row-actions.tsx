'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  permanentlyDeleteContentAction,
  restoreContentAction,
  trashContentAction,
} from '@/app/admin/content-actions';
import { buttonVariants, Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import {
  ContentStatusValue,
  type ContentStatusValue as ContentStatus,
} from '@/lib/cms/constants';

export function ContentRowActions({
  id,
  status,
  editHref,
  canPermanentlyDelete,
}: {
  id: string;
  status: ContentStatus;
  editHref: string;
  canPermanentlyDelete: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      toast.add({
        title: result.ok ? 'Success' : 'Unable to update content',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) router.refresh();
    });
  }

  if (status === ContentStatusValue.TRASH) {
    return (
      <div className='flex justify-end gap-1'>
        <Button
          size='xs'
          variant='ghost'
          disabled={isPending}
          onClick={() => runAction(() => restoreContentAction(id))}
        >
          Restore
        </Button>
        {canPermanentlyDelete ? (
          <Button
            size='xs'
            variant='destructive'
            disabled={isPending}
            onClick={() => {
              if (
                window.confirm(
                  'Permanently delete this content and its revisions and comments?'
                )
              ) {
                runAction(() => permanentlyDeleteContentAction(id));
              }
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className='flex justify-end gap-1'>
      <Link
        className={buttonVariants({ variant: 'ghost', size: 'xs' })}
        href={editHref}
      >
        Edit
      </Link>
      <Button
        size='xs'
        variant='ghost'
        disabled={isPending}
        onClick={() => {
          if (window.confirm('Move this content to trash?')) {
            runAction(() => trashContentAction(id));
          }
        }}
      >
        Trash
      </Button>
    </div>
  );
}
