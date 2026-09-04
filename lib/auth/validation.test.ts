import { describe, expect, it } from 'vitest';

import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  getSafeCallbackURL,
  signUpSchema,
} from './validation';

describe('authentication validation', () => {
  it('accepts only local callback paths', () => {
    expect(getSafeCallbackURL('/admin/posts?status=draft')).toBe(
      '/admin/posts?status=draft'
    );
    expect(getSafeCallbackURL('https://example.com')).toBe('/account');
    expect(getSafeCallbackURL('//example.com')).toBe('/account');
    expect(getSafeCallbackURL('/%40evil')).toBe('/account');
    expect(getSafeCallbackURL('/\\evil')).toBe('/account');
  });

  it('requires matching strong passwords for sign-up', () => {
    const result = signUpSchema.safeParse({
      name: 'NextPress Author',
      email: 'author@example.com',
      password: 'weak',
      confirmPassword: 'different',
    });

    expect(result.success).toBe(false);
  });

  it('accepts a complete administrator user create payload', () => {
    const result = adminCreateUserSchema.safeParse({
      name: 'Jordan Editor',
      email: 'jordan@example.com',
      password: 'Str0ng!pass',
      confirmPassword: 'Str0ng!pass',
      role: 'EDITOR',
      displayName: 'Jordan',
      bio: '',
    });

    expect(result.success).toBe(true);
  });

  it('allows an optional password when updating a user', () => {
    const result = adminUpdateUserSchema.safeParse({
      id: 'user-1',
      name: 'Jordan Editor',
      email: 'jordan@example.com',
      role: 'AUTHOR',
      displayName: '',
      bio: '',
      emailVerified: true,
      password: '',
      confirmPassword: '',
    });

    expect(result.success).toBe(true);
  });
});
