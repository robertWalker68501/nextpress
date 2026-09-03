import { Suspense } from 'react';
import type { Metadata } from 'next';

import {
  AuthCard,
  AuthCardFallback,
  AuthLink,
} from '@/components/auth/auth-card';
import { SignInForm } from '@/components/auth/auth-forms';
import { SocialSignIn } from '@/components/auth/social-sign-in';
import { Separator } from '@/components/ui/separator';
import { getEnabledSocialProviders } from '@/lib/auth/social-providers';
import { getSafeCallbackURL } from '@/lib/auth/validation';

export const metadata: Metadata = {
  title: 'Sign in',
};

type SignInPageProps = {
  searchParams: Promise<{
    callbackURL?: string;
    error?: string;
    reset?: string;
  }>;
};

async function SignInContent({ searchParams }: SignInPageProps) {
  const query = await searchParams;
  const callbackURL = getSafeCallbackURL(query.callbackURL);
  const providers = getEnabledSocialProviders();
  const initialMessage =
    query.error === 'oauth'
      ? 'Social sign-in was not completed. Please try again.'
      : query.reset === 'true'
        ? 'Your password was reset. Sign in with your new password.'
        : undefined;

  return (
    <AuthCard
      title='Welcome back'
      description='Sign in to manage your NextPress site.'
      footer={
        <>
          Need an account? <AuthLink href='/sign-up'>Create one</AuthLink>
        </>
      }
    >
      <SignInForm
        callbackURL={callbackURL}
        initialMessage={initialMessage}
        initialMessageSuccess={query.reset === 'true'}
      />
      {providers.length > 0 ? (
        <>
          <div className='flex items-center gap-3'>
            <Separator className='flex-1' />
            <span className='text-muted-foreground text-xs uppercase'>or</span>
            <Separator className='flex-1' />
          </div>
          <SocialSignIn
            callbackURL={callbackURL}
            providers={providers}
          />
        </>
      ) : null}
    </AuthCard>
  );
}

export default function SignInPage(props: SignInPageProps) {
  return (
    <Suspense fallback={<AuthCardFallback />}>
      <SignInContent {...props} />
    </Suspense>
  );
}
