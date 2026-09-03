import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ContentType } from '@/app/generated/prisma/client';
import { ContentEditorPage } from '@/components/admin/content-editor-page';

export const metadata: Metadata = {
  title: 'Edit page',
};

export default function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<p className='text-muted-foreground'>Loading editor…</p>}
    >
      <EditPageContent params={params} />
    </Suspense>
  );
}

async function EditPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ContentEditorPage
      type={ContentType.PAGE}
      id={id}
    />
  );
}
