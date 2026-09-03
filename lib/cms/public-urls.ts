import { ContentType } from '@/app/generated/prisma/client';

export function getPostUrl(slug: string) {
  return `/${slug}`;
}

export function getPageUrl(slugPath: string[]) {
  return `/${slugPath.join('/')}`;
}

export function getCategoryUrl(slug: string) {
  return `/category/${slug}`;
}

export function getTagUrl(slug: string) {
  return `/tag/${slug}`;
}

export function getAuthorUrl(slug: string) {
  return `/author/${slug}`;
}

export function getSearchUrl(query?: string) {
  if (!query?.trim()) return '/search';
  return `/search?q=${encodeURIComponent(query.trim())}`;
}

export function authorSlugFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getContentPublicUrl(
  type: ContentType,
  slug: string,
  slugPath?: string[]
) {
  if (type === ContentType.PAGE) {
    return getPageUrl(slugPath?.length ? slugPath : [slug]);
  }

  return getPostUrl(slug);
}
