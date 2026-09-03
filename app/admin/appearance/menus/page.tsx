import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MenuManager } from '@/components/admin/menu-manager';
import { AdminContentSkeleton } from '@/components/admin/admin-shell';
import { getMenuForAdmin, listMenusForAdmin } from '@/lib/cms/menu-queries';
import { requireCapability } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Menus',
};

type MenusPageProps = {
  searchParams: Promise<{ menu?: string }>;
};

async function MenusContent({ searchParams }: MenusPageProps) {
  const query = await searchParams;
  await requireCapability('manageMenus');
  const menus = await listMenusForAdmin();
  const selectedMenuId = query.menu ?? menus[0]?.id;

  if (!selectedMenuId) {
    return (
      <p className='text-muted-foreground text-sm'>
        No menus are available yet.
      </p>
    );
  }

  const data = await getMenuForAdmin(selectedMenuId);
  if (!data) notFound();

  return (
    <div className='grid gap-6'>
      <div className='flex flex-wrap gap-2'>
        {menus.map((menu) => (
          <a
            key={menu.id}
            href={`/admin/appearance/menus?menu=${menu.id}`}
            className={
              menu.id === selectedMenuId
                ? 'bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium'
                : 'bg-muted hover:bg-muted/80 rounded-full px-4 py-2 text-sm font-medium'
            }
          >
            {menu.name} ({menu._count.items})
          </a>
        ))}
      </div>

      <MenuManager
        menuId={data.menu.id}
        menuName={data.menu.name}
        initialItems={data.menu.items}
        pages={data.pages}
        posts={data.posts}
      />
    </div>
  );
}

export default function MenusPage(props: MenusPageProps) {
  return (
    <div className='grid gap-6'>
      <div>
        <h1 className='font-heading text-3xl font-bold tracking-tight'>
          Menus
        </h1>
        <p className='text-muted-foreground mt-1'>
          Build navigation for the primary header and footer locations.
        </p>
      </div>
      <Suspense fallback={<AdminContentSkeleton />}>
        <MenusContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
