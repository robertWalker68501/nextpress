import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';

import { publishDueScheduledContent } from '@/lib/cms/content-mutations';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');
  if (!secret || !authorization?.startsWith('Bearer ')) return false;

  const supplied = authorization.slice('Bearer '.length);
  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);

  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const published = await publishDueScheduledContent();

  if (published.length > 0) {
    revalidateTag('content', 'max');
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/posts');
    revalidatePath('/admin/pages');

    for (const item of published) {
      revalidatePath(`/${item.slug}`);
    }
  }

  return Response.json({
    published: published.length,
    ids: published.map(({ id }) => id),
  });
}
