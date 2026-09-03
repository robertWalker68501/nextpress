import 'server-only';

import { TermType } from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';

import { normalizeSlug } from './slug';
import type { TermEditorInput } from './validation';

async function validateCategoryParent(
  parentId: string | null,
  termId?: string
) {
  if (!parentId) return null;
  if (parentId === termId) {
    throw new Error('A category cannot be its own parent.');
  }

  let currentId: string | null = parentId;
  while (currentId) {
    const parent: {
      id: string;
      parentId: string | null;
      type: TermType;
    } | null = await prisma.term.findUnique({
      where: { id: currentId },
      select: { id: true, parentId: true, type: true },
    });

    if (!parent || parent.type !== TermType.CATEGORY) {
      throw new Error('Select a valid parent category.');
    }
    if (parent.id === termId) {
      throw new Error('Category hierarchy cannot contain a cycle.');
    }
    currentId = parent.parentId;
  }

  return parentId;
}

export async function saveTermRecord(input: TermEditorInput) {
  const existing = input.id
    ? await prisma.term.findUnique({ where: { id: input.id } })
    : null;

  if (input.id && !existing) throw new Error('Term was not found.');
  if (existing && existing.type !== input.type) {
    throw new Error('Term type cannot be changed.');
  }

  const slug = normalizeSlug(input.slug || input.name);
  if (!slug) throw new Error('Enter a valid name or slug.');

  const duplicate = await prisma.term.findUnique({
    where: { type_slug: { type: input.type, slug } },
    select: { id: true },
  });
  if (duplicate && duplicate.id !== input.id) {
    throw new Error('That slug is already in use.');
  }

  const parentId =
    input.type === TermType.CATEGORY
      ? await validateCategoryParent(input.parentId ?? null, input.id)
      : null;
  const data = {
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
    parentId,
  };

  return existing
    ? prisma.term.update({ where: { id: existing.id }, data })
    : prisma.term.create({ data: { ...data, type: input.type } });
}

export async function deleteTermRecord(id: string) {
  const term = await prisma.term.findUnique({
    where: { id },
    include: {
      _count: {
        select: { contents: true, children: true },
      },
    },
  });

  if (!term) throw new Error('Term was not found.');
  if (term.type === TermType.CATEGORY && term.slug === 'uncategorized') {
    throw new Error('The default Uncategorized category cannot be deleted.');
  }
  if (term._count.contents > 0) {
    throw new Error('Remove this term from its content before deleting it.');
  }
  if (term._count.children > 0) {
    throw new Error('Reassign child categories before deleting this category.');
  }

  await prisma.term.delete({ where: { id } });
}
