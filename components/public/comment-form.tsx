'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { submitCommentAction } from '@/app/public-actions';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import { type PublicCommentInput, publicCommentSchema } from '@/lib/cms/validation';

export function CommentForm({ contentId }: { contentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PublicCommentInput>({
    resolver: zodResolver(publicCommentSchema),
    defaultValues: {
      contentId,
      authorName: '',
      authorEmail: '',
      authorUrl: '',
      body: '',
      honeypot: '',
    },
  });

  function onSubmit(values: PublicCommentInput) {
    startTransition(async () => {
      const result = await submitCommentAction(values);
      if (result.ok) {
        setError(null);
        setMessage(result.message);
        form.reset({
          contentId,
          authorName: '',
          authorEmail: '',
          authorUrl: '',
          body: '',
          honeypot: '',
        });
        router.refresh();
        return;
      }

      setMessage(null);
      setError(result.message);
    });
  }

  return (
    <form
      className='grid gap-4 rounded-xl border p-6'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div>
        <h2 className='font-heading text-lg font-semibold'>Leave a comment</h2>
        <p className='text-muted-foreground text-sm'>
          Comments are moderated before they appear publicly.
        </p>
      </div>

      <input
        type='text'
        tabIndex={-1}
        autoComplete='off'
        className='hidden'
        {...form.register('honeypot')}
      />

      <div className='grid gap-4 sm:grid-cols-2'>
        <FormFieldControl
          control={form.control}
          name='authorName'
          type='text'
          label='Name'
          required
        />
        <FormFieldControl
          control={form.control}
          name='authorEmail'
          type='email'
          label='Email'
          required
        />
      </div>
      <FormFieldControl
        control={form.control}
        name='authorUrl'
        type='url'
        label='Website'
        placeholder='https://example.com'
      />
      <FormFieldControl
        control={form.control}
        name='body'
        type='textarea'
        label='Comment'
        rows={5}
        required
      />

      {message ? (
        <p
          role='status'
          className='text-sm text-green-600 dark:text-green-400'
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role='alert'
          className='text-destructive text-sm'
        >
          {error}
        </p>
      ) : null}

      <Button
        type='submit'
        disabled={isPending}
      >
        {isPending ? 'Submitting…' : 'Submit comment'}
      </Button>
    </form>
  );
}
