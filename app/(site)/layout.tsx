import type { ReactNode } from 'react';

import { SiteFooter, SiteHeader } from '@/components/public/site-shell';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-full flex-col'>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
