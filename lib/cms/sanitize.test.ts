import { describe, expect, it } from 'vitest';

import { sanitizeContentHtml, sanitizePlainText } from './sanitize';

describe('sanitizeContentHtml', () => {
  it('strips script tags and event handlers', () => {
    const input =
      '<p>Hello</p><script>alert(1)</script><img src=x onerror=alert(1) />';
    const output = sanitizeContentHtml(input);

    expect(output).not.toContain('<script');
    expect(output).not.toContain('onerror');
    expect(output).toContain('<p>Hello</p>');
  });

  it('allows safe links and images', () => {
    const input =
      '<p><a href="https://example.com">Link</a></p><img src="https://example.com/a.jpg" alt="A" />';
    const output = sanitizeContentHtml(input);

    expect(output).toContain('href="https://example.com"');
    expect(output).toContain('src="https://example.com/a.jpg"');
  });

  it('removes javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">Bad</a>';
    const output = sanitizeContentHtml(input);

    expect(output).not.toContain('javascript:');
  });
});

describe('sanitizePlainText', () => {
  it('returns null for empty values', () => {
    expect(sanitizePlainText(null)).toBeNull();
    expect(sanitizePlainText('')).toBeNull();
  });

  it('strips all HTML tags', () => {
    expect(sanitizePlainText('<strong>Title</strong>')).toBe('Title');
  });
});
