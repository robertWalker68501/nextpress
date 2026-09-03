import { Suspense } from 'react';
import type { Metadata } from 'next';

import {
  AuthCard,
  AuthCardFallback,
  AuthLink,
} from '@/components/auth/auth-card';
import { VerificationForm } from '@/components/auth/auth-forms';

export const metadata: Metadata = {
  title: 'Verify email',
};

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    verified?: string;
    error?: string;
  }>;
};

async function VerifyEmailContent({ searchParams }: VerifyEmailPageProps) {
  const query = await searchParams;
  const verified = query.verified === 'true';

  return (
    <AuthCard
      title={verified ? 'Email verified' : 'Verify your email'}
      description={
        verified
          ? 'Your NextPress account is ready.'
          : 'Confirm your email address before signing in.'
      }
      footer={
        <AuthLink href={verified ? '/admin' : '/sign-in'}>
          {verified ? 'Continue to administration' : 'Back to sign in'}
        </AuthLink>
      }
    >
      <VerificationForm
        email={query.email}
        verified={verified}
        verificationError={query.error === 'INVALID_TOKEN'}
      />
    </AuthCard>
  );
}

export default function VerifyEmailPage(props: VerifyEmailPageProps) {
  return (
    <Suspense fallback={<AuthCardFallback />}>
      <VerifyEmailContent {...props} />
    </Suspense>
  );
}
