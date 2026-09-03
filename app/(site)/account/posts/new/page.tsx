import type { Metadata } from 'next';

import { ContentType } from '@/app/generated/prisma/client';
import { saveAccountPostAction } from '@/app/account-actions';
import { ContentEditorPage } from '@/components/admin/content-editor-page';

export const metadata: Metadata = {
  title: 'Write a post',
};

export const instant = false;

export default function NewAccountPostPage() {
  return (
    <ContentEditorPage
      type={ContentType.POST}
      redirectBase='/account/posts'
      saveAction={saveAccountPostAction}
      showRevisions={false}
    />
  );
}
