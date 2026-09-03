export const BLOG_PAGE_SLUG = 'blog';

export const BLOG_PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 50] as const;

export type BlogPageSize = (typeof BLOG_PAGE_SIZE_OPTIONS)[number];

export function parseBlogPageSize(
  value: string | undefined,
  fallback: number
): BlogPageSize {
  const parsed = Number.parseInt(value ?? '', 10);
  if (BLOG_PAGE_SIZE_OPTIONS.includes(parsed as BlogPageSize)) {
    return parsed as BlogPageSize;
  }

  if (BLOG_PAGE_SIZE_OPTIONS.includes(fallback as BlogPageSize)) {
    return fallback as BlogPageSize;
  }

  return 10;
}

export function getBlogUrl({
  page = 1,
  perPage,
  defaultPerPage = 10,
}: {
  page?: number;
  perPage?: number;
  defaultPerPage?: number;
} = {}) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (perPage && perPage !== defaultPerPage) {
    params.set('perPage', String(perPage));
  }

  const search = params.toString();
  return search ? `/blog?${search}` : '/blog';
}
