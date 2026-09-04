import { Suspense } from 'react';

import type { Metadata } from 'next';

import { AdminContentSkeleton } from '@/components/admin/admin-shell';
import { UserList, type UserListQuery } from '@/components/admin/user-list';

export const metadata: Metadata = {
  title: 'Users',
};

type UsersPageProps = {
  searchParams: Promise<UserListQuery>;
};

async function UsersContent({ searchParams }: UsersPageProps) {
  return <UserList query={await searchParams} />;
}

export default function UsersPage(props: UsersPageProps) {
  return (
    <Suspense fallback={<AdminContentSkeleton />}>
      <UsersContent {...props} />
    </Suspense>
  );
}
