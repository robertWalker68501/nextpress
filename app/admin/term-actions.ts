'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { type TermType } from '@/app/generated/prisma/client';
import { requireCapability } from '@/lib/auth/session';
import { deleteTermRecord, saveTermRecord } from '@/lib/cms/term-mutations';
import { type ActionResult, termEditorSchema } from '@/lib/cms/validation';

function refreshTermRoutes() {
  updateTag('content');
  updateTag('terms');
  revalidatePath('/admin/taxonomy/categories');
  revalidatePath('/admin/taxonomy/tags');
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The term could not be saved.';
}

export async function saveTermAction(
  input: unknown
): Promise<ActionResult<{ id: string; type: TermType }>> {
  const parsed = termEditorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await requireCapability('manageTerms');
    const term = await saveTermRecord(parsed.data);
    refreshTermRoutes();
    return {
      ok: true,
      data: { id: term.id, type: term.type },
      message: 'Term saved.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function deleteTermAction(id: string): Promise<ActionResult> {
  try {
    await requireCapability('manageTerms');
    await deleteTermRecord(id);
    refreshTermRoutes();
    return {
      ok: true,
      data: undefined,
      message: 'Term deleted.',
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
