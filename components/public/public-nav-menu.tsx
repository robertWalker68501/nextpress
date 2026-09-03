'use client';

import Link from 'next/link';

import type { PublicMenuItem } from '@/lib/cms/menu-queries';
import { cn } from '@/lib/utils';

export function PublicNavMenu({
  items,
  className,
}: {
  items: PublicMenuItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label='Site navigation'
      className={cn('flex flex-wrap items-center justify-end gap-4 text-sm', className)}
    >
      {items.map((item) => (
        <NavItem
          key={item.id}
          item={item}
        />
      ))}
    </nav>
  );
}

function NavItem({ item }: { item: PublicMenuItem }) {
  const linkProps = item.openInNewTab
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  if (item.children.length > 0) {
    return (
      <div className='group relative'>
        <Link
          href={item.href}
          className='hover:text-primary font-medium'
          {...linkProps}
        >
          {item.label}
        </Link>
        <div className='bg-popover absolute top-full right-0 z-20 mt-2 hidden min-w-40 rounded-md border p-2 shadow-md group-hover:block group-focus-within:block'>
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.href}
              className='hover:bg-muted block rounded px-3 py-2'
              {...(child.openInNewTab
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className='hover:text-primary font-medium'
      {...linkProps}
    >
      {item.label}
    </Link>
  );
}
