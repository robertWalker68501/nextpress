import type { ComponentProps } from 'react';
import { notFound } from 'next/navigation';

import {
  CommentPolicy,
  ContentStatus,
  ContentType,
  TermType,
} from '@/app/generated/prisma/client';
import { ContentEditorForm } from '@/components/admin/content-editor-form';
import { ContentRevisionsPanel } from '@/components/admin/content-revisions-panel';
import { requireCapability } from '@/lib/auth/session';
import {
  getContentForEditor,
  getEditorOptions,
} from '@/lib/cms/content-queries';
import type { ContentEditorInput } from '@/lib/cms/validation';
import { getAvailableStatuses } from '@/lib/cms/workflow';

export async function ContentEditorPage({
  type,
  id,
  redirectBase,
  saveAction,
  showRevisions = true,
}: {
  type: ContentType;
  id?: string;
  redirectBase?: string;
  saveAction?: ComponentProps<typeof ContentEditorForm>['saveAction'];
  showRevisions?: boolean;
}) {
  const actor = await requireCapability('editContent');
  const content = id ? await getContentForEditor(actor, id) : null;

  if (id && (!content || content.type !== type)) notFound();

  const { categories, parentPages } = await getEditorOptions(type, id);
  const subject = content ?? {
    authorId: actor.id,
    status: ContentStatus.DRAFT,
  };
  const availableStatuses = getAvailableStatuses(actor, subject);
  const singular = type === ContentType.POST ? 'post' : 'page';
  const defaultValues: ContentEditorInput = content
    ? {
        id: content.id,
        type: content.type,
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt ?? '',
        body: content.body,
        status: content.status,
        scheduledAt: content.scheduledAt
          ? content.scheduledAt.toISOString().slice(0, 16)
          : null,
        commentPolicy: content.commentPolicy,
        parentId: content.parentId ?? 'NONE',
        categoryIds: content.terms
          .filter(({ term }) => term.type === TermType.CATEGORY)
          .map(({ termId }) => termId),
        tagNames: content.terms
          .filter(({ term }) => term.type === TermType.TAG)
          .map(({ term }) => term.name),
        featuredImage: content.featuredMedia
          ? [
              {
                key: content.featuredMedia.storageKey,
                name: content.featuredMedia.filename,
                url: content.featuredMedia.url,
                size: content.featuredMedia.sizeBytes,
                type: content.featuredMedia.mimeType,
              },
            ]
          : [],
      }
    : {
        type,
        title: '',
        slug: '',
        excerpt: '',
        body: '',
        status: ContentStatus.DRAFT,
        scheduledAt: null,
        commentPolicy: CommentPolicy.OPEN,
        parentId: 'NONE',
        categoryIds:
          categories.find(({ name }) => name === 'Uncategorized')?.id !==
          undefined
            ? [categories.find(({ name }) => name === 'Uncategorized')!.id]
            : [],
        tagNames: [],
        featuredImage: [],
      };

  return (
    <div className='grid gap-8'>
      <div>
        <h1 className='font-heading text-3xl font-bold tracking-tight'>
          {content ? `Edit ${singular}` : `Add ${singular}`}
        </h1>
        <p className='text-muted-foreground mt-1'>
          {content
            ? `Last updated ${new Intl.DateTimeFormat('en', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(content.updatedAt)}.`
            : `Create a new ${singular} for your site.`}
        </p>
      </div>

      <ContentEditorForm
        defaultValues={defaultValues}
        availableStatuses={availableStatuses}
        categories={categories.map(({ id: value, name: label }) => ({
          label,
          value,
        }))}
        parentPages={parentPages.map(({ id: value, title: label }) => ({
          label,
          value,
        }))}
        redirectBase={redirectBase}
        saveAction={saveAction}
      />

      {content && showRevisions ? (
        <ContentRevisionsPanel contentId={content.id} />
      ) : null}
    </div>
  );
}
