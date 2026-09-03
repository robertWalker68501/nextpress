import 'server-only';

import prisma from '@/lib/prisma';

import type { MenuEditorInput } from './validation';

export async function saveMenuItemsRecord(menuId: string, input: MenuEditorInput) {
  const menu = await prisma.menu.findUnique({ where: { id: menuId } });
  if (!menu) throw new Error('Menu was not found.');

  await prisma.$transaction(async (tx) => {
    await tx.menuItem.deleteMany({ where: { menuId } });

    if (input.items.length === 0) return;

    const idMap = new Map<string, string>();

    for (const [index, item] of input.items.entries()) {
      const created = await tx.menuItem.create({
        data: {
          menuId,
          label: item.label.trim(),
          sortOrder: item.sortOrder ?? index,
          openInNewTab: item.openInNewTab ?? false,
          url: item.linkType === 'custom' ? item.url?.trim() || null : null,
          contentId: item.linkType === 'content' ? item.contentId ?? null : null,
        },
      });
      idMap.set(item.clientId, created.id);
    }

    for (const item of input.items) {
      if (!item.parentClientId) continue;
      const parentId = idMap.get(item.parentClientId);
      const itemId = idMap.get(item.clientId);
      if (!parentId || !itemId) continue;

      await tx.menuItem.update({
        where: { id: itemId },
        data: { parentId },
      });
    }
  });
}
