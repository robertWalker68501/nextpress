import 'server-only';

import { cacheTag } from 'next/cache';

import prisma from '@/lib/prisma';
import { buildPageSlugPath } from '@/lib/cms/page-path';
import { getContentPublicUrl, isAdminPublicPath } from '@/lib/cms/public-urls';

export type PublicMenuItem = {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
  children: PublicMenuItem[];
};

export type PublicMenu = {
  id: string;
  name: string;
  slug: string;
  items: PublicMenuItem[];
};

function buildMenuTree(
  items: Array<{
    id: string;
    label: string;
    sortOrder: number;
    openInNewTab: boolean;
    parentId: string | null;
    url: string | null;
    content: {
      slug: string;
      type: 'POST' | 'PAGE';
      parent: { slug: string; parent: { slug: string } | null } | null;
    } | null;
  }>
): PublicMenuItem[] {
  const byParent = new Map<string | null, typeof items>();

  for (const item of items) {
    const bucket = byParent.get(item.parentId) ?? [];
    bucket.push(item);
    byParent.set(item.parentId, bucket);
  }

  function resolveHref(item: (typeof items)[number]) {
    if (item.url) return item.url;
    if (!item.content) return '#';

    const slugPath =
      item.content.type === 'PAGE'
        ? buildPageSlugPath(item.content)
        : undefined;

    return getContentPublicUrl(item.content.type, item.content.slug, slugPath);
  }

  function mapItems(parentId: string | null): PublicMenuItem[] {
    const siblings = byParent.get(parentId) ?? [];
    return siblings
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        id: item.id,
        label: item.label,
        href: resolveHref(item),
        openInNewTab: item.openInNewTab,
        children: mapItems(item.id),
      }))
      .filter((item) => !isAdminPublicPath(item.href));
  }

  return mapItems(null);
}

export function withoutAdminMenuItems(
  items: PublicMenuItem[]
): PublicMenuItem[] {
  return items
    .filter(
      (item) =>
        !isAdminPublicPath(item.href) &&
        item.label.trim().toLowerCase() !== 'admin'
    )
    .map((item) => ({
      ...item,
      children: withoutAdminMenuItems(item.children),
    }));
}

export async function getPublicMenuBySlug(
  slug: string
): Promise<PublicMenu | null> {
  'use cache';
  cacheTag('menus', `menus:${slug}`);

  const menu = await prisma.menu.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          label: true,
          sortOrder: true,
          openInNewTab: true,
          parentId: true,
          url: true,
          content: {
            select: {
              slug: true,
              type: true,
              parent: {
                select: {
                  slug: true,
                  parent: { select: { slug: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!menu) return null;

  return {
    id: menu.id,
    name: menu.name,
    slug: menu.slug,
    items: buildMenuTree(menu.items),
  };
}

export async function listMenusForAdmin() {
  return prisma.menu.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { items: true } },
    },
  });
}

export async function getMenuForAdmin(menuId: string) {
  const [menu, pages, posts] = await Promise.all([
    prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        items: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            label: true,
            sortOrder: true,
            openInNewTab: true,
            parentId: true,
            url: true,
            contentId: true,
          },
        },
      },
    }),
    prisma.content.findMany({
      where: {
        type: 'PAGE',
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    }),
    prisma.content.findMany({
      where: {
        type: 'POST',
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    }),
  ]);

  if (!menu) return null;

  return { menu, pages, posts };
}
