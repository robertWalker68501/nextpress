import { describe, expect, it } from 'vitest';

import { CommentStatus, UserRole } from '@/app/generated/prisma/client';

import { CommentStatusValue } from './constants';

describe('comment moderation constants', () => {
  it('maps comment status values to prisma enum members', () => {
    expect(Object.values(CommentStatusValue)).toEqual(
      expect.arrayContaining(Object.values(CommentStatus))
    );
  });

  it('keeps contributor roles without comment moderation capability', () => {
    const rolesWithoutModeration = [
      UserRole.AUTHOR,
      UserRole.CONTRIBUTOR,
      UserRole.SUBSCRIBER,
    ];

    for (const role of rolesWithoutModeration) {
      expect(role).not.toBe(UserRole.EDITOR);
    }
  });
});
