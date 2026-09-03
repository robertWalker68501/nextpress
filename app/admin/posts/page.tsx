import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ContentType } from '@/app/generated/prisma/client';
import {
  ContentList,
  type ContentListQuery,
} from '@/components/admin/content-list';
import { AdminContentSkeleton } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'Posts',
};

type PostsPageProps = {
  searchParams: Promise<ContentListQuery>;
};

async function PostsContent({ searchParams }: PostsPageProps) {
  return (
    <ContentList
      type={ContentType.POST}
      query={await searchParams}
    />
  );
}

export default function PostsPage(props: PostsPageProps) {
  return (
    <Suspense fallback={<AdminContentSkeleton />}>
      <PostsContent {...props} />
    </Suspense>
  );
}
