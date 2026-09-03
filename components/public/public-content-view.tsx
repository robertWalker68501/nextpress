import Link from 'next/link';
import { format } from 'date-fns';

import { ContentBody } from '@/components/public/content-body';
import { CommentForm } from '@/components/public/comment-form';
import {
  getApprovedComments,
  isCommentsOpen,
  type PublicContent,
} from '@/lib/cms/public-queries';
import {
  authorSlugFromName,
  getCategoryUrl,
  getTagUrl,
} from '@/lib/cms/public-urls';
import { sanitizePlainText } from '@/lib/cms/sanitize';

export async function PublicContentView({ content }: { content: PublicContent }) {
  const comments = await getApprovedComments(content.id);
  const authorName = content.author.displayName ?? content.author.name;
  const categories = content.terms
    .filter((entry) => entry.term.type === 'CATEGORY')
    .map((entry) => entry.term);
  const tags = content.terms
    .filter((entry) => entry.term.type === 'TAG')
    .map((entry) => entry.term);

  return (
    <article className='grid gap-8'>
      <header className='grid gap-4 border-b pb-8'>
        <h1 className='font-heading text-4xl font-bold tracking-tight text-balance'>
          {content.title}
        </h1>
        <div className='text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-sm'>
          {content.publishedAt ? (
            <time dateTime={content.publishedAt.toISOString()}>
              {format(content.publishedAt, 'MMMM d, yyyy')}
            </time>
          ) : null}
          <span>·</span>
          <Link
            href={`/author/${authorSlugFromName(authorName)}`}
            className='hover:text-foreground'
          >
            {authorName}
          </Link>
        </div>
        {content.featuredMedia ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.featuredMedia.url}
            alt={content.featuredMedia.altText ?? content.title}
            className='aspect-[16/9] w-full rounded-xl border object-cover'
          />
        ) : null}
        {content.excerpt ? (
          <p className='text-muted-foreground text-lg leading-8'>
            {sanitizePlainText(content.excerpt)}
          </p>
        ) : null}
        {categories.length || tags.length ? (
          <div className='flex flex-wrap gap-2 text-sm'>
            {categories.map((term) => (
              <Link
                key={term.id}
                href={getCategoryUrl(term.slug)}
                className='bg-muted hover:bg-muted/80 rounded-full px-3 py-1'
              >
                {term.name}
              </Link>
            ))}
            {tags.map((term) => (
              <Link
                key={term.id}
                href={getTagUrl(term.slug)}
                className='border hover:border-primary/40 rounded-full px-3 py-1'
              >
                #{term.name}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <ContentBody html={content.body} />

      <section className='grid gap-6 border-t pt-8'>
        <div>
          <h2 className='font-heading text-xl font-semibold'>
            Comments ({comments.length})
          </h2>
        </div>
        {comments.length ? (
          <ol className='grid gap-4'>
            {comments.map((comment) => (
              <li
                key={comment.id}
                className='rounded-xl border p-4'
              >
                <p className='font-medium'>{comment.authorName}</p>
                <p className='text-muted-foreground text-xs'>
                  {format(comment.createdAt, 'MMMM d, yyyy')}
                </p>
                <p className='mt-3 whitespace-pre-wrap'>{comment.body}</p>
                {comment.replies.length ? (
                  <ol className='mt-4 grid gap-3 border-l pl-4'>
                    {comment.replies.map((reply) => (
                      <li key={reply.id}>
                        <p className='font-medium'>{reply.authorName}</p>
                        <p className='text-muted-foreground text-xs'>
                          {format(reply.createdAt, 'MMMM d, yyyy')}
                        </p>
                        <p className='mt-2 whitespace-pre-wrap'>{reply.body}</p>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className='text-muted-foreground text-sm'>No comments yet.</p>
        )}
        {isCommentsOpen(content.commentPolicy) ? (
          <CommentForm contentId={content.id} />
        ) : (
          <p className='text-muted-foreground text-sm'>Comments are closed.</p>
        )}
      </section>
    </article>
  );
}
