import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function SiteNotFound() {
  return (
    <main className='mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-6 py-16 text-center'>
      <h1 className='font-heading text-3xl font-bold tracking-tight'>
        Content not found
      </h1>
      <p className='text-muted-foreground leading-7'>
        This post, page, or archive could not be found.
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
