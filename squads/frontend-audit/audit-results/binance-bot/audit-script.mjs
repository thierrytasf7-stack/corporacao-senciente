import { chromium } from '../../../../apps/dashboard/node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\User\\Desktop\\Diana-Corporacao-Senciente\\squads\\frontend-audit\\audit-results\\binance-bot';
const BASE_URL = 'http://localhost:21340';

const findings = [];
const allConsoleErrors = [];
const allNetworkErrors = [];

function addFinding(severity, category, description, page, details = '') {
  findings.push({ severity, category, description, page, details });
  const prefix = severity === 'CRITICAL' ? '!!! ' : severity === 'HIGH' ? '!! ' : severity === 'MEDIUM' ? '! ' : '';
  console.log(`  ${prefix}[${severity}][${category}] ${description}`);
}

async function screenshot(page, name) {
  const path = join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`  Screenshot: ${name}.png`);
  return path;
}

async function commonChecks(page, pageName) {
  // Horizontal overflow
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  if (hasOverflow) {
    addFinding('HIGH', 'Layout', 'Horizontal overflow detected - page wider than viewport', pageName);
  }

  // Overflow on child elements
  const overflowElements = await page.evaluate(() => {
    const issues = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollWidth > el.clientWidth + 5 && el.clientWidth > 50) {
        const tag = el.tagName.toLowerCase();
        const cls = el.className?.toString().substring(0, 80) || '';
        if (!['body', 'html'].includes(tag)) {
          issues.push({ tag, class: cls, scrollW: el.scrollWidth, clientW: el.clientWidth });
        }
      }
    });
    return issues.slice(0, 10);
  });
  if (overflowElements.length > 0) {
    addFinding('MEDIUM', 'Layout', `${overflowElements.length} element(s) with internal overflow`, pageName,
      JSON.stringify(overflowElements, null, 2));
  }

  // NaN / undefined / null displayed
  const dataIssues = await page.evaluate(() => {
    const issues = [];
    const walk = (el) => {
      if (el.childNodes) {
        for (const child of el.childNodes) {
          if (child.nodeType === 3) {
            const t = child.textContent?.trim();
            if (t && (t === 'NaN' || t === 'undefined' || t === 'null' || t.includes('NaN'))) {
              const parent = child.parentElement;
              issues.push({
                text: t.substring(0, 60),
                tag: parent?.tagName,
                class: parent?.className?.toString()?.substring(0, 50)
              });
            }
          }
          walk(child);
        }
      }
    };
    walk(document.body);
    return issues.slice(0, 20);
  });
  if (dataIssues.length > 0) {
    addFinding('CRITICAL', 'Data Display', `Found NaN/undefined/null displayed on page`, pageName,
      JSON.stringify(dataIssues, null, 2));
  }

  // Empty state handling
  const hasEmptyState = await page.evaluate(() => {
    const text = document.body.textContent?.toLowerCase() || '';
    return {
      noData: text.includes('no data') || text.includes('sem dados'),
      empty: text.includes('empty') || text.includes('vazio') || text.includes('nenhum'),
      loading: text.includes('loading') || text.includes('carregando'),
    };
  });

  // Loading spinners still visible
  const spinners = await page.locator('[class*="spinner"], [class*="loading"], [class*="skeleton"], [role="progressbar"]').count();
  if (spinners > 0) {
    addFinding('MEDIUM', 'Loading', `${spinners} loading indicator(s) still visible after page load`, pageName);
  }

  // Tables analysis
  const tableInfo = await page.evaluate(() => {
    const tables = document.querySelectorAll('table');
    return Array.from(tables).map((t, i) => {
      const rows = t.querySelectorAll('tr').length;
      const headers = Array.from(t.querySelectorAll('th')).map(th => th.textContent?.trim());
      const cells = t.querySelectorAll('td').length;
      const emptyRows = Array.from(t.querySelectorAll('tr')).filter(r => !r.textContent?.trim()).length;
      return { index: i, rows, headers, cells, emptyRows };
    });
  });
  tableInfo.forEach(t => {
    if (t.headers.length === 0 && t.rows > 1) {
      addFinding('MEDIUM', 'Data Display', `Table #${t.index} has no header row`, pageName);
    }
    if (t.cells === 0 && t.rows <= 1) {
      addFinding('HIGH', 'Data Display', `Table #${t.index} appears empty`, pageName);
    }
    if (t.emptyRows > 0) {
      addFinding('LOW', 'Data Display', `Table #${t.index} has ${t.emptyRows} empty row(s)`, pageName);
    }
  });
  if (tableInfo.length > 0) {
    console.log(`  Tables: ${tableInfo.length} found - ${tableInfo.map(t => `#${t.index}(${t.rows}rows/${t.cells}cells)`).join(', ')}`);
  }

  // Number formatting check
  const unformattedNumbers = await page.evaluate(() => {
    const issues = [];
    document.querySelectorAll('td, span, p, div').forEach(el => {
      const t = el.textContent?.trim();
      if (!t) return;
      const m = t.match(/\d{7,}\.\d+/);
      if (m) issues.push({ text: t.substring(0, 80), tag: el.tagName });
    });
    return issues.slice(0, 10);
  });
  if (unformattedNumbers.length > 0) {
    addFinding('LOW', 'Data Display', `${unformattedNumbers.length} unformatted large number(s)`, pageName,
      JSON.stringify(unformattedNumbers, null, 2));
  }

  // Buttons without labels
  const btnIssues = await page.evaluate(() => {
    const issues = [];
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent?.trim();
      const aria = btn.getAttribute('aria-label');
      const title = btn.getAttribute('title');
      const rect = btn.getBoundingClientRect();
      if (!text && !aria && !title && rect.width > 0) {
        issues.push({ class: btn.className?.toString()?.substring(0, 60), w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    });
    return issues;
  });
  if (btnIssues.length > 0) {
    addFinding('MEDIUM', 'Accessibility', `${btnIssues.length} button(s) without text/aria-label`, pageName,
      JSON.stringify(btnIssues, null, 2));
  }

  // Small click targets
  const smallTargets = await page.evaluate(() => {
    const issues = [];
    document.querySelectorAll('button, a, [role="tab"], [role="button"]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 32 || rect.height < 28)) {
        issues.push({
          tag: el.tagName,
          text: el.textContent?.trim()?.substring(0, 30),
          w: Math.round(rect.width),
          h: Math.round(rect.height)
        });
      }
    });
    return issues.slice(0, 10);
  });
  if (smallTargets.length > 0) {
    addFinding('MEDIUM', 'Accessibility', `${smallTargets.length} element(s) with small click target (<32px)`, pageName,
      JSON.stringify(smallTargets, null, 2));
  }

  // Images without alt
  const noAlt = await page.locator('img:not([alt])').count();
  if (noAlt > 0) {
    addFinding('LOW', 'Accessibility', `${noAlt} image(s) without alt text`, pageName);
  }

  // Color scheme analysis
  const colorScheme = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const bgs = new Set();
    document.querySelectorAll('div, section, main, header, nav, table, tr, td, th, aside').forEach(el => {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') bgs.add(bg);
    });
    return {
      bodyBg: body.backgroundColor,
      bodyColor: body.color,
      uniqueBgs: Array.from(bgs).slice(0, 15),
      fontFamily: body.fontFamily?.substring(0, 80)
    };
  });
  console.log(`  Color scheme: bodyBg=${colorScheme.bodyBg}, bodyColor=${colorScheme.bodyColor}, ${colorScheme.uniqueBgs.length} unique BGs`);

  // Small font size
  const smallFonts = await page.evaluate(() => {
    const issues = [];
    const seen = new Set();
    document.querySelectorAll('p, span, td, th, label, a, li, div').forEach(el => {
      const style = getComputedStyle(el);
      const fs = parseFloat(style.fontSize);
      if (fs > 0 && fs < 11 && el.textContent?.trim()) {
        const key = `${fs}-${style.color}`;
        if (!seen.has(key)) {
          seen.add(key);
          issues.push({ text: el.textContent?.trim()?.substring(0, 30), fontSize: fs, color: style.color });
        }
      }
    });
    return issues.slice(0, 10);
  });
  if (smallFonts.length > 0) {
    addFinding('LOW', 'Readability', `${smallFonts.length} text style(s) with font-size < 11px`, pageName,
      JSON.stringify(smallFonts, null, 2));
  }

  return { hasEmptyState, tableInfo, colorScheme };
}

