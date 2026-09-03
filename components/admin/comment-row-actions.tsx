'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquareReply } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  approveCommentAction,
  permanentlyDeleteCommentAction,
  replyCommentAction,
  restoreCommentAction,
  spamCommentAction,
  trashCommentAction,
  unapproveCommentAction,
} from '@/app/admin/comment-actions';
import { CommentStatusBadge } from '@/components/admin/comment-status-badge';
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
import {
  CommentStatusValue,
  type CommentStatusValue as CommentStatus,
} from '@/lib/cms/constants';
import {
  type CommentReplyInput,
  commentReplySchema,
} from '@/lib/cms/validation';

export function CommentRowActions({
  id,
  status,
}: {
  id: string;
  status: CommentStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [replyOpen, setReplyOpen] = useState(false);
  const form = useForm<CommentReplyInput>({
    resolver: zodResolver(commentReplySchema),
    defaultValues: { parentId: id, body: '' },
  });

  function runAction(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      toast.add({
        title: result.ok ? 'Updated' : 'Unable to update comment',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) router.refresh();
    });
  }

  async function onReply(values: CommentReplyInput) {
    const result = await replyCommentAction(values);
    toast.add({
      title: result.ok ? 'Reply posted' : 'Unable to post reply',
      description: result.message,
      type: result.ok ? 'success' : 'error',
    });
    if (result.ok) {
      setReplyOpen(false);
      form.reset({ parentId: id, body: '' });
      router.refresh();
    }
  }

  if (status === CommentStatusValue.TRASH) {
    return (
      <div className='flex justify-end gap-1'>
        <Button
          size='xs'
          variant='ghost'
          disabled={isPending}
          onClick={() => runAction(() => restoreCommentAction(id))}
        >
          Restore
        </Button>
        <Button
          size='xs'
          variant='destructive'
          disabled={isPending}
          onClick={() => {
            if (window.confirm('Permanently delete this comment?')) {
              runAction(() => permanentlyDeleteCommentAction(id));
            }
          }}
        >
          Delete
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-wrap justify-end gap-1'>
        {status !== CommentStatusValue.APPROVED ? (
          <Button
            size='xs'
            variant='ghost'
            disabled={isPending}
            onClick={() => runAction(() => approveCommentAction(id))}
          >
            Approve
          </Button>
        ) : (
          <Button
            size='xs'
            variant='ghost'
            disabled={isPending}
            onClick={() => runAction(() => unapproveCommentAction(id))}
          >
            Unapprove
          </Button>
        )}
        <Button
          size='xs'
          variant='ghost'
          disabled={isPending}
          onClick={() => setReplyOpen(true)}
        >
          <MessageSquareReply className='size-3.5' />
          Reply
        </Button>
        {status !== CommentStatusValue.SPAM ? (
          <Button
            size='xs'
            variant='ghost'
            disabled={isPending}
            onClick={() => runAction(() => spamCommentAction(id))}
          >
            Spam
          </Button>
        ) : null}
        <Button
          size='xs'
          variant='ghost'
          disabled={isPending}
          onClick={() => runAction(() => trashCommentAction(id))}
        >
          Trash
        </Button>
      </div>

      <Dialog
        open={replyOpen}
        onOpenChange={setReplyOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to comment</DialogTitle>
          </DialogHeader>
          <form
            className='grid gap-4'
            onSubmit={form.handleSubmit(onReply)}
          >
            <FormFieldControl
              control={form.control}
              name='body'
              type='textarea'
              label='Reply'
              rows={4}
              required
            />
            <DialogFooter>
              <Button
                type='submit'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Posting…' : 'Post reply'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
