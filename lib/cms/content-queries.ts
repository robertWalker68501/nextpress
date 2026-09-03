import 'server-only';

import {
  ContentStatus,
  ContentType,
  TermType,
  type UserRole,
} from '@/app/generated/prisma/client';
import { canEditContent, hasCapability } from '@/lib/auth/capabilities';
import prisma from '@/lib/prisma';

type Actor = {
  id: string;
  role: UserRole;
};

export async function listContentForAdmin({
  actor,
  type,
  page = 1,
  pageSize = 20,
  search,
  status,
}: {
  actor: Actor;
  type: ContentType;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ContentStatus;
}) {
  const where = {
    type,
    ...(!hasCapability(actor.role, 'editOthersContent')
      ? { authorId: actor.id }
      : {}),
    ...(status
      ? {
          status,
          ...(status === ContentStatus.TRASH
            ? { deletedAt: { not: null } }
            : { deletedAt: null }),
        }
      : {
          status: { not: ContentStatus.TRASH },
          deletedAt: null,
        }),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        publishedAt: true,
        authorId: true,
        author: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getContentForEditor(actor: Actor, id: string) {
  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      terms: {
        include: { term: true },
      },
      featuredMedia: true,
    },
  });

  if (!content || !canEditContent(actor, content)) return null;
  return content;
}

export async function getContentRevisions(contentId: string) {
  return prisma.contentRevision.findMany({
    where: { contentId },
    orderBy: { revisionNumber: 'desc' },
    take: 20,
    include: {
      author: {
        select: { name: true, displayName: true },
      },
    },
  });
}

export async function getEditorOptions(type: ContentType, currentId?: string) {
  const [categories, parentPages] = await Promise.all([
    type === ContentType.POST
      ? prisma.term.findMany({
          where: { type: TermType.CATEGORY },
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    type === ContentType.PAGE
      ? prisma.content.findMany({
          where: {
            type: ContentType.PAGE,
            status: { not: ContentStatus.TRASH },
            deletedAt: null,
            ...(currentId ? { id: { not: currentId } } : {}),
          },
          orderBy: { title: 'asc' },
          select: { id: true, title: true },
        })
      : Promise.resolve([]),
  ]);

  return { categories, parentPages };
}
