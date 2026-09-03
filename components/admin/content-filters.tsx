'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { getContentStatusLabel } from '@/components/admin/content-status-badge';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import {
  ContentStatusValue,
  type ContentStatusValue as ContentStatus,
} from '@/lib/cms/constants';

type FilterValues = {
  q: string;
  status: string;
};

export function ContentFilters({
  search,
  status,
}: {
  search?: string;
  status?: ContentStatus;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const form = useForm<FilterValues>({
    defaultValues: {
      q: search ?? '',
      status: status ?? 'ALL',
    },
  });

  function applyFilters(values: FilterValues) {
    const query = new URLSearchParams();
    if (values.q.trim()) query.set('q', values.q.trim());
    if (values.status !== 'ALL') query.set('status', values.status);
    router.push(query.size > 0 ? `${pathname}?${query}` : pathname);
  }

  return (
    <form
      className='grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto]'
      onSubmit={form.handleSubmit(applyFilters)}
    >
      <FormFieldControl
        control={form.control}
        name='q'
        type='search'
        label='Search'
        placeholder='Search title or slug'
      />
      <FormFieldControl
        control={form.control}
        name='status'
        type='select'
        label='Status'
        options={[
          { label: 'All active statuses', value: 'ALL' },
          ...Object.values(ContentStatusValue).map((value) => ({
            label: getContentStatusLabel(value),
            value,
          })),
        ]}
      />
      <Button
        type='submit'
        variant='outline'
      >
        Apply
      </Button>
    </form>
  );
}
