'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { trashAccountPostAction } from '@/app/account-actions';
import { ContentStatusBadge } from '@/components/admin/content-status-badge';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ContentStatus } from '@/app/generated/prisma/client';

type AccountPost = {
  id: string;
  title: string;
  status: ContentStatus;
  updatedAt: Date;
};

export function AccountPostList({ posts }: { posts: AccountPost[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function trashPost(id: string) {
    startTransition(async () => {
      await trashAccountPostAction(id);
      router.refresh();
    });
  }

  if (posts.length === 0) {
    return (
      <div className='rounded-xl border px-6 py-12 text-center'>
        <p className='text-muted-foreground text-sm'>
          You have not written any posts yet.
        </p>
        <Link
          className={buttonVariants({ className: 'mt-4' })}
          href='/account/posts/new'
        >
          Write a post
        </Link>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <Link
                  className='font-medium hover:underline'
                  href={`/account/posts/${post.id}`}
                >
                  {post.title}
                </Link>
              </TableCell>
              <TableCell>
                <ContentStatusBadge status={post.status} />
              </TableCell>
              <TableCell>
                {new Intl.DateTimeFormat('en', {
                  dateStyle: 'medium',
                }).format(post.updatedAt)}
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  disabled={isPending}
                  onClick={() => trashPost(post.id)}
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
