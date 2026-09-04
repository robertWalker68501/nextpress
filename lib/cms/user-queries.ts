import 'server-only';

import { UserRole } from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';

import { countOwnedRecords } from './user-management';

const userSelect = {
  id: true,
  name: true,
  displayName: true,
  email: true,
  emailVerified: true,
  role: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      authoredContent: true,
      contentRevisions: true,
      uploadedMedia: true,
    },
  },
} as const;

export async function listUsersForAdmin({
  page = 1,
  pageSize = 20,
  search,
  role,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
}) {
  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { displayName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: userSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      ownedRecordCount: countOwnedRecords(item._count),
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getUserForAdmin(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) return null;

  return {
    ...user,
    ownedRecordCount: countOwnedRecords(user._count),
  };
}

export async function listUsersForReassignment(excludeId?: string) {
  const users = await prisma.user.findMany({
    where: excludeId ? { id: { not: excludeId } } : {},
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
    },
  });

  return users.map((user) => ({
    id: user.id,
    label: `${user.displayName ?? user.name} (${user.email})`,
  }));
}
