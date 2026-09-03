'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className='mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-6 py-16 text-center'>
      <h1 className='font-heading text-3xl font-bold tracking-tight'>
        Something went wrong
      </h1>
      <p className='text-muted-foreground leading-7'>
        The page could not be loaded. Try again or return to the homepage.
      </p>
      <div className='flex flex-wrap justify-center gap-2'>
        <button
          type='button'
          className={buttonVariants()}
          onClick={reset}
        >
          Try again
        </button>
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href='/'
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
