// Binance Bot Frontend Audit Script
// Audits: /backtest, /portfolio, /settings pages
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:21340';
const SCREENSHOT_DIR = 'C:/Users/User/Desktop/Diana-Corporacao-Senciente/squads/frontend-audit/audit-results/binance-bot';

const findings = [];

function addFinding(severity, page, category, description, details = '') {
  findings.push({ severity, page, category, description, details });
}

async function collectConsoleMessages(page, pageName) {
  const messages = [];
  page.on('console', msg => {
    messages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    addFinding('CRITICAL', pageName, 'Console Error', `Uncaught page error: ${err.message}`);
  });
  return messages;
}

async function auditBacktestPage(browser) {
  console.log('\n=== AUDITING /backtest ===');
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const consoleMessages = await collectConsoleMessages(page, '/backtest');

  try {
    // Navigate to backtest
    await page.goto(`${BASE_URL}/backtest`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for async loading

    // Screenshot: Main backtest page (Configure view - default)
    await page.screenshot({ path: join(SCREENSHOT_DIR, 'backtest-01-configure-view.png'), fullPage: true });
    console.log('  Screenshot: backtest-01-configure-view.png');

    // Check header
    const header = await page.locator('h1:has-text("Backtesting")').count();
    if (header === 0) {
      addFinding('HIGH', '/backtest', 'Layout', 'Missing main header "Backtesting"');
    } else {
      console.log('  OK: Header "Backtesting" found');
    }

    // Check "EM DESENVOLVIMENTO" badge
    const devBadge = await page.locator('text=EM DESENVOLVIMENTO').count();
    if (devBadge > 0) {
      addFinding('LOW', '/backtest', 'Status', 'Page shows "EM DESENVOLVIMENTO" badge - expected for beta feature');
      console.log('  INFO: "EM DESENVOLVIMENTO" badge present');
    }

    // Check navigation tabs
    const tabs = ['Configurar', 'Histórico', 'Comparação'];
    for (const tab of tabs) {
      const tabEl = await page.locator(`button:has-text("${tab}")`).count();
      if (tabEl === 0) {
        addFinding('HIGH', '/backtest', 'Navigation', `Missing tab: "${tab}"`);
      } else {
        console.log(`  OK: Tab "${tab}" found`);
      }
    }

    // Check if "Results" tab is missing from navigation
    const resultsTab = await page.locator('button:has-text("Resultados")').count();
    if (resultsTab === 0) {
      addFinding('MEDIUM', '/backtest', 'Navigation', 'No "Resultados" tab in navigation - Results view is only accessible after running a backtest, not via direct tab navigation');
    }

    // Check Configure view content (default state - no strategies)
    const noStrategyMsg = await page.locator('text=Nenhuma Estratégia Configurada').count();
    if (noStrategyMsg > 0) {
      addFinding('MEDIUM', '/backtest', 'Data', 'Configure view shows "Nenhuma Estratégia Configurada" - no strategies loaded, backtest cannot be run');
      console.log('  INFO: No strategies configured - empty state shown');
    }

    // Check loading spinner visibility
    const spinner = await page.locator('.animate-spin').count();
    console.log(`  INFO: Loading spinners visible: ${spinner}`);

    // Check Binance connection warning
    const binanceWarning = await page.locator('text=Conecte-se à Binance primeiro').count();
    if (binanceWarning > 0) {
      addFinding('MEDIUM', '/backtest', 'Connection', 'Binance connection warning shown - system is not connected to Binance API');
      console.log('  INFO: Binance connection warning present');
    }

    const binanceConnected = await page.locator('text=Conectado à Binance').count();
    if (binanceConnected > 0) {
      console.log('  OK: Binance is connected');
    }

    // === View 2: History tab ===
    console.log('\n  --- Clicking History tab ---');
    await page.locator('button:has-text("Histórico")').click();
    await page.waitForTimeout(2000); // Wait for async loading

    await page.screenshot({ path: join(SCREENSHOT_DIR, 'backtest-02-history-view.png'), fullPage: true });
    console.log('  Screenshot: backtest-02-history-view.png');

    const historyTitle = await page.locator('text=Histórico de Backtests').count();
    if (historyTitle > 0) {
      console.log('  OK: History view title present');
    }

    const noBacktestMsg = await page.locator('text=Nenhum Backtest Executado').count();
    if (noBacktestMsg > 0) {
      addFinding('LOW', '/backtest', 'Data', 'History view shows "Nenhum Backtest Executado" - expected for new installation');
      console.log('  INFO: No backtest history - empty state');
    }

    // === View 3: Comparison tab ===
    console.log('\n  --- Clicking Comparison tab ---');
    await page.locator('button:has-text("Comparação")').click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: join(SCREENSHOT_DIR, 'backtest-03-comparison-view.png'), fullPage: true });
    console.log('  Screenshot: backtest-03-comparison-view.png');

    const comparisonTitle = await page.locator('text=Comparação de Estratégias').count();
    if (comparisonTitle > 0) {
      console.log('  OK: Comparison view title present');
    }

    // Check comparison cards (mock data)
    const comparisonCards = await page.locator('text=RSI Oversold/Overbought').count();
    if (comparisonCards > 0) {
      addFinding('MEDIUM', '/backtest', 'Data', 'Comparison view uses hardcoded mock data (RSI Oversold/Overbought, MACD Crossover, Bollinger Bands) - not connected to real backtest results');
      console.log('  INFO: Mock comparison data present');
    }

    // Select comparison items to test comparison table
    const checkboxes = await page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`  INFO: ${checkboxCount} comparison checkboxes found`);

    if (checkboxCount >= 2) {
      // Click first two items to trigger comparison table
      await checkboxes.nth(0).click();
      await page.waitForTimeout(300);
      await checkboxes.nth(1).click();
      await page.waitForTimeout(500);

      await page.screenshot({ path: join(SCREENSHOT_DIR, 'backtest-04-comparison-with-selection.png'), fullPage: true });
      console.log('  Screenshot: backtest-04-comparison-with-selection.png');

      // Check if comparison table appears
      const compTable = await page.locator('text=Comparação Detalhada').count();
      if (compTable > 0) {
        console.log('  OK: Comparison detail table rendered');
      }

      const analysisSection = await page.locator('text=Análise Comparativa').count();
      if (analysisSection > 0) {
        console.log('  OK: Comparative analysis section rendered');
      }

      // Select all 3 to test max limit
      if (checkboxCount >= 3) {
        await checkboxes.nth(2).click();
        await page.waitForTimeout(500);

        await page.screenshot({ path: join(SCREENSHOT_DIR, 'backtest-05-comparison-max-3.png'), fullPage: true });
        console.log('  Screenshot: backtest-05-comparison-max-3.png');

        const maxWarning = await page.locator('text=Máximo de 3 backtests').count();
        if (maxWarning > 0) {
          console.log('  OK: Max 3 comparison warning shown');
        }
      }
    }

    // === View 4: Results view (via direct navigation from configure) ===
    console.log('\n  --- Navigating to Results view ---');
    await page.locator('button:has-text("Configurar")').click();
    await page.waitForTimeout(1500);

    // The Results view is accessible via BacktestPage state. Since there are no strategies,
    // we need to check what happens when we try to access it programmatically.
    // The only way to get to results is by running a backtest, which requires strategies.
    // Let's check the empty results state by navigating there if possible.

    await page.screenshot({ path: join(SCREENSHOT_DIR, 'backtest-06-configure-after-navigation.png'), fullPage: true });
    console.log('  Screenshot: backtest-06-configure-after-navigation.png');

    // Check console messages
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');

    for (const err of errors) {
      if (err.text.includes('BacktestResult') || err.text.includes('export')) {
        addFinding('CRITICAL', '/backtest', 'Console Error', `TypeScript/Import error: ${err.text}`);
      } else if (err.text.includes('Failed to fetch') || err.text.includes('Network')) {
        addFinding('HIGH', '/backtest', 'Console Error', `Network error: ${err.text}`);
      } else {
        addFinding('MEDIUM', '/backtest', 'Console Error', err.text.substring(0, 200));
      }
    }

    for (const warn of warnings) {
      if (!warn.text.includes('DevTools') && !warn.text.includes('React')) {
        addFinding('LOW', '/backtest', 'Console Warning', warn.text.substring(0, 200));
      }
    }

    console.log(`  Console: ${errors.length} errors, ${warnings.length} warnings`);

  } catch (err) {
    addFinding('CRITICAL', '/backtest', 'Page Load', `Failed to audit backtest page: ${err.message}`);
    console.error(`  ERROR: ${err.message}`);
    try {
      await page.screenshot({ path: join(SCREENSHOT_DIR, 'backtest-ERROR.png'), fullPage: true });
    } catch (e) {}
  }

  await context.close();
}

