'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { ContentType } from '@/app/generated/prisma/client';
import { requireCapability } from '@/lib/auth/session';
import {
  permanentlyDeleteContentRecord,
  restoreContentRecord,
  restoreRevisionRecord,
  saveContentRecord,
  trashContentRecord,
} from '@/lib/cms/content-mutations';
import { type ActionResult, contentEditorSchema } from '@/lib/cms/validation';

function refreshContentRoutes() {
  updateTag('content');
  updateTag('terms');
  revalidatePath('/');
  revalidatePath('/search');
  revalidatePath('/blog');
  revalidatePath('/feed.xml');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin');
  revalidatePath('/admin/posts');
  revalidatePath('/admin/pages');
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The content could not be saved.';
}

export async function saveContentAction(
  input: unknown
): Promise<ActionResult<{ id: string; type: ContentType }>> {
  const parsed = contentEditorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const actor = await requireCapability('editContent');
    const content = await saveContentRecord(actor, parsed.data);
    refreshContentRoutes();

    return {
      ok: true,
      data: { id: content.id, type: content.type },
      message: 'Content saved.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function trashContentAction(
  id: string
): Promise<ActionResult<{ type: ContentType }>> {
  try {
    const actor = await requireCapability('deleteContent');
    const content = await trashContentRecord(actor, id);
    refreshContentRoutes();
    return {
      ok: true,
      data: { type: content.type },
      message: 'Content moved to trash.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function restoreContentAction(
  id: string
): Promise<ActionResult<{ type: ContentType }>> {
  try {
    const actor = await requireCapability('deleteContent');
    const content = await restoreContentRecord(actor, id);
    refreshContentRoutes();
    return {
      ok: true,
      data: { type: content.type },
      message: 'Content restored as a draft.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function permanentlyDeleteContentAction(
  id: string
): Promise<ActionResult> {
  try {
    const actor = await requireCapability('deleteContent');
    await permanentlyDeleteContentRecord(actor, id);
    refreshContentRoutes();
    return {
      ok: true,
      data: undefined,
      message: 'Content permanently deleted.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function restoreRevisionAction(
  contentId: string,
  revisionId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireCapability('editContent');
    const content = await restoreRevisionRecord(actor, contentId, revisionId);
    refreshContentRoutes();
    revalidatePath(
      `/admin/${content.type === ContentType.POST ? 'posts' : 'pages'}/${content.id}`
    );
    return {
      ok: true,
      data: { id: content.id },
      message: 'Revision restored.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
