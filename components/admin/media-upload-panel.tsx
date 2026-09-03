'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud } from 'lucide-react';

import { registerMediaAction } from '@/app/admin/media-actions';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import {
  normalizeUploadThingFile,
  useUploadThing,
} from '@/utils/uploadthing';

const accept = 'image/*,video/*,audio/*';

export function MediaUploadPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRegistrationRef = useRef<
    ReturnType<typeof normalizeUploadThingFile>[] | null
  >(null);
  const [pendingRegistration, setPendingRegistration] = useState<
    ReturnType<typeof normalizeUploadThingFile>[] | null
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  async function registerUploadedFiles(
    payload: ReturnType<typeof normalizeUploadThingFile>[]
  ) {
    setIsRegistering(true);
    try {
      const result = await registerMediaAction(payload);

      toast.add({
        title: result.ok ? 'Upload complete' : 'Upload failed',
        description: result.message,
        type: result.ok ? 'success' : 'error',
      });

      if (result.ok) {
        pendingRegistrationRef.current = null;
        setPendingRegistration(null);
        setUploadError(null);
        router.refresh();
      } else {
        pendingRegistrationRef.current = payload;
        setPendingRegistration(payload);
        setUploadError(result.message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The upload completed, but the file could not be saved.';
      pendingRegistrationRef.current = payload;
      setPendingRegistration(payload);
      setUploadError(message);
      toast.add({
        title: 'Upload failed',
        description: message,
        type: 'error',
      });
    } finally {
      setIsRegistering(false);
    }
  }

  const { startUpload, isUploading } = useUploadThing('mediaUploader', {
    uploadProgressGranularity: 'fine',
    onClientUploadComplete: async (files) => {
      try {
        const payload = files.map(normalizeUploadThingFile);
        await registerUploadedFiles(payload);
      } finally {
        setProgress(100);
        window.setTimeout(() => setProgress(0), 500);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    onUploadProgress: (nextProgress) => {
      setProgress(nextProgress);
    },
    onUploadError: (error) => {
      setUploadError(error.message);
      setProgress(0);
      toast.add({
        title: 'Upload failed',
        description: error.message,
        type: 'error',
      });
      if (inputRef.current) inputRef.current.value = '';
    },
  });

  async function uploadSelectedFiles(selectedFiles: File[]) {
    if (selectedFiles.length === 0 || isUploading || isRegistering) return;

    const invalidFile = selectedFiles.find(
      (file) =>
        !file.type.startsWith('image/') &&
        !file.type.startsWith('audio/') &&
        !file.type.startsWith('video/')
    );

    if (invalidFile) {
      setUploadError('Only image, audio, and video files can be uploaded here.');
      return;
    }

    setUploadError(null);
    setProgress(1);

    try {
      await startUpload(selectedFiles.slice(0, 4));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'The upload failed.';
      setUploadError(message);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const isBusy = isUploading || isRegistering;

  return (
    <div className='rounded-xl border border-dashed p-4'>
      <input
        ref={inputRef}
        type='file'
        className='sr-only'
        accept={accept}
        multiple
        disabled={isBusy}
        onChange={(event) => {
          void uploadSelectedFiles(Array.from(event.target.files ?? []));
        }}
      />

      <div
        role='button'
        tabIndex={isBusy ? -1 : 0}
        aria-disabled={isBusy}
        className={cn(
          'flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center',
          'focus-visible:border-ring focus-visible:ring-ring/50 transition-colors outline-none focus-visible:ring-[3px]',
          isDragging && 'border-primary bg-primary/5',
          isBusy && 'cursor-not-allowed opacity-70'
        )}
        onClick={() => !isBusy && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!isBusy && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!isBusy) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!isBusy) {
            void uploadSelectedFiles(Array.from(event.dataTransfer.files));
          }
        }}
      >
        <div className='bg-muted flex size-11 items-center justify-center rounded-full'>
          {isBusy ? (
            <Loader2
              className='size-5 animate-spin'
              aria-hidden='true'
            />
          ) : (
            <UploadCloud
              className='size-5'
              aria-hidden='true'
            />
          )}
        </div>

        <div className='grid gap-1'>
          <p className='text-sm font-medium'>
            {isUploading
              ? `Uploading ${progress}%`
              : isRegistering
                ? 'Saving to media library…'
                : 'Drop files here or choose them from your device'}
          </p>
          <p className='text-muted-foreground text-xs'>
            Images, audio, and video files are supported. Up to 4 files per
            upload.
          </p>
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isBusy}
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Choose files
        </Button>

        {isUploading ? (
          <div className='bg-muted h-1.5 w-full max-w-xs overflow-hidden rounded-full'>
            <div
              className='bg-primary h-full transition-all'
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        {uploadError ? (
          <div className='grid max-w-md gap-2'>
            <p
              role='alert'
              className='text-destructive text-sm'
            >
              {uploadError}
            </p>
            {pendingRegistration ? (
              <Button
                type='button'
                size='sm'
                variant='outline'
                disabled={isRegistering}
                onClick={(event) => {
                  event.stopPropagation();
                  void registerUploadedFiles(pendingRegistration);
                }}
              >
                Retry saving to library
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
