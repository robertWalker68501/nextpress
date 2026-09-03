import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { UTApi, UTFile } from 'uploadthing/server';

import {
  CommentPolicy,
  ContentStatus,
  ContentType,
  UserRole,
} from '../app/generated/prisma/client';
import prisma from '../lib/prisma';

const ASSETS_DIR =
  process.env.HOME_MEDIA_DIR ??
  path.resolve(
    'C:/Users/rober/.cursor/projects/c-Code-nextjs-projects-nextpress/assets'
  );

const HOME_BODY = `
<p>NextPress is a modern, open-source content management system inspired by WordPress. It is a single-site publishing platform with a public website, an authenticated administration area, and a familiar editorial workflow.</p>
<p>Write posts, organize hierarchical pages, upload media, and moderate comments from one place. Roles from Subscriber through Administrator map to the capabilities teams already understand—without a custom permission maze.</p>
<p>Under the hood, NextPress runs on Next.js, Prisma, Better Auth, Tailwind, UploadThing, and Resend, so you can publish quickly and keep the codebase you actually want to maintain.</p>
<h2>What you can do</h2>
<ul>
<li>Draft, review, schedule, and publish posts and hierarchical pages</li>
<li>Manage categories, tags, revisions, comments, and a full media library</li>
<li>Configure menus, site settings, search, RSS, and SEO metadata</li>
<li>Sign in with email or optional Google and GitHub accounts</li>
</ul>
`.trim();

const MEDIA_FILES = [
  {
    filename: 'home-hero.png',
    altText:
      'A bright publishing studio with a laptop open to a content dashboard',
    caption: 'Home hero',
    description: 'Hero image for the NextPress home page.',
  },
  {
    filename: 'feature-editorial.png',
    altText:
      'An editorial desk with a monitor showing a draft-to-publish workflow',
    caption: 'Editorial workflow',
    description: 'Feature illustration for the NextPress editorial workflow.',
  },
  {
    filename: 'feature-media.png',
    altText:
      'A media library workspace with a grid of photographs on a large display',
    caption: 'Media library',
    description: 'Feature illustration for the NextPress media library.',
  },
  {
    filename: 'feature-roles.png',
    altText: 'An editorial team collaborating around a table',
    caption: 'Familiar roles',
    description: 'Feature illustration for NextPress user roles.',
  },
  {
    filename: 'feature-stack.png',
    altText: 'A modern software desk with layered glass interface cards',
    caption: 'Modern stack',
    description: 'Feature illustration for the NextPress technology stack.',
  },
  {
    filename: 'home-cta.png',
    altText: 'Sunrise light filling a quiet writing loft',
    caption: 'Get started',
    description: 'Call-to-action background for the NextPress home page.',
  },
] as const;

const FEATURED_POSTS = [
  {
    slug: 'hello-nextpress',
    title: 'Hello, NextPress',
    excerpt: 'Your NextPress site is ready for its first story.',
    body: '<p>Welcome to NextPress. This is your first published story. Edit it from the administration area, or keep it as a marker for the day the site went live.</p><p>From here you can draft new posts, organize pages, and build the public site your readers will see.</p>',
    mediaFilename: 'home-hero.png',
    publishedOffsetDays: 6,
  },
  {
    slug: 'editorial-workflow-from-draft-to-publish',
    title: 'Editorial workflow from draft to publish',
    excerpt:
      'Draft, review, schedule, and publish with the same states teams already know.',
    body: '<p>NextPress follows a WordPress-style workflow. Contributors draft, editors review, and administrators can schedule or publish immediately.</p><p>Revisions keep a history of each save, so you can look back at how a story changed before it went live.</p>',
    mediaFilename: 'feature-editorial.png',
    publishedOffsetDays: 4,
  },
  {
    slug: 'a-media-library-built-for-stories',
    title: 'A media library built for stories',
    excerpt:
      'Upload images to UploadThing and reuse them across posts, pages, and menus.',
    body: '<p>Every upload lands in the media library with alt text, captions, and descriptions you can edit later.</p><p>Featured images and inline editor uploads share the same storage, so your public site and administration area stay in sync.</p>',
    mediaFilename: 'feature-media.png',
    publishedOffsetDays: 2,
  },
] as const;

type UploadedMedia = {
  id: string;
  filename: string;
  url: string;
};

function unwrapUpload(result: {
  data?: {
    key: string;
    name: string;
    size: number;
    type: string;
    ufsUrl?: string;
    url?: string;
  } | null;
  error?: { message?: string } | null;
}) {
  if (result.error || !result.data) {
    throw new Error(
      result.error?.message ?? 'UploadThing did not return a file.'
    );
  }

  const url = result.data.ufsUrl ?? result.data.url;
  if (!url) {
    throw new Error('UploadThing did not return a file URL.');
  }

  return {
    key: result.data.key,
    name: result.data.name,
    size: result.data.size,
    type: result.data.type || 'image/png',
    url,
  };
}

async function resolveAuthor() {
  const administrator = await prisma.user.findFirst({
    where: { role: UserRole.ADMINISTRATOR },
    orderBy: { createdAt: 'asc' },
  });

  if (administrator) return administrator;

  const anyUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!anyUser) {
    throw new Error(
      'No user accounts exist. Sign up first, then rerun this script.'
    );
  }

  return anyUser;
}

