import 'server-only';

import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function deleteUploadedFile(storageKey: string) {
  if (!process.env.UPLOADTHING_TOKEN?.trim()) {
    throw new Error(
      'UploadThing is not configured. Set UPLOADTHING_TOKEN before deleting files from storage.'
    );
  }

  const result = await utapi.deleteFiles(storageKey);

  if (!result.success) {
    throw new Error('The file could not be removed from UploadThing storage.');
  }
}
