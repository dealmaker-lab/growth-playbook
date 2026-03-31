import { Page, expect } from '@playwright/test';

/**
 * Validation Algorithms: E2E Test Helpers
 *
 * Shared utilities for playbook and calculator tests.
 * Includes boundary testing, error collection, and assertion helpers.
 */

export const PAGES = [
  { path: '/', name: 'Playbook Home' },
  { path: '/calculator', name: 'ROI Calculator' },
];

export const CATEGORIES = ['Gaming', 'E-commerce', 'FinTech', 'Health & Fitness', 'Utility'] as const;
export const REGIONS = ['North America', 'LATAM', 'SEA', 'EMEA', 'MENA', 'APAC'] as const;
export const GOALS = ['Install Volume', 'ROAS Target', 'LTV Optimization', 'Market Expansion'] as const;

/**
 * Collect console errors from the page
 */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
  return errors;
}

/**
 * Assert page loaded without critical errors
 */
export async function expectPageLoaded(page: Page, errors: string[]) {
  // No "Application error" or 500 page
  const body = await page.textContent('body');
  expect(body).not.toContain('Application error');
  expect(body).not.toContain('500');
  expect(body).not.toContain('Internal Server Error');

  // Filter out non-critical errors (e.g., analytics failures)
  const critical = errors.filter(
    (e) => !e.includes('analytics') && !e.includes('favicon') && !e.includes('ERR_CONNECTION_REFUSED')
  );
  expect(critical).toHaveLength(0);
}

/**
 * Fill calculator wizard and get results
 */
export async function fillCalculator(
  page: Page,
  opts: {
    category?: string;
    regions?: string[];
    budget?: number;
    goal?: string;
    customLTV?: number;
  } = {}
) {
  const { category = 'Gaming', regions = ['North America'], budget = 50000, goal = 'Install Volume', customLTV } = opts;

  // Step 1: Category & Regions
  await page.selectOption('.calc-select', category);
  for (const region of regions) {
    await page.click(`.chip:has-text("${region}")`);
  }
  await page.click('.btn-next');

  // Step 2: Budget
  await page.fill('.budget-input', String(budget));

  // Custom LTV if provided
  if (customLTV) {
    await page.click('.ltv-toggle');
    await page.fill('.ltv-input-area input[type="number"]', String(customLTV));
  }

  await page.click('.btn-next');

  // Step 3: Goal
  await page.click(`.goal-card:has-text("${goal}")`);
  await page.click('.btn-calculate');

  // Wait for results
  await page.waitForSelector('.results-section', { timeout: 5000 });
}
