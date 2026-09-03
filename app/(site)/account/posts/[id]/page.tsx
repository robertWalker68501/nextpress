import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ContentType } from '@/app/generated/prisma/client';
import { saveAccountPostAction } from '@/app/account-actions';
import { ContentEditorPage } from '@/components/admin/content-editor-page';

export const metadata: Metadata = {
  title: 'Edit post',
};

export const instant = false;

export default function EditAccountPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<p className='text-muted-foreground'>Loading editor…</p>}
    >
      <EditAccountPostContent params={params} />
    </Suspense>
  );
}

async function EditAccountPostContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ContentEditorPage
      type={ContentType.POST}
      id={id}
      redirectBase='/account/posts'
      saveAction={saveAccountPostAction}
      showRevisions={false}
    />
  );
}
