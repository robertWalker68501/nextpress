import type { Metadata } from 'next';
import Link from 'next/link';

import { AccountPostList } from '@/components/account/account-post-list';
import { buttonVariants } from '@/components/ui/button';
import { listAccountPosts } from '@/lib/cms/account-queries';
import { requireUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Your posts',
};

export const instant = false;

export default async function AccountPostsPage() {
  const user = await requireUser();
  const posts = await listAccountPosts(user.id);

  return (
    <div className='grid gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>
            Posts
          </h1>
          <p className='text-muted-foreground mt-1'>
            Draft, submit, and update your own posts.
          </p>
        </div>
        <Link
          className={buttonVariants()}
          href='/account/posts/new'
        >
          Write a post
        </Link>
      </div>
      <AccountPostList posts={posts} />
    </div>
  );
}
