'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { requireCapability } from '@/lib/auth/session';
import {
  permanentlyDeleteMediaRecord,
  registerMediaRecords,
  restoreMediaRecord,
  trashMediaRecord,
  updateMediaRecord,
} from '@/lib/cms/media-mutations';
import {
  type ActionResult,
  mediaEditorSchema,
  mediaUploadSchema,
} from '@/lib/cms/validation';

function refreshMediaRoutes() {
  updateTag('media');
  revalidatePath('/admin/media');
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.message.includes('Connection terminated') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('Failed to get session')
    ) {
      return 'The database connection was lost. Refresh the page and try saving again.';
    }

    return error.message;
  }

  return 'The media could not be saved.';
}

export async function registerMediaAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const parsed = mediaUploadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Upload metadata was invalid.',
    };
  }

  try {
    const actor = await requireCapability('uploadFiles');
    const records = await registerMediaRecords(actor, parsed.data);
    refreshMediaRoutes();
    return {
      ok: true,
      data: { count: records.length },
      message:
        records.length === 1
          ? 'Media uploaded.'
          : `${records.length} files uploaded.`,
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function updateMediaAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = mediaEditorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const actor = await requireCapability('uploadFiles');
    const media = await updateMediaRecord(actor, parsed.data);
    refreshMediaRoutes();
    return {
      ok: true,
      data: { id: media.id },
      message: 'Media details saved.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function trashMediaAction(id: string): Promise<ActionResult> {
  try {
    const actor = await requireCapability('uploadFiles');
    await trashMediaRecord(actor, id);
    refreshMediaRoutes();
    return { ok: true, data: undefined, message: 'Media moved to trash.' };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function restoreMediaAction(id: string): Promise<ActionResult> {
  try {
    const actor = await requireCapability('uploadFiles');
    await restoreMediaRecord(actor, id);
    refreshMediaRoutes();
    return { ok: true, data: undefined, message: 'Media restored.' };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function permanentlyDeleteMediaAction(
  id: string
): Promise<ActionResult> {
  try {
    const actor = await requireCapability('uploadFiles');
    await permanentlyDeleteMediaRecord(actor, id);
    refreshMediaRoutes();
    return {
      ok: true,
      data: undefined,
      message: 'Media permanently deleted.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
