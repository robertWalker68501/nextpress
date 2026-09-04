import { Suspense } from 'react';

import type { Metadata } from 'next';

import { AdminContentSkeleton } from '@/components/admin/admin-shell';
import { UserEditorPage } from '@/components/admin/user-editor-page';

export const metadata: Metadata = {
  title: 'Edit user',
};

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AdminContentSkeleton />}>
      <EditUserContent params={params} />
    </Suspense>
  );
}

async function EditUserContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserEditorPage id={id} />;
}
