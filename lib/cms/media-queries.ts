import 'server-only';

import { type UserRole } from '@/app/generated/prisma/client';
import { hasCapability } from '@/lib/auth/capabilities';
import prisma from '@/lib/prisma';

type Actor = {
  id: string;
  role: UserRole;
};

export type MediaTypeFilter = 'all' | 'image' | 'video' | 'audio' | 'document';

function getMimeFilter(type: MediaTypeFilter) {
  switch (type) {
    case 'image':
      return { mimeType: { startsWith: 'image/' } };
    case 'video':
      return { mimeType: { startsWith: 'video/' } };
    case 'audio':
      return { mimeType: { startsWith: 'audio/' } };
    case 'document':
      return {
        NOT: {
          OR: [
            { mimeType: { startsWith: 'image/' } },
            { mimeType: { startsWith: 'video/' } },
            { mimeType: { startsWith: 'audio/' } },
          ],
        },
      };
    default:
      return {};
  }
}

export async function listMediaForAdmin({
  actor,
  page = 1,
  pageSize = 24,
  search,
  type = 'all',
  includeTrash = false,
}: {
  actor: Actor;
  page?: number;
  pageSize?: number;
  search?: string;
  type?: MediaTypeFilter;
  includeTrash?: boolean;
}) {
  const where = {
    ...(includeTrash ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(!hasCapability(actor.role, 'editOthersContent')
      ? { uploadedById: actor.id }
      : {}),
    ...getMimeFilter(type),
    ...(search
      ? {
          OR: [
            { filename: { contains: search, mode: 'insensitive' as const } },
            { altText: { contains: search, mode: 'insensitive' as const } },
            { caption: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        filename: true,
        url: true,
        mimeType: true,
        sizeBytes: true,
        altText: true,
        caption: true,
        description: true,
        width: true,
        height: true,
        createdAt: true,
        deletedAt: true,
        uploadedBy: {
          select: { name: true, displayName: true },
        },
        _count: {
          select: {
            featuredOn: true,
            menuItems: true,
          },
        },
      },
    }),
    prisma.media.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getMediaForEdit(actor: Actor, id: string) {
  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      uploadedBy: { select: { id: true, name: true, displayName: true } },
      _count: { select: { featuredOn: true, menuItems: true } },
    },
  });

  if (!media) return null;
  if (
    media.uploadedById !== actor.id &&
    !hasCapability(actor.role, 'editOthersContent')
  ) {
    return null;
  }

  return media;
}
