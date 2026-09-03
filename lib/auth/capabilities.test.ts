import { describe, expect, it } from 'vitest';

import { ContentStatus, UserRole } from '@/app/generated/prisma/client';

import {
  canEditContent,
  canPublishContent,
  hasCapability,
} from './capabilities';

describe('role capabilities', () => {
  it('gives administrators site-management access', () => {
    expect(hasCapability(UserRole.ADMINISTRATOR, 'manageUsers')).toBe(true);
    expect(hasCapability(UserRole.ADMINISTRATOR, 'manageSettings')).toBe(true);
    expect(hasCapability(UserRole.ADMINISTRATOR, 'manageMenus')).toBe(true);
  });

  it('limits subscribers to public-site access', () => {
    expect(hasCapability(UserRole.SUBSCRIBER, 'accessAdmin')).toBe(false);
    expect(hasCapability(UserRole.SUBSCRIBER, 'editContent')).toBe(false);
  });

  it('allows contributors to edit only their own unpublished content', () => {
    const contributor = { id: 'author-1', role: UserRole.CONTRIBUTOR };

    expect(
      canEditContent(contributor, {
        authorId: 'author-1',
        status: ContentStatus.DRAFT,
      })
    ).toBe(true);
    expect(
      canEditContent(contributor, {
        authorId: 'author-1',
        status: ContentStatus.PUBLISHED,
      })
    ).toBe(false);
    expect(
      canEditContent(contributor, {
        authorId: 'author-2',
        status: ContentStatus.DRAFT,
      })
    ).toBe(false);
  });

  it('allows editors to publish content from other authors', () => {
    expect(
      canPublishContent(
        { id: 'editor-1', role: UserRole.EDITOR },
        { authorId: 'author-1', status: ContentStatus.PENDING_REVIEW }
      )
    ).toBe(true);
  });
});
