'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import { type UserRoleValue, roleOptions } from '@/lib/auth/roles';

type FilterValues = {
  q: string;
  role: string;
};

export function UserFilters({
  search,
  role,
}: {
  search?: string;
  role?: UserRoleValue;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const form = useForm<FilterValues>({
    defaultValues: {
      q: search ?? '',
      role: role ?? 'ALL',
    },
  });

  function applyFilters(values: FilterValues) {
    const query = new URLSearchParams();
    if (values.q.trim()) query.set('q', values.q.trim());
    if (values.role !== 'ALL') query.set('role', values.role);
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
        placeholder='Search name or email'
      />
      <FormFieldControl
        control={form.control}
        name='role'
        type='select'
        label='Role'
        options={[{ label: 'All roles', value: 'ALL' }, ...roleOptions]}
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
