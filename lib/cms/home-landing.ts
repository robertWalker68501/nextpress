import 'server-only';

import { cacheTag } from 'next/cache';

import { ContentType } from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';

import type { PublicContent } from './public-queries';

export const HOME_PAGE_SLUG = 'home';

export const HOME_MEDIA_FILENAMES = {
  hero: 'home-hero.png',
  editorial: 'feature-editorial.png',
  media: 'feature-media.png',
  roles: 'feature-roles.png',
  stack: 'feature-stack.png',
  cta: 'home-cta.png',
} as const;

export type HomeLandingMedia = {
  url: string;
  altText: string | null;
  filename: string;
};

export function isHomeLandingPage(
  content: Pick<PublicContent, 'type' | 'slug'>
) {
  return content.type === ContentType.PAGE && content.slug === HOME_PAGE_SLUG;
}

export async function getHomeLandingMedia() {
  'use cache';
  cacheTag('media');

  const records = await prisma.media.findMany({
    where: {
      filename: { in: Object.values(HOME_MEDIA_FILENAMES) },
      deletedAt: null,
    },
    select: {
      filename: true,
      url: true,
      altText: true,
    },
  });

  return new Map<string, HomeLandingMedia>(
    records.map((record) => [record.filename, record])
  );
}
