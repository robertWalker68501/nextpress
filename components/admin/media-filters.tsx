'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import type { MediaTypeFilter } from '@/lib/cms/media-queries';

type FilterValues = {
  q: string;
  type: MediaTypeFilter;
  trash: 'library' | 'trash';
};

export function MediaFilters({
  search,
  type,
  includeTrash,
}: {
  search?: string;
  type?: MediaTypeFilter;
  includeTrash?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const form = useForm<FilterValues>({
    values: {
      q: search ?? '',
      type: type ?? 'all',
      trash: includeTrash ? 'trash' : 'library',
    },
  });

  function applyFilters(values: FilterValues) {
    const query = new URLSearchParams();
    if (values.q.trim()) query.set('q', values.q.trim());
    if (values.type !== 'all') query.set('type', values.type);
    if (values.trash === 'trash') query.set('trash', 'true');
    router.push(query.size > 0 ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className='grid gap-2'>
      <form
        className='grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]'
        onSubmit={form.handleSubmit(applyFilters)}
      >
        <FormFieldControl
          control={form.control}
          name='q'
          type='search'
          label='Search'
          placeholder='Search filename or alt text'
        />
        <FormFieldControl
          control={form.control}
          name='type'
          type='select'
          label='Type'
          options={[
            { label: 'All types', value: 'all' },
            { label: 'Images', value: 'image' },
            { label: 'Video', value: 'video' },
            { label: 'Audio', value: 'audio' },
            { label: 'Documents', value: 'document' },
          ]}
        />
        <FormFieldControl
          control={form.control}
          name='trash'
          type='select'
          label='View'
          options={[
            { label: 'Active library', value: 'library' },
            { label: 'Trash', value: 'trash' },
          ]}
        />
        <Button
          type='submit'
          variant='outline'
        >
          Apply
        </Button>
      </form>
      {includeTrash ? (
        <p className='text-muted-foreground text-sm'>
          Trashed files can be restored from here or permanently deleted.
        </p>
      ) : (
        <p className='text-muted-foreground text-sm'>
          Deleted files go to{' '}
          <Link
            href={`${pathname}?trash=true`}
            className='text-primary underline-offset-4 hover:underline'
          >
            Trash
          </Link>
          .
        </p>
      )}
    </div>
  );
}
