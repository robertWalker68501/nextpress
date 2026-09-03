import type { Metadata } from 'next';

import { AccountCommentList } from '@/components/account/account-comment-list';
import { listAccountComments } from '@/lib/cms/account-queries';
import { requireUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Your comments',
};

export const instant = false;

export default async function AccountCommentsPage() {
  const user = await requireUser();
  const comments = await listAccountComments(user.id, user.email);

  return (
    <div className='grid gap-6'>
      <div>
        <h1 className='font-heading text-3xl font-bold tracking-tight'>
          Comments
        </h1>
        <p className='text-muted-foreground mt-1'>
          Review and remove comments you have left on the site.
        </p>
      </div>
      <AccountCommentList comments={comments} />
    </div>
  );
}
