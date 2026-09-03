import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function AdminNotFound() {
  return (
    <div className='mx-auto grid w-full max-w-lg gap-4 text-center'>
      <h1 className='font-heading text-2xl font-bold tracking-tight'>
        Admin page not found
      </h1>
      <p className='text-muted-foreground leading-7'>
        This administration route does not exist.
      </p>
      <Link
        className={buttonVariants()}
        href='/admin'
      >
        Back to dashboard
      </Link>
    </div>
  );
}
