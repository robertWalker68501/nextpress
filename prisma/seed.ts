import {
  ContentStatus,
  ContentType,
  TermType,
  UserRole,
} from '../app/generated/prisma/client';
import prisma from '../lib/prisma';

const defaultSettings = [
  { key: 'site_title', value: 'NextPress' },
  { key: 'site_tagline', value: 'A modern publishing platform' },
  { key: 'posts_per_page', value: 10 },
  { key: 'default_comment_status', value: 'OPEN' },
  { key: 'date_format', value: 'MMMM d, yyyy' },
  { key: 'permalink_structure', value: '/%postname%/' },
] as const;

async function seedDefaults() {
  await Promise.all(
    defaultSettings.map(({ key, value }) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: {},
      })
    )
  );

  await Promise.all([
    prisma.menu.upsert({
      where: { slug: 'primary' },
      create: { name: 'Primary navigation', slug: 'primary' },
      update: {},
    }),
    prisma.menu.upsert({
      where: { slug: 'footer' },
      create: { name: 'Footer navigation', slug: 'footer' },
      update: {},
    }),
    prisma.term.upsert({
      where: {
        type_slug: {
          type: TermType.CATEGORY,
          slug: 'uncategorized',
        },
      },
      create: {
        type: TermType.CATEGORY,
        name: 'Uncategorized',
        slug: 'uncategorized',
      },
      update: {},
    }),
  ]);
}

async function promoteBootstrapAdministrator() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.warn(
      `Bootstrap administrator ${email} was not found. Sign up first, then rerun the seed.`
    );
    return null;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { role: UserRole.ADMINISTRATOR },
  });
}

async function seedDemoContent(administratorId?: string) {
  if (process.env.SEED_DEMO !== 'true') return;

  const author =
    (administratorId
      ? await prisma.user.findUnique({ where: { id: administratorId } })
      : null) ??
    (await prisma.user.findFirst({
      where: { role: UserRole.ADMINISTRATOR },
      orderBy: { createdAt: 'asc' },
    }));

  if (!author) {
    console.warn(
      'Demo content was skipped because no administrator account exists.'
    );
    return;
  }

  await prisma.content.upsert({
    where: {
      type_slug: {
        type: ContentType.POST,
        slug: 'hello-nextpress',
      },
    },
    create: {
      type: ContentType.POST,
      status: ContentStatus.PUBLISHED,
      title: 'Hello, NextPress',
      slug: 'hello-nextpress',
      excerpt: 'Your NextPress site is ready for its first story.',
      body: '<p>Welcome to NextPress. Start publishing from the administration area.</p>',
      authorId: author.id,
      publishedAt: new Date(),
    },
    update: {},
  });

  await prisma.content.upsert({
    where: {
      type_slug: {
        type: ContentType.PAGE,
        slug: 'sample-page',
      },
    },
    create: {
      type: ContentType.PAGE,
      status: ContentStatus.PUBLISHED,
      title: 'Sample Page',
      slug: 'sample-page',
      body: '<p>This is a sample page. Edit or remove it when you are ready.</p>',
      authorId: author.id,
      publishedAt: new Date(),
    },
    update: {},
  });
}

async function main() {
  await seedDefaults();
  const administrator = await promoteBootstrapAdministrator();
  await seedDemoContent(administrator?.id);
  console.info('NextPress seed completed.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
