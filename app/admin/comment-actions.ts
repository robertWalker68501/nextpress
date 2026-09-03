'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { CommentStatus } from '@/app/generated/prisma/client';
import { requireCapability } from '@/lib/auth/session';
import {
  bulkUpdateCommentStatusRecord,
  permanentlyDeleteCommentRecord,
  replyToCommentRecord,
  restoreCommentRecord,
  updateCommentStatusRecord,
} from '@/lib/cms/comment-mutations';
import { type ActionResult, commentReplySchema } from '@/lib/cms/validation';

function refreshCommentRoutes() {
  updateTag('comments');
  revalidatePath('/admin/comments');
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The comment could not be updated.';
}

export async function approveCommentAction(id: string): Promise<ActionResult> {
  try {
    const actor = await requireCapability('moderateComments');
    await updateCommentStatusRecord(actor, id, CommentStatus.APPROVED);
    refreshCommentRoutes();
    return { ok: true, data: undefined, message: 'Comment approved.' };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function unapproveCommentAction(
  id: string
): Promise<ActionResult> {
  try {
    const actor = await requireCapability('moderateComments');
    await updateCommentStatusRecord(actor, id, CommentStatus.PENDING);
    refreshCommentRoutes();
    return { ok: true, data: undefined, message: 'Comment unapproved.' };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function spamCommentAction(id: string): Promise<ActionResult> {
  try {
    const actor = await requireCapability('moderateComments');
    await updateCommentStatusRecord(actor, id, CommentStatus.SPAM);
    refreshCommentRoutes();
    return { ok: true, data: undefined, message: 'Comment marked as spam.' };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function trashCommentAction(id: string): Promise<ActionResult> {
  try {
    const actor = await requireCapability('moderateComments');
    await updateCommentStatusRecord(actor, id, CommentStatus.TRASH);
    refreshCommentRoutes();
    return { ok: true, data: undefined, message: 'Comment moved to trash.' };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function restoreCommentAction(id: string): Promise<ActionResult> {
  try {
    const actor = await requireCapability('moderateComments');
    await restoreCommentRecord(actor, id);
    refreshCommentRoutes();
    return { ok: true, data: undefined, message: 'Comment restored.' };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function permanentlyDeleteCommentAction(
  id: string
): Promise<ActionResult> {
  try {
    const actor = await requireCapability('moderateComments');
    await permanentlyDeleteCommentRecord(actor, id);
    refreshCommentRoutes();
    return {
      ok: true,
      data: undefined,
      message: 'Comment permanently deleted.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function replyCommentAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = commentReplySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const actor = await requireCapability('moderateComments');
    const comment = await replyToCommentRecord(actor, parsed.data);
    refreshCommentRoutes();
    return {
      ok: true,
      data: { id: comment.id },
      message: 'Reply posted.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function bulkModerateCommentsAction(
  ids: string[],
  status: CommentStatus
): Promise<ActionResult<{ count: number }>> {
  try {
    const actor = await requireCapability('moderateComments');
    const result = await bulkUpdateCommentStatusRecord(actor, ids, status);
    refreshCommentRoutes();
    return {
      ok: true,
      data: { count: result.count },
      message: `${result.count} comment${result.count === 1 ? '' : 's'} updated.`,
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
