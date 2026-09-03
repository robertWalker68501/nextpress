import { describe, expect, it } from 'vitest';

import { getBlogUrl, parseBlogPageSize } from '@/lib/cms/blog';
import {
  authorSlugFromName,
  getCategoryUrl,
  getPageUrl,
  getPostUrl,
  getSearchUrl,
} from '@/lib/cms/public-urls';

describe('public urls', () => {
  it('builds post and page urls', () => {
    expect(getPostUrl('hello-nextpress')).toBe('/hello-nextpress');
    expect(getPageUrl(['about', 'team'])).toBe('/about/team');
  });

  it('builds archive and search urls', () => {
    expect(getCategoryUrl('news')).toBe('/category/news');
    expect(getSearchUrl('hello world')).toBe('/search?q=hello%20world');
    expect(getBlogUrl()).toBe('/blog');
    expect(getBlogUrl({ page: 2, perPage: 20, defaultPerPage: 10 })).toBe(
      '/blog?page=2&perPage=20'
    );
    expect(parseBlogPageSize('20', 10)).toBe(20);
    expect(parseBlogPageSize('7', 10)).toBe(10);
  });

  it('slugifies author names', () => {
    expect(authorSlugFromName('Jane Doe')).toBe('jane-doe');
  });
});
