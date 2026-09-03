import { Suspense } from 'react';
import type { Metadata } from 'next';

import {
  MediaLibrary,
  type MediaListQuery,
} from '@/components/admin/media-library';
import { AdminContentSkeleton } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'Media',
};

type MediaPageProps = {
  searchParams: Promise<MediaListQuery>;
};

async function MediaContent({ searchParams }: MediaPageProps) {
  return <MediaLibrary query={await searchParams} />;
}

export default function MediaPage(props: MediaPageProps) {
  return (
    <Suspense fallback={<AdminContentSkeleton />}>
      <MediaContent {...props} />
    </Suspense>
  );
}
