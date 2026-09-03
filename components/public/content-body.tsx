import { sanitizeContentHtml } from '@/lib/cms/sanitize';
import { cn } from '@/lib/utils';

export function ContentBody({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const sanitized = sanitizeContentHtml(html);

  return (
    <div
      className={cn(
        'public-content max-w-none leading-7 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h2]:font-heading [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_img]:rounded-lg [&_img]:border [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
