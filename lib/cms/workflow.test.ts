import { describe, expect, it } from 'vitest';

import { ContentStatus, UserRole } from '@/app/generated/prisma/client';

import {
  canTransitionContent,
  deriveWorkflowDates,
  getAvailableStatuses,
} from './workflow';

const authorId = 'author-1';
const draft = {
  authorId,
  status: ContentStatus.DRAFT,
};

describe('content workflow permissions', () => {
  it('lets contributors submit their own drafts but not publish them', () => {
    const contributor = {
      id: authorId,
      role: UserRole.CONTRIBUTOR,
    };

    expect(
      canTransitionContent(contributor, draft, ContentStatus.PENDING_REVIEW)
    ).toBe(true);
    expect(
      canTransitionContent(contributor, draft, ContentStatus.PUBLISHED)
    ).toBe(false);
  });

  it('lets authors publish their own content but not another author’s', () => {
    const author = { id: authorId, role: UserRole.AUTHOR };

    expect(canTransitionContent(author, draft, ContentStatus.PUBLISHED)).toBe(
      true
    );
    expect(
      canTransitionContent(
        author,
        { ...draft, authorId: 'another-author' },
        ContentStatus.PUBLISHED
      )
    ).toBe(false);
  });

  it('lets editors publish and trash content from other authors', () => {
    const editor = { id: 'editor-1', role: UserRole.EDITOR };
    const anotherAuthorsDraft = { ...draft, authorId: 'author-2' };

    expect(
      canTransitionContent(editor, anotherAuthorsDraft, ContentStatus.PUBLISHED)
    ).toBe(true);
    expect(
      canTransitionContent(editor, anotherAuthorsDraft, ContentStatus.TRASH)
    ).toBe(true);
  });

  it('only offers draft and review statuses to a contributor', () => {
    expect(
      getAvailableStatuses({ id: authorId, role: UserRole.CONTRIBUTOR }, draft)
    ).toEqual([ContentStatus.DRAFT, ContentStatus.PENDING_REVIEW]);
  });
});

describe('content workflow dates', () => {
  const now = new Date('2026-09-03T18:00:00.000Z');

  it('requires a future date for scheduled content', () => {
    expect(() =>
      deriveWorkflowDates({
        currentStatus: ContentStatus.DRAFT,
        nextStatus: ContentStatus.SCHEDULED,
        scheduledAt: new Date('2026-09-03T17:59:00.000Z'),
        now,
      })
    ).toThrow(/future publication date/i);
  });

  it('sets publication dates when publishing', () => {
    expect(
      deriveWorkflowDates({
        currentStatus: ContentStatus.DRAFT,
        nextStatus: ContentStatus.PUBLISHED,
        now,
      })
    ).toMatchObject({
      status: ContentStatus.PUBLISHED,
      publishedAt: now,
      scheduledAt: null,
      deletedAt: null,
    });
  });

  it('marks trashed content as deleted', () => {
    expect(
      deriveWorkflowDates({
        currentStatus: ContentStatus.DRAFT,
        nextStatus: ContentStatus.TRASH,
        now,
      })
    ).toMatchObject({
      status: ContentStatus.TRASH,
      deletedAt: now,
    });
  });
});
