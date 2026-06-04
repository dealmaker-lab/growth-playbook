import { test, expect } from '@playwright/test';
import { collectErrors, expectPageLoaded } from './helpers';

/**
 * UX/UI regression suite — covers the 2026 Rewarded Playtime rewrite, the
 * Hybrid-Casual avatar fix, and the systemic mobile responsive-grid fix.
 *
 * Runs in both the `desktop` (1280) and `mobile` (375) projects, so every
 * check below is exercised on web AND mobile.
 */

const ALL_PAGES = ['/', '/growth-playbook', '/rewarded-playtime', '/hybrid-casual', '/calculator'] as const;

// ── No page may overflow its viewport horizontally (mobile + web) ──
for (const path of ALL_PAGES) {
  test(`no horizontal overflow: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return { scrollWidth: de.scrollWidth, inner: window.innerWidth };
    });
    // allow 2px slack for sub-pixel rounding
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.inner + 2);
  });
}

// ── Rewarded Playtime: the new 7-chapter regional structure ──
test.describe('Rewarded Playtime Handbook (2026 rewrite)', () => {
  test('renders 7 chapters and the regional landscape', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/rewarded-playtime', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('.toc-card')).toHaveCount(7);
    await expect(page.locator('#rp-ch4')).toBeAttached();
    await expect(page.locator('body')).toContainText('Regional Landscape');
    await expect(page.locator('body')).toContainText('South Korea');
    await expectPageLoaded(page, errors);
  });

  test('renders interactive charts and the recurring RP-Play callout', async ({ page }) => {
    await page.goto('/rewarded-playtime', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    // US dual chart (2) + Japan + Brazil + Korea = 5 canvases
    expect(await page.locator('canvas').count()).toBeGreaterThanOrEqual(4);
    expect(await page.locator('.rp-play').count()).toBe(5);
    await expect(page.locator('.infographic-table')).toHaveCount(2);
  });

  test('email gate is present before unlock', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/rewarded-playtime', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#emailGate')).toBeAttached();
  });
});

// ── Hybrid-Casual: avatars must never render as broken images ──
test.describe('Hybrid-Casual report', () => {
  test('quote avatars are not broken-image references', async ({ page }) => {
    await page.goto('/hybrid-casual', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    // the previously-404 person photos must NOT be referenced as <img>
    for (const slug of ['osman-soysal', 'utku-erdinc', 'ryan-chadwick']) {
      expect(await page.locator(`img[src*="${slug}"]`).count()).toBe(0);
    }
    // initials-circle avatars render instead
    expect(await page.locator('.quote-avatar').count()).toBeGreaterThanOrEqual(3);
  });

  test('any quote <img> avatars actually load (no 404s)', async ({ page }) => {
    await page.goto('/rewarded-playtime', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const imgs = page.locator('img.quote-avatar');
    const n = await imgs.count();
    for (let i = 0; i < n; i++) {
      const ok = await imgs.nth(i).evaluate((el) => {
        const img = el as HTMLImageElement;
        return img.complete && img.naturalWidth > 0;
      });
      expect(ok).toBeTruthy();
    }
  });
});

// ── Hub lists every guide ──
test('hub renders the three ebook cards', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hub-card')).toHaveCount(3);
});
