import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ContentType } from '@/app/generated/prisma/client';
import { ContentEditorPage } from '@/components/admin/content-editor-page';

export const metadata: Metadata = {
  title: 'Add post',
};

export default function NewPostPage() {
  return (
    <Suspense
      fallback={<p className='text-muted-foreground'>Loading editor…</p>}
    >
      <ContentEditorPage type={ContentType.POST} />
    </Suspense>
  );
}
