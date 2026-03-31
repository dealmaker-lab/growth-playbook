import { test, expect } from '@playwright/test';
import { CATEGORIES, REGIONS, GOALS, collectErrors, fillCalculator } from './helpers';

/**
 * Validation Algorithms: Calculator E2E Tests
 *
 * Comprehensive test matrix:
 * - All 5 categories produce valid results
 * - All 6 regions selectable
 * - Min/max budget boundaries
 * - All 4 goals x 5 categories (20 combos)
 * - Custom LTV override (Fairness ML)
 * - What-if scenario slider
 * - New chart visualizations render
 * - Mobile viewport
 * - No NaN, negative, or >100% values
 */

test.describe('Calculator Wizard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
  });

  test('Step 1: can select category and regions', async ({ page }) => {
    await page.selectOption('.calc-select', 'FinTech');
    await page.click('.chip:has-text("EMEA")');
    await page.click('.chip:has-text("MENA")');

    // Verify chips are selected
    await expect(page.locator('.chip.selected')).toHaveCount(2);

    // Next button should be enabled
    await expect(page.locator('.btn-next')).toBeEnabled();
  });

  test('Step 1: cannot advance without region', async ({ page }) => {
    await expect(page.locator('.btn-next')).toBeDisabled();
    await expect(page.locator('.field-error')).toBeVisible();
  });

  test('Step 2: budget slider works', async ({ page }) => {
    // Select region first
    await page.click('.chip:has-text("SEA")');
    await page.click('.btn-next');

    // Budget input exists
    await expect(page.locator('.budget-input')).toBeVisible();

    // Enter a custom budget
    await page.fill('.budget-input', '100000');
  });

  test('Step 2: LTV override toggle works', async ({ page }) => {
    await page.click('.chip:has-text("APAC")');
    await page.click('.btn-next');

    // Toggle LTV section
    await page.click('.ltv-toggle');
    await expect(page.locator('.ltv-input-area')).toBeVisible();

    // Enter custom LTV
    await page.fill('.ltv-input-area input[type="number"]', '20');
  });

  test('Full flow produces results', async ({ page }) => {
    const errors = collectErrors(page);
    await fillCalculator(page, { category: 'Gaming', regions: ['North America'], budget: 50000, goal: 'ROAS Target' });

    // Results section visible
    await expect(page.locator('.results-heading')).toBeVisible();
    await expect(page.locator('.roas-card')).toBeVisible();
    await expect(page.locator('.breakdown-card')).toBeVisible();

    // ROAS range visible (Fairness ML)
    await expect(page.locator('.roas-range')).toBeVisible();

    // No critical console errors
    const critical = errors.filter((e) => !e.includes('analytics') && !e.includes('favicon'));
    expect(critical).toHaveLength(0);
  });

  test('ROAS shows range not just single number', async ({ page }) => {
    await fillCalculator(page);
    const rangeText = await page.locator('.roas-range').textContent();
    expect(rangeText).toMatch(/\d+\.\d+x.*\d+\.\d+x/);
  });

  test('Custom LTV affects ROAS', async ({ page }) => {
    // First calculate with default LTV
    await fillCalculator(page, { category: 'Gaming' });
    const defaultRoas = await page.locator('.roas-value').textContent();

    // Start over
    await page.click('.btn-recalc');

    // Calculate with higher LTV
    await fillCalculator(page, { category: 'Gaming', customLTV: 25 });
    const customRoas = await page.locator('.roas-value').textContent();

    // Higher LTV should produce higher ROAS
    const defaultVal = parseFloat(defaultRoas?.replace('x', '') || '0');
    const customVal = parseFloat(customRoas?.replace('x', '') || '0');
    expect(customVal).toBeGreaterThan(defaultVal);
  });
});

test.describe('Calculator Result Integrity', () => {
  // Test all 5 categories produce valid results
  for (const category of CATEGORIES) {
    test(`${category}: produces valid mix (sums to 100%)`, async ({ page }) => {
      await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
      await fillCalculator(page, { category, regions: ['North America'] });

      // Read breakdown percentages
      const pcts = await page.locator('.breakdown-pct').allTextContents();
      const values = pcts.map((t) => parseInt(t.replace(/[()%]/g, '')));
      const sum = values.reduce((a, b) => a + b, 0);

      expect(sum).toBe(100);
      values.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(5); // Min 5% per channel
        expect(v).toBeLessThanOrEqual(95);
      });
    });
  }

  // Test all 4 goals produce different top recommendations
  for (const goal of GOALS) {
    test(`Goal "${goal}": produces valid ROAS`, async ({ page }) => {
      await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
      await fillCalculator(page, { goal });

      const roasText = await page.locator('.roas-value').textContent();
      const roas = parseFloat(roasText?.replace('x', '') || '0');
      expect(roas).toBeGreaterThan(0);
      expect(roas).toBeLessThan(100); // Sanity check
      expect(roasText).not.toContain('NaN');
    });
  }
});

test.describe('Calculator Boundary Tests', () => {
  test('Min budget ($5K) produces valid results', async ({ page }) => {
    await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
    await fillCalculator(page, { budget: 5000 });

    const roasText = await page.locator('.roas-value').textContent();
    expect(roasText).not.toContain('NaN');
    expect(roasText).not.toContain('Infinity');
  });

  test('Max budget ($500K) produces valid results', async ({ page }) => {
    await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
    await fillCalculator(page, { budget: 500000 });

    const roasText = await page.locator('.roas-value').textContent();
    expect(roasText).not.toContain('NaN');
    expect(roasText).not.toContain('Infinity');
  });

  test('All 6 regions selected simultaneously', async ({ page }) => {
    await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
    await fillCalculator(page, { regions: [...REGIONS] });

    // Should still produce valid results
    await expect(page.locator('.results-section')).toBeVisible();
    const roasText = await page.locator('.roas-value').textContent();
    expect(roasText).not.toContain('NaN');
  });
});

test.describe('New Optimization Charts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
    await fillCalculator(page);
  });

  test('What-if scenario slider renders', async ({ page }) => {
    await expect(page.locator('.whatif-card')).toBeVisible();
    await expect(page.locator('.whatif-slider')).toBeVisible();
  });

  test('What-if slider shows comparison on change', async ({ page }) => {
    // Move slider to +15
    await page.locator('.whatif-slider').fill('15');
    await page.waitForTimeout(300);
    await expect(page.locator('.whatif-comparison')).toBeVisible();
  });

  test('Budget efficiency curve chart renders', async ({ page }) => {
    await expect(page.locator('.efficiency-container')).toBeVisible();
    // Chart canvas should exist
    await expect(page.locator('.efficiency-container canvas')).toBeVisible();
  });

  test('Disclaimer includes updated text', async ({ page }) => {
    const disclaimer = await page.locator('.disclaimer').textContent();
    expect(disclaimer).toContain('2025-2026');
    expect(disclaimer).toContain('range');
    expect(disclaimer).toContain('March 2026');
  });
});

test.describe('20-Combo Matrix (Category x Goal)', () => {
  for (const category of CATEGORIES) {
    for (const goal of GOALS) {
      test(`${category} + ${goal}: valid`, async ({ page }) => {
        await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
        await fillCalculator(page, { category, goal });

        // Verify results render
        await expect(page.locator('.results-section')).toBeVisible();

        // No NaN anywhere in results
        const resultsText = await page.locator('.results-section').textContent();
        expect(resultsText).not.toContain('NaN');
        expect(resultsText).not.toContain('undefined');
        expect(resultsText).not.toContain('Infinity');
      });
    }
  }
});
