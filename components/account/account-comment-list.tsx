'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { deleteAccountCommentAction } from '@/app/account-actions';
import { CommentStatusBadge } from '@/components/admin/comment-status-badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CommentStatus } from '@/app/generated/prisma/client';

type AccountComment = {
  id: string;
  body: string;
  status: CommentStatus;
  createdAt: Date;
  content: {
    title: string;
  };
};

export function AccountCommentList({
  comments,
}: {
  comments: AccountComment[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function removeComment(id: string) {
    startTransition(async () => {
      await deleteAccountCommentAction(id);
      router.refresh();
    });
  }

  if (comments.length === 0) {
    return (
      <p className='text-muted-foreground rounded-xl border px-6 py-12 text-center text-sm'>
        You have not left any comments yet.
      </p>
    );
  }

  return (
    <div className='overflow-hidden rounded-xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Comment</TableHead>
            <TableHead>On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell className='max-w-xs truncate'>
                {comment.body}
              </TableCell>
              <TableCell className='max-w-[12rem] truncate'>
                {comment.content.title}
              </TableCell>
              <TableCell>
                <CommentStatusBadge status={comment.status} />
              </TableCell>
              <TableCell>
                {new Intl.DateTimeFormat('en', {
                  dateStyle: 'medium',
                }).format(comment.createdAt)}
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  disabled={isPending}
                  onClick={() => removeComment(comment.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
