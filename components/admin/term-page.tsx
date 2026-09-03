import { TermType } from '@/app/generated/prisma/client';
import { TermManager } from '@/components/admin/term-manager';
import { requireCapability } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export async function TermPage({ type }: { type: TermType }) {
  await requireCapability('manageTerms');
  const terms = await prisma.term.findMany({
    where: { type },
    orderBy: { name: 'asc' },
    include: {
      parent: { select: { name: true } },
      _count: { select: { contents: true } },
    },
  });
  const title = type === TermType.CATEGORY ? 'Categories' : 'Tags';

  return (
    <div className='grid gap-6'>
      <div>
        <h1 className='font-heading text-3xl font-bold tracking-tight'>
          {title}
        </h1>
        <p className='text-muted-foreground mt-1'>
          {type === TermType.CATEGORY
            ? 'Organize posts into a hierarchical set of topics.'
            : 'Describe posts with flexible, reusable labels.'}
        </p>
      </div>
      <TermManager
        type={type}
        terms={terms.map((term) => ({
          id: term.id,
          name: term.name,
          slug: term.slug,
          description: term.description,
          parentId: term.parentId,
          parentName: term.parent?.name ?? null,
          contentCount: term._count.contents,
        }))}
      />
    </div>
  );
}
