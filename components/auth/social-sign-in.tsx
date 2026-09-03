'use client';

import { useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

type SocialProvider = 'github' | 'google';

const providerDetails = {
  github: {
    label: 'Continue with GitHub',
    icon: FaGithub,
  },
  google: {
    label: 'Continue with Google',
    icon: FaGoogle,
  },
} satisfies Record<SocialProvider, { label: string; icon: typeof FaGithub }>;

export function SocialSignIn({
  callbackURL,
  providers,
}: {
  callbackURL: string;
  providers: SocialProvider[];
}) {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  if (providers.length === 0) return null;

  async function signIn(provider: SocialProvider) {
    setError(null);
    setPendingProvider(provider);

    const result = await authClient.signIn.social({
      provider,
      callbackURL,
      errorCallbackURL: '/sign-in?error=oauth',
    });

    if (result.error) {
      setError(result.error.message ?? 'Social sign-in failed.');
      setPendingProvider(null);
    }
  }

  return (
    <div className='grid gap-3'>
      {error ? (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className='grid gap-2'>
        {providers.map((provider) => {
          const { icon: Icon, label } = providerDetails[provider];
          return (
            <Button
              key={provider}
              type='button'
              variant='outline'
              className='w-full'
              disabled={pendingProvider !== null}
              onClick={() => void signIn(provider)}
            >
              <Icon aria-hidden='true' />
              {pendingProvider === provider ? 'Connecting…' : label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export type { SocialProvider };
