'use client';

import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ModeToggle } from '@/components/mode-toggle';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toast';

const adminNavigation = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/comments', label: 'Comments' },
  { href: '/admin/taxonomy/categories', label: 'Categories' },
  { href: '/admin/taxonomy/tags', label: 'Tags' },
  { href: '/admin/appearance/menus', label: 'Menus' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/settings', label: 'Settings' },
] as const;

function getCurrentNavLabel(pathname: string) {
  return (
    [...adminNavigation]
      .reverse()
      .find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      )?.label ?? 'Administration'
  );
}

function AdminPageTitle() {
  const pathname = usePathname();

  return (
    <p className='font-heading font-medium'>{getCurrentNavLabel(pathname)}</p>
  );
}

export function AdminShellFrame({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <Toaster>
      <SidebarProvider>
        <Sidebar
          variant='inset'
          collapsible='icon'
        >
          {sidebar}
        </Sidebar>

        <SidebarInset>
          <header className='bg-background/90 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 backdrop-blur'>
            <SidebarTrigger />
            <div
              className='bg-border h-4 w-px'
              aria-hidden='true'
            />
            <Suspense
              fallback={
                <Skeleton
                  className='h-5 w-32'
                  aria-label='Loading section'
                />
              }
            >
              <AdminPageTitle />
            </Suspense>
            <div className='ml-auto flex items-center gap-3'>
              <Link
                href='/'
                className='text-muted-foreground hover:text-foreground text-sm'
              >
                View site
              </Link>
              <ModeToggle />
            </div>
          </header>
          <div className='flex flex-1 flex-col p-4 sm:p-6 lg:p-8'>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Toaster>
  );
}
