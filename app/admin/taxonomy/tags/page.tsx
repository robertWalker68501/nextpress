import { Suspense } from 'react';
import type { Metadata } from 'next';

import { TermType } from '@/app/generated/prisma/client';
import { TermPage } from '@/components/admin/term-page';

export const metadata: Metadata = {
  title: 'Tags',
};

export default function TagsPage() {
  return (
    <Suspense fallback={<p className='text-muted-foreground'>Loading tags…</p>}>
      <TermPage type={TermType.TAG} />
    </Suspense>
  );
}
