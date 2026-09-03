import 'server-only';

import {
  ContentStatus,
  ContentType,
  Prisma,
  TermType,
  UserRole,
  type UserRole as UserRoleType,
} from '@/app/generated/prisma/client';
import { canDeleteContent, canEditContent } from '@/lib/auth/capabilities';
import prisma from '@/lib/prisma';

import { normalizeSlug } from './slug';
import { sanitizeContentHtml, sanitizePlainText } from './sanitize';
import type { ContentEditorInput } from './validation';
import { canTransitionContent, deriveWorkflowDates } from './workflow';

type Actor = {
  id: string;
  role: UserRoleType;
};

async function getUniqueSlug(
  tx: Prisma.TransactionClient,
  type: ContentType,
  requestedSlug: string,
  currentId?: string
) {
  const baseSlug = normalizeSlug(requestedSlug);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await tx.content.findUnique({
      where: { type_slug: { type, slug: candidate } },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) return candidate;

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function validateParent(
  tx: Prisma.TransactionClient,
  type: ContentType,
  parentId: string | null,
  contentId?: string
) {
  if (type === ContentType.POST || !parentId) return null;
  if (parentId === contentId) {
    throw new Error('A page cannot be its own parent.');
  }

  let currentId: string | null = parentId;
  while (currentId) {
    const parent: {
      id: string;
      parentId: string | null;
      type: ContentType;
    } | null = await tx.content.findUnique({
      where: { id: currentId },
      select: { id: true, parentId: true, type: true },
    });

    if (!parent || parent.type !== ContentType.PAGE) {
      throw new Error('Select a valid parent page.');
    }
    if (parent.id === contentId) {
      throw new Error('Page hierarchy cannot contain a cycle.');
    }
    currentId = parent.parentId;
  }

  return parentId;
}

async function resolveTermIds(
  tx: Prisma.TransactionClient,
  categoryIds: string[],
  tagNames: string[]
) {
  const categories = await tx.term.findMany({
    where: {
      id: { in: categoryIds },
      type: TermType.CATEGORY,
    },
    select: { id: true },
  });

  const normalizedTagNames = [
    ...new Set(tagNames.map((name) => name.trim()).filter(Boolean)),
  ];
  const tags: string[] = [];

  for (const name of normalizedTagNames) {
    const slug = normalizeSlug(name);
    const tag = await tx.term.upsert({
      where: { type_slug: { type: TermType.TAG, slug } },
      create: { type: TermType.TAG, name, slug },
      update: { name },
      select: { id: true },
    });
    tags.push(tag.id);
  }

  return [...new Set([...categories.map(({ id }) => id), ...tags])];
}

async function resolveFeaturedMediaId(
  tx: Prisma.TransactionClient,
  actor: Actor,
  input: ContentEditorInput['featuredImage']
) {
  const file = input[0];
  if (!file) return null;

  const existing = await tx.media.findUnique({
    where: { storageKey: file.key },
    select: { id: true, uploadedById: true },
  });

  if (
    existing &&
    existing.uploadedById !== actor.id &&
    actor.role !== UserRole.ADMINISTRATOR &&
    actor.role !== UserRole.EDITOR
  ) {
    throw new Error('You cannot use this media file.');
  }

  const media = await tx.media.upsert({
    where: { storageKey: file.key },
    create: {
      storageKey: file.key,
      url: file.url,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      uploadedById: actor.id,
    },
    update: {
      url: file.url,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      deletedAt: null,
    },
    select: { id: true },
  });

  return media.id;
}

export async function saveContentRecord(
  actor: Actor,
  input: ContentEditorInput
) {
  return prisma.$transaction(
    async (tx) => {
      const existing = input.id
        ? await tx.content.findUnique({ where: { id: input.id } })
        : null;

      if (input.id && !existing) throw new Error('Content was not found.');
      if (existing && !canEditContent(actor, existing)) {
        throw new Error('You cannot edit this content.');
      }
      if (existing && !canTransitionContent(actor, existing, input.status)) {
        throw new Error('You cannot apply the selected publishing status.');
      }

      const initialSubject = {
        authorId: actor.id,
        status: ContentStatus.DRAFT,
      };
      if (
        !existing &&
        input.status !== ContentStatus.DRAFT &&
        !canTransitionContent(actor, initialSubject, input.status)
      ) {
        throw new Error('You cannot create content with this status.');
      }

      const type = existing?.type ?? input.type;
      if (existing && existing.type !== input.type) {
        throw new Error('Content type cannot be changed.');
      }

      const slug = await getUniqueSlug(
        tx,
        type,
        input.slug || input.title,
        existing?.id
      );
      const parentId = await validateParent(
        tx,
        type,
        input.parentId ?? null,
        existing?.id
      );
      const scheduledAt = input.scheduledAt
        ? new Date(input.scheduledAt)
        : null;
      const workflow = deriveWorkflowDates({
        currentStatus: existing?.status ?? ContentStatus.DRAFT,
        nextStatus: input.status,
        currentPublishedAt: existing?.publishedAt,
        scheduledAt,
      });
      const termIds = await resolveTermIds(
        tx,
        input.categoryIds,
        input.tagNames
      );
      const featuredMediaId = await resolveFeaturedMediaId(
        tx,
        actor,
        input.featuredImage
      );
      const data = {
        title: input.title.trim(),
        slug,
        excerpt: sanitizePlainText(input.excerpt),
        body: sanitizeContentHtml(input.body),
        commentPolicy: input.commentPolicy,
        parentId,
        featuredMediaId,
        ...workflow,
      };

      const content = existing
        ? await tx.content.update({
            where: { id: existing.id },
            data,
          })
        : await tx.content.create({
            data: {
              ...data,
              type,
              authorId: actor.id,
            },
          });

      await tx.contentTerm.deleteMany({
        where: { contentId: content.id },
      });
      if (termIds.length > 0) {
        await tx.contentTerm.createMany({
          data: termIds.map((termId) => ({
            contentId: content.id,
            termId,
          })),
          skipDuplicates: true,
        });
      }

      const latestRevision = await tx.contentRevision.aggregate({
        where: { contentId: content.id },
        _max: { revisionNumber: true },
      });
      await tx.contentRevision.create({
        data: {
          contentId: content.id,
          revisionNumber: (latestRevision._max.revisionNumber ?? 0) + 1,
          title: content.title,
          excerpt: content.excerpt,
          body: content.body,
          statusSnapshot: content.status,
          authorId: actor.id,
        },
      });

      return content;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 10_000,
    }
  );
}

export async function trashContentRecord(actor: Actor, id: string) {
  const content = await prisma.content.findUnique({ where: { id } });
  if (!content || !canDeleteContent(actor, content)) {
    throw new Error('You cannot move this content to trash.');
  }

  const workflow = deriveWorkflowDates({
    currentStatus: content.status,
    nextStatus: ContentStatus.TRASH,
    currentPublishedAt: content.publishedAt,
  });

  return prisma.content.update({
    where: { id },
    data: {
      ...workflow,
      slug: `${content.slug}-trash-${content.id.slice(-6)}`,
    },
  });
}

export async function restoreContentRecord(actor: Actor, id: string) {
  return prisma.$transaction(async (tx) => {
    const content = await tx.content.findUnique({ where: { id } });
    if (
      !content ||
      content.status !== ContentStatus.TRASH ||
      !canDeleteContent(actor, content)
    ) {
      throw new Error('You cannot restore this content.');
    }

    const trashSuffix = `-trash-${content.id.slice(-6)}`;
    const baseSlug = content.slug.endsWith(trashSuffix)
      ? content.slug.slice(0, -trashSuffix.length)
      : content.slug;
    const slug = await getUniqueSlug(tx, content.type, baseSlug, content.id);

    return tx.content.update({
      where: { id },
      data: {
        slug,
        status: ContentStatus.DRAFT,
        deletedAt: null,
        scheduledAt: null,
      },
    });
  });
}

export async function permanentlyDeleteContentRecord(actor: Actor, id: string) {
  const content = await prisma.content.findUnique({ where: { id } });
  if (
    !content ||
    content.status !== ContentStatus.TRASH ||
    actor.role !== UserRole.ADMINISTRATOR
  ) {
    throw new Error(
      'Only administrators can permanently delete trashed content.'
    );
  }

  await prisma.content.delete({ where: { id } });
}

export async function restoreRevisionRecord(
  actor: Actor,
  contentId: string,
  revisionId: string
) {
  return prisma.$transaction(
    async (tx) => {
      const content = await tx.content.findUnique({
        where: { id: contentId },
      });
      if (!content || !canEditContent(actor, content)) {
        throw new Error('You cannot restore revisions for this content.');
      }

      const revision = await tx.contentRevision.findFirst({
        where: { id: revisionId, contentId },
      });
      if (!revision) throw new Error('Revision was not found.');

      const latestRevision = await tx.contentRevision.aggregate({
        where: { contentId },
        _max: { revisionNumber: true },
      });
      const updated = await tx.content.update({
        where: { id: contentId },
        data: {
          title: revision.title,
          excerpt: revision.excerpt,
          body: revision.body,
        },
      });

      await tx.contentRevision.create({
        data: {
          contentId,
          revisionNumber: (latestRevision._max.revisionNumber ?? 0) + 1,
          title: updated.title,
          excerpt: updated.excerpt,
          body: updated.body,
          statusSnapshot: updated.status,
          authorId: actor.id,
        },
      });

      return updated;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 10_000,
    }
  );
}

export async function publishDueScheduledContent(asOf = new Date()) {
  return prisma.content.updateManyAndReturn({
    where: {
      status: ContentStatus.SCHEDULED,
      scheduledAt: { lte: asOf },
      deletedAt: null,
    },
    data: {
      status: ContentStatus.PUBLISHED,
      publishedAt: asOf,
      scheduledAt: null,
    },
    select: {
      id: true,
      slug: true,
      type: true,
    },
  });
}
