import type { Metadata } from 'next';

import { AuthCard, AuthLink } from '@/components/auth/auth-card';
import { SignUpForm } from '@/components/auth/auth-forms';
import { SocialSignIn } from '@/components/auth/social-sign-in';
import { Separator } from '@/components/ui/separator';
import { getEnabledSocialProviders } from '@/lib/auth/social-providers';

export const metadata: Metadata = {
  title: 'Create account',
};

export default function SignUpPage() {
  const providers = getEnabledSocialProviders();

  return (
    <AuthCard
      title='Create your account'
      description='Join NextPress and start building your publishing workflow.'
      footer={
        <>
          Already have an account? <AuthLink href='/sign-in'>Sign in</AuthLink>
        </>
      }
    >
      <SignUpForm />
      {providers.length > 0 ? (
        <>
          <div className='flex items-center gap-3'>
            <Separator className='flex-1' />
            <span className='text-muted-foreground text-xs uppercase'>or</span>
            <Separator className='flex-1' />
          </div>
          <SocialSignIn
            callbackURL='/admin'
            providers={providers}
          />
        </>
      ) : null}
    </AuthCard>
  );
}
