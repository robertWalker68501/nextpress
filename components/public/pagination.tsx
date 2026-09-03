import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Pagination({
  page,
  totalPages,
  hrefForPage,
  className,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label='Pagination'
      className={cn('flex items-center justify-between gap-4', className)}
    >
      <p className='text-muted-foreground text-sm'>
        Page {page} of {totalPages}
      </p>
      <div className='flex gap-2'>
        {page > 1 ? (
          <Link
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
            href={hrefForPage(page - 1)}
          >
            Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
            href={hrefForPage(page + 1)}
          >
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
