import { Suspense } from 'react';
import type { Metadata } from 'next';

import {
  CommentList,
  type CommentListQuery,
} from '@/components/admin/comment-list';
import { AdminContentSkeleton } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'Comments',
};

type CommentsPageProps = {
  searchParams: Promise<CommentListQuery>;
};

async function CommentsContent({ searchParams }: CommentsPageProps) {
  return <CommentList query={await searchParams} />;
}

export default function CommentsPage(props: CommentsPageProps) {
  return (
    <Suspense fallback={<AdminContentSkeleton />}>
      <CommentsContent {...props} />
    </Suspense>
  );
}
