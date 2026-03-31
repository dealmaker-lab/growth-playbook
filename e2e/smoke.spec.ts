import { test, expect } from '@playwright/test';
import { PAGES, collectErrors, expectPageLoaded } from './helpers';

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

test('Playbook hero section renders', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hero h1')).toBeVisible();
  await expect(page.locator('.hero-badge')).toContainText('2026');
  await expect(page.locator('.btn-primary')).toBeVisible();
});

test('Playbook bento stats are visible', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const bentoCards = page.locator('.bento-card');
  await expect(bentoCards).toHaveCount(4);
});

test('Logo wall renders', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.logo-wall')).toBeVisible();
});

test('TOC section has 4 chapters', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const tocCards = page.locator('.toc-card');
  await expect(tocCards).toHaveCount(4);
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
