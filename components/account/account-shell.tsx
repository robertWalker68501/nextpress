import { AccountNav } from '@/components/account/account-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { hasCapability } from '@/lib/auth/capabilities';
import { requireUser } from '@/lib/auth/session';

export function AccountNavSkeleton() {
  return (
    <div className='flex flex-wrap gap-2 lg:flex-col'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton
          key={index}
          className='h-9 w-28 rounded-md lg:w-full'
        />
      ))}
    </div>
  );
}

export function AccountContentSkeleton() {
  return (
    <div
      className='grid gap-6'
      aria-label='Loading account'
    >
      <Skeleton className='h-10 w-52' />
      <Skeleton className='h-24 w-full rounded-xl' />
      <Skeleton className='h-64 w-full rounded-xl' />
    </div>
  );
}

export async function AccountNavSection() {
  const user = await requireUser();

  return <AccountNav showAdmin={hasCapability(user.role, 'accessAdmin')} />;
}
