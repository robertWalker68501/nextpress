import { describe, expect, it } from 'vitest';

import {
  publicCommentSchema,
  siteSettingsSchema,
  termEditorSchema,
} from './validation';

describe('CMS validation schemas', () => {
  it('accepts valid site settings', () => {
    const result = siteSettingsSchema.safeParse({
      siteTitle: 'NextPress',
      siteTagline: 'Publishing',
      siteDescription: 'A CMS',
      postsPerPage: 10,
      defaultCommentStatus: 'OPEN',
      dateFormat: 'MMMM d, yyyy',
      permalinkStructure: '/%postname%/',
      showOnFront: 'posts',
      pageOnFront: null,
      socialTwitter: '',
      socialFacebook: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid term slugs', () => {
    const result = termEditorSchema.safeParse({
      type: 'CATEGORY',
      name: 'News',
      slug: 'Invalid Slug',
    });

    expect(result.success).toBe(false);
  });

  it('rejects public comments with invalid email', () => {
    const result = publicCommentSchema.safeParse({
      contentId: 'content-1',
      authorName: 'Reader',
      authorEmail: 'not-an-email',
      body: 'Hello',
    });

    expect(result.success).toBe(false);
  });
});
