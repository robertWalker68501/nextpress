export const ContentTypeValue = {
  POST: 'POST',
  PAGE: 'PAGE',
} as const;

export const ContentStatusValue = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  PRIVATE: 'PRIVATE',
  TRASH: 'TRASH',
} as const;

export const CommentPolicyValue = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;

export const TermTypeValue = {
  CATEGORY: 'CATEGORY',
  TAG: 'TAG',
} as const;

export const CommentStatusValue = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  SPAM: 'SPAM',
  TRASH: 'TRASH',
} as const;

export type ContentTypeValue =
  (typeof ContentTypeValue)[keyof typeof ContentTypeValue];
export type ContentStatusValue =
  (typeof ContentStatusValue)[keyof typeof ContentStatusValue];
export type CommentPolicyValue =
  (typeof CommentPolicyValue)[keyof typeof CommentPolicyValue];
export type TermTypeValue = (typeof TermTypeValue)[keyof typeof TermTypeValue];
export type CommentStatusValue =
  (typeof CommentStatusValue)[keyof typeof CommentStatusValue];
