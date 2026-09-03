'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isAuthorizationError = error.name === 'AuthorizationError';

  return (
    <Card className='mx-auto w-full max-w-lg'>
      <CardHeader>
        <CardTitle>
          {isAuthorizationError
            ? 'You do not have permission'
            : 'Something went wrong'}
        </CardTitle>
      </CardHeader>
      <CardContent className='grid gap-4'>
        <p className='text-muted-foreground leading-7'>
          {isAuthorizationError
            ? 'Your account cannot perform this action. Contact an administrator if you believe this is a mistake.'
            : 'The administration page could not be loaded. Try again or return to the dashboard.'}
        </p>
        <div className='flex flex-wrap gap-2'>
          {!isAuthorizationError ? (
            <button
              type='button'
              className={buttonVariants()}
              onClick={reset}
            >
              Try again
            </button>
          ) : null}
          <Link
            className={buttonVariants({ variant: 'outline' })}
            href='/admin'
          >
            Back to dashboard
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
