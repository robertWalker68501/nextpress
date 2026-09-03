import { UserRole } from '@/app/generated/prisma/client';
import { AdminSidebarNav } from '@/components/admin/admin-shell';
import { type Capability, hasCapability } from '@/lib/auth/capabilities';
import { requireUser } from '@/lib/auth/session';

const roleLabels = {
  [UserRole.ADMINISTRATOR]: 'Administrator',
  [UserRole.EDITOR]: 'Editor',
  [UserRole.AUTHOR]: 'Author',
  [UserRole.CONTRIBUTOR]: 'Contributor',
  [UserRole.SUBSCRIBER]: 'Subscriber',
} satisfies Record<UserRole, string>;

const navigationCapabilities = [
  { href: '/admin', capability: 'accessAdmin' },
  { href: '/admin/posts', capability: 'editContent' },
  { href: '/admin/pages', capability: 'editContent' },
  { href: '/admin/media', capability: 'uploadFiles' },
  { href: '/admin/comments', capability: 'moderateComments' },
  { href: '/admin/taxonomy/categories', capability: 'manageTerms' },
  { href: '/admin/taxonomy/tags', capability: 'manageTerms' },
  { href: '/admin/appearance/menus', capability: 'manageMenus' },
  { href: '/admin/settings', capability: 'manageSettings' },
] satisfies Array<{ href: string; capability: Capability }>;

export async function AdminSidebarSection() {
  const user = await requireUser();

  if (!hasCapability(user.role, 'accessAdmin')) {
    return null;
  }

  const allowedHrefs = navigationCapabilities
    .filter(({ capability }) => hasCapability(user.role, capability))
    .map(({ href }) => href);

  return (
    <AdminSidebarNav
      user={{
        name: user.displayName ?? user.name,
        email: user.email,
        roleLabel: roleLabels[user.role],
      }}
      allowedHrefs={allowedHrefs}
    />
  );
}
