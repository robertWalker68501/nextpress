import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import { UserRole } from '@/app/generated/prisma/client';
import { hasCapability } from '@/lib/auth/capabilities';
import { auth } from '@/lib/auth';
import { registerUploadedFileRecord } from '@/lib/cms/media-mutations';
import prisma from '@/lib/prisma';
import { updateTag } from 'next/cache';

const f = createUploadthing();

type AuthSessionUser = {
  id: string;
  role?: UserRole;
};

async function requireUploadUser(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    throw new UploadThingError('Unauthorized');
  }

  const sessionUser = session.user as AuthSessionUser;

  if (sessionUser.role) {
    if (!hasCapability(sessionUser.role, 'uploadFiles')) {
      throw new UploadThingError('Forbidden');
    }

    return {
      userId: sessionUser.id,
      role: sessionUser.role,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, role: true },
  });

  if (!user || !hasCapability(user.role, 'uploadFiles')) {
    throw new UploadThingError('Forbidden');
  }

  return {
    userId: user.id,
    role: user.role,
  };
}

async function persistUpload(
  userId: string,
  file: {
    key: string;
    name: string;
    size: number;
    type: string;
    ufsUrl?: string;
    url?: string;
  }
) {
  const url = file.ufsUrl ?? file.url;
  if (!url) return;

  try {
    await registerUploadedFileRecord(userId, {
      key: file.key,
      url,
      name: file.name,
      type: file.type,
      size: file.size,
    });
    updateTag('media');
  } catch (error) {
    console.error('Failed to register uploaded media.', error);
  }
}

export const ourFileRouter = {
  /**
   * Used by the TinyMCE editor and by FileUploadField when
   * mode="image".
   *
   * Allows up to five images per upload request. TinyMCE still
   * uploads one image at a time, while FileUploadField may upload
   * several images together.
   */
  imageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      return requireUploadUser(req);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await persistUpload(metadata.userId, file);
      return {
        uploadedBy: metadata.userId,
        key: file.key,
        name: file.name,
        size: file.size,
        url: file.ufsUrl,
      };
    }),

  /**
   * Used by the CMS media library for mixed image, audio, and video uploads.
   * Per-type limits constrain each UploadThing request.
   */
  mediaUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 4,
      contentDisposition: 'inline',
    },
    audio: {
      maxFileSize: '32MB',
      maxFileCount: 4,
      contentDisposition: 'inline',
    },
    video: {
      maxFileSize: '128MB',
      maxFileCount: 4,
      contentDisposition: 'inline',
    },
  })
    .middleware(async ({ req }) => {
      return requireUploadUser(req);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await persistUpload(metadata.userId, file);
      return {
        uploadedBy: metadata.userId,
        key: file.key,
        name: file.name,
        size: file.size,
        url: file.ufsUrl,
      };
    }),

  /**
   * Used by FileUploadField when mode="audio".
   *
   * Audio files are kept separate from general attachments so their larger
   * limit does not widen the limit for documents.
   */
  audioUploader: f({
    audio: {
      maxFileSize: '64MB',
      maxFileCount: 12,
      contentDisposition: 'inline',
    },
  })
    .middleware(async ({ req }) => {
      return requireUploadUser(req);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await persistUpload(metadata.userId, file);
      return {
        uploadedBy: metadata.userId,
        key: file.key,
        name: file.name,
        size: file.size,
        url: file.ufsUrl,
      };
    }),

  fileUploader: f({
    /**
     * The blob type accepts general CMS documents. More specific file rules
     * can be introduced with the media-library data model.
     */
    blob: {
      maxFileSize: '16MB',
      maxFileCount: 5,
      contentDisposition: 'attachment',
    },
  })
    .middleware(async ({ req }) => {
      return requireUploadUser(req);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await persistUpload(metadata.userId, file);
      return {
        uploadedBy: metadata.userId,
        key: file.key,
        name: file.name,
        size: file.size,
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
