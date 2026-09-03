import { Suspense } from 'react';
import type { Metadata } from 'next';

import { SiteSettingsForm } from '@/components/admin/site-settings-form';
import { AdminContentSkeleton } from '@/components/admin/admin-shell';
import {
  getPublishedPageOptions,
  getSiteSettings,
} from '@/lib/cms/site-settings';
import { requireCapability } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Settings',
};

async function SettingsContent() {
  await requireCapability('manageSettings');
  const [settings, pages] = await Promise.all([
    getSiteSettings(),
    getPublishedPageOptions(),
  ]);

  return (
    <SiteSettingsForm
      settings={settings}
      pages={pages}
    />
  );
}

export default function SettingsPage() {
  return (
    <div className='grid gap-6'>
      <div>
        <h1 className='font-heading text-3xl font-bold tracking-tight'>
          Settings
        </h1>
        <p className='text-muted-foreground mt-1'>
          Configure site identity, reading defaults, discussion, and SEO.
        </p>
      </div>
      <Suspense fallback={<AdminContentSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
