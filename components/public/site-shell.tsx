import { Suspense } from 'react';
import Link from 'next/link';

import {
  getPublicMenuBySlug,
  withoutAdminMenuItems,
} from '@/lib/cms/menu-queries';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { cn } from '@/lib/utils';

import { ModeToggle } from '@/components/mode-toggle';
import { NextPressLogo } from '@/components/nextpress-logo';
import { SiteAuthLinks } from '@/components/public/site-auth-links';
import { PublicNavMenu } from '@/components/public/public-nav-menu';

export async function SiteHeader() {
  const [settings, primaryMenu] = await Promise.all([
    getSiteSettings(),
    getPublicMenuBySlug('primary'),
  ]);

  return (
    <header className='border-b'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-8'>
        <div className='flex min-w-0 items-center gap-3'>
          <NextPressLogo
            size={40}
            alt=''
            priority
          />
          <div className='min-w-0'>
            <Link
              href='/'
              className='font-heading block truncate text-lg font-semibold tracking-tight'
            >
              {settings.siteTitle}
            </Link>
            {settings.siteTagline ? (
              <p className='text-muted-foreground truncate text-sm'>
                {settings.siteTagline}
              </p>
            ) : null}
          </div>
        </div>
        <div className='flex shrink-0 items-center gap-3'>
          <PublicNavMenu
            items={withoutAdminMenuItems(primaryMenu?.items ?? [])}
          />
          <Suspense
            fallback={
              <span className='text-muted-foreground text-sm font-medium'>
                Account
              </span>
            }
          >
            <SiteAuthLinks />
          </Suspense>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const [settings, footerMenu] = await Promise.all([
    getSiteSettings(),
    getPublicMenuBySlug('footer'),
  ]);

  return (
    <footer className='border-t'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:px-8'>
        {footerMenu?.items.length ? (
          <PublicNavMenu
            items={withoutAdminMenuItems(footerMenu.items)}
            className='justify-start'
          />
        ) : null}
        <div className='text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between'>
          <p>© {settings.siteTitle}</p>
          <div className='flex gap-4'>
            <Link
              href='/feed.xml'
              className='hover:text-foreground'
            >
              RSS
            </Link>
            <Link
              href='/search'
              className='hover:text-foreground'
            >
              Search
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        'mx-auto w-full max-w-6xl flex-1 px-6 py-10 lg:px-8',
        className
      )}
    >
      {children}
    </main>
  );
}
