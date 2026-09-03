import type { ReactNode } from 'react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { hasCapability } from '@/lib/auth/capabilities';
import { requireUser } from '@/lib/auth/session';

export async function AdminContentGate({ children }: { children: ReactNode }) {
  const user = await requireUser();

  if (!hasCapability(user.role, 'accessAdmin')) {
    return (
      <Card className='mx-auto w-full max-w-lg'>
        <CardHeader>
          <CardTitle>Editorial access required</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <p className='text-muted-foreground leading-7'>
            Your account is active, but Subscriber accounts cannot access the
            NextPress administration workspace.
          </p>
          <Link
            className={buttonVariants({ variant: 'outline' })}
            href='/'
          >
            Return to site
          </Link>
        </CardContent>
      </Card>
    );
  }

  return children;
}
