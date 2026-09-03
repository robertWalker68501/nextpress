import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ContentType } from '@/app/generated/prisma/client';
import { ContentEditorPage } from '@/components/admin/content-editor-page';

export const metadata: Metadata = {
  title: 'Edit post',
};

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<p className='text-muted-foreground'>Loading editor…</p>}
    >
      <EditPostContent params={params} />
    </Suspense>
  );
}

async function EditPostContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ContentEditorPage
      type={ContentType.POST}
      id={id}
    />
  );
}
