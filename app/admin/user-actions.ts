'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { requireCapability } from '@/lib/auth/session';
import {
  adminBulkUserRoleSchema,
  adminCreateUserSchema,
  adminDeleteUserSchema,
  adminUpdateUserSchema,
} from '@/lib/auth/validation';
import {
  bulkUpdateUserRolesRecord,
  createUserRecord,
  deleteUserRecord,
  updateUserRecord,
} from '@/lib/cms/user-mutations';
import { type ActionResult } from '@/lib/cms/validation';

function refreshUserRoutes() {
  updateTag('content');
  revalidatePath('/admin');
  revalidatePath('/admin/users');
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function createUserAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = adminCreateUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const actor = await requireCapability('manageUsers');
    const user = await createUserRecord(actor, parsed.data);
    refreshUserRoutes();
    return {
      ok: true,
      data: { id: user.id },
      message: 'User created.',
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'The user could not be created.'),
    };
  }
}

export async function updateUserAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = adminUpdateUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const actor = await requireCapability('manageUsers');
    const user = await updateUserRecord(actor, parsed.data);
    refreshUserRoutes();
    revalidatePath(`/admin/users/${user.id}`);
    return {
      ok: true,
      data: { id: user.id },
      message: 'User updated.',
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'The user could not be updated.'),
    };
  }
}

export async function deleteUserAction(input: unknown): Promise<ActionResult> {
  const parsed = adminDeleteUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Review the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const actor = await requireCapability('manageUsers');
    await deleteUserRecord(actor, parsed.data);
    refreshUserRoutes();
    return {
      ok: true,
      data: undefined,
      message: 'User deleted.',
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'The user could not be deleted.'),
    };
  }
}

export async function bulkUpdateUserRolesAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const parsed = adminBulkUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Select users and a role, then try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const actor = await requireCapability('manageUsers');
    const result = await bulkUpdateUserRolesRecord(actor, parsed.data);
    refreshUserRoutes();
    return {
      ok: true,
      data: { count: result.count },
      message: `${result.count} user${result.count === 1 ? '' : 's'} updated.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(
        error,
        'The selected users could not be updated.'
      ),
    };
  }
}
