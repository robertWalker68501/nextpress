import type { Metadata } from 'next';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAccountOverview } from '@/lib/cms/account-queries';
import { requireUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Account',
};

export const instant = false;

export default async function AccountPage() {
  const user = await requireUser();
  const stats = await getAccountOverview(user.id, user.email);

  const cards = [
    { label: 'Posts', value: stats.posts },
    { label: 'Published', value: stats.published },
    { label: 'Pending review', value: stats.pendingReview },
    { label: 'Comments', value: stats.comments },
  ];

  return (
    <div className='grid gap-8'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='font-heading text-3xl font-bold tracking-tight'>
            Your dashboard
          </h1>
          <p className='text-muted-foreground mt-1'>
            Welcome back, {user.displayName ?? user.name}.
          </p>
        </div>
        <Link
          className={buttonVariants()}
          href='/account/posts/new'
        >
          Write a post
        </Link>
      </div>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='font-heading text-3xl font-bold'>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
