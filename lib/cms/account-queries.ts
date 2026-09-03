import 'server-only';

import {
  CommentStatus,
  ContentStatus,
  ContentType,
} from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';

export async function getAccountOverview(userId: string, email: string) {
  const commentOwner = {
    OR: [{ authorUserId: userId }, { authorEmail: email }],
  };

  const [posts, published, pendingReview, comments] = await Promise.all([
    prisma.content.count({
      where: {
        authorId: userId,
        type: ContentType.POST,
        deletedAt: null,
        status: { not: ContentStatus.TRASH },
      },
    }),
    prisma.content.count({
      where: {
        authorId: userId,
        type: ContentType.POST,
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
      },
    }),
    prisma.content.count({
      where: {
        authorId: userId,
        type: ContentType.POST,
        deletedAt: null,
        status: ContentStatus.PENDING_REVIEW,
      },
    }),
    prisma.comment.count({
      where: {
        ...commentOwner,
        deletedAt: null,
        status: { not: CommentStatus.TRASH },
      },
    }),
  ]);

  return { posts, published, pendingReview, comments };
}

export async function listAccountPosts(userId: string) {
  return prisma.content.findMany({
    where: {
      authorId: userId,
      type: ContentType.POST,
      deletedAt: null,
      status: { not: ContentStatus.TRASH },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      publishedAt: true,
    },
  });
}

export async function listAccountComments(userId: string, email: string) {
  return prisma.comment.findMany({
    where: {
      OR: [{ authorUserId: userId }, { authorEmail: email }],
      deletedAt: null,
      status: { not: CommentStatus.TRASH },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      body: true,
      status: true,
      createdAt: true,
      content: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
        },
      },
    },
  });
}
