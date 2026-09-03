'use client';

import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BLOG_PAGE_SIZE_OPTIONS,
  getBlogUrl,
  type BlogPageSize,
} from '@/lib/cms/blog';

export function PostsPerPageSelect({
  value,
  defaultPerPage,
}: {
  value: BlogPageSize;
  defaultPerPage: number;
}) {
  const router = useRouter();
  const options = BLOG_PAGE_SIZE_OPTIONS.map((option) => ({
    label: `${option} per page`,
    value: String(option),
  }));

  return (
    <div className='flex items-center gap-2'>
      <label
        htmlFor='posts-per-page'
        className='text-muted-foreground text-sm'
      >
        Posts per page
      </label>
      <Select
        value={String(value)}
        onValueChange={(next) => {
          if (typeof next !== 'string') return;
          router.push(
            getBlogUrl({
              page: 1,
              perPage: Number.parseInt(next, 10),
              defaultPerPage,
            })
          );
        }}
        items={options}
      >
        <SelectTrigger
          id='posts-per-page'
          size='sm'
          aria-label='Posts per page'
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              label={option.label}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
