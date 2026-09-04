import { describe, expect, it } from 'vitest';

import { UserRole } from '@/app/generated/prisma/client';

import {
  countOwnedRecords,
  getBulkRoleChangeError,
  getLastAdministratorError,
  getReassignmentError,
  getSelfDeleteError,
} from './user-management';

describe('user management rules', () => {
  it('prevents deleting your own account', () => {
    expect(getSelfDeleteError('admin-1', 'admin-1')).toBe(
      'You cannot delete your own account.'
    );
    expect(getSelfDeleteError('admin-1', 'author-1')).toBeNull();
  });

  it('protects the last administrator from deletion and demotion', () => {
    expect(
      getLastAdministratorError({
        targetRole: UserRole.ADMINISTRATOR,
        nextRole: null,
        administratorCount: 1,
      })
    ).toBe('The last administrator cannot be deleted.');
    expect(
      getLastAdministratorError({
        targetRole: UserRole.ADMINISTRATOR,
        nextRole: UserRole.EDITOR,
        administratorCount: 1,
      })
    ).toBe('The last administrator cannot be demoted.');
    expect(
      getLastAdministratorError({
        targetRole: UserRole.ADMINISTRATOR,
        nextRole: UserRole.EDITOR,
        administratorCount: 2,
      })
    ).toBeNull();
  });

  it('requires reassignment when the user owns records', () => {
    expect(
      getReassignmentError({
        ownedRecordCount: 3,
        targetId: 'author-1',
      })
    ).toMatch(/Reassign/);
    expect(
      getReassignmentError({
        ownedRecordCount: 3,
        reassignToUserId: 'author-1',
        targetId: 'author-1',
      })
    ).toMatch(/different user/);
    expect(
      getReassignmentError({
        ownedRecordCount: 3,
        reassignToUserId: 'admin-1',
        targetId: 'author-1',
      })
    ).toBeNull();
    expect(
      getReassignmentError({
        ownedRecordCount: 0,
        targetId: 'author-1',
      })
    ).toBeNull();
  });

  it('blocks bulk demotion that would remove every administrator', () => {
    expect(
      getBulkRoleChangeError({
        selectedIds: ['admin-1', 'editor-1'],
        targets: [
          { id: 'admin-1', role: UserRole.ADMINISTRATOR },
          { id: 'editor-1', role: UserRole.EDITOR },
        ],
        nextRole: UserRole.AUTHOR,
        administratorCount: 1,
      })
    ).toBe('Keep at least one administrator.');
    expect(
      getBulkRoleChangeError({
        selectedIds: ['editor-1'],
        targets: [{ id: 'editor-1', role: UserRole.EDITOR }],
        nextRole: UserRole.AUTHOR,
        administratorCount: 1,
      })
    ).toBeNull();
  });

  it('counts owned content, revisions, and media together', () => {
    expect(
      countOwnedRecords({
        authoredContent: 2,
        contentRevisions: 4,
        uploadedMedia: 1,
      })
    ).toBe(7);
  });
});
