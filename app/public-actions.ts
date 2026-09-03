'use server';

import { updateTag } from 'next/cache';

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
    const result = await submitPublicComment(parsed.data);
    updateTag('comments');
    return { ok: true, data: undefined, message: result.message };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Comment could not be submitted.',
    };
  }
}
