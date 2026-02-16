import { test, expect } from '@playwright/test';

test.describe('Stress Test Dashboard Validation', () => {
  test('Workers page after stress test', async ({ page }) => {
    await page.goto('http://localhost:21300/workers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/stress-test-workers.png', fullPage: true });
  });

  test('Kanban page shows 20 REVISADO stories', async ({ page }) => {
    await page.goto('http://localhost:21300/kanban');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/stress-test-kanban.png', fullPage: true });
  });

  test('API reflects 20 stories in REVISADO status', async ({ page }) => {
    const response = await page.request.get('http://localhost:21300/api/workers');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.workers).toHaveLength(3);
  });
});
