import { Suspense } from 'react';

import { RevisionList } from '@/components/admin/revision-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getContentRevisions } from '@/lib/cms/content-queries';

function RevisionListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent revisions</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-3'>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton
            key={index}
            className='h-12 w-full rounded-md'
          />
        ))}
      </CardContent>
    </Card>
  );
}

async function RevisionListSection({ contentId }: { contentId: string }) {
  const revisions = await getContentRevisions(contentId);

  return (
    <RevisionList
      contentId={contentId}
      revisions={revisions.map((revision) => ({
        id: revision.id,
        revisionNumber: revision.revisionNumber,
        createdAt: revision.createdAt.toISOString(),
        authorName: revision.author.displayName ?? revision.author.name,
      }))}
    />
  );
}

export function ContentRevisionsPanel({ contentId }: { contentId: string }) {
  return (
    <Suspense fallback={<RevisionListSkeleton />}>
      <RevisionListSection contentId={contentId} />
    </Suspense>
  );
}
