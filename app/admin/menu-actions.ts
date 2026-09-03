'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { requireCapability } from '@/lib/auth/session';
import { saveMenuItemsRecord } from '@/lib/cms/menu-mutations';
import { type ActionResult, menuEditorSchema } from '@/lib/cms/validation';

function refreshMenuRoutes() {
  updateTag('menus');
  updateTag('content');
  revalidatePath('/');
  revalidatePath('/admin/appearance/menus');
}

export async function saveMenuAction(input: unknown): Promise<ActionResult> {
  const parsed = menuEditorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await requireCapability('manageMenus');
    await saveMenuItemsRecord(parsed.data.menuId, parsed.data);
    refreshMenuRoutes();
    return { ok: true, data: undefined, message: 'Menu saved.' };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Menu could not be saved.',
    };
  }
}
