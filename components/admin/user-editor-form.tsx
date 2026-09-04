'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from '@/app/admin/user-actions';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { roleOptions } from '@/lib/auth/roles';
import {
  type AdminCreateUserInput,
  type AdminUpdateUserInput,
  adminCreateUserSchema,
  adminUpdateUserSchema,
} from '@/lib/auth/validation';

type ReassignOption = {
  id: string;
  label: string;
};

const passwordDescription =
  'Use at least 8 characters with a letter, number, and symbol.';

export function UserEditorForm({
  mode,
  defaultValues,
  currentUserId,
  ownedRecordCount = 0,
  reassignOptions = [],
}: {
  mode: 'create' | 'edit';
  defaultValues: AdminCreateUserInput | AdminUpdateUserInput;
  currentUserId?: string;
  ownedRecordCount?: number;
  reassignOptions?: ReassignOption[];
}) {
  const router = useRouter();
  const [isDeleting, startDelete] = useTransition();
  const isEdit = mode === 'edit';
  const createForm = useForm<AdminCreateUserInput>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'SUBSCRIBER',
      displayName: '',
      bio: '',
      ...(isEdit ? {} : (defaultValues as AdminCreateUserInput)),
    },
  });
  const updateForm = useForm<AdminUpdateUserInput>({
    resolver: zodResolver(adminUpdateUserSchema),
    defaultValues: isEdit
      ? (defaultValues as AdminUpdateUserInput)
      : {
          id: '',
          name: '',
          email: '',
          role: 'SUBSCRIBER',
          displayName: '',
          bio: '',
          emailVerified: true,
          password: '',
          confirmPassword: '',
        },
  });
  const deleteForm = useForm<{ reassignToUserId: string }>({
    defaultValues: {
      reassignToUserId: reassignOptions[0]?.id ?? '',
    },
  });

  const userId = isEdit
    ? (defaultValues as AdminUpdateUserInput).id
    : undefined;
  const isSelf = Boolean(userId && userId === currentUserId);
  const needsReassignment = ownedRecordCount > 0;
  const canDelete =
    isEdit && !isSelf && (!needsReassignment || reassignOptions.length > 0);

  async function onCreate(values: AdminCreateUserInput) {
    createForm.clearErrors();
    const result = await createUserAction(values);
    toast.add({
      title: result.ok ? 'User created' : 'Unable to create user',
      description: result.message,
      type: result.ok ? 'success' : 'error',
    });
    if (result.ok) {
      router.push(`/admin/users/${result.data.id}`);
      router.refresh();
    }
  }

  async function onUpdate(values: AdminUpdateUserInput) {
    updateForm.clearErrors();
    const result = await updateUserAction(values);
    toast.add({
      title: result.ok ? 'User updated' : 'Unable to update user',
      description: result.message,
      type: result.ok ? 'success' : 'error',
    });
    if (result.ok) router.refresh();
  }

  function onDelete(reassignToUserId?: string) {
    if (!userId) return;

    startDelete(async () => {
      const result = await deleteUserAction({
        id: userId,
        reassignToUserId,
      });
      toast.add({
        title: result.ok ? 'User deleted' : 'Unable to delete user',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) {
        router.push('/admin/users');
        router.refresh();
      }
    });
  }

  if (!isEdit) {
    return (
      <form
        className='grid gap-6'
        onSubmit={createForm.handleSubmit(onCreate)}
      >
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <FormFieldControl
              control={createForm.control}
              name='name'
              type='text'
              label='Name'
              required
            />
            <FormFieldControl
              control={createForm.control}
              name='displayName'
              type='text'
              label='Display name'
              description='Shown on posts and comments. Leave blank to use the name.'
            />
            <FormFieldControl
              control={createForm.control}
              name='email'
              type='email'
              label='Email'
              autoComplete='off'
              required
            />
            <FormFieldControl
              control={createForm.control}
              name='role'
              type='select'
              label='Role'
              options={roleOptions}
              required
            />
            <FormFieldControl
              control={createForm.control}
              name='bio'
              type='textarea'
              label='Bio'
              rows={4}
              maxLength={500}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <FormFieldControl
              control={createForm.control}
              name='password'
              type='password'
              label='Password'
              description={passwordDescription}
              autoComplete='new-password'
              required
            />
            <FormFieldControl
              control={createForm.control}
              name='confirmPassword'
              type='password'
              label='Confirm password'
              autoComplete='new-password'
              required
            />
          </CardContent>
        </Card>

        <div>
          <Button
            type='submit'
            disabled={createForm.formState.isSubmitting}
          >
            {createForm.formState.isSubmitting ? 'Creating…' : 'Create user'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className='grid gap-6'>
      <form
        className='grid gap-6'
        onSubmit={updateForm.handleSubmit(onUpdate)}
      >
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <FormFieldControl
              control={updateForm.control}
              name='name'
              type='text'
              label='Name'
              required
            />
            <FormFieldControl
              control={updateForm.control}
              name='displayName'
              type='text'
              label='Display name'
              description='Shown on posts and comments. Leave blank to use the name.'
            />
            <FormFieldControl
              control={updateForm.control}
              name='email'
              type='email'
              label='Email'
              autoComplete='off'
              required
            />
            <FormFieldControl
              control={updateForm.control}
              name='role'
              type='select'
              label='Role'
              options={roleOptions}
              required
            />
            <FormFieldControl
              control={updateForm.control}
              name='emailVerified'
              type='checkbox'
              label='Email verification'
              checkboxLabel='Email address is verified'
            />
            <FormFieldControl
              control={updateForm.control}
              name='bio'
              type='textarea'
              label='Bio'
              rows={4}
              maxLength={500}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <FormFieldControl
              control={updateForm.control}
              name='password'
              type='password'
              label='New password'
              description={`Leave blank to keep the current password. ${passwordDescription}`}
              autoComplete='new-password'
            />
            <FormFieldControl
              control={updateForm.control}
              name='confirmPassword'
              type='password'
              label='Confirm new password'
              autoComplete='new-password'
            />
          </CardContent>
        </Card>

        <div>
          <Button
            type='submit'
            disabled={updateForm.formState.isSubmitting}
          >
            {updateForm.formState.isSubmitting ? 'Saving…' : 'Save user'}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Delete user</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          {isSelf ? (
            <p className='text-muted-foreground text-sm'>
              You cannot delete your own account.
            </p>
          ) : needsReassignment && reassignOptions.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              Create another user first so this content can be reassigned.
            </p>
          ) : (
            <form
              className='grid gap-4'
              onSubmit={deleteForm.handleSubmit((values) =>
                onDelete(
                  needsReassignment ? values.reassignToUserId : undefined
                )
              )}
            >
              <p className='text-muted-foreground text-sm'>
                {needsReassignment
                  ? `This account owns ${ownedRecordCount} content, revision, or media record${ownedRecordCount === 1 ? '' : 's'}. Choose another user to receive them, then delete the account.`
                  : 'This account and its sessions will be removed. This cannot be undone.'}
              </p>
              {needsReassignment ? (
                <FormFieldControl
                  control={deleteForm.control}
                  name='reassignToUserId'
                  type='select'
                  label='Reassign to'
                  options={reassignOptions.map((option) => ({
                    label: option.label,
                    value: option.id,
                  }))}
                  required
                />
              ) : null}
              <div>
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={!canDelete || isDeleting}
                >
                  {isDeleting ? 'Deleting…' : 'Delete user'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
