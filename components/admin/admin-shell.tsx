'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  FileText,
  FolderTree,
  Gauge,
  Image,
  LayoutList,
  MessageSquare,
  Settings,
  Tags,
  Users,
} from 'lucide-react';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { NextPressLogo } from '@/components/nextpress-logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export const adminNavigation = [
  { href: '/admin', label: 'Dashboard', icon: Gauge },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/pages', label: 'Pages', icon: LayoutList },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  {
    href: '/admin/taxonomy/categories',
    label: 'Categories',
    icon: FolderTree,
  },
  { href: '/admin/taxonomy/tags', label: 'Tags', icon: Tags },
  { href: '/admin/appearance/menus', label: 'Menus', icon: BookOpen },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
] as const;

export function AdminSidebarNav({
  user,
  allowedHrefs,
}: {
  user: {
    name: string;
    email: string;
    roleLabel: string;
  };
  allowedHrefs: string[];
}) {
  const pathname = usePathname();
  const visibleNavigation = adminNavigation.filter((item) =>
    allowedHrefs.includes(item.href)
  );

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              tooltip='NextPress'
              render={<Link href='/admin' />}
            >
              <NextPressLogo
                size={32}
                alt=''
                priority
              />
              <span className='grid flex-1 text-left leading-tight'>
                <span className='truncate font-semibold'>NextPress</span>
                <span className='text-muted-foreground truncate text-xs'>
                  Administration
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={
                      pathname === item.href ||
                      (item.href !== '/admin' &&
                        pathname.startsWith(`${item.href}/`))
                    }
                    render={<Link href={item.href} />}
                  >
                    <item.icon aria-hidden='true' />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className='group-data-[collapsible=icon]:hidden'>
          <p className='truncate text-sm font-medium'>{user.name}</p>
          <p className='text-muted-foreground truncate text-xs'>{user.email}</p>
          <p className='text-muted-foreground mt-1 text-xs'>{user.roleLabel}</p>
        </div>
        <SignOutButton />
      </SidebarFooter>
    </>
  );
}

export function AdminSidebarSkeleton() {
  return (
    <>
      <SidebarHeader>
        <Skeleton className='h-12 w-full rounded-lg' />
      </SidebarHeader>
      <SidebarContent className='gap-3 p-2'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className='h-9 w-full rounded-md'
          />
        ))}
      </SidebarContent>
      <SidebarFooter className='gap-2'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-2/3' />
        <Skeleton className='h-8 w-full rounded-md' />
      </SidebarFooter>
    </>
  );
}

export function AdminContentSkeleton() {
  return (
    <div
      className='grid gap-6'
      aria-label='Loading page content'
    >
      <Skeleton className='h-10 w-52' />
      <Skeleton className='h-24 w-full rounded-xl' />
      <Skeleton className='h-64 w-full rounded-xl' />
    </div>
  );
}
