import { describe, expect, it } from 'vitest';

import { UserRole } from '@/app/generated/prisma/client';

import { mediaVisibilityWhere } from './media-visibility';

describe('mediaVisibilityWhere', () => {
  it('limits subscribers to their own uploads', () => {
    expect(
      mediaVisibilityWhere({ id: 'user-1', role: UserRole.SUBSCRIBER })
    ).toEqual({ uploadedById: 'user-1' });
  });

  it('lets administrators see every file in the admin library', () => {
    expect(
      mediaVisibilityWhere({ id: 'admin-1', role: UserRole.ADMINISTRATOR })
    ).toEqual({});
  });

  it('still scopes administrators to their own files when ownerOnly is set', () => {
    expect(
      mediaVisibilityWhere(
        { id: 'admin-1', role: UserRole.ADMINISTRATOR },
        true
      )
    ).toEqual({ uploadedById: 'admin-1' });
  });
});
