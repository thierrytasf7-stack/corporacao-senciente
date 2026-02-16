#!/usr/bin/env node
/**
 * FNW PUV Score - Multi-Channel Scraper
 * Extrai dados de presença digital de 4 canais usando Playwright
 *
 * Usage: node scraper.js --canal website --link "https://..." [--output scraped.json]
 * Canais: website, google, instagram, mercadolivre
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CANAIS = ['website', 'google', 'instagram', 'mercadolivre'];
const TIMEOUT = 30000;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--canal' && args[i+1]) parsed.canal = args[++i];
    else if (args[i] === '--link' && args[i+1]) parsed.link = args[++i];
    else if (args[i] === '--output' && args[i+1]) parsed.output = args[++i];
  }
  return parsed;
}

async function scrapeWebsite(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });

  return await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.textContent.trim() : null;
    };
    const getAll = (sel) => [...document.querySelectorAll(sel)].map(el => el.textContent.trim()).filter(Boolean);
    const getMeta = (name) => {
      const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return el ? el.getAttribute('content') : null;
    };

    return {
      titulo: document.title || null,
      meta_description: getMeta('description') || getMeta('og:description'),
      meta_keywords: getMeta('keywords'),
      og_title: getMeta('og:title'),
      og_image: getMeta('og:image'),
      h1: getAll('h1'),
      h2: getAll('h2').slice(0, 10),
      h3: getAll('h3').slice(0, 10),
      paragrafos: getAll('p').slice(0, 20).map(p => p.substring(0, 300)),
      links_nav: [...document.querySelectorAll('nav a, header a')].map(a => ({
        texto: a.textContent.trim(),
        href: a.href
      })).filter(l => l.texto).slice(0, 20),
      ctas: [...document.querySelectorAll('a[class*="btn"], button, a[class*="cta"], a[class*="action"], [role="button"]')]
        .map(el => el.textContent.trim())
        .filter(t => t.length > 0 && t.length < 100)
        .slice(0, 10),
      imagens: [...document.querySelectorAll('img')]
        .map(img => ({ src: img.src, alt: img.alt }))
        .filter(i => i.src && !i.src.includes('data:'))
        .slice(0, 15),
      telefones: (document.body.innerText.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g) || []).slice(0, 5),
      emails: (document.body.innerText.match(/[\w.-]+@[\w.-]+\.\w+/g) || []).slice(0, 5),
      texto_principal: document.body.innerText.substring(0, 3000)
    };
  });
}

async function scrapeGoogle(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT });
  await page.waitForTimeout(2000);

  return await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.textContent.trim() : null;
    };
    const getAll = (sel) => [...document.querySelectorAll(sel)].map(el => el.textContent.trim()).filter(Boolean);

    // Google Business Profile selectors vary, try multiple
    const nome = getText('[data-attrid="title"]') || getText('h1') || getText('.SPZz6b h1');
    const rating = getText('[data-attrid="kc:/location/location:rating"]') || getText('.Aq14fc');
    const reviews_count = getText('[data-attrid="kc:/collection/knowledge_panels/has_review:num_reviews"]');

    return {
      nome: nome,
      rating: rating,
      reviews_count: reviews_count,
      descricao: getText('[data-attrid="kc:/location/location:description"]') || getText('.PYvSYb'),
      endereco: getText('[data-attrid="kc:/location/location:address"]') || getText('.LrzXr'),
      telefone: getText('[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"]'),
      horarios: getAll('[data-attrid="kc:/location/location:hours"] tr').slice(0, 7),
      categorias: getAll('[data-attrid="kc:/local:lu attribute list"] span').slice(0, 5),
      fotos: [...document.querySelectorAll('[data-attrid="kc:/location/location:photos"] img, .Uf0Ypb img')]
        .map(img => img.src).filter(Boolean).slice(0, 10),
      reviews: getAll('.review-full-text, .OA1nbd, .wiI7pd').slice(0, 5),
      texto_completo: document.body.innerText.substring(0, 3000)
    };
  });
}

async function scrapeInstagram(page, url) {
  // Ensure URL format
  if (!url.includes('instagram.com')) url = `https://www.instagram.com/${url.replace('@', '')}/`;

  await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT });
  await page.waitForTimeout(3000);

  return await page.evaluate(() => {
    const metas = {};
    document.querySelectorAll('meta').forEach(m => {
      const prop = m.getAttribute('property') || m.getAttribute('name');
      if (prop) metas[prop] = m.getAttribute('content');
    });

    // Try to extract from page content and meta tags
    const description = metas['og:description'] || metas['description'] || '';

    // Parse follower counts from description (format: "X Followers, Y Following, Z Posts")
    const statsMatch = description.match(/([\d,.KMkm]+)\s*Followers.*?([\d,.KMkm]+)\s*Following.*?([\d,.KMkm]+)\s*Posts/i);

    // Extract bio from meta or page
    const bioEl = document.querySelector('.-vDIg span, header section > div:last-child');
    const bio = bioEl ? bioEl.textContent.trim() : (metas['og:description'] || '');

    // Extract posts
    const posts = [...document.querySelectorAll('article a[href*="/p/"], main a[href*="/p/"]')]
      .slice(0, 12)
      .map(a => {
        const img = a.querySelector('img');
        return {
          link: a.href,
          imagem: img ? img.src : null,
          alt: img ? img.alt : null
        };
      });

    return {
      username: (metas['og:title'] || '').split('(')[0]?.trim() || window.location.pathname.replace(/\//g, ''),
      nome_display: (metas['og:title'] || '').match(/\(([^)]+)\)/)?.[1] || null,
      bio: bio,
      link_bio: document.querySelector('a[rel="me nofollow noopener noreferrer"]')?.href || null,
      followers: statsMatch ? statsMatch[1] : null,
      following: statsMatch ? statsMatch[2] : null,
      posts_count: statsMatch ? statsMatch[3] : null,
      og_image: metas['og:image'] || null,
      posts_recentes: posts,
      hashtags: (bio.match(/#\w+/g) || []),
      tem_cta_bio: !!(document.querySelector('a[rel="me nofollow noopener noreferrer"]')),
      texto_completo: document.body.innerText.substring(0, 3000)
    };
  });
}

async function scrapeMercadoLivre(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
  await page.waitForTimeout(2000);

  return await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.textContent.trim() : null;
    };
    const getAll = (sel) => [...document.querySelectorAll(sel)].map(el => el.textContent.trim()).filter(Boolean);

    return {
      titulo: getText('h1.ui-pdp-title') || getText('h1'),
      preco: getText('.andes-money-amount__fraction') || getText('[itemprop="price"]'),
      preco_original: getText('.andes-money-amount--previous .andes-money-amount__fraction'),
      desconto: getText('.ui-pdp-price__second-line__label'),
      descricao: getText('.ui-pdp-description__content') || getText('[class*="description"]'),
      condicao: getText('.ui-pdp-subtitle'),
      vendidos: getText('.ui-pdp-subtitle'),
      fotos: [...document.querySelectorAll('.ui-pdp-gallery__figure img, [data-zoom] img')]
        .map(img => img.src || img.dataset.src)
        .filter(Boolean)
        .slice(0, 10),
      vendedor: {
        nome: getText('.ui-pdp-seller__header__title'),
        reputacao: getText('.ui-pdp-seller__status-text'),
        localizacao: getText('.ui-pdp-seller__header__info-container'),
      },
      caracteristicas: getAll('.ui-pdp-specs__table tr').slice(0, 15).map(tr => tr.replace(/\t+/g, ': ')),
      reviews_resumo: getText('.ui-review-capability__rating__average'),
      reviews_count: getText('.ui-review-capability__rating__label'),
      perguntas: getAll('.ui-pdp-questions__question').slice(0, 5),
      frete: getText('.ui-pdp-media__body p') || getText('[class*="shipping"]'),
      garantia: getText('[class*="warranty"]'),
      texto_completo: document.body.innerText.substring(0, 3000)
    };
  });
}

async function main() {
  const args = parseArgs();

  if (!args.canal || !args.link) {
    console.error(JSON.stringify({
      error: true,
      message: 'Uso: node scraper.js --canal <website|google|instagram|mercadolivre> --link <URL>',
      canais: CANAIS
    }, null, 2));
    process.exit(1);
  }

  if (!CANAIS.includes(args.canal)) {
    console.error(JSON.stringify({
      error: true,
      message: `Canal "${args.canal}" invalido. Use: ${CANAIS.join(', ')}`,
      canais: CANAIS
    }, null, 2));
    process.exit(1);
  }

  const scrapers = {
    website: scrapeWebsite,
    google: scrapeGoogle,
    instagram: scrapeInstagram,
    mercadolivre: scrapeMercadoLivre
  };

  let browser;
  try {
    console.error(`[SCRAPER] Iniciando scraping: canal=${args.canal} link=${args.link}`);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'pt-BR'
    });
    const page = await context.newPage();

    const startTime = Date.now();
    const content = await scrapers[args.canal](page, args.link);
    const duration = Date.now() - startTime;

    const result = {
      canal: args.canal,
      url: args.link,
      scraped_at: new Date().toISOString(),
      duration_ms: duration,
      content: content
    };

    const json = JSON.stringify(result, null, 2);

    if (args.output) {
      const dir = path.dirname(args.output);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(args.output, json, 'utf-8');
      console.error(`[SCRAPER] Salvo em ${args.output} (${duration}ms)`);
    }

    console.log(json);

  } catch (err) {
    const errorResult = {
      error: true,
      canal: args.canal,
      url: args.link,
      message: err.message,
      scraped_at: new Date().toISOString()
    };
    console.log(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