async function auditPortfolioPage(browser) {
  console.log('\n=== AUDITING /portfolio ===');
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const consoleMessages = await collectConsoleMessages(page, '/portfolio');

  try {
    await page.goto(`${BASE_URL}/portfolio`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: join(SCREENSHOT_DIR, 'portfolio-01-main.png'), fullPage: true });
    console.log('  Screenshot: portfolio-01-main.png');

    // Check title
    const title = await page.locator('text=Portfolio Detalhado').count();
    if (title > 0) {
      console.log('  OK: "Portfolio Detalhado" title found');
    } else {
      addFinding('HIGH', '/portfolio', 'Layout', 'Missing "Portfolio Detalhado" title');
    }

    // Check development status
    const devStatus = await page.locator('text=Funcionalidade em desenvolvimento').count();
    if (devStatus > 0) {
      addFinding('LOW', '/portfolio', 'Status', 'Page shows "Funcionalidade em desenvolvimento" placeholder - expected for in-development page');
      console.log('  INFO: "Funcionalidade em desenvolvimento" indicator present');
    }

    // Check 3 feature cards
    const cards = [
      { text: 'Análise de Ativos', desc: 'distribuição dos seus ativos' },
      { text: 'Gestão de Risco', desc: 'exposição e correlações' },
      { text: 'Performance', desc: 'retornos e métricas avançadas' },
    ];

    for (const card of cards) {
      const found = await page.locator(`text=${card.text}`).count();
      if (found > 0) {
        console.log(`  OK: Feature card "${card.text}" present`);
      } else {
        addFinding('MEDIUM', '/portfolio', 'Layout', `Missing feature card: "${card.text}"`);
      }
    }

    // Check sidebar navigation
    const sidebar = await page.locator('nav, [role="navigation"]').count();
    console.log(`  INFO: Navigation elements found: ${sidebar}`);

    // Check for active sidebar link
    const activeLink = await page.locator('a[href="/portfolio"]').count();
    if (activeLink > 0) {
      console.log('  OK: Portfolio sidebar link exists');
    }

    // Console messages
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');

    for (const err of errors) {
      addFinding('MEDIUM', '/portfolio', 'Console Error', err.text.substring(0, 200));
    }

    console.log(`  Console: ${errors.length} errors, ${warnings.length} warnings`);

  } catch (err) {
    addFinding('CRITICAL', '/portfolio', 'Page Load', `Failed to audit portfolio page: ${err.message}`);
    console.error(`  ERROR: ${err.message}`);
    try {
      await page.screenshot({ path: join(SCREENSHOT_DIR, 'portfolio-ERROR.png'), fullPage: true });
    } catch (e) {}
  }

  await context.close();
}

