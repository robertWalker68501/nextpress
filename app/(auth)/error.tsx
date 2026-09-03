'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function AuthError({
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
    <main className='mx-auto grid w-full max-w-md gap-4 px-6 py-16 text-center'>
      <h1 className='font-heading text-2xl font-bold tracking-tight'>
        Sign-in problem
      </h1>
      <p className='text-muted-foreground leading-7'>
        Authentication could not be completed. Try again or use email sign-in.
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
          href='/sign-in'
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
