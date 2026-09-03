'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function signOut() {
    setIsPending(true);
    const result = await authClient.signOut();

    if (result.error) {
      setIsPending(false);
      return;
    }

    router.push('/sign-in');
    router.refresh();
  }

  return (
    <Button
      type='button'
      variant='ghost'
      disabled={isPending}
      onClick={signOut}
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
