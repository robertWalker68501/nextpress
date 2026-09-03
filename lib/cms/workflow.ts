import { ContentStatus, type UserRole } from '@/app/generated/prisma/client';
import {
  canDeleteContent,
  canEditContent,
  canPublishContent,
} from '@/lib/auth/capabilities';

type Actor = {
  id: string;
  role: UserRole;
};

type Subject = {
  authorId: string;
  status: ContentStatus;
};

export function canTransitionContent(
  actor: Actor,
  content: Subject,
  nextStatus: ContentStatus
) {
  if (nextStatus === content.status) {
    return canEditContent(actor, content);
  }

  if (nextStatus === ContentStatus.TRASH) {
    return canDeleteContent(actor, content);
  }

  if (content.status === ContentStatus.TRASH) {
    return (
      nextStatus === ContentStatus.DRAFT && canDeleteContent(actor, content)
    );
  }

  if (nextStatus === ContentStatus.PENDING_REVIEW) {
    return canEditContent(actor, content);
  }

  if (nextStatus === ContentStatus.DRAFT) {
    return canEditContent(actor, content) || canPublishContent(actor, content);
  }

  if (
    nextStatus === ContentStatus.PUBLISHED ||
    nextStatus === ContentStatus.PRIVATE ||
    nextStatus === ContentStatus.SCHEDULED
  ) {
    return canPublishContent(actor, content);
  }

  return false;
}

export function getAvailableStatuses(actor: Actor, content: Subject) {
  return [
    ContentStatus.DRAFT,
    ContentStatus.PENDING_REVIEW,
    ContentStatus.PUBLISHED,
    ContentStatus.SCHEDULED,
    ContentStatus.PRIVATE,
  ].filter((status) => canTransitionContent(actor, content, status));
}

export function deriveWorkflowDates({
  currentStatus,
  nextStatus,
  currentPublishedAt,
  scheduledAt,
  now = new Date(),
}: {
  currentStatus: ContentStatus;
  nextStatus: ContentStatus;
  currentPublishedAt?: Date | null;
  scheduledAt?: Date | null;
  now?: Date;
}) {
  if (nextStatus === ContentStatus.SCHEDULED) {
    if (!scheduledAt || scheduledAt <= now) {
      throw new Error('Scheduled content requires a future publication date.');
    }

    return {
      status: nextStatus,
      publishedAt: null,
      scheduledAt,
      deletedAt: null,
    };
  }

  if (
    nextStatus === ContentStatus.PUBLISHED ||
    nextStatus === ContentStatus.PRIVATE
  ) {
    return {
      status: nextStatus,
      publishedAt: currentPublishedAt ?? now,
      scheduledAt: null,
      deletedAt: null,
    };
  }

  if (nextStatus === ContentStatus.TRASH) {
    return {
      status: nextStatus,
      publishedAt: currentPublishedAt ?? null,
      scheduledAt: null,
      deletedAt: now,
    };
  }

  return {
    status: nextStatus,
    publishedAt:
      currentStatus === ContentStatus.PUBLISHED ||
      currentStatus === ContentStatus.PRIVATE
        ? (currentPublishedAt ?? null)
        : null,
    scheduledAt: null,
    deletedAt: null,
  };
}
