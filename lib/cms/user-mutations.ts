import 'server-only';

import { createLocalAccountIssuer } from '@better-auth/core/db';
import { generateRandomString, hashPassword } from 'better-auth/crypto';

import { UserRole } from '@/app/generated/prisma/client';
import { hasCapability } from '@/lib/auth/capabilities';
import type {
  AdminBulkUserRoleInput,
  AdminCreateUserInput,
  AdminDeleteUserInput,
  AdminUpdateUserInput,
} from '@/lib/auth/validation';
import prisma from '@/lib/prisma';

import {
  getBulkRoleChangeError,
  getLastAdministratorError,
  getReassignmentError,
  getSelfDeleteError,
} from './user-management';

type Actor = {
  id: string;
  role: UserRole;
};

function assertCanManageUsers(actor: Actor) {
  if (!hasCapability(actor.role, 'manageUsers')) {
    throw new Error('You cannot manage users.');
  }
}

function createAuthId() {
  return generateRandomString(32, 'a-z', 'A-Z', '0-9');
}

function isUniqueEmailError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

async function setCredentialPassword(userId: string, password: string) {
  const hashedPassword = await hashPassword(password);
  const issuer = createLocalAccountIssuer('credential');
  const existing = await prisma.account.findFirst({
    where: {
      userId,
      providerId: 'credential',
      issuer,
    },
  });

  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: { password: hashedPassword },
    });
    return;
  }

  await prisma.account.create({
    data: {
      id: createAuthId(),
      issuer,
      providerId: 'credential',
      accountId: userId,
      userId,
      password: hashedPassword,
    },
  });
}

async function revokeUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function createUserRecord(
  actor: Actor,
  input: AdminCreateUserInput
) {
  assertCanManageUsers(actor);

  const userId = createAuthId();
  const hashedPassword = await hashPassword(input.password);
  const issuer = createLocalAccountIssuer('credential');

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          name: input.name,
          email: input.email,
          emailVerified: true,
          role: input.role,
          displayName: input.displayName.trim() || null,
          bio: input.bio.trim() || null,
        },
      });

      await tx.account.create({
        data: {
          id: createAuthId(),
          issuer,
          providerId: 'credential',
          accountId: user.id,
          userId: user.id,
          password: hashedPassword,
        },
      });

      return user;
    });
  } catch (error) {
    if (isUniqueEmailError(error)) {
      throw new Error('A user with that email address already exists.');
    }

    throw error;
  }
}

export async function updateUserRecord(
  actor: Actor,
  input: AdminUpdateUserInput
) {
  assertCanManageUsers(actor);

  const target = await prisma.user.findUnique({
    where: { id: input.id },
    select: { id: true, role: true },
  });

  if (!target) {
    throw new Error('User was not found.');
  }

  const administratorCount = await prisma.user.count({
    where: { role: UserRole.ADMINISTRATOR },
  });
  const lastAdministratorError = getLastAdministratorError({
    targetRole: target.role,
    nextRole: input.role,
    administratorCount,
  });

  if (lastAdministratorError) {
    throw new Error(lastAdministratorError);
  }

  try {
    const user = await prisma.user.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        displayName: input.displayName.trim() || null,
        bio: input.bio.trim() || null,
        emailVerified: input.emailVerified,
      },
    });

    const passwordChanged = Boolean(input.password);
    if (passwordChanged && input.password) {
      await setCredentialPassword(user.id, input.password);
    }

    if (passwordChanged && user.id !== actor.id) {
      await revokeUserSessions(user.id);
    }

    return user;
  } catch (error) {
    if (isUniqueEmailError(error)) {
      throw new Error('A user with that email address already exists.');
    }

    throw error;
  }
}

export async function deleteUserRecord(
  actor: Actor,
  input: AdminDeleteUserInput
) {
  assertCanManageUsers(actor);

  const selfDeleteError = getSelfDeleteError(actor.id, input.id);
  if (selfDeleteError) {
    throw new Error(selfDeleteError);
  }

  const target = await prisma.user.findUnique({
    where: { id: input.id },
    select: {
      id: true,
      role: true,
      _count: {
        select: {
          authoredContent: true,
          contentRevisions: true,
          uploadedMedia: true,
        },
      },
    },
  });

  if (!target) {
    throw new Error('User was not found.');
  }

  const administratorCount = await prisma.user.count({
    where: { role: UserRole.ADMINISTRATOR },
  });
  const lastAdministratorError = getLastAdministratorError({
    targetRole: target.role,
    nextRole: null,
    administratorCount,
  });

  if (lastAdministratorError) {
    throw new Error(lastAdministratorError);
  }

  const ownedRecordCount =
    target._count.authoredContent +
    target._count.contentRevisions +
    target._count.uploadedMedia;
  const reassignmentError = getReassignmentError({
    ownedRecordCount,
    reassignToUserId: input.reassignToUserId,
    targetId: target.id,
  });

  if (reassignmentError) {
    throw new Error(reassignmentError);
  }

  if (input.reassignToUserId) {
    const recipient = await prisma.user.findUnique({
      where: { id: input.reassignToUserId },
      select: { id: true },
    });

    if (!recipient) {
      throw new Error('Choose a valid user to receive this content.');
    }
  }

  await prisma.$transaction(async (tx) => {
    if (input.reassignToUserId) {
      await Promise.all([
        tx.content.updateMany({
          where: { authorId: target.id },
          data: { authorId: input.reassignToUserId },
        }),
        tx.contentRevision.updateMany({
          where: { authorId: target.id },
          data: { authorId: input.reassignToUserId },
        }),
        tx.media.updateMany({
          where: { uploadedById: target.id },
          data: { uploadedById: input.reassignToUserId },
        }),
      ]);
    }

    await tx.user.delete({ where: { id: target.id } });
  });
}

export async function bulkUpdateUserRolesRecord(
  actor: Actor,
  input: AdminBulkUserRoleInput
) {
  assertCanManageUsers(actor);

  const targets = await prisma.user.findMany({
    where: { id: { in: input.ids } },
    select: { id: true, role: true },
  });
  const administratorCount = await prisma.user.count({
    where: { role: UserRole.ADMINISTRATOR },
  });
  const bulkError = getBulkRoleChangeError({
    targets,
    selectedIds: input.ids,
    nextRole: input.role,
    administratorCount,
  });

  if (bulkError) {
    throw new Error(bulkError);
  }

  return prisma.user.updateMany({
    where: { id: { in: input.ids } },
    data: { role: input.role },
  });
}
