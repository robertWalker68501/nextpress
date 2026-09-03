'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import {
  type ForgotPasswordValues,
  forgotPasswordSchema,
  getSafeCallbackURL,
  type ResetPasswordValues,
  resetPasswordSchema,
  type SignInValues,
  signInSchema,
  type SignUpValues,
  signUpSchema,
  type VerificationValues,
  verificationSchema,
} from '@/lib/auth/validation';

function FormMessage({
  message,
  success = false,
}: {
  message: string | null;
  success?: boolean;
}) {
  if (!message) return null;

  return (
    <Alert variant={success ? 'default' : 'destructive'}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function SignInForm({
  callbackURL,
  initialMessage,
  initialMessageSuccess = false,
}: {
  callbackURL?: string;
  initialMessage?: string;
  initialMessageSuccess?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(initialMessage ?? null);
  const [messageSuccess, setMessageSuccess] = useState(initialMessageSuccess);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  async function onSubmit(values: SignInValues) {
    setMessage(null);
    setMessageSuccess(false);
    const destination = getSafeCallbackURL(callbackURL);
    const result = await authClient.signIn.email({
      ...values,
      callbackURL: destination,
    });

    if (result.error) {
      setMessage(result.error.message ?? 'Unable to sign in.');
      return;
    }

    router.push(destination);
    router.refresh();
  }

  return (
    <form
      className='grid gap-4'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormMessage
        message={message}
        success={messageSuccess}
      />
      <FormFieldControl
        control={form.control}
        name='email'
        type='email'
        label='Email address'
        autoComplete='email'
        required
      />
      <FormFieldControl
        control={form.control}
        name='password'
        type='password'
        label='Password'
        autoComplete='current-password'
        required
      />
      <div className='flex items-center justify-between gap-4'>
        <FormFieldControl
          control={form.control}
          name='rememberMe'
          type='checkbox'
          label='Remember me'
          checkboxLabel='Remember me'
          className='flex-1'
        />
        <Link
          className='text-primary text-sm font-medium hover:underline'
          href='/forgot-password'
        >
          Forgot password?
        </Link>
      </div>
      <Button
        className='w-full'
        type='submit'
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SignUpValues) {
    setMessage(null);
    const result = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: '/verify-email?verified=true',
    });

    if (result.error) {
      setMessage(result.error.message ?? 'Unable to create your account.');
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <form
      className='grid gap-4'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormMessage message={message} />
      <FormFieldControl
        control={form.control}
        name='name'
        type='text'
        label='Name'
        autoComplete='name'
        required
      />
      <FormFieldControl
        control={form.control}
        name='email'
        type='email'
        label='Email address'
        autoComplete='email'
        required
      />
      <FormFieldControl
        control={form.control}
        name='password'
        type='password'
        label='Password'
        description='Use at least 8 characters with a letter, number, and symbol.'
        autoComplete='new-password'
        required
      />
      <FormFieldControl
        control={form.control}
        name='confirmPassword'
        type='password'
        label='Confirm password'
        autoComplete='new-password'
        required
      />
      <Button
        className='w-full'
        type='submit'
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setMessage(null);
    setSuccess(false);
    const result = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: '/reset-password',
    });

    if (result.error) {
      setMessage('Unable to process the request. Please try again.');
      return;
    }

    setSuccess(true);
    setMessage(
      'If an account exists for that email, a password reset link has been sent.'
    );
  }

  return (
    <form
      className='grid gap-4'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormMessage
        message={message}
        success={success}
      />
      <FormFieldControl
        control={form.control}
        name='email'
        type='email'
        label='Email address'
        autoComplete='email'
        required
      />
      <Button
        className='w-full'
        type='submit'
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({
  token,
  invalidToken = false,
}: {
  token?: string;
  invalidToken?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(
    invalidToken ? 'This password reset link is invalid or has expired.' : null
  );
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      setMessage('This password reset link is invalid or has expired.');
      return;
    }

    setMessage(null);
    const result = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (result.error) {
      setMessage(result.error.message ?? 'Unable to reset your password.');
      return;
    }

    router.push('/sign-in?reset=true');
  }

  return (
    <form
      className='grid gap-4'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormMessage message={message} />
      <FormFieldControl
        control={form.control}
        name='password'
        type='password'
        label='New password'
        description='Use at least 8 characters with a letter, number, and symbol.'
        autoComplete='new-password'
        required
        disabled={!token}
      />
      <FormFieldControl
        control={form.control}
        name='confirmPassword'
        type='password'
        label='Confirm new password'
        autoComplete='new-password'
        required
        disabled={!token}
      />
      <Button
        className='w-full'
        type='submit'
        disabled={!token || form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Resetting…' : 'Reset password'}
      </Button>
    </form>
  );
}

export function VerificationForm({
  email,
  verified = false,
  verificationError,
}: {
  email?: string;
  verified?: boolean;
  verificationError?: boolean;
}) {
  const [message, setMessage] = useState<string | null>(
    verified
      ? 'Your email is verified. You can now continue to the administration area.'
      : verificationError
        ? 'The verification link is invalid or has expired.'
        : email
          ? 'Check your inbox and follow the verification link.'
          : null
  );
  const [success, setSuccess] = useState(verified || Boolean(email));
  const form = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { email: email ?? '' },
  });

  async function onSubmit(values: VerificationValues) {
    setMessage(null);
    setSuccess(false);
    const result = await authClient.sendVerificationEmail({
      email: values.email,
      callbackURL: '/verify-email?verified=true',
    });

    if (result.error) {
      setMessage('Unable to send a verification email. Please try again.');
      return;
    }

    setSuccess(true);
    setMessage(
      'If the account is eligible, a verification email has been sent.'
    );
  }

  return (
    <form
      className='grid gap-4'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormMessage
        message={message}
        success={success}
      />
      {!verified ? (
        <>
          <FormFieldControl
            control={form.control}
            name='email'
            type='email'
            label='Email address'
            autoComplete='email'
            required
          />
          <Button
            className='w-full'
            type='submit'
            variant='outline'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? 'Sending…'
              : 'Resend verification email'}
          </Button>
        </>
      ) : null}
    </form>
  );
}
