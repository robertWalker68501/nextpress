# NextPress

NextPress is a modern, open-source content management system inspired by
WordPress. It is a single-site publishing platform with a public website, an
authenticated administration area, and a familiar editorial workflow.

## Core features

- Posts and hierarchical pages with draft, review, scheduled, published, private, and trash states
- WordPress-style Administrator, Editor, Author, Contributor, and Subscriber roles
- Administrator user management for creating accounts, assigning roles, and deleting users
- Categories, tags, revisions, comments, and media management
- Menus, site settings, search, RSS feed, sitemap, and SEO metadata
- Email/password authentication, email verification, and optional Google/GitHub sign-in

## Technology

- [Next.js 16.3.4](https://nextjs.org/) with the App Router and Cache Components
- [React 19](https://react.dev/) and [TypeScript 5](https://www.typescriptlang.org/)
- [Prisma ORM 7.10](https://www.prisma.io/) with PostgreSQL
- [Better Auth 1.7](https://www.better-auth.com/)
- [Tailwind CSS 4](https://tailwindcss.com/) and [shadcn 4.20](https://ui.shadcn.com/)
- [UploadThing 7.7](https://uploadthing.com/) for media uploads
- [TinyMCE](https://www.tiny.cloud/) for rich-text editing
- [Resend](https://resend.com/) and [React Email](https://react.email/) for transactional email
- ESLint 9, Prettier 3, Vitest, and Playwright

Application forms use the reusable controls in `components/form-fields`
whenever those controls support the required input.

## Project structure

```text
app/                    App Router pages, layouts, and API routes
components/form-fields/ Reusable form controls and rich-text editor
components/ui/          shadcn UI components
e2e/                    Playwright end-to-end tests
emails/                 Transactional email templates
lib/                    Authentication, Prisma, CMS logic, and shared utilities
prisma/                 Prisma schema and migrations
utils/                  Client-side integration helpers
```

## Local development

### Requirements

- Node.js 20.19 or newer
- npm
- PostgreSQL
- Credentials for the enabled third-party services

### Environment variables

Copy `.env.example` to `.env` and configure the values listed there. Important
variables include:

| Variable                                  | Purpose                                              |
| ----------------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`                            | PostgreSQL connection string                         |
| `BETTER_AUTH_SECRET`                      | Session signing secret (32+ random characters)       |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` | Application base URL                                 |
| `BOOTSTRAP_ADMIN_EMAIL`                   | Promote an existing account to Administrator on seed |
| `SEED_DEMO`                               | Set to `true` to add sample posts, pages, and menus  |
| `CRON_SECRET`                             | Bearer token for `POST /api/cron/publish-scheduled`  |
| `UPLOADTHING_TOKEN`                       | Media uploads and permanent file deletion            |
| `NEXT_PUBLIC_TINYMCE_API_KEY`             | Rich-text editor in the admin                        |
| `RESEND_API_KEY` / `EMAIL_FROM`           | Verification and password-reset email                |
| OAuth variables                           | Enable Google and/or GitHub sign-in buttons          |

OAuth credentials are required only for providers that are enabled. Never
commit `.env` files or service credentials.

### Install and run

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To bootstrap the first administrator, create an account through `/sign-up`,
set `BOOTSTRAP_ADMIN_EMAIL` to that account's email address, and run
`npm run db:seed` again. Set `SEED_DEMO=true` to add sample content.

If Turbopack HMR misbehaves in development, use `npm run dev:webpack`.

## Available scripts

```bash
npm run dev           # Start the development server (Turbopack)
npm run dev:webpack   # Start the development server (Webpack)
npm run build         # Create a production build
npm run start         # Start the production server
npm run lint          # Run ESLint
npm run typecheck     # Check TypeScript without emitting files
npm run format:check  # Check formatting
npm run test:run      # Run unit tests once
npm run test:e2e      # Run Playwright end-to-end tests
npm run db:generate   # Generate the Prisma client
npm run db:migrate    # Create and apply a development migration
npm run db:deploy     # Apply migrations in production
npm run db:seed       # Seed site defaults and the bootstrap administrator
npm run db:studio     # Open Prisma Studio
npm run email:dev     # Preview email templates
```

## Release verification

Run this sequence before deploying or opening a release pull request:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run db:generate
npm run build
```

For end-to-end smoke tests:

```bash
npx playwright install chromium
npm run test:e2e
```

### Fresh database checklist

On a clean PostgreSQL database:

1. Copy `.env.example` to `.env` and fill in required values.
2. Run `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`.
3. Sign up, set `BOOTSTRAP_ADMIN_EMAIL`, and run `npm run db:seed` again.
4. Start the app with `npm run dev` or `npm run build && npm run start`.
5. Verify sign-in, admin dashboard, content editor, media upload, comments, users, settings, menus, and the public homepage.

### Scheduled publishing

Production deployments should call the cron endpoint on a schedule:

```bash
curl -X POST https://your-domain.example/api/cron/publish-scheduled \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Current integrations

- Better Auth is exposed through `app/api/auth/[...all]/route.ts`.
- UploadThing routes are exposed through `app/api/uploadthing/` and require an
  authenticated session with upload capability.
- Prisma uses the PostgreSQL driver adapter and generates its client into
  `app/generated/prisma`.
- Verification and password-reset emails are rendered from `emails/` and sent
  through Resend when configured.

## Status

NextPress core CMS functionality is implemented for single-site publishing.
Plugin-style extensibility is out of scope for the current release.

## License

No license has been selected yet.
