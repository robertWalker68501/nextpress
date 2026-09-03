import 'server-only';

import { cacheTag } from 'next/cache';

import {
  CommentPolicy,
  CommentStatus,
  ContentStatus,
  ContentType,
  TermType,
} from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';

const publishedContentWhere = {
  status: ContentStatus.PUBLISHED,
  deletedAt: null,
  publishedAt: { not: null },
} as const;

const publicContentSelect = {
  id: true,
  type: true,
  title: true,
  slug: true,
  excerpt: true,
  body: true,
  commentPolicy: true,
  publishedAt: true,
  updatedAt: true,
  parentId: true,
  author: {
    select: {
      id: true,
      name: true,
      displayName: true,
    },
  },
  featuredMedia: {
    select: {
      url: true,
      altText: true,
      filename: true,
    },
  },
  terms: {
    select: {
      term: {
        select: {
          id: true,
          type: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} as const;

export type PublicContent = NonNullable<
  Awaited<ReturnType<typeof getPublishedPostBySlug>>
>;

export async function getPublishedPostBySlug(slug: string) {
  'use cache';
  cacheTag('content', `content:post:${slug}`);

  return prisma.content.findFirst({
    where: {
      ...publishedContentWhere,
      type: ContentType.POST,
      slug,
    },
    select: publicContentSelect,
  });
}

export async function getPublishedPageBySlug(slug: string, parentId?: string) {
  'use cache';
  cacheTag('content', `content:page:${slug}`);

  return prisma.content.findFirst({
    where: {
      ...publishedContentWhere,
      type: ContentType.PAGE,
      slug,
      parentId: parentId ?? null,
    },
    select: publicContentSelect,
  });
}

export async function getPublishedPageBySlugPath(slugPath: string[]) {
  if (slugPath.length === 0) return null;

  let parentId: string | null = null;
  let page: Awaited<ReturnType<typeof getPublishedPageBySlug>> = null;

  for (const slug of slugPath) {
    page = await getPublishedPageBySlug(slug, parentId ?? undefined);
    if (!page) return null;
    parentId = page.id;
  }

  return page;
}

export async function listPublishedPosts({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
}) {
  'use cache';
  cacheTag('content', `content:posts:${page}:${pageSize}`);

  const where = {
    ...publishedContentWhere,
    type: ContentType.POST,
  };

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            displayName: true,
          },
        },
        featuredMedia: {
          select: {
            url: true,
            altText: true,
          },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPublishedContentById(id: string) {
  'use cache';
  cacheTag('content', `content:id:${id}`);

  return prisma.content.findFirst({
    where: {
      ...publishedContentWhere,
      id,
    },
    select: publicContentSelect,
  });
}

export async function searchPublishedContent({
  query,
  page = 1,
  pageSize = 10,
}: {
  query: string;
  page?: number;
  pageSize?: number;
}) {
  'use cache';
  cacheTag('content', `content:search:${query}:${page}`);

  const trimmed = query.trim();
  if (!trimmed) {
    return { items: [], total: 0, page, totalPages: 1 };
  }

  const where = {
    ...publishedContentWhere,
    OR: [
      { title: { contains: trimmed, mode: 'insensitive' as const } },
      { excerpt: { contains: trimmed, mode: 'insensitive' as const } },
      { body: { contains: trimmed, mode: 'insensitive' as const } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listPublishedPostsByTerm({
  termType,
  slug,
  page = 1,
  pageSize = 10,
}: {
  termType: TermType;
  slug: string;
  page?: number;
  pageSize?: number;
}) {
  'use cache';
  cacheTag('content', 'terms', `content:term:${termType}:${slug}:${page}`);

  const term = await prisma.term.findFirst({
    where: { type: termType, slug },
    select: { id: true, name: true, description: true },
  });

  if (!term) return null;

  const where = {
    ...publishedContentWhere,
    type: ContentType.POST,
    terms: { some: { termId: term.id } },
  };

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    term,
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listPublishedPostsByAuthor({
  authorSlug,
  page = 1,
  pageSize = 10,
}: {
  authorSlug: string;
  page?: number;
  pageSize?: number;
}) {
  'use cache';
  cacheTag('content', `content:author:${authorSlug}:${page}`);

  const authors = await prisma.user.findMany({
    where: {
      authoredContent: {
        some: {
          ...publishedContentWhere,
          type: ContentType.POST,
        },
      },
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      bio: true,
    },
  });

  const author = authors.find((entry) => {
    const slug = (entry.displayName ?? entry.name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug === authorSlug;
  });

  if (!author) return null;

  const where = {
    ...publishedContentWhere,
    type: ContentType.POST,
    authorId: author.id,
  };

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    author,
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getApprovedComments(contentId: string) {
  'use cache';
  cacheTag('comments', `comments:content:${contentId}`);

  return prisma.comment.findMany({
    where: {
      contentId,
      status: CommentStatus.APPROVED,
      deletedAt: null,
      parentId: null,
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      body: true,
      authorName: true,
      createdAt: true,
      replies: {
        where: {
          status: CommentStatus.APPROVED,
          deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          body: true,
          authorName: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function getSitemapEntries() {
  'use cache';
  cacheTag('content', 'terms');

  const [content, terms] = await Promise.all([
    prisma.content.findMany({
      where: publishedContentWhere,
      select: {
        slug: true,
        type: true,
        updatedAt: true,
        parent: { select: { slug: true, parent: { select: { slug: true } } } },
      },
    }),
    prisma.term.findMany({
      select: { slug: true, type: true, updatedAt: true },
    }),
  ]);

  return { content, terms };
}

export async function getFeedEntries(limit = 20) {
  'use cache';
  cacheTag('content');

  return prisma.content.findMany({
    where: {
      ...publishedContentWhere,
      type: ContentType.POST,
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      body: true,
      publishedAt: true,
      updatedAt: true,
      author: {
        select: {
          name: true,
          displayName: true,
        },
      },
    },
  });
}

export function isCommentsOpen(commentPolicy: CommentPolicy) {
  return commentPolicy === CommentPolicy.OPEN;
}
