import { Badge } from '@/components/ui/badge';
import {
  ContentStatusValue,
  type ContentStatusValue as ContentStatus,
} from '@/lib/cms/constants';

const labels = {
  [ContentStatusValue.DRAFT]: 'Draft',
  [ContentStatusValue.PENDING_REVIEW]: 'Pending review',
  [ContentStatusValue.SCHEDULED]: 'Scheduled',
  [ContentStatusValue.PUBLISHED]: 'Published',
  [ContentStatusValue.PRIVATE]: 'Private',
  [ContentStatusValue.TRASH]: 'Trash',
} satisfies Record<ContentStatus, string>;

const variants = {
  [ContentStatusValue.DRAFT]: 'secondary',
  [ContentStatusValue.PENDING_REVIEW]: 'outline',
  [ContentStatusValue.SCHEDULED]: 'outline',
  [ContentStatusValue.PUBLISHED]: 'default',
  [ContentStatusValue.PRIVATE]: 'secondary',
  [ContentStatusValue.TRASH]: 'destructive',
} as const;

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

export function getContentStatusLabel(status: ContentStatus) {
  return labels[status];
}