async function auditSettingsPage(browser) {
  console.log('\n=== AUDITING /settings ===');
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const consoleMessages = await collectConsoleMessages(page, '/settings');

  try {
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: join(SCREENSHOT_DIR, 'settings-01-main.png'), fullPage: true });
    console.log('  Screenshot: settings-01-main.png');

    // Check title
    const title = await page.locator('text=Configurações do Sistema').count();
    if (title > 0) {
      console.log('  OK: "Configurações do Sistema" title found');
    } else {
      addFinding('HIGH', '/settings', 'Layout', 'Missing "Configurações do Sistema" title');
    }

    // Check development status
    const devStatus = await page.locator('text=Funcionalidade em desenvolvimento').count();
    if (devStatus > 0) {
      addFinding('LOW', '/settings', 'Status', 'Page shows "Funcionalidade em desenvolvimento" placeholder - expected for in-development page');
      console.log('  INFO: "Funcionalidade em desenvolvimento" indicator present');
    }

    // Check 3 feature cards
    const cards = [
      { text: 'Segurança', desc: 'autenticação e permissões' },
      { text: 'Notificações', desc: 'alertas e notificações' },
      { text: 'Preferências', desc: 'interface e comportamento' },
    ];

    for (const card of cards) {
      const found = await page.locator(`text=${card.text}`).count();
      if (found > 0) {
        console.log(`  OK: Feature card "${card.text}" present`);
      } else {
        addFinding('MEDIUM', '/settings', 'Layout', `Missing feature card: "${card.text}"`);
      }
    }

    // Check for any interactive elements (there should be none in placeholder)
    const inputs = await page.locator('input, select, textarea').count();
    const buttons = await page.locator('button').count();
    console.log(`  INFO: Interactive elements - inputs: ${inputs}, buttons: ${buttons}`);

    if (inputs === 0) {
      addFinding('LOW', '/settings', 'Functionality', 'No form inputs present - page is pure placeholder with no interactive settings');
    }

    // Console messages
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');

    for (const err of errors) {
      addFinding('MEDIUM', '/settings', 'Console Error', err.text.substring(0, 200));
    }

    console.log(`  Console: ${errors.length} errors, ${warnings.length} warnings`);

  } catch (err) {
    addFinding('CRITICAL', '/settings', 'Page Load', `Failed to audit settings page: ${err.message}`);
    console.error(`  ERROR: ${err.message}`);
    try {
      await page.screenshot({ path: join(SCREENSHOT_DIR, 'settings-ERROR.png'), fullPage: true });
    } catch (e) {}
  }

  await context.close();
}

