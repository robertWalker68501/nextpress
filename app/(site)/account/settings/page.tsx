import type { Metadata } from 'next';

import { AccountSettingsForm } from '@/components/account/account-settings-form';
import { requireUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Account settings',
};

export const instant = false;

export default async function AccountSettingsPage() {
  const user = await requireUser();
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, displayName: true, bio: true },
  });

  return (
    <div className='grid gap-6'>
      <div>
        <h1 className='font-heading text-3xl font-bold tracking-tight'>
          Settings
        </h1>
        <p className='text-muted-foreground mt-1'>
          Update your public profile and password.
        </p>
      </div>
      <AccountSettingsForm
        defaultValues={{
          name: profile?.name ?? user.name,
          displayName: profile?.displayName ?? '',
          bio: profile?.bio ?? '',
        }}
      />
    </div>
  );
}
