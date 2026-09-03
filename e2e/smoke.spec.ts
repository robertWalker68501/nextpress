import { expect, test } from '@playwright/test';

test.describe('public site smoke', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('feed is available', async ({ request }) => {
    const response = await request.get('/feed.xml');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('xml');
  });

  test('robots.txt is available', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('admin access', () => {
  test('redirects unauthenticated visitors to sign in', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('auth pages', () => {
  test('sign-in page renders', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });
});
