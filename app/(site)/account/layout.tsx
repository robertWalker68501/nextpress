import { Suspense, type ReactNode } from 'react';

import {
  AccountContentSkeleton,
  AccountNavSection,
  AccountNavSkeleton,
} from '@/components/account/account-shell';
import { SiteMain } from '@/components/public/site-shell';
import { Toaster } from '@/components/ui/toast';

// Account routes read the session on every request; opt out of
// instant-navigation validation until those reads sit behind Suspense.
export const instant = false;

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <Toaster>
      <SiteMain className='max-w-none px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8'>
        <div className='grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]'>
          <Suspense fallback={<AccountNavSkeleton />}>
            <AccountNavSection />
          </Suspense>
          <div className='min-w-0'>
            <Suspense fallback={<AccountContentSkeleton />}>
              {children}
            </Suspense>
          </div>
        </div>
      </SiteMain>
    </Toaster>
  );
}
