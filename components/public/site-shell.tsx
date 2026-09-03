import Link from 'next/link';

import { getPublicMenuBySlug } from '@/lib/cms/menu-queries';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { cn } from '@/lib/utils';

import { PublicNavMenu } from '@/components/public/public-nav-menu';

export async function SiteHeader() {
  const [settings, primaryMenu] = await Promise.all([
    getSiteSettings(),
    getPublicMenuBySlug('primary'),
  ]);

  return (
    <header className='border-b'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-8'>
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
        <PublicNavMenu items={primaryMenu?.items ?? []} />
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
            items={footerMenu.items}
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
