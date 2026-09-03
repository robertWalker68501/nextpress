import { getPageUrl } from '@/lib/cms/public-urls';

type PagePathNode = {
  slug: string;
  parent?: PagePathNode | null;
};

export function buildPageSlugPath(content: PagePathNode) {
  const parts = [content.slug];
  let current = content.parent;

  while (current) {
    parts.unshift(current.slug);
    current = current.parent;
  }

  return parts;
}

export function buildPagePublicPath(content: PagePathNode) {
  return getPageUrl(buildPageSlugPath(content));
}
