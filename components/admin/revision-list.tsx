'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { restoreRevisionAction } from '@/app/admin/content-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

type Revision = {
  id: string;
  revisionNumber: number;
  createdAt: string;
  authorName: string;
};

export function RevisionList({
  contentId,
  revisions,
}: {
  contentId: string;
  revisions: Revision[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function restore(revisionId: string) {
    if (!window.confirm('Restore this revision as the current content?'))
      return;

    startTransition(async () => {
      const result = await restoreRevisionAction(contentId, revisionId);
      toast.add({
        title: result.ok ? 'Revision restored' : 'Unable to restore revision',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) router.refresh();
    });
  }

  if (revisions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent revisions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='divide-y'>
          {revisions.map((revision, index) => (
            <li
              key={revision.id}
              className='flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0'
            >
              <div>
                <p className='text-sm font-medium'>
                  Revision {revision.revisionNumber}
                  {index === 0 ? ' (current)' : ''}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {revision.authorName} ·{' '}
                  {new Intl.DateTimeFormat('en', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(revision.createdAt))}
                </p>
              </div>
              {index > 0 ? (
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  disabled={isPending}
                  onClick={() => restore(revision.id)}
                >
                  Restore
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
