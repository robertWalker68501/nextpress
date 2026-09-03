import Link from 'next/link';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { hasCapability } from '@/lib/auth/capabilities';
import { getCurrentUser } from '@/lib/auth/session';

export async function SiteAuthLinks() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href='/sign-in'
        className='hover:text-primary text-sm font-medium'
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className='flex items-center gap-3'>
      <Link
        href='/account'
        className='hover:text-primary text-sm font-medium'
      >
        Account
      </Link>
      {hasCapability(user.role, 'accessAdmin') ? (
        <Link
          href='/admin'
          className='hover:text-primary text-sm font-medium'
        >
          Admin
        </Link>
      ) : null}
      <SignOutButton />
    </div>
  );
}
