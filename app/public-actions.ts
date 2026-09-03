'use server';

import { updateTag } from 'next/cache';

import { getCurrentUser } from '@/lib/auth/session';
import { submitPublicComment } from '@/lib/cms/public-mutations';
import { type ActionResult, publicCommentSchema } from '@/lib/cms/validation';

export async function submitCommentAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = publicCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await getCurrentUser();
    const result = await submitPublicComment({
      ...parsed.data,
      authorName: user?.displayName || user?.name || parsed.data.authorName,
      authorEmail: user?.email || parsed.data.authorEmail,
      authorUserId: user?.id,
    });
    updateTag('comments');
    return { ok: true, data: undefined, message: result.message };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Comment could not be submitted.',
    };
  }
}
