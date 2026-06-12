import { test, expect } from '@playwright/test';
import { PAGES, collectErrors, expectPageLoaded } from './helpers';

const PLAYBOOK_PATHS = ['/growth-playbook', '/monetization-playbook', '/rewarded-playtime'] as const;

/**
 * Validation Algorithms: Smoke Tests
 *
 * Fast pass over every page — confirms no crashes, key elements visible.
 */

for (const { path, name } of PAGES) {
  test(`${name} loads without errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expectPageLoaded(page, errors);
  });
}

test('Hub hero renders', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hub-hero-title')).toBeVisible();
  await expect(page.locator('.hero-badge')).toContainText('Content Hub');
});

test('Hub lists the ebook cards', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // EBOOKS grid renders one card per guide: growth-playbook, rewarded-playtime, monetization-playbook
  await expect(page.locator('.hub-card')).toHaveCount(3);
});

test('Growth Playbook page renders hero + TOC', async ({ page }) => {
  await page.goto('/growth-playbook', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hero h1')).toBeVisible();
  await expect(page.locator('.toc-card').first()).toBeVisible();
});

test('Calculator page renders wizard', async ({ page }) => {
  await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.calc-hero h1')).toContainText('Calculator');
  await expect(page.locator('.steps-bar')).toBeVisible();
  await expect(page.locator('.step-dot')).toHaveCount(3);
});

test('Calculator back link works', async ({ page }) => {
  await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
  await page.click('.calc-back');
  await page.waitForURL('/', { timeout: 5000 });
});

for (const path of PLAYBOOK_PATHS) {
  test(`${path} ships AppSamurai favicon`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    // At least one of the AppSamurai brand icons should be registered
    const icons = await page.locator('link[rel="apple-touch-icon"], link[rel="icon"][sizes="192x192"]').count();
    expect(icons).toBeGreaterThanOrEqual(1);
  });
}