async function findAndClickTab(page, tabNames, pageName) {
  // Try multiple strategies to find tabs
  for (const name of tabNames) {
    // Strategy 1: role="tab"
    const roleTab = page.locator(`[role="tab"]:has-text("${name}")`);
    if (await roleTab.count() > 0 && await roleTab.first().isVisible()) {
      await roleTab.first().click();
      return true;
    }

    // Strategy 2: button with text
    const btnTab = page.locator(`button:has-text("${name}")`);
    if (await btnTab.count() > 0 && await btnTab.first().isVisible()) {
      await btnTab.first().click();
      return true;
    }

    // Strategy 3: tab class
    const classTab = page.locator(`[class*="tab"]:has-text("${name}")`);
    if (await classTab.count() > 0 && await classTab.first().isVisible()) {
      await classTab.first().click();
      return true;
    }

    // Strategy 4: link with text
    const linkTab = page.locator(`a:has-text("${name}")`);
    if (await linkTab.count() > 0 && await linkTab.first().isVisible()) {
      await linkTab.first().click();
      return true;
    }

    // Strategy 5: any clickable with text
    const anyClickable = page.locator(`text="${name}"`);
    if (await anyClickable.count() > 0 && await anyClickable.first().isVisible()) {
      await anyClickable.first().click();
      return true;
    }
  }
  return false;
}

