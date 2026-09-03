'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { saveContentAction } from '@/app/admin/content-actions';
import { getContentStatusLabel } from '@/components/admin/content-status-badge';
import { FileUploadField } from '@/components/form-fields/FileUploadField';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { MultiSelectField } from '@/components/form-fields/MultiSelectField';
import { TagInputField } from '@/components/form-fields/TagInputField';
import { RichTextEditorField } from '@/components/form-fields/editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import {
  CommentPolicyValue,
  ContentStatusValue,
  type ContentStatusValue as ContentStatus,
  ContentTypeValue,
} from '@/lib/cms/constants';
import {
  type ContentEditorInput,
  contentEditorSchema,
} from '@/lib/cms/validation';

type EditorOption = {
  label: string;
  value: string;
};

export function ContentEditorForm({
  defaultValues,
  availableStatuses,
  categories,
  parentPages,
}: {
  defaultValues: ContentEditorInput;
  availableStatuses: ContentStatus[];
  categories: EditorOption[];
  parentPages: EditorOption[];
}) {
  const router = useRouter();
  const form = useForm<ContentEditorInput>({
    resolver: zodResolver(contentEditorSchema),
    defaultValues,
  });
  const selectedStatus = form.watch('status');
  const type = form.watch('type');
  const segment = type === ContentTypeValue.POST ? 'posts' : 'pages';
  const statusOptions = useMemo(
    () =>
      availableStatuses.map((status) => ({
        label: getContentStatusLabel(status),
        value: status,
      })),
    [availableStatuses]
  );

  async function onSubmit(values: ContentEditorInput) {
    form.clearErrors();
    const result = await saveContentAction({
      ...values,
      parentId: values.parentId === 'NONE' ? null : values.parentId,
    });

    if (!result.ok) {
      for (const [field, messages] of Object.entries(
        result.fieldErrors ?? {}
      )) {
        const message = messages?.[0];
        if (message) {
          form.setError(field as keyof ContentEditorInput, { message });
        }
      }
      toast.add({
        title: 'Unable to save',
        description: result.message,
        type: 'error',
      });
      return;
    }

    toast.add({
      title: 'Saved',
      description: result.message,
      type: 'success',
    });

    if (!values.id) {
      router.push(`/admin/${segment}/${result.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form
      className='grid gap-6'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {form.formState.errors.root?.message ? (
        <Alert variant='destructive'>
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]'>
        <div className='grid gap-6'>
          <Card>
            <CardContent>
              <FormFieldControl
                control={form.control}
                name='title'
                type='text'
                label='Title'
                placeholder={`Enter ${type.toLowerCase()} title`}
                required
              />
              <FormFieldControl
                control={form.control}
                name='slug'
                type='text'
                label='Slug'
                description='Leave blank to generate it from the title.'
                placeholder='my-content-slug'
              />
              <FormFieldControl
                control={form.control}
                name='excerpt'
                type='textarea'
                label='Excerpt'
                description='A short summary used in archives and search results.'
                rows={3}
                maxLength={500}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditorField
                control={form.control}
                name='body'
                label='Body'
                preset='full'
                height={560}
                required
              />
            </CardContent>
          </Card>
        </div>

        <aside className='grid gap-6 xl:sticky xl:top-20'>
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent>
              <FormFieldControl
                control={form.control}
                name='status'
                type='select'
                label='Status'
                options={statusOptions}
              />
              {selectedStatus === ContentStatusValue.SCHEDULED ? (
                <FormFieldControl
                  control={form.control}
                  name='scheduledAt'
                  type='datetime-local'
                  label='Publication date'
                  required
                />
              ) : null}
              <FormFieldControl
                control={form.control}
                name='commentPolicy'
                type='select'
                label='Comments'
                options={[
                  { label: 'Open', value: CommentPolicyValue.OPEN },
                  { label: 'Closed', value: CommentPolicyValue.CLOSED },
                ]}
              />
              <Button
                className='w-full'
                type='submit'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </CardContent>
          </Card>

          {type === ContentTypeValue.POST ? (
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiSelectField
                  control={form.control}
                  name='categoryIds'
                  label='Categories'
                  options={categories}
                />
                <TagInputField
                  control={form.control}
                  name='tagNames'
                  label='Tags'
                  description='Press Enter or comma to add a tag.'
                  maxTags={30}
                  maxTagLength={80}
                  replaceSpacesWithHyphens={false}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Page attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormFieldControl
                  control={form.control}
                  name='parentId'
                  type='select'
                  label='Parent page'
                  placeholder='No parent'
                  options={[
                    { label: 'No parent', value: 'NONE' },
                    ...parentPages,
                  ]}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Featured image</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadField
                control={form.control}
                name='featuredImage'
                label='Image'
                mode='image'
                maxFiles={1}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}
