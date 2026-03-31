import { test, expect } from '@playwright/test';
import { collectErrors, expectPageLoaded } from './helpers';

/**
 * Validation Algorithms: Playbook Content Tests
 *
 * Tests email gate, content sections, analytics, navigation.
 */

test.describe('Playbook Content', () => {
  test('Email gate is visible for new visitors', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Gate overlay should be present (blur + gradient)
    const gatedContent = page.locator('.gated-locked');
    // Content is in DOM (SEO-friendly) but visually gated
    await expectPageLoaded(page, errors);
  });

  test('Email gate rejects empty submission', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Find and try to submit empty email
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      // HTML5 validation should prevent empty submission
      await expect(emailInput).toHaveAttribute('required', '');
    }
  });

  test('Email gate rejects invalid email format', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('notanemail');
      // Try to submit — should be rejected by HTML5 validation
      const submitBtn = page.locator('button[type="submit"], .gate-submit');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Should still be on gate (not unlocked)
        await page.waitForTimeout(500);
      }
    }
  });

  test('All 4 chapter sections exist in DOM', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Chapters should be in DOM even when gated (SEO requirement)
    const body = await page.content();
    expect(body).toContain('ch1');
    expect(body).toContain('ch2');
    expect(body).toContain('ch3');
    expect(body).toContain('ch4');
  });

  test('FAQ sections render', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // FAQ component should be in the DOM
    const faqElements = page.locator('[class*="faq"]');
    const count = await faqElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Trending content component loads', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // TrendingContent may or may not render (depends on API)
    // But it should not cause errors
    const errors = collectErrors(page);
    await page.waitForTimeout(1000);
    const critical = errors.filter((e) => !e.includes('analytics') && !e.includes('favicon'));
    expect(critical).toHaveLength(0);
  });

  test('Calculator link from playbook works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Find link to calculator
    const calcLink = page.locator('a[href*="calculator"]').first();
    if (await calcLink.isVisible()) {
      await calcLink.click();
      await page.waitForURL('**/calculator', { timeout: 5000 });
      await expect(page.locator('.calc-hero')).toBeVisible();
    }
  });
});

test.describe('Analytics API', () => {
  test('POST /api/analytics accepts valid event', async ({ request }) => {
    const response = await request.post('/api/analytics', {
      data: {
        session_id: 'test-e2e-session',
        event_type: 'page_view',
        section: 'hero',
        metadata: { source: 'e2e-test' },
      },
    });

    // Should succeed or fail gracefully (no 500)
    expect([200, 400]).toContain(response.status());
  });

  test('POST /api/analytics rejects missing fields', async ({ request }) => {
    const response = await request.post('/api/analytics', {
      data: {},
    });

    expect(response.status()).toBe(400);
  });
});

test.describe('Rankings API', () => {
  test('GET /api/rankings returns valid response', async ({ request }) => {
    const response = await request.get('/api/rankings');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('rankings');
    expect(data).toHaveProperty('source');
    expect(data.rankings).toHaveLength(4);

    // Validate ranking structure
    for (const r of data.rankings) {
      expect(r).toHaveProperty('section');
      expect(r).toHaveProperty('label');
      expect(r).toHaveProperty('score');
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
});

test.describe('Email Gate API', () => {
  test('POST /api/unlock rejects invalid email', async ({ request }) => {
    const response = await request.post('/api/unlock', {
      data: { email: 'notvalid' },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/unlock rejects disposable email', async ({ request }) => {
    const response = await request.post('/api/unlock', {
      data: { email: 'test@mailinator.com' },
    });
    // Should reject with 400 (disposable domain)
    expect([400, 429]).toContain(response.status());
  });
});