async function getClickableElements(page) {
  return page.evaluate(() => {
    const items = [];
    document.querySelectorAll('button, a, [role="tab"], [role="button"], [class*="tab"]').forEach(el => {
      const text = el.textContent?.trim();
      if (text && el.getBoundingClientRect().width > 0) {
        items.push({
          tag: el.tagName,
          text: text.substring(0, 60),
          role: el.getAttribute('role'),
          class: el.className?.toString()?.substring(0, 60),
          href: el.getAttribute('href')
        });
      }
    });
    return items;
  });
}

async function run() {
  console.log('==============================================');
  console.log('BINANCE BOT FRONTEND AUDIT');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('==============================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });

  // ============================================================
  // AUDIT 1: /analysis
  // ============================================================
  console.log('\n========== AUDIT: /analysis ==========');
  {
    const page = await context.newPage();
    const consoleMessages = [];
    const networkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleMessages.push({ type: 'error', text: msg.text() });
      if (msg.type() === 'warning') consoleMessages.push({ type: 'warning', text: msg.text() });
    });
    page.on('pageerror', error => consoleMessages.push({ type: 'pageerror', text: error.message }));
    page.on('requestfailed', req => networkErrors.push({ url: req.url(), failure: req.failure()?.errorText }));

    try {
      const resp = await page.goto(`${BASE_URL}/analysis`, { waitUntil: 'networkidle', timeout: 30000 });
      if (!resp || !resp.ok()) {
        addFinding('CRITICAL', 'Navigation', `Failed to load /analysis - HTTP ${resp?.status()}`, '/analysis');
      }
      await page.waitForTimeout(3000);
      await screenshot(page, '01-analysis-initial');

      const pageInfo = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim(),
        h2s: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()),
        bodyText: document.body.textContent?.substring(0, 500)
      }));
      console.log(`  Title: ${pageInfo.title}`);
      console.log(`  H1: ${pageInfo.h1 || '(none)'}`);

      // List clickable elements
      const clickables = await getClickableElements(page);
      console.log(`  Clickable elements: ${clickables.length}`);
      clickables.forEach(c => console.log(`    ${c.tag} "${c.text}" role=${c.role} href=${c.href}`));

      await commonChecks(page, '/analysis');

      // Try clicking Spot Rotative tab
      console.log('\n  --- Clicking Spot Rotative tab ---');
      const spotFound = await findAndClickTab(page, ['Spot Rotative', 'Spot', 'spot rotative', 'SPOT ROTATIVE', 'Rotative']);
      if (spotFound) {
        await page.waitForTimeout(2000);
        await screenshot(page, '02-analysis-spot-rotative');
        await commonChecks(page, '/analysis (Spot Rotative)');
      } else {
        addFinding('HIGH', 'Navigation', 'Could not find "Spot Rotative" tab', '/analysis',
          `Available clickables: ${clickables.map(c => c.text).join(', ')}`);
        await screenshot(page, '02-analysis-spot-rotative-missing');
      }

      // Try clicking Futures tab
      console.log('\n  --- Clicking Futures tab ---');
      const futuresFound = await findAndClickTab(page, ['Futures', 'futures', 'FUTURES', 'Futuros']);
      if (futuresFound) {
        await page.waitForTimeout(2000);
        await screenshot(page, '03-analysis-futures');
        await commonChecks(page, '/analysis (Futures)');
      } else {
        addFinding('HIGH', 'Navigation', 'Could not find "Futures" tab', '/analysis',
          `Available clickables: ${clickables.map(c => c.text).join(', ')}`);
        await screenshot(page, '03-analysis-futures-missing');
      }

    } catch (err) {
      addFinding('CRITICAL', 'Navigation', `Error loading /analysis: ${err.message}`, '/analysis');
      try { await screenshot(page, '01-analysis-error'); } catch (_) {}
    }

    // Console errors
    const errors = consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    if (errors.length > 0) {
      addFinding('HIGH', 'Console', `${errors.length} console error(s)`, '/analysis',
        errors.map(e => e.text.substring(0, 200)).join('\n'));
    }
    if (warnings.length > 0) {
      addFinding('LOW', 'Console', `${warnings.length} console warning(s)`, '/analysis',
        warnings.map(w => w.text.substring(0, 200)).join('\n'));
    }
    if (networkErrors.length > 0) {
      addFinding('HIGH', 'Network', `${networkErrors.length} failed request(s)`, '/analysis',
        networkErrors.map(e => `${e.url} - ${e.failure}`).join('\n'));
    }

    allConsoleErrors.push(...consoleMessages);
    allNetworkErrors.push(...networkErrors);
    await page.close();
  }

  // ============================================================
  // AUDIT 2: /positions
  // ============================================================
  console.log('\n========== AUDIT: /positions ==========');
  {
    const page = await context.newPage();
    const consoleMessages = [];
    const networkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleMessages.push({ type: 'error', text: msg.text() });
      if (msg.type() === 'warning') consoleMessages.push({ type: 'warning', text: msg.text() });
    });
    page.on('pageerror', error => consoleMessages.push({ type: 'pageerror', text: error.message }));
    page.on('requestfailed', req => networkErrors.push({ url: req.url(), failure: req.failure()?.errorText }));

    try {
      const resp = await page.goto(`${BASE_URL}/positions`, { waitUntil: 'networkidle', timeout: 30000 });
      if (!resp || !resp.ok()) {
        addFinding('CRITICAL', 'Navigation', `Failed to load /positions - HTTP ${resp?.status()}`, '/positions');
      }
      await page.waitForTimeout(3000);
      await screenshot(page, '04-positions-initial');

      const pageInfo = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim(),
        h2s: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()),
      }));
      console.log(`  Title: ${pageInfo.title}`);
      console.log(`  H1: ${pageInfo.h1 || '(none)'}`);

      const clickables = await getClickableElements(page);
      console.log(`  Clickable elements: ${clickables.length}`);
      clickables.forEach(c => console.log(`    ${c.tag} "${c.text}" role=${c.role} href=${c.href}`));

      await commonChecks(page, '/positions');

      // Try clicking Spot tab
      console.log('\n  --- Clicking Spot tab ---');
      const spotFound = await findAndClickTab(page, ['Spot', 'spot', 'SPOT']);
      if (spotFound) {
        await page.waitForTimeout(2000);
        await screenshot(page, '05-positions-spot');
        await commonChecks(page, '/positions (Spot)');
      } else {
        addFinding('HIGH', 'Navigation', 'Could not find "Spot" tab', '/positions',
          `Available clickables: ${clickables.map(c => c.text).join(', ')}`);
        await screenshot(page, '05-positions-spot-missing');
      }

      // Try clicking Futures tab
      console.log('\n  --- Clicking Futures tab ---');
      const futuresFound = await findAndClickTab(page, ['Futures', 'futures', 'FUTURES', 'Futuros']);
      if (futuresFound) {
        await page.waitForTimeout(2000);
        await screenshot(page, '06-positions-futures');
        await commonChecks(page, '/positions (Futures)');
      } else {
        addFinding('HIGH', 'Navigation', 'Could not find "Futures" tab', '/positions',
          `Available clickables: ${clickables.map(c => c.text).join(', ')}`);
        await screenshot(page, '06-positions-futures-missing');
      }

    } catch (err) {
      addFinding('CRITICAL', 'Navigation', `Error loading /positions: ${err.message}`, '/positions');
      try { await screenshot(page, '04-positions-error'); } catch (_) {}
    }

    const errors = consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    if (errors.length > 0) {
      addFinding('HIGH', 'Console', `${errors.length} console error(s)`, '/positions',
        errors.map(e => e.text.substring(0, 200)).join('\n'));
    }
    if (warnings.length > 0) {
      addFinding('LOW', 'Console', `${warnings.length} console warning(s)`, '/positions',
        warnings.map(w => w.text.substring(0, 200)).join('\n'));
    }
    if (networkErrors.length > 0) {
      addFinding('HIGH', 'Network', `${networkErrors.length} failed request(s)`, '/positions',
        networkErrors.map(e => `${e.url} - ${e.failure}`).join('\n'));
    }

    allConsoleErrors.push(...consoleMessages);
    allNetworkErrors.push(...networkErrors);
    await page.close();
  }

  // ============================================================
  // AUDIT 3: /markets
  // ============================================================
  console.log('\n========== AUDIT: /markets ==========');
  {
    const page = await context.newPage();
    const consoleMessages = [];
    const networkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleMessages.push({ type: 'error', text: msg.text() });
      if (msg.type() === 'warning') consoleMessages.push({ type: 'warning', text: msg.text() });
    });
    page.on('pageerror', error => consoleMessages.push({ type: 'pageerror', text: error.message }));
    page.on('requestfailed', req => networkErrors.push({ url: req.url(), failure: req.failure()?.errorText }));

    try {
      const resp = await page.goto(`${BASE_URL}/markets`, { waitUntil: 'networkidle', timeout: 30000 });
      if (!resp || !resp.ok()) {
        addFinding('CRITICAL', 'Navigation', `Failed to load /markets - HTTP ${resp?.status()}`, '/markets');
      }
      await page.waitForTimeout(3000);
      await screenshot(page, '07-markets-initial');

      const pageInfo = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim(),
        h2s: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()),
      }));
      console.log(`  Title: ${pageInfo.title}`);
      console.log(`  H1: ${pageInfo.h1 || '(none)'}`);

      const clickables = await getClickableElements(page);
      console.log(`  Clickable elements: ${clickables.length}`);
      clickables.forEach(c => console.log(`    ${c.tag} "${c.text}" role=${c.role} href=${c.href}`));

      await commonChecks(page, '/markets');

    } catch (err) {
      addFinding('CRITICAL', 'Navigation', `Error loading /markets: ${err.message}`, '/markets');
      try { await screenshot(page, '07-markets-error'); } catch (_) {}
    }

    const errors = consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    if (errors.length > 0) {
      addFinding('HIGH', 'Console', `${errors.length} console error(s)`, '/markets',
        errors.map(e => e.text.substring(0, 200)).join('\n'));
    }
    if (warnings.length > 0) {
      addFinding('LOW', 'Console', `${warnings.length} console warning(s)`, '/markets',
        warnings.map(w => w.text.substring(0, 200)).join('\n'));
    }
    if (networkErrors.length > 0) {
      addFinding('HIGH', 'Network', `${networkErrors.length} failed request(s)`, '/markets',
        networkErrors.map(e => `${e.url} - ${e.failure}`).join('\n'));
    }

    allConsoleErrors.push(...consoleMessages);
    allNetworkErrors.push(...networkErrors);
    await page.close();
  }

  // ============================================================
  // REPORT
  // ============================================================
  console.log('\n\n==============================================');
  console.log('AUDIT FINDINGS SUMMARY');
  console.log('==============================================\n');

  const bySeverity = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
  findings.forEach(f => { if (bySeverity[f.severity]) bySeverity[f.severity].push(f); });

  for (const sev of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
    const items = bySeverity[sev];
    if (items.length > 0) {
      console.log(`\n--- ${sev} (${items.length}) ---`);
      items.forEach((f, i) => {
        console.log(`  ${i + 1}. [${f.page}] [${f.category}] ${f.description}`);
        if (f.details) console.log(`     Details: ${f.details.substring(0, 300)}`);
      });
    }
  }

  console.log(`\n  Total: ${findings.length} findings`);
  console.log(`    CRITICAL: ${bySeverity.CRITICAL.length}`);
  console.log(`    HIGH:     ${bySeverity.HIGH.length}`);
  console.log(`    MEDIUM:   ${bySeverity.MEDIUM.length}`);
  console.log(`    LOW:      ${bySeverity.LOW.length}`);

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    pages: ['/analysis', '/positions', '/markets'],
    findings,
    consoleMessages: allConsoleErrors,
    networkErrors: allNetworkErrors,
    summary: {
      total: findings.length,
      critical: bySeverity.CRITICAL.length,
      high: bySeverity.HIGH.length,
      medium: bySeverity.MEDIUM.length,
      low: bySeverity.LOW.length,
    }
  };

  writeFileSync(join(SCREENSHOT_DIR, 'audit-report.json'), JSON.stringify(report, null, 2));
  console.log('\nFull report saved to audit-report.json');

  await browser.close();
  console.log('Audit complete.');
}

run().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
