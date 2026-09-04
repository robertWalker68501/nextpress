import { AdminSidebarNav } from '@/components/admin/admin-shell';
import { type Capability, hasCapability } from '@/lib/auth/capabilities';
import { getRoleLabel } from '@/lib/auth/roles';
import { requireUser } from '@/lib/auth/session';

const navigationCapabilities = [
  { href: '/admin', capability: 'accessAdmin' },
  { href: '/admin/posts', capability: 'editContent' },
  { href: '/admin/pages', capability: 'editContent' },
  { href: '/admin/media', capability: 'uploadFiles' },
  { href: '/admin/comments', capability: 'moderateComments' },
  { href: '/admin/taxonomy/categories', capability: 'manageTerms' },
  { href: '/admin/taxonomy/tags', capability: 'manageTerms' },
  { href: '/admin/appearance/menus', capability: 'manageMenus' },
  { href: '/admin/users', capability: 'manageUsers' },
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
        roleLabel: getRoleLabel(user.role),
      }}
      allowedHrefs={allowedHrefs}
    />
  );
}
