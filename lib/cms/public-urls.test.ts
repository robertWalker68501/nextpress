import { describe, expect, it } from 'vitest';

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
  });

  it('slugifies author names', () => {
    expect(authorSlugFromName('Jane Doe')).toBe('jane-doe');
  });
});
