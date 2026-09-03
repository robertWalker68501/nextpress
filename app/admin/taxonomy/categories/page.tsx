import { Suspense } from 'react';
import type { Metadata } from 'next';

import { TermType } from '@/app/generated/prisma/client';
import { TermPage } from '@/components/admin/term-page';

export const metadata: Metadata = {
  title: 'Categories',
};

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={<p className='text-muted-foreground'>Loading categories…</p>}
    >
      <TermPage type={TermType.CATEGORY} />
    </Suspense>
  );
}
