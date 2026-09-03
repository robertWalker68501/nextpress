import { Suspense } from 'react';
import type { Metadata } from 'next';

import {
  MediaLibrary,
  type MediaListQuery,
} from '@/components/admin/media-library';
import { AccountContentSkeleton } from '@/components/account/account-shell';

export const metadata: Metadata = {
  title: 'Media',
};

export const instant = false;

type AccountMediaPageProps = {
  searchParams: Promise<MediaListQuery>;
};

async function AccountMediaContent({ searchParams }: AccountMediaPageProps) {
  return (
    <MediaLibrary
      query={await searchParams}
      basePath='/account/media'
      ownerOnly
      title='Your media'
      description='Upload files and reuse them in your posts. You only see media you uploaded.'
    />
  );
}

export default function AccountMediaPage(props: AccountMediaPageProps) {
  return (
    <Suspense fallback={<AccountContentSkeleton />}>
      <AccountMediaContent {...props} />
    </Suspense>
  );
}
