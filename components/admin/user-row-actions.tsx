'use client';

import { useState, useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { deleteUserAction } from '@/app/admin/user-actions';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { buttonVariants, Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';

type ReassignOption = {
  id: string;
  label: string;
};

export function UserRowActions({
  id,
  name,
  isSelf,
  ownedRecordCount,
  reassignOptions,
}: {
  id: string;
  name: string;
  isSelf: boolean;
  ownedRecordCount: number;
  reassignOptions: ReassignOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useForm<{ reassignToUserId: string }>({
    defaultValues: {
      reassignToUserId: reassignOptions[0]?.id ?? '',
    },
  });
  const needsReassignment = ownedRecordCount > 0;
  const canDelete =
    !isSelf && (!needsReassignment || reassignOptions.length > 0);

  function runDelete(reassignToUserId?: string) {
    startTransition(async () => {
      const result = await deleteUserAction({
        id,
        reassignToUserId,
      });
      toast.add({
        title: result.ok ? 'User deleted' : 'Unable to delete user',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) {
        setDeleteOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className='flex justify-end gap-1'>
        <Link
          className={buttonVariants({ variant: 'ghost', size: 'xs' })}
          href={`/admin/users/${id}`}
        >
          Edit
        </Link>
        <Button
          size='xs'
          variant='ghost'
          disabled={!canDelete || isPending}
          onClick={() => {
            if (isSelf) return;
            setDeleteOpen(true);
          }}
        >
          Delete
        </Button>
      </div>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {name}?</DialogTitle>
          </DialogHeader>
          {needsReassignment ? (
            <form
              className='grid gap-4'
              onSubmit={form.handleSubmit((values) =>
                runDelete(values.reassignToUserId)
              )}
            >
              <p className='text-muted-foreground text-sm'>
                This account owns {ownedRecordCount} content, revision, or media
                record
                {ownedRecordCount === 1 ? '' : 's'}. Choose another user to
                receive them.
              </p>
              <FormFieldControl
                control={form.control}
                name='reassignToUserId'
                type='select'
                label='Reassign to'
                options={reassignOptions.map((option) => ({
                  label: option.label,
                  value: option.id,
                }))}
                required
              />
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={isPending}
                >
                  {isPending ? 'Deleting…' : 'Delete user'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className='grid gap-4'>
              <p className='text-muted-foreground text-sm'>
                This account and its sessions will be removed. This cannot be
                undone.
              </p>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='button'
                  variant='destructive'
                  disabled={isPending}
                  onClick={() => runDelete()}
                >
                  {isPending ? 'Deleting…' : 'Delete user'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
