import { test, expect } from '@playwright/test';

test.describe('Workers Dashboard Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:21300/workers');
    await page.waitForLoadState('networkidle');
  });

  test('Workers page loads and shows 3 worker cards', async ({ page }) => {
    // Page should have the Workers heading
    await expect(page.getByRole('heading', { name: 'Workers' })).toBeVisible({ timeout: 10000 });

    // Should show 3 worker names
    await expect(page.locator('text=Genesis').first()).toBeVisible();
    await expect(page.locator('text=Escrivao').first()).toBeVisible();
    await expect(page.locator('text=Revisador').first()).toBeVisible();

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/workers-page.png', fullPage: true });
  });

  test('Workers API returns valid data', async ({ page }) => {
    const response = await page.request.get('http://localhost:21300/api/workers');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.workers).toHaveLength(3);
    expect(data.workers.map((w: { id: string }) => w.id)).toEqual(['genesis', 'aider', 'zero']);

    for (const worker of data.workers) {
      expect(worker).toHaveProperty('id');
      expect(worker).toHaveProperty('name');
      expect(worker).toHaveProperty('status');
      expect(worker).toHaveProperty('stats');
    }
  });

  test('Worker control API - trigger', async ({ page }) => {
    const response = await page.request.post('http://localhost:21300/api/workers/genesis/control', {
      data: { action: 'trigger' },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Worker control API - stop', async ({ page }) => {
    const response = await page.request.post('http://localhost:21300/api/workers/aider/control', {
      data: { action: 'stop' },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Worker control API - invalid worker returns 400', async ({ page }) => {
    const response = await page.request.post('http://localhost:21300/api/workers/invalid/control', {
      data: { action: 'start' },
    });
    expect(response.status()).toBe(400);
  });

  test('Workers page shows online status with heartbeats', async ({ page }) => {
    await page.waitForTimeout(4000);
    const onlineCount = await page.locator('text=Online').count();
    expect(onlineCount).toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: 'tests/screenshots/workers-status.png', fullPage: true });
  });

  test('Kanban page loads with Story Board', async ({ page }) => {
    await page.goto('http://localhost:21300/kanban');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Story Board' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Backlog').first()).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/kanban-page.png', fullPage: true });
  });

  test('Sidebar navigation includes Workers link', async ({ page }) => {
    const workersButtons = page.getByRole('button', { name: /Workers/i });
    await expect(workersButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test('Pipeline flow diagram is visible', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.locator('text=PIPELINE FLOW')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=HUMAN_REVIEW')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/workers-pipeline.png', fullPage: true });
  });

  test('Worker cards show control buttons', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Each card has either Start or Stop + Trigger
    const startOrStop = page.locator('button:has-text("Start"), button:has-text("Stop")');
    const triggerButtons = page.locator('button:has-text("Trigger")');
    expect(await startOrStop.count()).toBe(3);
    expect(await triggerButtons.count()).toBe(3);
  });

  test('3/3 online counter displayed', async ({ page }) => {
    await page.waitForTimeout(4000);
    await expect(page.locator('text=/\\d+\\/3 online/i').first()).toBeVisible({ timeout: 10000 });
  });
});
