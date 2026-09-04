import { z } from 'zod';

import { UserRoleValue } from './roles';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Za-z]/, 'Password must include a letter.')
  .regex(/[0-9]/, 'Password must include a number.')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character.');

export const signInSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  password: z.string().min(1, 'Enter your password.'),
  rememberMe: z.boolean(),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
    email: z.email('Enter a valid email address.').trim().toLowerCase(),
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const verificationSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const optionalPassword = z.union([password, z.literal('')]).optional();

export const adminCreateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(80),
    email: z.email('Enter a valid email address.').trim().toLowerCase(),
    password,
    confirmPassword: z.string(),
    role: z.enum(UserRoleValue),
    displayName: z.string().trim().max(80),
    bio: z.string().trim().max(500),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const adminUpdateUserSchema = z
  .object({
    id: z.string().min(1),
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(80),
    email: z.email('Enter a valid email address.').trim().toLowerCase(),
    role: z.enum(UserRoleValue),
    displayName: z.string().trim().max(80),
    bio: z.string().trim().max(500),
    emailVerified: z.boolean(),
    password: optionalPassword,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (values) => !values.password || values.password === values.confirmPassword,
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    }
  );

export const adminDeleteUserSchema = z.object({
  id: z.string().min(1),
  reassignToUserId: z
    .string()
    .min(1)
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
});

export const adminBulkUserRoleSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Select at least one user.'),
  role: z.enum(UserRoleValue),
});

export function getSafeCallbackURL(
  value?: string | null,
  fallback = '/account'
) {
  if (!value) return fallback;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.includes('\\') ||
    decoded.includes('@')
  ) {
    return fallback;
  }

  return decoded;
}

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type VerificationValues = z.infer<typeof verificationSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type AdminDeleteUserInput = z.infer<typeof adminDeleteUserSchema>;
export type AdminBulkUserRoleInput = z.infer<typeof adminBulkUserRoleSchema>;