async function auditResponsiveness(browser) {
  console.log('\n=== AUDITING RESPONSIVENESS ===');
  const viewports = [
    { width: 375, height: 812, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    try {
      // Backtest on mobile/tablet
      await page.goto(`${BASE_URL}/backtest`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(SCREENSHOT_DIR, `backtest-responsive-${vp.name}.png`), fullPage: true });
      console.log(`  Screenshot: backtest-responsive-${vp.name}.png`);

      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      if (bodyWidth > vp.width) {
        addFinding('MEDIUM', '/backtest', 'Responsiveness', `Horizontal overflow on ${vp.name} (${vp.width}px): body width is ${bodyWidth}px`);
      }

      // Portfolio on mobile/tablet
      await page.goto(`${BASE_URL}/portfolio`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(SCREENSHOT_DIR, `portfolio-responsive-${vp.name}.png`), fullPage: true });
      console.log(`  Screenshot: portfolio-responsive-${vp.name}.png`);

      // Settings on mobile/tablet
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(SCREENSHOT_DIR, `settings-responsive-${vp.name}.png`), fullPage: true });
      console.log(`  Screenshot: settings-responsive-${vp.name}.png`);

    } catch (err) {
      addFinding('MEDIUM', 'responsive', 'Responsiveness', `Failed responsive audit for ${vp.name}: ${err.message}`);
    }

    await context.close();
  }
}

async function main() {
  console.log('Binance Bot Frontend Audit');
  console.log('==========================');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);

  const browser = await chromium.launch({ headless: true });

  try {
    await auditBacktestPage(browser);
    await auditPortfolioPage(browser);
    await auditSettingsPage(browser);
    await auditResponsiveness(browser);
  } finally {
    await browser.close();
  }

  // Generate report
  console.log('\n\n========================================');
  console.log('AUDIT FINDINGS REPORT');
  console.log('========================================\n');

  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

  for (const f of findings) {
    severityCounts[f.severity]++;
    console.log(`[${f.severity}] ${f.page} | ${f.category}`);
    console.log(`  ${f.description}`);
    if (f.details) console.log(`  Details: ${f.details}`);
    console.log('');
  }

  console.log('========================================');
  console.log('SUMMARY');
  console.log(`  CRITICAL: ${severityCounts.CRITICAL}`);
  console.log(`  HIGH:     ${severityCounts.HIGH}`);
  console.log(`  MEDIUM:   ${severityCounts.MEDIUM}`);
  console.log(`  LOW:      ${severityCounts.LOW}`);
  console.log(`  TOTAL:    ${findings.length}`);
  console.log('========================================');

  // Save JSON report
  const report = {
    timestamp: new Date().toISOString(),
    target: BASE_URL,
    pages: ['/backtest', '/portfolio', '/settings'],
    findings,
    summary: severityCounts,
  };

  writeFileSync(join(SCREENSHOT_DIR, 'audit-report.json'), JSON.stringify(report, null, 2));
  console.log('\nJSON report saved to audit-report.json');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
