import sanitizeHtml from 'sanitize-html';

const contentSanitizeOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'figure',
    'figcaption',
    'img',
    'h1',
    'h2',
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

export function sanitizeContentHtml(value: string) {
  return sanitizeHtml(value, contentSanitizeOptions);
}

export function sanitizePlainText(value?: string | null) {
  return value
    ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim()
    : null;
}
