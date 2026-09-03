import { Badge } from '@/components/ui/badge';
import {
  CommentStatusValue,
  type CommentStatusValue as CommentStatus,
} from '@/lib/cms/constants';

const labels = {
  [CommentStatusValue.PENDING]: 'Pending',
  [CommentStatusValue.APPROVED]: 'Approved',
  [CommentStatusValue.SPAM]: 'Spam',
  [CommentStatusValue.TRASH]: 'Trash',
} satisfies Record<CommentStatus, string>;

const variants = {
  [CommentStatusValue.PENDING]: 'outline',
  [CommentStatusValue.APPROVED]: 'default',
  [CommentStatusValue.SPAM]: 'destructive',
  [CommentStatusValue.TRASH]: 'secondary',
} as const;

export function CommentStatusBadge({ status }: { status: CommentStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

export function getCommentStatusLabel(status: CommentStatus) {
  return labels[status];
}
