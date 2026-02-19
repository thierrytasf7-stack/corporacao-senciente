import { test, expect } from '@playwright/test';

test('debug - capture errors and screenshot', async ({ page }) => {
  const errors: string[] = [];
  const consoleMessages: string[] = [];

  page.on('pageerror', error => errors.push('ERROR: ' + error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleMessages.push('CONSOLE ERROR: ' + msg.text());
  });

  await page.goto('/');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });

  console.log('Page errors:', errors);
  console.log('Console errors:', consoleMessages);
  console.log('Page title:', await page.title());
  console.log('Page content preview:', (await page.content()).substring(0, 500));
});
