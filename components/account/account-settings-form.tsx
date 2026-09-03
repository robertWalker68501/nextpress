'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { updateAccountProfileAction } from '@/app/account-actions';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import {
  type ChangePasswordValues,
  changePasswordSchema,
} from '@/lib/auth/validation';
import {
  type AccountProfileInput,
  accountProfileSchema,
} from '@/lib/cms/validation';

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

export function AccountSettingsForm({
  defaultValues,
}: {
  defaultValues: AccountProfileInput;
}) {
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profileForm = useForm<AccountProfileInput>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues,
  });
  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSaveProfile(values: AccountProfileInput) {
    setProfileMessage(null);
    setProfileSuccess(false);
    const result = await updateAccountProfileAction(values);

    if (!result.ok) {
      setProfileMessage(result.message);
      return;
    }

    setProfileSuccess(true);
    setProfileMessage(result.message);
  }

  async function onChangePassword(values: ChangePasswordValues) {
    setPasswordMessage(null);
    setPasswordSuccess(false);
    const result = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.password,
      revokeOtherSessions: true,
    });

    if (result.error) {
      setPasswordMessage(result.error.message ?? 'Unable to change password.');
      return;
    }

    passwordForm.reset();
    setPasswordSuccess(true);
    setPasswordMessage('Password updated.');
  }

  return (
    <div className='grid gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-4'
            onSubmit={profileForm.handleSubmit(onSaveProfile)}
          >
            <FormMessage
              message={profileMessage}
              success={profileSuccess}
            />
            <FormFieldControl
              control={profileForm.control}
              name='name'
              type='text'
              label='Name'
              required
            />
            <FormFieldControl
              control={profileForm.control}
              name='displayName'
              type='text'
              label='Display name'
              description='Shown on posts and comments. Leave blank to use your name.'
            />
            <FormFieldControl
              control={profileForm.control}
              name='bio'
              type='textarea'
              label='Bio'
              rows={4}
              maxLength={500}
            />
            <Button
              type='submit'
              disabled={profileForm.formState.isSubmitting}
            >
              {profileForm.formState.isSubmitting ? 'Saving…' : 'Save profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-4'
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
          >
            <FormMessage
              message={passwordMessage}
              success={passwordSuccess}
            />
            <FormFieldControl
              control={passwordForm.control}
              name='currentPassword'
              type='password'
              label='Current password'
              autoComplete='current-password'
              required
            />
            <FormFieldControl
              control={passwordForm.control}
              name='password'
              type='password'
              label='New password'
              description='Use at least 8 characters with a letter, number, and symbol.'
              autoComplete='new-password'
              required
            />
            <FormFieldControl
              control={passwordForm.control}
              name='confirmPassword'
              type='password'
              label='Confirm new password'
              autoComplete='new-password'
              required
            />
            <Button
              type='submit'
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting
                ? 'Updating…'
                : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