async function uploadHomeMedia(uploadedById: string) {
  if (!process.env.UPLOADTHING_TOKEN?.trim()) {
    throw new Error('UPLOADTHING_TOKEN is not set.');
  }

  const utapi = new UTApi();
  const records = new Map<string, UploadedMedia>();

  for (const file of MEDIA_FILES) {
    const existing = await prisma.media.findFirst({
      where: { filename: file.filename, deletedAt: null },
    });

    if (existing) {
      const updated = await prisma.media.update({
        where: { id: existing.id },
        data: {
          altText: file.altText,
          caption: file.caption,
          description: file.description,
        },
      });
      records.set(file.filename, {
        id: updated.id,
        filename: updated.filename,
        url: updated.url,
      });
      console.info(`Reused media ${file.filename}`);
      continue;
    }

    const buffer = await readFile(path.join(ASSETS_DIR, file.filename));
    const uploaded = unwrapUpload(
      await utapi.uploadFiles(
        new UTFile([buffer], file.filename, { type: 'image/png' })
      )
    );

    const created = await prisma.media.create({
      data: {
        storageKey: uploaded.key,
        url: uploaded.url,
        filename: file.filename,
        mimeType: uploaded.type,
        sizeBytes: uploaded.size,
        altText: file.altText,
        caption: file.caption,
        description: file.description,
        uploadedById,
      },
    });

    records.set(file.filename, {
      id: created.id,
      filename: created.filename,
      url: created.url,
    });
    console.info(`Uploaded media ${file.filename}`);
  }

  return records;
}

async function upsertHomePage(
  authorId: string,
  heroMediaId: string | undefined
) {
  const publishedAt = new Date();
  const page = await prisma.content.upsert({
    where: {
      type_slug: {
        type: ContentType.PAGE,
        slug: 'home',
      },
    },
    create: {
      type: ContentType.PAGE,
      status: ContentStatus.PUBLISHED,
      title: 'Home',
      slug: 'home',
      excerpt:
        'NextPress is a modern, open-source CMS inspired by WordPress—with posts, pages, media, comments, and roles on a Next.js stack.',
      body: HOME_BODY,
      commentPolicy: CommentPolicy.CLOSED,
      authorId,
      featuredMediaId: heroMediaId,
      publishedAt,
    },
    update: {
      status: ContentStatus.PUBLISHED,
      title: 'Home',
      excerpt:
        'NextPress is a modern, open-source CMS inspired by WordPress—with posts, pages, media, comments, and roles on a Next.js stack.',
      body: HOME_BODY,
      commentPolicy: CommentPolicy.CLOSED,
      featuredMediaId: heroMediaId,
      deletedAt: null,
      publishedAt,
    },
  });

  const latestRevision = await prisma.contentRevision.aggregate({
    where: { contentId: page.id },
    _max: { revisionNumber: true },
  });

  await prisma.contentRevision.create({
    data: {
      contentId: page.id,
      revisionNumber: (latestRevision._max.revisionNumber ?? 0) + 1,
      title: page.title,
      excerpt: page.excerpt,
      body: page.body,
      statusSnapshot: page.status,
      authorId,
    },
  });

  return page;
}

async function upsertFeaturedPosts(
  authorId: string,
  media: Map<string, UploadedMedia>
) {
  for (const post of FEATURED_POSTS) {
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - post.publishedOffsetDays);

    await prisma.content.upsert({
      where: {
        type_slug: {
          type: ContentType.POST,
          slug: post.slug,
        },
      },
      create: {
        type: ContentType.POST,
        status: ContentStatus.PUBLISHED,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body,
        authorId,
        featuredMediaId: media.get(post.mediaFilename)?.id,
        publishedAt,
      },
      update: {
        status: ContentStatus.PUBLISHED,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        featuredMediaId: media.get(post.mediaFilename)?.id,
        deletedAt: null,
        publishedAt,
      },
    });
  }
}

async function setHomeAsFrontPage(pageId: string) {
  await Promise.all([
    prisma.siteSetting.upsert({
      where: { key: 'show_on_front' },
      create: { key: 'show_on_front', value: 'page' },
      update: { value: 'page' },
    }),
    prisma.siteSetting.upsert({
      where: { key: 'page_on_front' },
      create: { key: 'page_on_front', value: pageId },
      update: { value: pageId },
    }),
  ]);
}

async function ensureHomeMenuItem(pageId: string) {
  const menu = await prisma.menu.upsert({
    where: { slug: 'primary' },
    create: { name: 'Primary navigation', slug: 'primary' },
    update: {},
  });

  const existing = await prisma.menuItem.findFirst({
    where: {
      menuId: menu.id,
      OR: [{ url: '/' }, { contentId: pageId }, { label: 'Home' }],
    },
  });

  if (existing) {
    await prisma.menuItem.update({
      where: { id: existing.id },
      data: { label: 'Home', url: '/', contentId: null, sortOrder: 0 },
    });
    return;
  }

  await prisma.menuItem.updateMany({
    where: { menuId: menu.id },
    data: { sortOrder: { increment: 1 } },
  });

  await prisma.menuItem.create({
    data: {
      menuId: menu.id,
      label: 'Home',
      url: '/',
      sortOrder: 0,
    },
  });
}

async function main() {
  const author = await resolveAuthor();
  console.info(`Using author ${author.email} (${author.role})`);

  const media = await uploadHomeMedia(author.id);
  const page = await upsertHomePage(author.id, media.get('home-hero.png')?.id);
  await upsertFeaturedPosts(author.id, media);
  await setHomeAsFrontPage(page.id);
  await ensureHomeMenuItem(page.id);

  console.info(`Home page ready: ${page.id}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
