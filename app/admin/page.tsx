import { Suspense } from 'react';

import type { Metadata } from 'next';
import Link from 'next/link';

import { ContentStatus, ContentType } from '@/app/generated/prisma/client';
import { AdminContentSkeleton } from '@/components/admin/admin-shell';
import { ContentStatusBadge } from '@/components/admin/content-status-badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { hasCapability } from '@/lib/auth/capabilities';
import { requireCapability } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Administration',
};

async function AdminDashboardContent() {
  const user = await requireCapability('accessAdmin');
  const canManageUsers = hasCapability(user.role, 'manageUsers');
  const scope = hasCapability(user.role, 'editOthersContent')
    ? {}
    : { authorId: user.id };
  const activeScope = { ...scope, deletedAt: null };

  const [posts, pages, pendingReview, published, recent, users] =
    await Promise.all([
      prisma.content.count({
        where: { ...activeScope, type: ContentType.POST },
      }),
      prisma.content.count({
        where: { ...activeScope, type: ContentType.PAGE },
      }),
      prisma.content.count({
        where: { ...activeScope, status: ContentStatus.PENDING_REVIEW },
      }),
      prisma.content.count({
        where: { ...activeScope, status: ContentStatus.PUBLISHED },
      }),
      prisma.content.findMany({
        where: activeScope,
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          updatedAt: true,
        },
      }),
      canManageUsers ? prisma.user.count() : Promise.resolve(null),
    ]);

  const stats = [
    { label: 'Posts', value: posts },
    { label: 'Pages', value: pages },
    { label: 'Pending review', value: pendingReview },
    { label: 'Published', value: published },
    ...(users === null ? [] : [{ label: 'Users', value: users }]),
  ];

  return (
    <div className='grid gap-8'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>
            Dashboard
          </h1>
          <p className='text-muted-foreground mt-1'>
            Welcome back, {user.displayName ?? user.name}.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Link
            className={buttonVariants()}
            href='/admin/posts/new'
          >
            Write a post
          </Link>
          {canManageUsers ? (
            <Link
              className={buttonVariants({ variant: 'outline' })}
              href='/admin/users'
            >
              Manage users
            </Link>
          ) : null}
        </div>
      </div>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='font-heading text-3xl font-bold'>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <CardTitle>Recently updated</CardTitle>
          <Link
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            href='/admin/posts'
          >
            View content
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className='text-muted-foreground py-10 text-center text-sm'>
              No content has been created yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        className='font-medium hover:underline'
                        href={`/admin/${item.type === ContentType.POST ? 'posts' : 'pages'}/${item.id}`}
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell className='capitalize'>
                      {item.type.toLowerCase()}
                    </TableCell>
                    <TableCell>
                      <ContentStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat('en', {
                        dateStyle: 'medium',
                      }).format(item.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminContentSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
