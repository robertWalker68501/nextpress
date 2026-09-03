import { describe, expect, it } from 'vitest';

import { getSafeCallbackURL, signUpSchema } from './validation';

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
});
