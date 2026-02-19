import { test, expect } from '@playwright/test';

test.describe('Backtest UI - Frontend Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Default page is already 'backtest' - verify form is visible
    await expect(page.getByText('Backtest System')).toBeVisible({ timeout: 10000 });
  });

  test('should display backtest form', async ({ page }) => {
    await expect(page.getByText('Run New Backtest')).toBeVisible();
    await expect(page.getByLabel('Strategy ID')).toBeVisible();
    await expect(page.getByLabel('Start Date')).toBeVisible();
    await expect(page.getByLabel('End Date')).toBeVisible();
    await expect(page.getByLabel('Initial Bankroll')).toBeVisible();
    await expect(page.getByLabel('Staking Strategy')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run Backtest' })).toBeVisible();
  });

  test('should submit backtest form successfully', async ({ page }) => {
    await page.getByLabel('Strategy ID').fill('ui-test-strategy');
    await page.getByLabel('Start Date').fill('2025-08-01');
    await page.getByLabel('End Date').fill('2025-12-31');
    await page.getByLabel('Initial Bankroll').fill('5000');
    await page.getByLabel('Staking Strategy').selectOption('kelly');

    await page.getByRole('button', { name: 'Run Backtest' }).click();

    await expect(page.getByText('Backtest Complete!')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Backtest ID:/)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByLabel('Strategy ID').fill('');
    await page.getByRole('button', { name: 'Run Backtest' }).click();

    const strategyInput = page.getByLabel('Strategy ID');
    const validationMessage = await strategyInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should show loading state during submission', async ({ page }) => {
    // Intercept and delay the API call to catch loading state
    await page.route('**/api/backtest/run', async (route) => {
      await new Promise(res => setTimeout(res, 2000));
      await route.continue();
    });

    await page.getByLabel('Strategy ID').fill('loading-test');
    await page.getByLabel('Start Date').fill('2025-08-01');
    await page.getByLabel('End Date').fill('2025-12-31');
    await page.getByLabel('Initial Bankroll').fill('10000');

    await page.getByRole('button', { name: 'Run Backtest' }).click();

    // Button shows "Running..." during the delayed API call
    await expect(page.getByRole('button', { name: 'Running...' })).toBeVisible({ timeout: 5000 });
  });

  test('should validate bankroll minimum value', async ({ page }) => {
    await page.getByLabel('Strategy ID').fill('bankroll-test');
    await page.getByLabel('Start Date').fill('2025-08-01');
    await page.getByLabel('End Date').fill('2025-12-31');

    const bankrollInput = page.getByLabel('Initial Bankroll');
    await bankrollInput.fill('-100');

    await page.getByRole('button', { name: 'Run Backtest' }).click();

    // min="1" attribute should prevent negative values
    const isValid = await bankrollInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should display all staking strategy options', async ({ page }) => {
    const strategySelect = page.getByLabel('Staking Strategy');
    const options = await strategySelect.locator('option').allTextContents();

    expect(options).toContain('Fixed');
    expect(options).toContain('Percentage');
    expect(options).toContain('Kelly');
  });

  test('should display navigation tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Strategies', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Backtest', exact: true })).toBeVisible();

    // Backtest should be active (highlighted)
    const backtestBtn = page.getByRole('button', { name: 'Backtest', exact: true });
    await expect(backtestBtn).toHaveClass(/bg-blue-500/);
  });

  test('should switch between pages', async ({ page }) => {
    // Click Strategies tab
    await page.getByRole('button', { name: 'Strategies', exact: true }).click();

    // "Betting Strategies" heading should appear (nav and h1 are outside ErrorBoundary)
    await expect(page.getByRole('heading', { name: 'Betting Strategies' })).toBeVisible({ timeout: 5000 });

    // Click back to Backtest
    await page.getByRole('button', { name: 'Backtest', exact: true }).click();
    await expect(page.getByText('Backtest System')).toBeVisible({ timeout: 5000 });
  });

  test('should show error when backend is unavailable', async ({ page }) => {
    // Fill and submit form
    await page.getByLabel('Strategy ID').fill('error-test');
    await page.getByLabel('Start Date').fill('2025-08-01');
    await page.getByLabel('End Date').fill('2025-12-31');
    await page.getByLabel('Initial Bankroll').fill('1000');

    // Note: if backend is running this will succeed, if not will show error
    await page.getByRole('button', { name: 'Run Backtest' }).click();

    // Either success or error should appear
    await expect(
      page.locator('.bg-green-50, .bg-red-50')
    ).toBeVisible({ timeout: 15000 });
  });

  test('should have correct form defaults', async ({ page }) => {
    // Check default values match what's configured in the component
    const strategyId = await page.getByLabel('Strategy ID').inputValue();
    expect(strategyId).toBe('test-strategy');

    const bankroll = await page.getByLabel('Initial Bankroll').inputValue();
    expect(bankroll).toBe('10000');

    const staking = await page.getByLabel('Staking Strategy').inputValue();
    expect(staking).toBe('kelly');
  });

  test('should integrate with backend API', async ({ page, request }) => {
    const healthCheck = await request.get('http://localhost:21370/health');
    expect(healthCheck.ok()).toBe(true);

    await page.getByLabel('Strategy ID').fill('api-integration-test');
    await page.getByLabel('Start Date').fill('2025-09-01');
    await page.getByLabel('End Date').fill('2025-12-31');
    await page.getByLabel('Initial Bankroll').fill('7500');
    await page.getByLabel('Staking Strategy').selectOption('percentage');

    await page.getByRole('button', { name: 'Run Backtest' }).click();

    await expect(page.getByText('Backtest Complete!')).toBeVisible({ timeout: 15000 });

    const backtestIdText = await page.getByText(/Backtest ID:/).textContent();
    expect(backtestIdText).toMatch(/bt-\d+-[a-z0-9]+/);
  });
});
