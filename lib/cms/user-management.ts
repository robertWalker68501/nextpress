import { UserRole } from '@/app/generated/prisma/client';

type Target = {
  id: string;
  role: UserRole;
};

export function getSelfDeleteError(actorId: string, targetId: string) {
  if (actorId === targetId) {
    return 'You cannot delete your own account.';
  }

  return null;
}

export function getLastAdministratorError({
  targetRole,
  nextRole,
  administratorCount,
}: {
  targetRole: UserRole;
  nextRole: UserRole | null;
  administratorCount: number;
}) {
  if (targetRole !== UserRole.ADMINISTRATOR) return null;
  if (administratorCount > 1) return null;
  if (nextRole === UserRole.ADMINISTRATOR) return null;

  return nextRole === null
    ? 'The last administrator cannot be deleted.'
    : 'The last administrator cannot be demoted.';
}

export function getReassignmentError({
  ownedRecordCount,
  reassignToUserId,
  targetId,
}: {
  ownedRecordCount: number;
  reassignToUserId?: string;
  targetId: string;
}) {
  if (ownedRecordCount <= 0) return null;

  if (!reassignToUserId) {
    return "Reassign this user's content, revisions, and media before deleting the account.";
  }

  if (reassignToUserId === targetId) {
    return 'Choose a different user to receive this content.';
  }

  return null;
}

export function getBulkRoleChangeError({
  targets,
  selectedIds,
  nextRole,
  administratorCount,
}: {
  targets: Target[];
  selectedIds: string[];
  nextRole: UserRole;
  administratorCount: number;
}) {
  if (selectedIds.length === 0) {
    return 'Select at least one user.';
  }

  if (targets.length !== selectedIds.length) {
    return 'One or more selected users were not found.';
  }

  if (nextRole === UserRole.ADMINISTRATOR) return null;

  const demotedAdministrators = targets.filter(
    (target) => target.role === UserRole.ADMINISTRATOR
  ).length;

  if (administratorCount - demotedAdministrators < 1) {
    return 'Keep at least one administrator.';
  }

  return null;
}

export function countOwnedRecords(counts: {
  authoredContent: number;
  contentRevisions: number;
  uploadedMedia: number;
}) {
  return (
    counts.authoredContent + counts.contentRevisions + counts.uploadedMedia
  );
}
