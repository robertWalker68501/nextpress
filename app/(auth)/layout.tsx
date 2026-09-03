import type { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className='relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12'>
      <div className='bg-primary/10 absolute inset-x-0 top-0 -z-10 h-72 blur-3xl' />
      <Link
        href='/'
        className='mb-8 flex items-center gap-2 text-lg font-semibold'
      >
        <span className='bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl'>
          <BookOpen
            className='size-5'
            aria-hidden='true'
          />
        </span>
        NextPress
      </Link>
      {children}
    </main>
  );
}
