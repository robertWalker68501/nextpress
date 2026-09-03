'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { ContentType } from '@/app/generated/prisma/client';
import { requireCapability, requireUser } from '@/lib/auth/session';
import { deleteOwnCommentRecord } from '@/lib/cms/comment-mutations';
import {
  saveContentRecord,
  trashContentRecord,
} from '@/lib/cms/content-mutations';
import {
  type AccountProfileInput,
  type ActionResult,
  accountProfileSchema,
  contentEditorSchema,
} from '@/lib/cms/validation';
import prisma from '@/lib/prisma';

function refreshAccountRoutes() {
  updateTag('content');
  updateTag('comments');
  updateTag('media');
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/account');
  revalidatePath('/account/posts');
  revalidatePath('/account/media');
  revalidatePath('/account/comments');
  revalidatePath('/account/settings');
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function saveAccountPostAction(
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

  if (parsed.data.type !== ContentType.POST) {
    return { ok: false, message: 'You can only manage posts from this area.' };
  }

  try {
    const actor = await requireCapability('editContent');
    const content = await saveContentRecord(actor, {
      ...parsed.data,
      type: ContentType.POST,
    });
    refreshAccountRoutes();

    return {
      ok: true,
      data: { id: content.id, type: content.type },
      message: 'Post saved.',
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'The post could not be saved.'),
    };
  }
}

export async function trashAccountPostAction(
  id: string
): Promise<ActionResult> {
  try {
    const actor = await requireCapability('deleteContent');
    const content = await trashContentRecord(actor, id);

    if (content.type !== ContentType.POST) {
      return {
        ok: false,
        message: 'You can only manage posts from this area.',
      };
    }

    refreshAccountRoutes();
    return { ok: true, data: undefined, message: 'Post moved to trash.' };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'The post could not be deleted.'),
    };
  }
}

export async function deleteAccountCommentAction(
  id: string
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await deleteOwnCommentRecord({ id: user.id, email: user.email }, id);
    refreshAccountRoutes();
    return { ok: true, data: undefined, message: 'Comment removed.' };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'The comment could not be deleted.'),
    };
  }
}

export async function updateAccountProfileAction(
  input: unknown
): Promise<ActionResult<AccountProfileInput>> {
  const parsed = accountProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await requireUser();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        displayName: parsed.data.displayName.trim() || null,
        bio: parsed.data.bio.trim() || null,
      },
    });
    revalidatePath('/account');
    revalidatePath('/account/settings');

    return {
      ok: true,
      data: parsed.data,
      message: 'Profile updated.',
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'Your profile could not be updated.'),
    };
  }
}
