import Image from 'next/image';
import Link from 'next/link';

import { ContentBody } from '@/components/public/content-body';
import { PostCardGrid } from '@/components/public/post-card';
import { Button } from '@/components/ui/button';
import {
  HOME_MEDIA_FILENAMES,
  getHomeLandingMedia,
  type HomeLandingMedia,
} from '@/lib/cms/home-landing';
import {
  listPublishedPosts,
  type PublicContent,
} from '@/lib/cms/public-queries';
import { sanitizePlainText } from '@/lib/cms/sanitize';

const FEATURES = [
  {
    filename: HOME_MEDIA_FILENAMES.editorial,
    title: 'Editorial workflow',
    description:
      'Move work from draft through review, schedule, and publish with the same states teams already know from WordPress.',
  },
  {
    filename: HOME_MEDIA_FILENAMES.media,
    title: 'Media library',
    description:
      'Upload images and files to UploadThing, then reuse them across posts, pages, featured images, and menus.',
  },
  {
    filename: HOME_MEDIA_FILENAMES.roles,
    title: 'Familiar roles',
    description:
      'Administrator, Editor, Author, Contributor, and Subscriber map to capabilities instead of a custom permission maze.',
  },
  {
    filename: HOME_MEDIA_FILENAMES.stack,
    title: 'Modern stack',
    description:
      'Next.js, Prisma, Better Auth, Tailwind, and Resend give you a CMS you can actually keep shipping on.',
  },
] as const;

function LandingImage({
  media,
  fallbackAlt,
  className,
  sizes,
  priority = false,
}: {
  media?: HomeLandingMedia | null;
  fallbackAlt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!media) return null;

  return (
    <Image
      src={media.url}
      alt={media.altText ?? fallbackAlt}
      width={1600}
      height={900}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

export async function HomeLanding({ content }: { content: PublicContent }) {
  const [posts, media] = await Promise.all([
    listPublishedPosts({ page: 1, pageSize: 3 }),
    getHomeLandingMedia(),
  ]);

  const hero =
    content.featuredMedia ?? media.get(HOME_MEDIA_FILENAMES.hero) ?? null;
  const cta = media.get(HOME_MEDIA_FILENAMES.cta) ?? null;
  const excerpt = sanitizePlainText(content.excerpt);

  return (
    <div className='grid gap-20'>
      <section className='grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center'>
        <div className='grid gap-6'>
          <p className='text-primary text-sm font-semibold tracking-wide uppercase'>
            NextPress
          </p>
          <h1 className='font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl'>
            A modern CMS for independent publishers
          </h1>
          {excerpt ? (
            <p className='text-muted-foreground text-lg leading-8 text-pretty'>
              {excerpt}
            </p>
          ) : null}
          <div className='flex flex-wrap gap-3'>
            <Button
              size='lg'
              nativeButton={false}
              render={<Link href='/sign-up' />}
            >
              Create an account
            </Button>
            <Button
              size='lg'
              variant='outline'
              nativeButton={false}
              render={<Link href='#featured-posts' />}
            >
              Read featured posts
            </Button>
          </div>
        </div>
        {hero ? (
          <div className='overflow-hidden rounded-2xl border shadow-xs'>
            <LandingImage
              media={{
                url: hero.url,
                altText: hero.altText ?? null,
                filename: HOME_MEDIA_FILENAMES.hero,
              }}
              fallbackAlt='A modern publishing studio with a laptop open to a content dashboard'
              sizes='(min-width: 1024px) 40vw, 100vw'
              className='aspect-16/10 w-full object-cover'
              priority
            />
          </div>
        ) : null}
      </section>

      <section className='grid gap-6'>
        <div className='max-w-3xl'>
          <h2 className='font-heading text-3xl font-semibold tracking-tight'>
            Built for the way you already publish
          </h2>
        </div>
        <ContentBody
          html={content.body}
          className='[&_p]:text-muted-foreground max-w-3xl [&_p]:text-base [&_p]:leading-8'
        />
      </section>

      <section className='grid gap-8'>
        <div className='max-w-3xl'>
          <h2 className='font-heading text-3xl font-semibold tracking-tight'>
            Everything you need to run a site
          </h2>
          <p className='text-muted-foreground mt-3 text-lg leading-8'>
            Posts, pages, media, comments, menus, and roles are included—so you
            can start publishing instead of assembling a stack.
          </p>
        </div>
        <div className='grid gap-6 md:grid-cols-2'>
          {FEATURES.map((feature) => {
            const image = media.get(feature.filename);

            return (
              <article
                key={feature.title}
                className='bg-card overflow-hidden rounded-2xl border shadow-xs'
              >
                <LandingImage
                  media={image}
                  fallbackAlt={feature.title}
                  sizes='(min-width: 768px) 40vw, 100vw'
                  className='aspect-4/3 w-full object-cover'
                />
                <div className='grid gap-2 p-6'>
                  <h3 className='font-heading text-xl font-semibold'>
                    {feature.title}
                  </h3>
                  <p className='text-muted-foreground leading-7'>
                    {feature.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {posts.items.length ? (
        <section
          id='featured-posts'
          className='grid scroll-mt-24 gap-8'
        >
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div className='max-w-2xl'>
              <h2 className='font-heading text-3xl font-semibold tracking-tight'>
                Featured posts
              </h2>
              <p className='text-muted-foreground mt-3 text-lg leading-8'>
                Latest stories from the NextPress library.
              </p>
            </div>
            <Button
              variant='outline'
              nativeButton={false}
              render={<Link href='/blog' />}
            >
              View all posts
            </Button>
          </div>
          <PostCardGrid
            items={posts.items}
            headingLevel='h3'
          />
        </section>
      ) : null}

      <section className='relative overflow-hidden rounded-3xl border'>
        {cta ? (
          <LandingImage
            media={cta}
            fallbackAlt='Sunrise over a quiet writing loft'
            sizes='100vw'
            className='absolute inset-0 size-full object-cover'
          />
        ) : null}
        <div className='from-background/95 via-background/85 to-background/70 relative grid gap-6 bg-linear-to-r px-6 py-16 sm:px-10 lg:max-w-2xl lg:px-14 lg:py-20'>
          <h2 className='font-heading text-3xl font-semibold tracking-tight sm:text-4xl'>
            Start publishing today
          </h2>
          <p className='text-muted-foreground text-lg leading-8'>
            Create an account to write posts, manage your profile, and—if you
            have editorial access—run the full NextPress administration area.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Button
              size='lg'
              nativeButton={false}
              render={<Link href='/sign-up' />}
            >
              Get started
            </Button>
            <Button
              size='lg'
              variant='outline'
              nativeButton={false}
              render={<Link href='/sign-in' />}
            >
              Sign in
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
