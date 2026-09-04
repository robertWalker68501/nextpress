import { notFound } from 'next/navigation';

import { UserEditorForm } from '@/components/admin/user-editor-form';
import { requireCapability } from '@/lib/auth/session';
import { type AdminCreateUserInput } from '@/lib/auth/validation';
import {
  getUserForAdmin,
  listUsersForReassignment,
} from '@/lib/cms/user-queries';

export async function UserEditorPage({ id }: { id?: string }) {
  const actor = await requireCapability('manageUsers');

  if (!id) {
    const defaultValues: AdminCreateUserInput = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'SUBSCRIBER',
      displayName: '',
      bio: '',
    };

    return (
      <div className='grid gap-6'>
        <div>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>
            Add user
          </h1>
          <p className='text-muted-foreground mt-1'>
            Create an account and assign a role. The user can sign in
            immediately.
          </p>
        </div>
        <UserEditorForm
          mode='create'
          defaultValues={defaultValues}
        />
      </div>
    );
  }

  const [user, reassignOptions] = await Promise.all([
    getUserForAdmin(id),
    listUsersForReassignment(id),
  ]);

  if (!user) notFound();

  return (
    <div className='grid gap-6'>
      <div>
        <h1 className='font-heading text-3xl font-bold tracking-tight'>
          Edit user
        </h1>
        <p className='text-muted-foreground mt-1'>
          Update profile details, role, and password for{' '}
          {user.displayName ?? user.name}.
        </p>
      </div>
      <UserEditorForm
        mode='edit'
        currentUserId={actor.id}
        ownedRecordCount={user.ownedRecordCount}
        reassignOptions={reassignOptions}
        defaultValues={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          displayName: user.displayName ?? '',
          bio: user.bio ?? '',
          emailVerified: user.emailVerified,
          password: '',
          confirmPassword: '',
        }}
      />
    </div>
  );
}
