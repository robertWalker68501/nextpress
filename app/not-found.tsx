import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className='mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center'>
      <p className='text-muted-foreground text-sm font-medium tracking-wide uppercase'>
        404
      </p>
      <h1 className='font-heading text-3xl font-bold tracking-tight'>
        Page not found
      </h1>
      <p className='text-muted-foreground leading-7'>
        The page you requested does not exist or may have been moved.
      </p>
      <Link
        className={buttonVariants()}
        href='/'
      >
        Back to home
      </Link>
    </main>
  );
}
