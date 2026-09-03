import { Suspense, type ReactNode } from 'react';

import { AdminContentGate } from '@/components/admin/admin-content-gate';
import { AdminSidebarSection } from '@/components/admin/admin-sidebar-section';
import {
  AdminContentSkeleton,
  AdminSidebarSkeleton,
} from '@/components/admin/admin-shell';
import { AdminShellFrame } from '@/components/admin/admin-shell-frame';

// Admin routes read the session on every request; opt out of instant-navigation
// validation until session reads use a Cache Components–compatible pattern.
export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShellFrame
      sidebar={
        <Suspense fallback={<AdminSidebarSkeleton />}>
          <AdminSidebarSection />
        </Suspense>
      }
    >
      <Suspense fallback={<AdminContentSkeleton />}>
        <AdminContentGate>{children}</AdminContentGate>
      </Suspense>
    </AdminShellFrame>
  );
}
