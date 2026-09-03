'use client';

import { useForm } from 'react-hook-form';

import { saveSiteSettingsAction } from '@/app/admin/settings-actions';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import {
  CommentPolicyValue,
  type CommentPolicyValue as CommentPolicy,
} from '@/lib/cms/constants';
import type { SiteSettings } from '@/lib/cms/site-settings';
type PageOption = { id: string; title: string };

type SiteSettingsFormValues = {
  siteTitle: string;
  siteTagline: string;
  siteDescription: string;
  postsPerPage: number;
  defaultCommentStatus: CommentPolicy;
  dateFormat: string;
  permalinkStructure: string;
  showOnFront: 'posts' | 'page';
  pageOnFront: string;
  socialTwitter: string;
  socialFacebook: string;
};

export function SiteSettingsForm({
  settings,
  pages,
}: {
  settings: SiteSettings;
  pages: PageOption[];
}) {
  const form = useForm<SiteSettingsFormValues>({
    values: {
      ...settings,
      pageOnFront: settings.pageOnFront ?? 'none',
    },
  });

  async function onSubmit(values: SiteSettingsFormValues) {
    const result = await saveSiteSettingsAction({
      ...values,
      pageOnFront:
        values.showOnFront === 'page' && values.pageOnFront !== 'none'
          ? values.pageOnFront
          : null,
    });
    toast.add({
      title: result.ok ? 'Saved' : 'Unable to save settings',
      description: result.message,
      type: result.ok ? 'success' : 'error',
    });
  }

  const showOnFront = form.watch('showOnFront');

  return (
    <form
      className='grid gap-6'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <FormFieldControl
            control={form.control}
            name='siteTitle'
            type='text'
            label='Site title'
            required
          />
          <FormFieldControl
            control={form.control}
            name='siteTagline'
            type='text'
            label='Tagline'
          />
          <FormFieldControl
            control={form.control}
            name='siteDescription'
            type='textarea'
            label='Description'
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reading</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <FormFieldControl
            control={form.control}
            name='showOnFront'
            type='select'
            label='Homepage displays'
            options={[
              { label: 'Latest posts', value: 'posts' },
              { label: 'A static page', value: 'page' },
            ]}
          />
          {showOnFront === 'page' ? (
            <FormFieldControl
              control={form.control}
              name='pageOnFront'
              type='select'
              label='Homepage'
              options={[
                { label: 'Select a page', value: 'none' },
                ...pages.map((page) => ({
                  label: page.title,
                  value: page.id,
                })),
              ]}
            />
          ) : null}
          <FormFieldControl
            control={form.control}
            name='postsPerPage'
            type='number'
            label='Posts per page'
            min={1}
            max={50}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <FormFieldControl
            control={form.control}
            name='defaultCommentStatus'
            type='select'
            label='Default comment status'
            options={[
              {
                label: 'Open',
                value: CommentPolicyValue.OPEN as CommentPolicy,
              },
              {
                label: 'Closed',
                value: CommentPolicyValue.CLOSED as CommentPolicy,
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO and social</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <FormFieldControl
            control={form.control}
            name='permalinkStructure'
            type='text'
            label='Permalink structure'
            description='Posts and pages currently resolve at /{slug}.'
          />
          <FormFieldControl
            control={form.control}
            name='socialTwitter'
            type='text'
            label='Twitter / X handle or URL'
          />
          <FormFieldControl
            control={form.control}
            name='socialFacebook'
            type='text'
            label='Facebook URL'
          />
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button type='submit'>Save settings</Button>
      </div>
    </form>
  );
}
