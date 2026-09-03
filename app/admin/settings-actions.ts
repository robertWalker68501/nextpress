'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { requireCapability } from '@/lib/auth/session';
import { updateSiteSettings } from '@/lib/cms/site-settings';
import { type ActionResult, siteSettingsSchema } from '@/lib/cms/validation';

function refreshPublicRoutes() {
  updateTag('settings');
  updateTag('menus');
  updateTag('content');
  revalidatePath('/');
  revalidatePath('/admin/settings');
  revalidatePath('/admin/appearance/menus');
}

export async function saveSiteSettingsAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await requireCapability('manageSettings');
    await updateSiteSettings(parsed.data);
    refreshPublicRoutes();
    return { ok: true, data: undefined, message: 'Settings saved.' };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Settings could not be saved.',
    };
  }
}
