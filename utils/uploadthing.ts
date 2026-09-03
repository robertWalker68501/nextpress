import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

export type UploadedFilePayload = {
  key: string;
  name: string;
  url: string;
  size: number;
  type: string;
};

export function normalizeUploadThingFile(file: {
  key: string;
  name: string;
  size: number;
  type?: string;
  url?: string;
  ufsUrl?: string;
  serverData?: { url?: string } | null;
}): UploadedFilePayload {
  const url = file.ufsUrl ?? file.url ?? file.serverData?.url;

  if (!url) {
    throw new Error('UploadThing did not return a file URL.');
  }

  return {
    key: file.key,
    name: file.name,
    url,
    size: file.size,
    type:
      file.type?.toLowerCase() ??
      file.name.split('.').pop()?.toLowerCase() ??
      'application/octet-stream',
  };
}

export const UploadButton = generateUploadButton<OurFileRouter>();

export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export const { useUploadThing, uploadFiles, getRouteConfig } =
  generateReactHelpers<OurFileRouter>();
