'use client';

import Link from 'next/link';
import type { Control } from 'react-hook-form';
import { useController } from 'react-hook-form';

import { FileUploadField } from '@/components/form-fields/FileUploadField';
import type { ContentEditorInput } from '@/lib/cms/validation';
import { cn } from '@/lib/utils';

export type LibraryImageOption = {
  key: string;
  name: string;
  url: string;
  size: number;
  type: string;
};

export function FeaturedMediaPicker({
  control,
  images,
  libraryHref,
}: {
  control: Control<ContentEditorInput>;
  images: LibraryImageOption[];
  libraryHref?: string;
}) {
  const { field } = useController({
    control,
    name: 'featuredImage',
  });
  const selected = field.value ?? [];
  const selectedKey = selected[0]?.key;

  return (
    <div className='grid gap-4'>
      {images.length ? (
        <div className='grid gap-2'>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-sm font-medium'>Choose from your library</p>
            {libraryHref ? (
              <Link
                href={libraryHref}
                className='text-primary text-sm underline-offset-4 hover:underline'
              >
                Manage media
              </Link>
            ) : null}
          </div>
          <div className='grid grid-cols-3 gap-2'>
            {images.map((image) => {
              const isSelected = selectedKey === image.key;

              return (
                <button
                  key={image.key}
                  type='button'
                  aria-pressed={isSelected}
                  className={cn(
                    'focus-visible:ring-ring/50 overflow-hidden rounded-md border focus-visible:ring-3',
                    isSelected && 'ring-primary ring-2'
                  )}
                  onClick={() => {
                    field.onChange(isSelected ? [] : [image]);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.name}
                    className='aspect-square w-full object-cover'
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <FileUploadField
        control={control}
        name='featuredImage'
        label={images.length ? 'Or upload a new image' : 'Image'}
        mode='image'
        maxFiles={1}
      />
    </div>
  );
}
