import { Suspense } from 'react';

import type { Metadata } from 'next';

import { AdminContentSkeleton } from '@/components/admin/admin-shell';
import { UserEditorPage } from '@/components/admin/user-editor-page';

export const metadata: Metadata = {
  title: 'Add user',
};

export default function NewUserPage() {
  return (
    <Suspense fallback={<AdminContentSkeleton />}>
      <UserEditorPage />
    </Suspense>
  );
}
