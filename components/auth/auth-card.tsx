import type { ReactNode } from 'react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='gap-6'>
        {children}
        {footer ? (
          <div className='text-muted-foreground text-center text-sm'>
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      className='text-primary font-medium hover:underline'
      href={href}
    >
      {children}
    </Link>
  );
}

export function AuthCardFallback() {
  return (
    <Card
      className='h-96 w-full max-w-md animate-pulse'
      aria-label='Loading'
    >
      <CardHeader className='items-center'>
        <div className='bg-muted h-7 w-48 rounded-md' />
        <div className='bg-muted h-4 w-64 rounded-md' />
      </CardHeader>
      <CardContent>
        <div className='bg-muted h-10 rounded-md' />
        <div className='bg-muted h-10 rounded-md' />
        <div className='bg-muted h-10 rounded-md' />
      </CardContent>
    </Card>
  );
}
