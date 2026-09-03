'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { deleteTermAction, saveTermAction } from '@/app/admin/term-actions';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import {
  TermTypeValue,
  type TermTypeValue as TermType,
} from '@/lib/cms/constants';
import { type TermEditorInput, termEditorSchema } from '@/lib/cms/validation';

type TermRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  contentCount: number;
};

export function TermManager({
  type,
  terms,
}: {
  type: TermType;
  terms: TermRow[];
}) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const singular = type === TermTypeValue.CATEGORY ? 'category' : 'tag';
  const title = type === TermTypeValue.CATEGORY ? 'Categories' : 'Tags';
  const form = useForm<TermEditorInput>({
    resolver: zodResolver(termEditorSchema),
    defaultValues: {
      type,
      name: '',
      slug: '',
      description: '',
      parentId: null,
    },
  });
  const editingId = form.watch('id');

  function resetForm() {
    form.reset({
      type,
      name: '',
      slug: '',
      description: '',
      parentId: null,
    });
  }

  async function onSubmit(values: TermEditorInput) {
    const result = await saveTermAction({
      ...values,
      parentId: values.parentId === 'NONE' ? null : values.parentId,
    });
    toast.add({
      title: result.ok ? 'Saved' : `Unable to save ${singular}`,
      description: result.message,
      type: result.ok ? 'success' : 'error',
    });

    if (result.ok) {
      resetForm();
      router.refresh();
    }
  }

  function editTerm(term: TermRow) {
    form.reset({
      id: term.id,
      type,
      name: term.name,
      slug: term.slug,
      description: term.description ?? '',
      parentId: term.parentId ?? null,
    });
  }

  function deleteTerm(id: string) {
    if (!window.confirm(`Delete this ${singular}?`)) return;

    startDeleteTransition(async () => {
      const result = await deleteTermAction(id);
      toast.add({
        title: result.ok ? 'Deleted' : `Unable to delete ${singular}`,
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });
      if (result.ok) {
        if (editingId === id) resetForm();
        router.refresh();
      }
    });
  }

  return (
    <div className='grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]'>
      <Card className='h-fit'>
        <CardHeader>
          <CardTitle>
            {editingId ? `Edit ${singular}` : `Add ${singular}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-4'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormFieldControl
              control={form.control}
              name='name'
              type='text'
              label='Name'
              required
            />
            <FormFieldControl
              control={form.control}
              name='slug'
              type='text'
              label='Slug'
              description='Leave blank to generate it from the name.'
            />
            <FormFieldControl
              control={form.control}
              name='description'
              type='textarea'
              label='Description'
              rows={3}
              maxLength={500}
            />
            {type === TermTypeValue.CATEGORY ? (
              <FormFieldControl
                control={form.control}
                name='parentId'
                type='select'
                label='Parent category'
                placeholder='No parent'
                options={[
                  { label: 'No parent', value: 'NONE' },
                  ...terms
                    .filter(({ id }) => id !== editingId)
                    .map(({ id: value, name: label }) => ({
                      label,
                      value,
                    })),
                ]}
              />
            ) : null}
            <div className='flex gap-2'>
              <Button
                type='submit'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving…' : 'Save'}
              </Button>
              {editingId ? (
                <Button
                  type='button'
                  variant='ghost'
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className='overflow-hidden rounded-xl border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              {type === TermTypeValue.CATEGORY ? (
                <TableHead>Parent</TableHead>
              ) : null}
              <TableHead>Count</TableHead>
              <TableHead>
                <span className='sr-only'>Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={type === TermTypeValue.CATEGORY ? 5 : 4}
                  className='text-muted-foreground py-12 text-center'
                >
                  No {title.toLowerCase()} found.
                </TableCell>
              </TableRow>
            ) : (
              terms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell>
                    <p className='font-medium'>{term.name}</p>
                    {term.description ? (
                      <p className='text-muted-foreground mt-1 max-w-sm text-xs'>
                        {term.description}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>{term.slug}</TableCell>
                  {type === TermTypeValue.CATEGORY ? (
                    <TableCell>{term.parentName ?? '—'}</TableCell>
                  ) : null}
                  <TableCell>{term.contentCount}</TableCell>
                  <TableCell>
                    <div className='flex justify-end gap-1'>
                      <Button
                        type='button'
                        size='xs'
                        variant='ghost'
                        onClick={() => editTerm(term)}
                      >
                        Edit
                      </Button>
                      <Button
                        type='button'
                        size='xs'
                        variant='ghost'
                        disabled={isDeleting}
                        onClick={() => deleteTerm(term.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
