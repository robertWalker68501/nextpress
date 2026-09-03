'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const links = [
  { href: '/account', label: 'Overview' },
  { href: '/account/posts', label: 'Posts' },
  { href: '/account/comments', label: 'Comments' },
  { href: '/account/settings', label: 'Settings' },
] as const;

export function AccountNav({ showAdmin }: { showAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label='Account'
      className='flex flex-wrap gap-2 lg:flex-col'
    >
      {links.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/account' && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'hover:bg-muted rounded-md px-3 py-2 text-sm font-medium',
              isActive && 'bg-muted text-foreground'
            )}
          >
            {item.label}
          </Link>
        );
      })}
      {showAdmin ? (
        <Link
          href='/admin'
          className='hover:bg-muted rounded-md px-3 py-2 text-sm font-medium'
        >
          Administration
        </Link>
      ) : null}
    </nav>
  );
}
