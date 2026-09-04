import Link from 'next/link';

import { UserRole } from '@/app/generated/prisma/client';
import { UserListPanel } from '@/components/admin/user-list-panel';
import { buttonVariants } from '@/components/ui/button';
import { type UserRoleValue } from '@/lib/auth/roles';
import { requireCapability } from '@/lib/auth/session';
import {
  listUsersForAdmin,
  listUsersForReassignment,
} from '@/lib/cms/user-queries';

type UserListQuery = {
  page?: string;
  q?: string;
  role?: string;
};

function parseRole(value?: string) {
  return Object.values(UserRole).find((role) => role === value);
}

export async function UserList({ query }: { query: UserListQuery }) {
  const actor = await requireCapability('manageUsers');
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const role = parseRole(query.role);
  const [result, reassignOptions] = await Promise.all([
    listUsersForAdmin({
      page,
      search: query.q?.trim() || undefined,
      role,
    }),
    listUsersForReassignment(),
  ]);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (role) params.set('role', role);
    if (nextPage > 1) params.set('page', String(nextPage));
    const search = params.toString();
    return `/admin/users${search ? `?${search}` : ''}`;
  }

  return (
    <div className='grid gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>
            Users
          </h1>
          <p className='text-muted-foreground mt-1'>
            Create accounts, assign roles, and reassign content when needed.
          </p>
        </div>
        <Link
          className={buttonVariants()}
          href='/admin/users/new'
        >
          Add user
        </Link>
      </div>

      <UserListPanel
        items={result.items.map((item) => ({
          id: item.id,
          name: item.name,
          displayName: item.displayName,
          email: item.email,
          emailVerified: item.emailVerified,
          role: item.role as UserRoleValue,
          createdAt: item.createdAt.toISOString(),
          ownedRecordCount: item.ownedRecordCount,
        }))}
        search={query.q}
        role={role}
        currentUserId={actor.id}
        reassignOptions={reassignOptions}
      />

      {result.totalPages > 1 ? (
        <nav
          className='flex items-center justify-between'
          aria-label='Pagination'
        >
          <p className='text-muted-foreground text-sm'>
            Page {result.page} of {result.totalPages}
          </p>
          <div className='flex gap-2'>
            {result.page > 1 ? (
              <Link
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
                href={pageHref(result.page - 1)}
              >
                Previous
              </Link>
            ) : null}
            {result.page < result.totalPages ? (
              <Link
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
                href={pageHref(result.page + 1)}
              >
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

export type { UserListQuery };
