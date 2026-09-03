import { ContentStatus, UserRole } from '@/app/generated/prisma/client';

export const capabilities = [
  'accessAdmin',
  'editContent',
  'editOthersContent',
  'publishContent',
  'deleteContent',
  'deleteOthersContent',
  'uploadFiles',
  'manageTerms',
  'moderateComments',
  'manageMenus',
  'manageSettings',
  'manageUsers',
] as const;

export type Capability = (typeof capabilities)[number];

const roleCapabilities = {
  [UserRole.ADMINISTRATOR]: new Set<Capability>(capabilities),
  [UserRole.EDITOR]: new Set<Capability>([
    'accessAdmin',
    'editContent',
    'editOthersContent',
    'publishContent',
    'deleteContent',
    'deleteOthersContent',
    'uploadFiles',
    'manageTerms',
    'moderateComments',
  ]),
  [UserRole.AUTHOR]: new Set<Capability>([
    'accessAdmin',
    'editContent',
    'publishContent',
    'deleteContent',
    'uploadFiles',
  ]),
  [UserRole.CONTRIBUTOR]: new Set<Capability>([
    'accessAdmin',
    'editContent',
    'deleteContent',
  ]),
  [UserRole.SUBSCRIBER]: new Set<Capability>([
    'editContent',
    'deleteContent',
    'uploadFiles',
  ]),
} satisfies Record<UserRole, ReadonlySet<Capability>>;

export function hasCapability(role: UserRole, capability: Capability) {
  return roleCapabilities[role].has(capability);
}

type Actor = {
  id: string;
  role: UserRole;
};

type OwnedContent = {
  authorId: string;
  status: ContentStatus;
};

export function canEditContent(actor: Actor, content: OwnedContent) {
  if (hasCapability(actor.role, 'editOthersContent')) return true;
  if (!hasCapability(actor.role, 'editContent')) return false;
  if (actor.id !== content.authorId) return false;

  return !(
    actor.role === UserRole.CONTRIBUTOR &&
    content.status === ContentStatus.PUBLISHED
  );
}

export function canPublishContent(actor: Actor, content: OwnedContent) {
  if (!hasCapability(actor.role, 'publishContent')) return false;

  return (
    actor.id === content.authorId ||
    hasCapability(actor.role, 'editOthersContent')
  );
}

export function canDeleteContent(actor: Actor, content: OwnedContent) {
  if (
    actor.id !== content.authorId &&
    !hasCapability(actor.role, 'deleteOthersContent')
  ) {
    return false;
  }

  return hasCapability(actor.role, 'deleteContent');
}
