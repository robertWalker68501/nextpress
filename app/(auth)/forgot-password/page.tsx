import type { Metadata } from 'next';

import { AuthCard, AuthLink } from '@/components/auth/auth-card';
import { ForgotPasswordForm } from '@/components/auth/auth-forms';

export const metadata: Metadata = {
  title: 'Forgot password',
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title='Reset your password'
      description='Enter your email address and we will send you a reset link.'
      footer={<AuthLink href='/sign-in'>Back to sign in</AuthLink>}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
