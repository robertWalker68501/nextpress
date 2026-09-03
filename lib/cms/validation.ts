import { z } from 'zod';

import {
  CommentPolicyValue,
  ContentStatusValue,
  ContentTypeValue,
  TermTypeValue,
} from '@/lib/cms/constants';

const uploadedFileSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  url: z.url(),
  size: z.number().int().nonnegative(),
  type: z.string().min(1),
});

export const contentEditorSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.enum(ContentTypeValue),
  title: z.string().trim().min(1, 'Title is required.').max(200),
  slug: z
    .string()
    .trim()
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and hyphens only.'
    )
    .optional()
    .or(z.literal('')),
  excerpt: z.string().trim().max(500).optional(),
  body: z.string(),
  status: z.enum(ContentStatusValue),
  scheduledAt: z.string().nullable().optional(),
  commentPolicy: z.enum(CommentPolicyValue),
  parentId: z.string().nullable().optional(),
  categoryIds: z.array(z.string()),
  tagNames: z.array(z.string().trim().min(1).max(80)).max(30),
  featuredImage: z.array(uploadedFileSchema).max(1),
});

export const termEditorSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.enum(TermTypeValue),
  name: z.string().trim().min(1, 'Name is required.').max(100),
  slug: z
    .string()
    .trim()
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and hyphens only.'
    )
    .optional()
    .or(z.literal('')),
  description: z.string().trim().max(500).optional(),
  parentId: z.string().nullable().optional(),
});

export const mediaEditorSchema = z.object({
  id: z.string().min(1),
  altText: z.string().trim().max(200).optional(),
  caption: z.string().trim().max(500).optional(),
  description: z.string().trim().max(1000).optional(),
});

export const mediaUploadSchema = z.array(uploadedFileSchema).min(1).max(20);

export const commentReplySchema = z.object({
  parentId: z.string().min(1),
  body: z.string().trim().min(1, 'Reply is required.').max(5000),
});

export const publicCommentSchema = z.object({
  contentId: z.string().min(1),
  authorName: z.string().trim().min(1, 'Name is required.').max(100),
  authorEmail: z.email('Enter a valid email address.'),
  authorUrl: z.url('Enter a valid URL.').optional().or(z.literal('')),
  body: z.string().trim().min(1, 'Comment is required.').max(5000),
  parentId: z.string().optional(),
  honeypot: z.string().optional(),
});

export const siteSettingsSchema = z.object({
  siteTitle: z.string().trim().min(1, 'Site title is required.').max(120),
  siteTagline: z.string().trim().max(200),
  siteDescription: z.string().trim().max(500),
  postsPerPage: z.number().int().min(1).max(50),
  defaultCommentStatus: z.enum(CommentPolicyValue),
  dateFormat: z.string().trim().min(1).max(80),
  permalinkStructure: z.string().trim().min(1).max(120),
  showOnFront: z.enum(['posts', 'page']),
  pageOnFront: z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value?.trim() ? value : null)),
  socialTwitter: z.string().trim().max(120),
  socialFacebook: z.string().trim().max(120),
});

export const menuItemSchema = z.object({
  clientId: z.string().min(1),
  parentClientId: z.string().nullable(),
  label: z.string().trim().min(1, 'Label is required.').max(120),
  linkType: z.enum(['custom', 'content']),
  url: z.string().trim().max(500).optional(),
  contentId: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative(),
  openInNewTab: z.boolean(),
});

export const menuEditorSchema = z.object({
  menuId: z.string().min(1),
  items: z.array(menuItemSchema),
});

export type ContentEditorInput = z.infer<typeof contentEditorSchema>;
export type TermEditorInput = z.infer<typeof termEditorSchema>;
export type MediaEditorInput = z.infer<typeof mediaEditorSchema>;
export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
export type CommentReplyInput = z.infer<typeof commentReplySchema>;
export type PublicCommentInput = z.infer<typeof publicCommentSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type MenuEditorInput = z.infer<typeof menuEditorSchema>;

export type ActionResult<T = undefined> =
  | { ok: true; data: T; message: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
