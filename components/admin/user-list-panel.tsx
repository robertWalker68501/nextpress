'use client';

import { useState, useTransition } from 'react';

import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { bulkUpdateUserRolesAction } from '@/app/admin/user-actions';
import { UserFilters } from '@/components/admin/user-filters';
import { UserRoleBadge } from '@/components/admin/user-role-badge';
import { UserRowActions } from '@/components/admin/user-row-actions';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { type UserRoleValue, roleOptions } from '@/lib/auth/roles';

type UserRow = {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  emailVerified: boolean;
  role: UserRoleValue;
  createdAt: string;
  ownedRecordCount: number;
};

type ReassignOption = {
  id: string;
  label: string;
};

export function UserListPanel({
  items,
  search,
  role,
  currentUserId,
  reassignOptions,
}: {
  items: UserRow[];
  search?: string;
  role?: UserRoleValue;
  currentUserId: string;
  reassignOptions: ReassignOption[];
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const bulkForm = useForm<{ role: UserRoleValue }>({
    defaultValues: { role: 'SUBSCRIBER' },
  });
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id)
    );
  }

  function applyBulkRole(values: { role: UserRoleValue }) {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const result = await bulkUpdateUserRolesAction({
        ids: selectedIds,
        role: values.role,
      });
      toast.add({
        title: result.ok ? 'Roles updated' : 'Bulk action failed',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) {
        setSelectedIds([]);
        router.refresh();
      }
    });
  }

  return (
    <div className='grid gap-6'>
      <UserFilters
        search={search}
        role={role}
      />

      {selectedIds.length > 0 ? (
        <form
          className='flex flex-wrap items-end gap-3 rounded-lg border p-3'
          onSubmit={bulkForm.handleSubmit(applyBulkRole)}
        >
          <p className='text-muted-foreground mr-auto text-sm'>
            {selectedIds.length} selected
          </p>
          <FormFieldControl
            control={bulkForm.control}
            name='role'
            type='select'
            label='Change role to'
            options={roleOptions}
            className='min-w-48'
          />
          <Button
            type='submit'
            size='sm'
            variant='outline'
            disabled={isPending}
          >
            {isPending ? 'Updating…' : 'Apply'}
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        <Empty className='border'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Users />
            </EmptyMedia>
            <EmptyTitle>No users found</EmptyTitle>
            <EmptyDescription>
              Add a user or change the current filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='overflow-hidden rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label='Select all users'
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>
                  <span className='sr-only'>Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) =>
                        toggleOne(item.id, checked === true)
                      }
                      aria-label={`Select ${item.displayName ?? item.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <p className='font-medium'>
                      {item.displayName ?? item.name}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {item.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    <UserRoleBadge role={item.role} />
                  </TableCell>
                  <TableCell>{item.emailVerified ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                    }).format(new Date(item.createdAt))}
                  </TableCell>
                  <TableCell>
                    <UserRowActions
                      id={item.id}
                      name={item.displayName ?? item.name}
                      isSelf={item.id === currentUserId}
                      ownedRecordCount={item.ownedRecordCount}
                      reassignOptions={reassignOptions.filter(
                        (option) => option.id !== item.id
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
