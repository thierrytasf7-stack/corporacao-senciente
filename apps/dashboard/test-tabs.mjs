import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:21300';
const SCREENSHOT_DIR = 'C:/Users/User/Desktop/Diana-Corporacao-Senciente/docs/qa/screenshots/tabs';

const TABS = [
  { name: 'home', path: '/', label: 'Home/Dashboard' },
  { name: 'monitor', path: '/monitor', label: 'Monitor' },
  { name: 'kanban', path: '/kanban', label: 'Kanban' },
  { name: 'workers', path: '/workers', label: 'Workers' },
  { name: 'terminals', path: '/terminals', label: 'Terminals' },
  { name: 'github', path: '/github', label: 'GitHub' },
  { name: 'settings', path: '/settings', label: 'Settings' },
];

mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function testTabs() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const errors = [];
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('pageerror', err => {
    errors.push({ url: page.url(), error: err.message });
  });

  console.log('=== Dashboard Tab Testing ===\n');

  for (const tab of TABS) {
    consoleErrors.length = 0;
    const tabErrors = [];

    try {
      console.log(`--- ${tab.label} (${tab.path}) ---`);

      const response = await page.goto(`${BASE}${tab.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      const status = response?.status();
      console.log(`  HTTP: ${status}`);

      if (status !== 200) {
        tabErrors.push(`HTTP ${status}`);
      }

      // Wait a bit for async content
      await page.waitForTimeout(2000);

      // Check for visible error text
      const errorElements = await page.$$eval('[class*="error"], [class*="Error"]', els =>
        els.map(el => el.textContent?.trim()).filter(t => t && t.length < 200)
      );

      if (errorElements.length > 0) {
        console.log(`  UI Errors: ${errorElements.join(' | ')}`);
      }

      // Check for REAL hydration errors (not just the word in scripts)
      const hydrationError = await page.evaluate(() => {
        const body = document.body.innerHTML;
        // Check for actual React hydration error messages
        const realErrors = [
          'Hydration failed',
          'hydration error',
          'Text content does not match',
          'did not match. Server:',
          'error while hydrating',
          'There was an error while hydrating this Suspense boundary',
        ];
        return realErrors.some(msg => body.includes(msg));
      });

      if (hydrationError) {
        tabErrors.push('Hydration error detected');
      }

      // Check console errors for this tab
      if (consoleErrors.length > 0) {
        console.log(`  Console Errors (${consoleErrors.length}):`);
        for (const ce of consoleErrors.slice(0, 5)) {
          console.log(`    - ${ce.text.slice(0, 150)}`);
        }
      }

      // Screenshot
      const screenshotPath = `${SCREENSHOT_DIR}/${tab.name}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  Screenshot: ${screenshotPath}`);

      if (tabErrors.length > 0) {
        console.log(`  ISSUES: ${tabErrors.join(', ')}`);
      } else {
        console.log(`  Status: OK`);
      }

    } catch (err) {
      console.log(`  FAILED: ${err.message}`);
      errors.push({ url: `${BASE}${tab.path}`, error: err.message });
    }

    console.log('');
  }

  // Summary
  console.log('=== Summary ===');
  if (errors.length > 0) {
    console.log(`Page Errors (${errors.length}):`);
    for (const e of errors) {
      console.log(`  ${e.url}: ${e.error.slice(0, 200)}`);
    }
  } else {
    console.log('No page errors detected.');
  }

  await browser.close();
}

testTabs().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
