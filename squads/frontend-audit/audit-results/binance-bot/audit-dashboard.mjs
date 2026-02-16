// Binance Bot Dashboard Audit Script
// Auditing: http://localhost:21340/dashboard
// Auditor: Lupe - Frontend Auditor
import { chromium } from '../../../../apps/dashboard/node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\User\\Desktop\\Diana-Corporacao-Senciente\\squads\\frontend-audit\\audit-results\\binance-bot';
const BASE_URL = 'http://localhost:21340';

const findings = [];
const consoleMessages = [];
const networkErrors = [];
const responseErrors = [];

function addFinding(severity, category, description, details = '') {
  findings.push({ severity, category, description, page: '/dashboard', details });
  const prefix = severity === 'CRITICAL' ? '!!! ' : severity === 'HIGH' ? '!! ' : severity === 'MEDIUM' ? '! ' : '';
  console.log(`  ${prefix}[${severity}][${category}] ${description}`);
}

async function run() {
  console.log('==============================================');
  console.log('BINANCE BOT DASHBOARD AUDIT');
  console.log(`URL: ${BASE_URL}/dashboard`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('==============================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Collect ALL console messages
  page.on('console', msg => {
    consoleMessages.push({ text: msg.text(), type: msg.type() });
  });
  page.on('pageerror', error => {
    consoleMessages.push({ text: error.message, type: 'pageerror', stack: error.stack });
  });
  page.on('requestfailed', request => {
    networkErrors.push({ url: request.url(), failure: request.failure()?.errorText, method: request.method() });
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      responseErrors.push({ url: response.url(), status: response.status(), statusText: response.statusText() });
    }
  });

  // ============================================================
  // STEP 1: Navigate to /dashboard
  // ============================================================
  console.log('\n=== STEP 1: Navigate to /dashboard ===');
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('  Dashboard loaded successfully');
  } catch (e) {
    console.log('  Dashboard load timeout (continuing):', e.message);
  }
  // Wait for async data to settle
  await page.waitForTimeout(6000);

  // ============================================================
  // STEP 2: Full-page screenshots
  // ============================================================
  console.log('\n=== STEP 2: Screenshots ===');
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'dashboard-01-fullpage.png'), fullPage: true });
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'dashboard-02-viewport.png'), fullPage: false });
  console.log('  Saved dashboard-01-fullpage.png and dashboard-02-viewport.png');

  // ============================================================
  // STEP 3: Console errors/warnings analysis
  // ============================================================
  console.log('\n=== STEP 3: Console Analysis ===');
  const errors = consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror');
  const warnings = consoleMessages.filter(m => m.type === 'warning');
  console.log(`  Errors: ${errors.length}, Warnings: ${warnings.length}, Network failures: ${networkErrors.length}, HTTP errors: ${responseErrors.length}`);

  if (errors.length > 0) {
    addFinding('HIGH', 'Console Errors', `${errors.length} console error(s) during page load`,
      errors.map(e => e.text.substring(0, 250)).join('\n'));
  }
  if (warnings.length > 0) {
    addFinding('LOW', 'Console Warnings', `${warnings.length} console warning(s) during page load`,
      warnings.slice(0, 5).map(w => w.text.substring(0, 200)).join('\n'));
  }
  if (networkErrors.length > 0) {
    addFinding('HIGH', 'Network Errors', `${networkErrors.length} network request(s) failed`,
      networkErrors.map(e => `${e.method} ${e.url} - ${e.failure}`).join('\n'));
  }
  if (responseErrors.length > 0) {
    addFinding('MEDIUM', 'HTTP Errors', `${responseErrors.length} HTTP error response(s)`,
      responseErrors.map(e => `${e.status} ${e.statusText} - ${e.url}`).join('\n'));
  }

  // ============================================================
  // STEP 4: Visual Layout Analysis
  // ============================================================
  console.log('\n=== STEP 4: Visual Layout Analysis ===');

  const layoutInfo = await page.evaluate(() => {
    const results = {};

    // Header
    const header = document.querySelector('header');
    if (header) {
      const rect = header.getBoundingClientRect();
      results.header = { found: true, width: rect.width, height: rect.height };
    } else {
      results.header = { found: false };
    }

    // Sidebar
    const sidebar = document.querySelector('.w-64');
    if (sidebar) {
      const rect = sidebar.getBoundingClientRect();
      results.sidebar = { found: true, width: rect.width, height: rect.height };
    } else {
      results.sidebar = { found: false };
    }

    // Main content area
    const main = document.querySelector('main');
    if (main) {
      const rect = main.getBoundingClientRect();
      results.main = { found: true, width: rect.width, height: rect.height, left: rect.left };
    } else {
      results.main = { found: false };
    }

    // Horizontal overflow
    results.hasHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;
    results.scrollWidth = document.documentElement.scrollWidth;
    results.viewportWidth = window.innerWidth;

    // Check overflow on individual elements
    const overflowElements = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 5 && rect.width > 0) {
        overflowElements.push({
          tag: el.tagName,
          className: el.className?.toString()?.substring(0, 80),
          overflow: Math.round(rect.right - window.innerWidth),
        });
      }
    });
    results.overflowElements = overflowElements.slice(0, 10);

    return results;
  });

  console.log(`  Header: ${layoutInfo.header.found ? `${layoutInfo.header.width}x${layoutInfo.header.height}` : 'NOT FOUND'}`);
  console.log(`  Sidebar: ${layoutInfo.sidebar.found ? `${layoutInfo.sidebar.width}x${layoutInfo.sidebar.height}` : 'NOT FOUND'}`);
  console.log(`  Main: ${layoutInfo.main.found ? `${layoutInfo.main.width}x${layoutInfo.main.height} (left: ${layoutInfo.main.left})` : 'NOT FOUND'}`);
  console.log(`  Horizontal overflow: ${layoutInfo.hasHorizontalOverflow} (scroll: ${layoutInfo.scrollWidth}, viewport: ${layoutInfo.viewportWidth})`);

  if (!layoutInfo.header.found) {
    addFinding('HIGH', 'Layout', 'Header element not found on dashboard');
  }
  if (!layoutInfo.sidebar.found) {
    addFinding('HIGH', 'Layout', 'Sidebar element not found on dashboard');
  }
  if (layoutInfo.hasHorizontalOverflow) {
    addFinding('MEDIUM', 'Layout', 'Page has horizontal overflow at 1920px viewport');
  }
  if (layoutInfo.overflowElements.length > 0) {
    addFinding('MEDIUM', 'Layout', `${layoutInfo.overflowElements.length} element(s) overflow the viewport`,
      layoutInfo.overflowElements.map(o => `<${o.tag}> class="${o.className}" overflow: ${o.overflow}px`).join('\n'));
  }

  // Font consistency
  const fontCheck = await page.evaluate(() => {
    const fonts = new Set();
    document.querySelectorAll('h1, h2, h3, h4, p, span, button, a').forEach(el => {
      fonts.add(window.getComputedStyle(el).fontFamily);
    });
    return Array.from(fonts);
  });
  console.log(`  Font families: ${fontCheck.length}`);
  if (fontCheck.length > 3) {
    addFinding('LOW', 'Typography', `${fontCheck.length} different font families detected`,
      fontCheck.join('\n'));
  }

  // Small fonts
  const smallFonts = await page.evaluate(() => {
    const issues = [];
    const seen = new Set();
    document.querySelectorAll('p, span, td, th, label, a, li, div').forEach(el => {
      const fs = parseFloat(window.getComputedStyle(el).fontSize);
      const text = el.textContent?.trim();
      if (fs > 0 && fs < 11 && text && text.length > 0 && text.length < 200) {
        const key = `${fs}-${text.substring(0, 20)}`;
        if (!seen.has(key)) {
          seen.add(key);
          issues.push({ text: text.substring(0, 50), fontSize: fs });
        }
      }
    });
    return issues.slice(0, 10);
  });
  if (smallFonts.length > 0) {
    addFinding('LOW', 'Typography', `${smallFonts.length} text element(s) with font-size < 11px`,
      smallFonts.map(f => `"${f.text}" - ${f.fontSize}px`).join('\n'));
  }

  // ============================================================
  // STEP 5: Interactive Elements Check
  // ============================================================
  console.log('\n=== STEP 5: Interactive Elements ===');

  const interactiveCheck = await page.evaluate(() => {
    const results = {
      buttons: { total: 0, disabled: 0, zeroSize: [], noLabel: [] },
      links: { total: 0, broken: [], external: [] },
      inputs: { total: 0, noLabel: [] },
    };

    // Buttons
    document.querySelectorAll('button').forEach(btn => {
      results.buttons.total++;
      if (btn.disabled) results.buttons.disabled++;
      const rect = btn.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        results.buttons.zeroSize.push(btn.textContent?.trim()?.substring(0, 50));
      }
      const label = btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.textContent?.trim();
      if (!label) {
        results.buttons.noLabel.push(btn.className?.toString()?.substring(0, 60));
      }
    });

    // Links
    document.querySelectorAll('a').forEach(link => {
      results.links.total++;
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === 'undefined') {
        results.links.broken.push({ text: link.textContent?.trim()?.substring(0, 50), href });
      }
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        results.links.external.push({ text: link.textContent?.trim()?.substring(0, 50), href });
      }
    });

    // Inputs
    document.querySelectorAll('input, select, textarea').forEach(input => {
      results.inputs.total++;
      const label = input.getAttribute('aria-label') || input.getAttribute('placeholder');
      if (!label) {
        results.inputs.noLabel.push({
          type: input.getAttribute('type') || input.tagName.toLowerCase(),
          id: input.id,
        });
      }
    });

    return results;
  });

  console.log(`  Buttons: ${interactiveCheck.buttons.total} (${interactiveCheck.buttons.disabled} disabled)`);
  console.log(`  Links: ${interactiveCheck.links.total} (${interactiveCheck.links.broken.length} broken)`);
  console.log(`  Inputs: ${interactiveCheck.inputs.total}`);

  if (interactiveCheck.buttons.zeroSize.length > 0) {
    addFinding('MEDIUM', 'Interactive', `${interactiveCheck.buttons.zeroSize.length} button(s) with zero dimensions`,
      interactiveCheck.buttons.zeroSize.join(', '));
  }
  if (interactiveCheck.buttons.noLabel.length > 0) {
    addFinding('MEDIUM', 'Accessibility', `${interactiveCheck.buttons.noLabel.length} button(s) without accessible labels`,
      interactiveCheck.buttons.noLabel.join(', '));
  }
  if (interactiveCheck.links.broken.length > 0) {
    addFinding('MEDIUM', 'Interactive', `${interactiveCheck.links.broken.length} broken/empty link(s)`,
      interactiveCheck.links.broken.map(l => `"${l.text}" href="${l.href}"`).join('\n'));
  }

  // ============================================================
  // STEP 6: Sub-component Analysis
  // ============================================================
  console.log('\n=== STEP 6: Sub-component Analysis ===');

  const componentCheck = await page.evaluate(() => {
    const body = document.body.textContent || '';
    const results = {};

    // BinanceConnectionStatus
    results.binanceConnection = {
      found: body.includes('Status da Conex') || body.includes('Conexão Binance'),
      hasStatusIndicator: !!document.querySelector('.bg-green-500, .bg-red-500, .bg-yellow-500, .bg-blue-500'),
    };

    // SystemStatus
    results.systemStatus = {
      found: body.includes('Status do Sistema'),
      apiStatus: body.includes('API Binance'),
      dbStatus: body.includes('Database') || body.includes('PostgreSQL'),
      redisStatus: body.includes('Redis') || body.includes('Cache'),
      wsStatus: body.includes('WebSocket'),
    };

    // PortfolioOverview
    results.portfolio = {
      found: body.includes('Portfolio'),
      hasValue: !!body.match(/US\$\s*[\d,.]+/) || !!body.match(/\$[\d,.]+/),
      isLoading: body.includes('Carregando dados reais'),
      hasError: body.includes('Erro ao Carregar Dados') || body.includes('Erro Portfolio'),
    };

    // ActivePositions
    results.activePositions = {
      found: body.includes('POSIÇÕES ATIVAS') || body.includes('Posições Ativas') || body.includes('posição ativa'),
      isEmpty: body.includes('Nenhuma posição ativa'),
      count: (body.match(/posição|posições/gi) || []).length,
    };

    // LogsFeed
    results.logsFeed = {
      found: body.includes('Logs do Sistema'),
      isDev: body.includes('EM DESENVOLVIMENTO') || body.includes('Em desenvolvimento'),
    };

    // TradingStrategies
    results.tradingStrategies = {
      found: body.includes('Estratégias de Trading'),
    };

    // Error banners
    const errorBanners = document.querySelectorAll('.bg-red-50');
    results.errorBanners = {
      count: errorBanners.length,
      texts: Array.from(errorBanners).map(b => b.textContent?.trim()?.substring(0, 200)),
    };

    // Warning banners
    const warnBanners = document.querySelectorAll('.bg-yellow-50');
    results.warningBanners = {
      count: warnBanners.length,
    };

    // Loading spinners
    let visibleSpinners = 0;
    document.querySelectorAll('.animate-spin').forEach(spinner => {
      const rect = spinner.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) visibleSpinners++;
    });
    results.visibleSpinners = visibleSpinners;

    // Development placeholders
    const devPlaceholders = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0 && el.textContent?.includes('Em desenvolvimento')) {
        devPlaceholders.push(el.textContent.trim().substring(0, 100));
      }
    });
    results.devPlaceholders = devPlaceholders;

    // Debug text in UI
    const debugPatterns = ['HMR ATIVO', 'CACHE BUSTER', 'TODO:', 'HACK:', 'FIXME:', 'console.log'];
    const foundDebug = debugPatterns.filter(p => body.includes(p));
    results.debugText = foundDebug;

    // NaN / undefined / null on screen
    const dataIssues = [];
    const walk = (el) => {
      if (el.childNodes) {
        for (const child of el.childNodes) {
          if (child.nodeType === 3) {
            const t = child.textContent?.trim();
            if (t && (t === 'NaN' || t === 'undefined' || t === 'null' || t.includes('NaN%') || t.includes('$NaN'))) {
              dataIssues.push({ text: t.substring(0, 60), parent: child.parentElement?.tagName });
            }
          }
          walk(child);
        }
      }
    };
    walk(document.body);
    results.dataIssues = dataIssues.slice(0, 20);

    return results;
  });

  console.log('  Sub-component status:');
  console.log(`    BinanceConnectionStatus: ${componentCheck.binanceConnection.found ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`    SystemStatus: ${componentCheck.systemStatus.found ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`    PortfolioOverview: ${componentCheck.portfolio.found ? 'FOUND' : 'NOT FOUND'} (loading: ${componentCheck.portfolio.isLoading}, error: ${componentCheck.portfolio.hasError})`);
  console.log(`    ActivePositions: ${componentCheck.activePositions.found ? 'FOUND' : 'NOT FOUND'} (empty: ${componentCheck.activePositions.isEmpty})`);
  console.log(`    LogsFeed: ${componentCheck.logsFeed.found ? 'FOUND' : 'NOT FOUND'} (dev mode: ${componentCheck.logsFeed.isDev})`);
  console.log(`    TradingStrategies: ${componentCheck.tradingStrategies.found ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`  Error banners: ${componentCheck.errorBanners.count}`);
  console.log(`  Warning banners: ${componentCheck.warningBanners.count}`);
  console.log(`  Loading spinners: ${componentCheck.visibleSpinners}`);
  console.log(`  Dev placeholders: ${componentCheck.devPlaceholders.length}`);
  console.log(`  Debug text: ${componentCheck.debugText.length > 0 ? componentCheck.debugText.join(', ') : 'none'}`);
  console.log(`  Data issues (NaN/undefined/null): ${componentCheck.dataIssues.length}`);

  // Generate findings from component checks
  if (!componentCheck.binanceConnection.found) {
    addFinding('HIGH', 'Components', 'BinanceConnectionStatus component not rendered');
  }
  if (!componentCheck.systemStatus.found) {
    addFinding('HIGH', 'Components', 'SystemStatus component not rendered');
  }
  if (!componentCheck.portfolio.found) {
    addFinding('HIGH', 'Components', 'PortfolioOverview component not rendered');
  }
  if (componentCheck.portfolio.isLoading) {
    addFinding('MEDIUM', 'Loading States', 'PortfolioOverview still showing loading state after 6s');
  }
  if (componentCheck.portfolio.hasError) {
    addFinding('HIGH', 'Error States', 'PortfolioOverview showing error state',
      componentCheck.errorBanners.texts.join('\n'));
  }
  if (!componentCheck.activePositions.found) {
    addFinding('HIGH', 'Components', 'ActivePositions component not rendered');
  }
  if (!componentCheck.logsFeed.found) {
    addFinding('HIGH', 'Components', 'LogsFeed component not rendered');
  }
  if (componentCheck.logsFeed.isDev) {
    addFinding('MEDIUM', 'UX Completeness', 'LogsFeed shows "Em desenvolvimento" placeholder - no real logs displayed');
  }
  if (componentCheck.errorBanners.count > 0) {
    addFinding('HIGH', 'Error States', `${componentCheck.errorBanners.count} error banner(s) visible on dashboard`,
      componentCheck.errorBanners.texts.join('\n---\n'));
  }
  if (componentCheck.visibleSpinners > 0) {
    addFinding('MEDIUM', 'Loading States', `${componentCheck.visibleSpinners} loading spinner(s) still visible after 6s page load`);
  }
  if (componentCheck.debugText.length > 0) {
    addFinding('MEDIUM', 'UX Quality', 'Debug/development text visible in production UI',
      `Found: ${componentCheck.debugText.join(', ')}`);
  }
  if (componentCheck.dataIssues.length > 0) {
    addFinding('CRITICAL', 'Data Display', `NaN/undefined/null values displayed on screen`,
      JSON.stringify(componentCheck.dataIssues, null, 2));
  }

  // Screenshot individual card sections
  const sections = await page.$$('.bg-white.rounded-lg.shadow, .bg-white.rounded-lg.shadow-lg');
  console.log(`\n  Card sections found: ${sections.length}`);
  for (let i = 0; i < Math.min(sections.length, 10); i++) {
    try {
      await sections[i].screenshot({ path: join(SCREENSHOT_DIR, `dashboard-section-${i + 1}.png`) });
      console.log(`    Saved dashboard-section-${i + 1}.png`);
    } catch (e) {
      console.log(`    Could not screenshot section ${i + 1}: ${e.message}`);
    }
  }

  // ============================================================
  // STEP 7: UX Heuristics (Nielsen)
  // ============================================================
  console.log('\n=== STEP 7: UX Heuristics ===');

  // Heuristic 1: Visibility of system status
  const statusIndicators = await page.evaluate(() => {
    let count = 0;
    document.querySelectorAll('[class*="rounded-full"]').forEach(el => {
      const cls = el.className || '';
      if (cls.includes('bg-green') || cls.includes('bg-red') || cls.includes('bg-yellow') || cls.includes('bg-blue')) {
        count++;
      }
    });
    return count;
  });
  console.log(`  H1 - Status indicators: ${statusIndicators}`);

  // Heuristic 2: Language consistency
  const langCheck = await page.evaluate(() => {
    const body = document.body.textContent || '';
    const english = ['Loading', 'Error occurred', 'Success', 'Failed to', 'Unknown error', 'An error occurred', 'Bad request'];
    return english.filter(p => body.includes(p));
  });
  if (langCheck.length > 0) {
    addFinding('LOW', 'UX - Language', 'Mixed Portuguese/English text on dashboard',
      `English phrases found: ${langCheck.join(', ')}`);
  }
  console.log(`  H2 - Language: ${langCheck.length > 0 ? 'Mixed PT/EN' : 'Consistent PT'}`);

  // Heuristic 4: Consistency - navigation active state
  const navCheck = await page.evaluate(() => {
    const activeLinks = document.querySelectorAll('nav a.bg-blue-100');
    const allNavLinks = document.querySelectorAll('nav a');
    return {
      activeCount: activeLinks.length,
      totalLinks: allNavLinks.length,
      activeTexts: Array.from(activeLinks).map(a => a.textContent?.trim()),
    };
  });
  console.log(`  H4 - Navigation: ${navCheck.activeCount}/${navCheck.totalLinks} active links (${navCheck.activeTexts.join(', ') || 'none'})`);

  if (navCheck.activeCount === 0) {
    addFinding('MEDIUM', 'UX - Navigation', 'No active navigation highlighting on Dashboard page',
      'Expected "Dashboard" link to be highlighted');
  } else if (!navCheck.activeTexts.some(t => t?.includes('Dashboard'))) {
    addFinding('LOW', 'UX - Navigation', 'Wrong navigation item highlighted on Dashboard page',
      `Active items: ${navCheck.activeTexts.join(', ')}`);
  }

  // Heuristic 5: Error prevention - check for dangerous buttons without confirmation
  const dangerousButtons = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent?.trim()?.toLowerCase() || '';
      const hasConfirm = btn.getAttribute('data-confirm') || btn.getAttribute('aria-description');
      if ((text.includes('fechar') || text.includes('excluir') || text.includes('deletar') || text.includes('remover')) && !hasConfirm) {
        results.push(text.substring(0, 50));
      }
    });
    return results;
  });
  if (dangerousButtons.length > 0) {
    // Note: The code uses window.confirm() which is a finding itself
    console.log(`  H5 - Dangerous buttons: ${dangerousButtons.length} (${dangerousButtons.join(', ')})`);
  }

  // Heuristic 8: Heading hierarchy
  const headings = await page.evaluate(() => {
    const h = [];
    for (let i = 1; i <= 6; i++) {
      document.querySelectorAll(`h${i}`).forEach(el => {
        h.push({ level: i, text: el.textContent?.trim()?.substring(0, 80) });
      });
    }
    return h;
  });
  console.log(`  H8 - Headings: ${headings.map(h => `h${h.level}`).join(', ')}`);

  const headingLevels = [...new Set(headings.map(h => h.level))].sort();
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      addFinding('LOW', 'Accessibility', `Heading hierarchy skips levels: h${headingLevels[i - 1]} to h${headingLevels[i]}`,
        headings.map(h => `h${h.level}: "${h.text}"`).join('\n'));
      break;
    }
  }

  // ============================================================
  // STEP 8: Responsive Layout Check
  // ============================================================
  console.log('\n=== STEP 8: Responsive Check ===');

  // Tablet (768px)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'dashboard-03-tablet.png'), fullPage: true });
  console.log('  Saved dashboard-03-tablet.png');

  const tabletCheck = await page.evaluate(() => {
    return {
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      sidebarVisible: (() => {
        const s = document.querySelector('.w-64');
        return s ? s.getBoundingClientRect().width > 0 : false;
      })(),
    };
  });
  console.log(`  Tablet: overflow=${tabletCheck.hasOverflow}, sidebar=${tabletCheck.sidebarVisible}`);

  if (tabletCheck.hasOverflow) {
    addFinding('MEDIUM', 'Responsive', `Horizontal overflow at tablet viewport (768px) - scrollWidth: ${tabletCheck.scrollWidth}`);
  }
  if (tabletCheck.sidebarVisible) {
    addFinding('MEDIUM', 'Responsive', 'Sidebar not collapsed/hidden at tablet viewport (768px)',
      'Fixed 256px sidebar reduces content area significantly on tablet');
  }

  // Mobile (375px)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'dashboard-04-mobile.png'), fullPage: true });
  console.log('  Saved dashboard-04-mobile.png');

  const mobileCheck = await page.evaluate(() => {
    return {
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      sidebarVisible: (() => {
        const s = document.querySelector('.w-64');
        return s ? s.getBoundingClientRect().width > 0 : false;
      })(),
      sidebarWidth: (() => {
        const s = document.querySelector('.w-64');
        return s ? s.getBoundingClientRect().width : 0;
      })(),
    };
  });
  console.log(`  Mobile: overflow=${mobileCheck.hasOverflow}, sidebar=${mobileCheck.sidebarVisible} (${mobileCheck.sidebarWidth}px)`);

  if (mobileCheck.hasOverflow) {
    addFinding('HIGH', 'Responsive', `Horizontal overflow at mobile viewport (375px) - scrollWidth: ${mobileCheck.scrollWidth}`);
  }
  if (mobileCheck.sidebarVisible) {
    addFinding('HIGH', 'Responsive', `Sidebar not collapsed on mobile (${mobileCheck.sidebarWidth}px on 375px viewport)`,
      `Sidebar takes ${Math.round(mobileCheck.sidebarWidth / 375 * 100)}% of the mobile screen`);
  }

  // Reset to desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'dashboard-05-final.png'), fullPage: true });

  // ============================================================
  // STEP 9: Code-level Issues (from source analysis)
  // ============================================================
  console.log('\n=== STEP 9: Code-level Issues ===');

  addFinding('HIGH', 'Code Quality', 'ActivePositions.tsx references undefined `ApiService` variable (line 119)',
    'ApiService.buildUrl() is called but ApiService is not imported in the component. This will cause a runtime error when trying to close a position.');

  addFinding('MEDIUM', 'Code Quality', 'ActivePositions.tsx header contains debug text "HMR ATIVO" (line 229)',
    'The h3 heading reads "POSICOES ATIVAS - HMR ATIVO" - development debug text visible to users');

  addFinding('MEDIUM', 'Code Quality', 'ActivePositions.tsx uses window.alert() and window.confirm() (lines 99, 139, 148)',
    'Native browser dialogs used for close-position confirmation and result feedback instead of proper UI modals');

  addFinding('MEDIUM', 'Code Quality', 'Multiple components use `any` TypeScript type',
    'BinanceConnectionStatus (line 22: catch err: any), PortfolioOverview (useState<any>, useState<any[]>), DashboardPage (dispatch as any)');

  addFinding('LOW', 'Code Quality', 'Excessive console.log statements in production code',
    'DashboardPage, BinanceConnectionStatus, PortfolioOverview, ActivePositions all have verbose console.log with emoji prefixes');

  addFinding('LOW', 'Code Quality', 'LogsFeed is a static placeholder with zero functionality',
    'LogsFeed.tsx only renders a static "Em desenvolvimento" message with no real log data');

  addFinding('MEDIUM', 'Code Quality', 'SystemStatus hardcodes service availability (database, redis always "connected")',
    'SystemStatus.tsx lines 19-20: database and redis status are hardcoded as "connected" without actual health checks');

  addFinding('LOW', 'Code Quality', 'Sidebar uses duplicate icons for different routes',
    'Both "Posicoes/Historico" and "Backtesting" use the same icon (line 11-12 of Sidebar.tsx)');

  addFinding('MEDIUM', 'Code Quality', 'DashboardPage has 2-second delay before loading data (setTimeout line 39-41)',
    'Artificial 2000ms delay in useEffect before fetching dashboard data, degrading perceived performance');

  // ============================================================
  // REPORT GENERATION
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
        console.log(`  ${i + 1}. [${f.category}] ${f.description}`);
        if (f.details) console.log(`     Details: ${f.details.substring(0, 300)}`);
      });
    }
  }

  console.log(`\n  TOTAL: ${findings.length} findings`);
  console.log(`    CRITICAL: ${bySeverity.CRITICAL.length}`);
  console.log(`    HIGH:     ${bySeverity.HIGH.length}`);
  console.log(`    MEDIUM:   ${bySeverity.MEDIUM.length}`);
  console.log(`    LOW:      ${bySeverity.LOW.length}`);

  // Save JSON report
  const report = {
    timestamp: new Date().toISOString(),
    auditor: 'Lupe - Frontend Auditor',
    target: `${BASE_URL}/dashboard`,
    components: ['BinanceConnectionStatus', 'SystemStatus', 'PortfolioOverview', 'ActivePositions', 'LogsFeed', 'TradingStrategiesPanel'],
    findings,
    consoleMessages: consoleMessages.slice(0, 100),
    networkErrors,
    responseErrors,
    componentStatus: componentCheck,
    summary: {
      total: findings.length,
      critical: bySeverity.CRITICAL.length,
      high: bySeverity.HIGH.length,
      medium: bySeverity.MEDIUM.length,
      low: bySeverity.LOW.length,
    },
    screenshots: [
      'dashboard-01-fullpage.png',
      'dashboard-02-viewport.png',
      'dashboard-03-tablet.png',
      'dashboard-04-mobile.png',
      'dashboard-05-final.png',
    ],
  };

  writeFileSync(join(SCREENSHOT_DIR, 'dashboard-audit-report.json'), JSON.stringify(report, null, 2));
  console.log('\nDetailed report saved to dashboard-audit-report.json');

  await browser.close();
  console.log('Audit complete.');
}

run().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
