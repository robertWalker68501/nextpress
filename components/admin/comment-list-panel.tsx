'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

import { bulkModerateCommentsAction } from '@/app/admin/comment-actions';
import { CommentFilters } from '@/components/admin/comment-filters';
import { CommentRowActions } from '@/components/admin/comment-row-actions';
import { CommentStatusBadge } from '@/components/admin/comment-status-badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { toast } from '@/components/ui/toast';
import {
  CommentStatusValue,
  type CommentStatusValue as CommentStatus,
} from '@/lib/cms/constants';

type CommentRow = {
  id: string;
  body: string;
  status: CommentStatus;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  contentTitle: string;
};

export function CommentListPanel({
  items,
  search,
  status,
}: {
  items: CommentRow[];
  search?: string;
  status?: CommentStatus;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id)
    );
  }

  function runBulk(status: CommentStatus, label: string) {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const result = await bulkModerateCommentsAction(selectedIds, status);
      toast.add({
        title: result.ok ? `${label} complete` : 'Bulk action failed',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) {
        setSelectedIds([]);
        router.refresh();
      }
    });
  }

  return (
    <div className='grid gap-6'>
      <div>
        <h1 className='font-heading text-3xl font-bold tracking-tight'>
          Comments
        </h1>
        <p className='text-muted-foreground mt-1'>
          Review, approve, and moderate discussion across your site.
        </p>
      </div>

      <CommentFilters
        search={search}
        status={status}
      />

      {selectedIds.length > 0 ? (
        <div className='flex flex-wrap gap-2 rounded-lg border p-3'>
          <p className='text-muted-foreground mr-auto text-sm'>
            {selectedIds.length} selected
          </p>
          <Button
            size='sm'
            variant='outline'
            disabled={isPending}
            onClick={() => runBulk(CommentStatusValue.APPROVED, 'Approval')}
          >
            Approve
          </Button>
          <Button
            size='sm'
            variant='outline'
            disabled={isPending}
            onClick={() => runBulk(CommentStatusValue.SPAM, 'Spam marking')}
          >
            Mark spam
          </Button>
          <Button
            size='sm'
            variant='outline'
            disabled={isPending}
            onClick={() => runBulk(CommentStatusValue.TRASH, 'Trash move')}
          >
            Move to trash
          </Button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <Empty className='border'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <MessageSquare />
            </EmptyMedia>
            <EmptyTitle>No comments found</EmptyTitle>
            <EmptyDescription>
              Adjust your filters or wait for new discussion to arrive.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='overflow-hidden rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label='Select all comments'
                  />
                </TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>
                  <span className='sr-only'>Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) =>
                        toggleOne(item.id, checked === true)
                      }
                      aria-label={`Select comment by ${item.authorName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <p className='line-clamp-2 text-sm'>{item.body}</p>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      On {item.contentTitle}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className='text-sm font-medium'>{item.authorName}</p>
                    <p className='text-muted-foreground text-xs'>
                      {item.authorEmail}
                    </p>
                  </TableCell>
                  <TableCell>
                    <CommentStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(item.createdAt))}
                  </TableCell>
                  <TableCell>
                    <CommentRowActions
                      id={item.id}
                      status={item.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
