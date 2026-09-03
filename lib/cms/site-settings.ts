import 'server-only';

import { cacheTag } from 'next/cache';

import { CommentPolicy, ContentType } from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';

export const SITE_SETTING_KEYS = {
  siteTitle: 'site_title',
  siteTagline: 'site_tagline',
  siteDescription: 'site_description',
  postsPerPage: 'posts_per_page',
  defaultCommentStatus: 'default_comment_status',
  dateFormat: 'date_format',
  permalinkStructure: 'permalink_structure',
  showOnFront: 'show_on_front',
  pageOnFront: 'page_on_front',
  socialTwitter: 'social_twitter',
  socialFacebook: 'social_facebook',
} as const;

export type SiteSettings = {
  siteTitle: string;
  siteTagline: string;
  siteDescription: string;
  postsPerPage: number;
  defaultCommentStatus: CommentPolicy;
  dateFormat: string;
  permalinkStructure: string;
  showOnFront: 'posts' | 'page';
  pageOnFront: string | null;
  socialTwitter: string;
  socialFacebook: string;
};

const defaultSettings: SiteSettings = {
  siteTitle: 'NextPress',
  siteTagline: 'A modern publishing platform',
  siteDescription: 'A modern publishing platform and content management system.',
  postsPerPage: 10,
  defaultCommentStatus: CommentPolicy.OPEN,
  dateFormat: 'MMMM d, yyyy',
  permalinkStructure: '/%postname%/',
  showOnFront: 'posts',
  pageOnFront: null,
  socialTwitter: '',
  socialFacebook: '',
};

function parseSettingValue<T>(
  value: unknown,
  fallback: T,
  parser?: (value: unknown) => T | null
): T {
  if (parser) {
    const parsed = parser(value);
    return parsed ?? fallback;
  }

  return (value as T) ?? fallback;
}

function mapSettings(
  records: Array<{ key: string; value: unknown }>
): SiteSettings {
  const map = new Map(records.map((record) => [record.key, record.value]));

  return {
    siteTitle: parseSettingValue(
      map.get(SITE_SETTING_KEYS.siteTitle),
      defaultSettings.siteTitle,
      (value) => (typeof value === 'string' && value.trim() ? value : null)
    ),
    siteTagline: parseSettingValue(
      map.get(SITE_SETTING_KEYS.siteTagline),
      defaultSettings.siteTagline,
      (value) => (typeof value === 'string' ? value : null)
    ),
    siteDescription: parseSettingValue(
      map.get(SITE_SETTING_KEYS.siteDescription),
      defaultSettings.siteDescription,
      (value) => (typeof value === 'string' ? value : null)
    ),
    postsPerPage: parseSettingValue(
      map.get(SITE_SETTING_KEYS.postsPerPage),
      defaultSettings.postsPerPage,
      (value) =>
        typeof value === 'number' && Number.isFinite(value) && value > 0
          ? Math.min(Math.floor(value), 50)
          : null
    ),
    defaultCommentStatus:
      map.get(SITE_SETTING_KEYS.defaultCommentStatus) === CommentPolicy.CLOSED
        ? CommentPolicy.CLOSED
        : CommentPolicy.OPEN,
    dateFormat: parseSettingValue(
      map.get(SITE_SETTING_KEYS.dateFormat),
      defaultSettings.dateFormat,
      (value) => (typeof value === 'string' && value.trim() ? value : null)
    ),
    permalinkStructure: parseSettingValue(
      map.get(SITE_SETTING_KEYS.permalinkStructure),
      defaultSettings.permalinkStructure,
      (value) => (typeof value === 'string' && value.trim() ? value : null)
    ),
    showOnFront:
      map.get(SITE_SETTING_KEYS.showOnFront) === 'page' ? 'page' : 'posts',
    pageOnFront: parseSettingValue(
      map.get(SITE_SETTING_KEYS.pageOnFront),
      defaultSettings.pageOnFront,
      (value) => (typeof value === 'string' && value.trim() ? value : null)
    ),
    socialTwitter: parseSettingValue(
      map.get(SITE_SETTING_KEYS.socialTwitter),
      defaultSettings.socialTwitter,
      (value) => (typeof value === 'string' ? value : null)
    ),
    socialFacebook: parseSettingValue(
      map.get(SITE_SETTING_KEYS.socialFacebook),
      defaultSettings.socialFacebook,
      (value) => (typeof value === 'string' ? value : null)
    ),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  'use cache';
  cacheTag('settings');

  const records = await prisma.siteSetting.findMany({
    select: { key: true, value: true },
  });

  return mapSettings(records);
}

export async function getPublishedPageOptions() {
  return prisma.content.findMany({
    where: {
      type: ContentType.PAGE,
      status: 'PUBLISHED',
      deletedAt: null,
    },
    orderBy: { title: 'asc' },
    select: { id: true, title: true, slug: true },
  });
}

export async function updateSiteSettings(input: SiteSettings) {
  const entries = [
    { key: SITE_SETTING_KEYS.siteTitle, value: input.siteTitle.trim() },
    { key: SITE_SETTING_KEYS.siteTagline, value: input.siteTagline.trim() },
    {
      key: SITE_SETTING_KEYS.siteDescription,
      value: input.siteDescription.trim(),
    },
    { key: SITE_SETTING_KEYS.postsPerPage, value: input.postsPerPage },
    {
      key: SITE_SETTING_KEYS.defaultCommentStatus,
      value: input.defaultCommentStatus,
    },
    { key: SITE_SETTING_KEYS.dateFormat, value: input.dateFormat.trim() },
    {
      key: SITE_SETTING_KEYS.permalinkStructure,
      value: input.permalinkStructure.trim(),
    },
    { key: SITE_SETTING_KEYS.showOnFront, value: input.showOnFront },
    { key: SITE_SETTING_KEYS.pageOnFront, value: input.pageOnFront ?? '' },
    { key: SITE_SETTING_KEYS.socialTwitter, value: input.socialTwitter.trim() },
    {
      key: SITE_SETTING_KEYS.socialFacebook,
      value: input.socialFacebook.trim(),
    },
  ];

  await Promise.all(
    entries.map(({ key, value }) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );
}
