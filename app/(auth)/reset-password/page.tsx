import { Suspense } from 'react';
import type { Metadata } from 'next';

import {
  AuthCard,
  AuthCardFallback,
  AuthLink,
} from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/auth-forms';

export const metadata: Metadata = {
  title: 'Choose a new password',
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
};

async function ResetPasswordContent({ searchParams }: ResetPasswordPageProps) {
  const query = await searchParams;

  return (
    <AuthCard
      title='Choose a new password'
      description='Your new password must be strong and unique.'
      footer={<AuthLink href='/sign-in'>Back to sign in</AuthLink>}
    >
      <ResetPasswordForm
        token={query.token}
        invalidToken={query.error === 'INVALID_TOKEN'}
      />
    </AuthCard>
  );
}

export default function ResetPasswordPage(props: ResetPasswordPageProps) {
  return (
    <Suspense fallback={<AuthCardFallback />}>
      <ResetPasswordContent {...props} />
    </Suspense>
  );
}
