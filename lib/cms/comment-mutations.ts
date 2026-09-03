import 'server-only';

import {
  CommentStatus,
  UserRole,
  type UserRole as UserRoleType,
} from '@/app/generated/prisma/client';
import { hasCapability } from '@/lib/auth/capabilities';
import prisma from '@/lib/prisma';

import type { CommentReplyInput } from './validation';

type Actor = {
  id: string;
  role: UserRoleType;
};

function assertModerator(actor: Actor) {
  if (!hasCapability(actor.role, 'moderateComments')) {
    throw new Error('You cannot moderate comments.');
  }
}

export async function updateCommentStatusRecord(
  actor: Actor,
  id: string,
  status: CommentStatus
) {
  assertModerator(actor);

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new Error('Comment was not found.');

  return prisma.comment.update({
    where: { id },
    data: {
      status,
      deletedAt: status === CommentStatus.TRASH ? new Date() : null,
      moderatedById: actor.id,
      moderatedAt: new Date(),
    },
  });
}

export async function restoreCommentRecord(actor: Actor, id: string) {
  assertModerator(actor);

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.status !== CommentStatus.TRASH) {
    throw new Error('You cannot restore this comment.');
  }

  return prisma.comment.update({
    where: { id },
    data: {
      status: CommentStatus.PENDING,
      deletedAt: null,
      moderatedById: actor.id,
      moderatedAt: new Date(),
    },
  });
}

export async function permanentlyDeleteCommentRecord(actor: Actor, id: string) {
  assertModerator(actor);

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (
    !comment ||
    comment.status !== CommentStatus.TRASH ||
    actor.role !== UserRole.ADMINISTRATOR
  ) {
    throw new Error(
      'Only administrators can permanently delete trashed comments.'
    );
  }

  await prisma.comment.delete({ where: { id } });
}

export async function replyToCommentRecord(
  actor: Actor,
  input: CommentReplyInput
) {
  assertModerator(actor);

  const parent = await prisma.comment.findUnique({
    where: { id: input.parentId },
    select: { id: true, contentId: true },
  });
  if (!parent) throw new Error('Comment was not found.');

  const user = await prisma.user.findUnique({
    where: { id: actor.id },
    select: { name: true, displayName: true, email: true },
  });
  if (!user) throw new Error('User was not found.');

  return prisma.comment.create({
    data: {
      contentId: parent.contentId,
      parentId: parent.id,
      status: CommentStatus.APPROVED,
      body: input.body.trim(),
      authorUserId: actor.id,
      authorName: user.displayName ?? user.name,
      authorEmail: user.email,
      moderatedById: actor.id,
      moderatedAt: new Date(),
    },
  });
}

export async function bulkUpdateCommentStatusRecord(
  actor: Actor,
  ids: string[],
  status: CommentStatus
) {
  assertModerator(actor);

  if (ids.length === 0) return { count: 0 };

  const result = await prisma.comment.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      deletedAt: status === CommentStatus.TRASH ? new Date() : null,
      moderatedById: actor.id,
      moderatedAt: new Date(),
    },
  });

  return { count: result.count };
}
