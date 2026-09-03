import 'server-only';

import { CommentPolicy, CommentStatus, ContentStatus } from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';
import { sanitizePlainText } from '@/lib/cms/sanitize';

import { getSiteSettings } from './site-settings';

export async function submitPublicComment(input: {
  contentId: string;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  body: string;
  parentId?: string;
  honeypot?: string;
}) {
  if (input.honeypot?.trim()) {
    return { ok: true as const, message: 'Comment submitted for review.' };
  }

  const content = await prisma.content.findFirst({
    where: {
      id: input.contentId,
      status: ContentStatus.PUBLISHED,
      deletedAt: null,
      commentPolicy: CommentPolicy.OPEN,
    },
    select: { id: true },
  });

  if (!content) {
    throw new Error('Comments are closed for this content.');
  }

  if (input.parentId) {
    const parent = await prisma.comment.findFirst({
      where: {
        id: input.parentId,
        contentId: input.contentId,
        status: CommentStatus.APPROVED,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!parent) {
      throw new Error('The comment you replied to is unavailable.');
    }
  }

  const settings = await getSiteSettings();
  const initialStatus =
    settings.defaultCommentStatus === CommentPolicy.OPEN
      ? CommentStatus.PENDING
      : CommentStatus.PENDING;

  await prisma.comment.create({
    data: {
      contentId: input.contentId,
      parentId: input.parentId ?? null,
      status: initialStatus,
      body: sanitizePlainText(input.body) ?? '',
      authorName: sanitizePlainText(input.authorName) ?? 'Anonymous',
      authorEmail: input.authorEmail.trim().toLowerCase(),
      authorUrl: sanitizePlainText(input.authorUrl) ?? null,
    },
  });

  return {
    ok: true as const,
    message: 'Comment submitted for review.',
  };
}
