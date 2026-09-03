import 'server-only';

import { CommentStatus, type UserRole } from '@/app/generated/prisma/client';
import { hasCapability } from '@/lib/auth/capabilities';
import prisma from '@/lib/prisma';

type Actor = {
  id: string;
  role: UserRole;
};

export async function listCommentsForAdmin({
  page = 1,
  pageSize = 20,
  search,
  status,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CommentStatus;
}) {
  const where = {
    ...(status
      ? {
          status,
          ...(status === CommentStatus.TRASH
            ? { deletedAt: { not: null } }
            : { deletedAt: null }),
        }
      : {
          status: { not: CommentStatus.TRASH },
          deletedAt: null,
        }),
    ...(search
      ? {
          OR: [
            { body: { contains: search, mode: 'insensitive' as const } },
            { authorName: { contains: search, mode: 'insensitive' as const } },
            { authorEmail: { contains: search, mode: 'insensitive' as const } },
            {
              content: {
                title: { contains: search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        body: true,
        status: true,
        authorName: true,
        authorEmail: true,
        createdAt: true,
        parentId: true,
        content: {
          select: {
            id: true,
            title: true,
            type: true,
            slug: true,
          },
        },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCommentForModeration(actor: Actor, id: string) {
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      content: { select: { id: true, title: true } },
      parent: { select: { id: true, authorName: true } },
    },
  });

  if (!comment || !hasCapability(actor.role, 'moderateComments')) {
    return null;
  }

  return comment;
}
