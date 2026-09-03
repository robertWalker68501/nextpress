import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ContentType } from '@/app/generated/prisma/client';
import {
  ContentList,
  type ContentListQuery,
} from '@/components/admin/content-list';
import { AdminContentSkeleton } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'Pages',
};

type PagesPageProps = {
  searchParams: Promise<ContentListQuery>;
};

async function PagesContent({ searchParams }: PagesPageProps) {
  return (
    <ContentList
      type={ContentType.PAGE}
      query={await searchParams}
    />
  );
}

export default function PagesPage(props: PagesPageProps) {
  return (
    <Suspense fallback={<AdminContentSkeleton />}>
      <PagesContent {...props} />
    </Suspense>
  );
}
