import { describe, expect, it } from 'vitest';

import { normalizeSlug } from './slug';

describe('normalizeSlug', () => {
  it('lowercases and hyphenates titles', () => {
    expect(normalizeSlug('Hello NextPress')).toBe('hello-nextpress');
  });

  it('removes unsafe characters', () => {
    expect(normalizeSlug('Post #1: Launch!')).toBe('post-1-launch');
  });

  it('falls back to untitled for empty input', () => {
    expect(normalizeSlug('   ')).toBe('untitled');
    expect(normalizeSlug('!!!')).toBe('untitled');
  });
});
