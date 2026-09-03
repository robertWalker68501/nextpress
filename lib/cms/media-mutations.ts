import 'server-only';

import {
  UserRole,
  type UserRole as UserRoleType,
} from '@/app/generated/prisma/client';
import { hasCapability } from '@/lib/auth/capabilities';
import prisma from '@/lib/prisma';
import { deleteUploadedFile } from '@/lib/uploadthing-server';

import type { MediaEditorInput, MediaUploadInput } from './validation';

type Actor = {
  id: string;
  role: UserRoleType;
};

function canManageMedia(actor: Actor, uploadedById: string) {
  return (
    hasCapability(actor.role, 'uploadFiles') &&
    (actor.id === uploadedById ||
      hasCapability(actor.role, 'editOthersContent'))
  );
}

async function getReferenceCount(mediaId: string) {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: {
      _count: { select: { featuredOn: true, menuItems: true } },
    },
  });

  return (media?._count.featuredOn ?? 0) + (media?._count.menuItems ?? 0);
}

export async function registerUploadedFileRecord(
  uploadedById: string,
  file: {
    key: string;
    url: string;
    name: string;
    type?: string;
    size: number;
  }
) {
  return prisma.media.upsert({
    where: { storageKey: file.key },
    create: {
      storageKey: file.key,
      url: file.url,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      uploadedById,
    },
    update: {
      url: file.url,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      deletedAt: null,
    },
  });
}

export async function registerMediaRecords(
  actor: Actor,
  files: MediaUploadInput
) {
  if (!hasCapability(actor.role, 'uploadFiles')) {
    throw new Error('You cannot upload files.');
  }

  return prisma.$transaction(async (tx) => {
    const records = [];

    for (const file of files) {
      const existing = await tx.media.findUnique({
        where: { storageKey: file.key },
        select: { uploadedById: true },
      });

      if (existing && !canManageMedia(actor, existing.uploadedById)) {
        throw new Error('You cannot register this upload.');
      }

      records.push(
        await tx.media.upsert({
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
        })
      );
    }

    return records;
  });
}

export async function updateMediaRecord(actor: Actor, input: MediaEditorInput) {
  const media = await prisma.media.findUnique({ where: { id: input.id } });
  if (!media || !canManageMedia(actor, media.uploadedById)) {
    throw new Error('You cannot edit this media item.');
  }

  return prisma.media.update({
    where: { id: input.id },
    data: {
      altText: input.altText?.trim() || null,
      caption: input.caption?.trim() || null,
      description: input.description?.trim() || null,
    },
  });
}

export async function trashMediaRecord(actor: Actor, id: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media || !canManageMedia(actor, media.uploadedById)) {
    throw new Error('You cannot move this media item to trash.');
  }

  const references = await getReferenceCount(id);
  if (references > 0) {
    throw new Error(
      'This file is still attached to content or menus. Remove those references first.'
    );
  }

  return prisma.media.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restoreMediaRecord(actor: Actor, id: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (
    !media ||
    !media.deletedAt ||
    !canManageMedia(actor, media.uploadedById)
  ) {
    throw new Error('You cannot restore this media item.');
  }

  return prisma.media.update({
    where: { id },
    data: { deletedAt: null },
  });
}

export async function permanentlyDeleteMediaRecord(actor: Actor, id: string) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media || !media.deletedAt || actor.role !== UserRole.ADMINISTRATOR) {
    throw new Error(
      'Only administrators can permanently delete trashed media.'
    );
  }

  const references = await getReferenceCount(id);
  if (references > 0) {
    throw new Error('This file is still referenced elsewhere.');
  }

  await deleteUploadedFile(media.storageKey);
  await prisma.media.delete({ where: { id } });
}
