import Image from 'next/image';

import { NEXTPRESS_LOGO } from '@/lib/nextpress-logo';
import { cn } from '@/lib/utils';

export function NextPressLogo({
  size = 32,
  className,
  alt = 'NextPress',
  priority = false,
}: {
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-lg',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={NEXTPRESS_LOGO.light}
        alt={alt}
        width={size}
        height={size}
        className='size-full dark:hidden'
        priority={priority}
      />
      <Image
        src={NEXTPRESS_LOGO.dark}
        alt=''
        width={size}
        height={size}
        className='hidden size-full dark:block'
        priority={priority}
      />
    </span>
  );
}
