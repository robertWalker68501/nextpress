import { describe, expect, it } from 'vitest';

import { getSafeCallbackURL, signUpSchema } from './validation';

describe('authentication validation', () => {
  it('accepts only local callback paths', () => {
    expect(getSafeCallbackURL('/admin/posts?status=draft')).toBe(
      '/admin/posts?status=draft'
    );
    expect(getSafeCallbackURL('https://example.com')).toBe('/admin');
    expect(getSafeCallbackURL('//example.com')).toBe('/admin');
    expect(getSafeCallbackURL('/%40evil')).toBe('/admin');
    expect(getSafeCallbackURL('/\\evil')).toBe('/admin');
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
});
