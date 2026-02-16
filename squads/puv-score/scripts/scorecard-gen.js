#!/usr/bin/env node
/**
 * FNW PUV Score - Scorecard Generator
 * Gera imagem JPG do infografico PUV Score usando HTML template + Puppeteer
 *
 * Usage: node scorecard-gen.js --analysis analysis.json [--output scorecard.jpg]
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--analysis' && args[i+1]) parsed.analysis = args[++i];
    else if (args[i] === '--output' && args[i+1]) parsed.output = args[++i];
  }
  return parsed;
}

function getClassCSS(score) {
  if (score <= 5) return 'class-fraco';
  if (score <= 9) return 'class-abaixo';
  if (score <= 13) return 'class-media';
  if (score <= 17) return 'class-forte';
  return 'class-excelente';
}

function getClassificacao(score) {
  if (score <= 5) return 'Fraco';
  if (score <= 9) return 'Abaixo da Media';
  if (score <= 13) return 'Media';
  if (score <= 17) return 'Forte';
  return 'Excelente';
}

async function generateScorecard(analysisData, outputPath) {
  const puppeteer = require(path.resolve(__dirname, '../node_modules/puppeteer'));

  // Load HTML template
  const templatePath = path.resolve(__dirname, '../templates/scorecard.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Extract data from analysis
  const alvoNome = analysisData.alvo?.nome || 'Analise PUV';
  const scoreTotal = analysisData.score_total || 0;
  const classificacao = analysisData.classificacao || getClassificacao(scoreTotal);
  const classCSS = getClassCSS(scoreTotal);

  // Get criteria scores (ensure we have 5)
  const criterios = analysisData.criterios || [];
  const c1 = criterios[0]?.score || 0;
  const c2 = criterios[1]?.score || 0;
  const c3 = criterios[2]?.score || 0;
  const c4 = criterios[3]?.score || 0;
  const c5 = criterios[4]?.score || 0;

  // Get top 3 actions
  const acoes = analysisData.top3_acoes || ['Melhorar posicionamento', 'Otimizar CTA', 'Adicionar prova social'];

  // Replace placeholders
  html = html
    .replace(/\{\{ALVO_NOME\}\}/g, alvoNome)
    .replace(/\{\{SCORE_TOTAL\}\}/g, scoreTotal)
    .replace(/\{\{CLASSIFICACAO\}\}/g, classificacao)
    .replace(/\{\{CLASS_CSS\}\}/g, classCSS)
    .replace(/\{\{C1\}\}/g, c1).replace(/\{\{C1_PCT\}\}/g, (c1/4*100))
    .replace(/\{\{C2\}\}/g, c2).replace(/\{\{C2_PCT\}\}/g, (c2/4*100))
    .replace(/\{\{C3\}\}/g, c3).replace(/\{\{C3_PCT\}\}/g, (c3/4*100))
    .replace(/\{\{C4\}\}/g, c4).replace(/\{\{C4_PCT\}\}/g, (c4/4*100))
    .replace(/\{\{C5\}\}/g, c5).replace(/\{\{C5_PCT\}\}/g, (c5/4*100))
    .replace(/\{\{ACAO1\}\}/g, acoes[0] || '')
    .replace(/\{\{ACAO2\}\}/g, acoes[1] || '')
    .replace(/\{\{ACAO3\}\}/g, acoes[2] || '');

  // Generate QR code as data URI
  try {
    const QRCode = require(path.resolve(__dirname, '../node_modules/qrcode'));
    const qrDataUrl = await QRCode.toDataURL('https://fnw.com.br/desbloquear', { width: 120, margin: 1 });
    html = html.replace(
      '<div class="qr-placeholder" id="qrCode">QR CODE</div>',
      `<img src="${qrDataUrl}" style="width:120px;height:120px;" />`
    );
  } catch (e) {
    console.error('[SCORECARD] QR code generation skipped:', e.message);
  }

  // Launch Puppeteer and screenshot
  console.error('[SCORECARD] Gerando imagem...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({ width: 1080, height: 1920 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const output = outputPath || path.resolve(process.cwd(), 'scorecard.jpg');
  const dir = path.dirname(output);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await page.screenshot({
    path: output,
    type: output.endsWith('.png') ? 'png' : 'jpeg',
    quality: output.endsWith('.png') ? undefined : 90,
    fullPage: false,
    clip: { x: 0, y: 0, width: 1080, height: 1920 }
  });

  await browser.close();
  console.error(`[SCORECARD] Salvo em ${output}`);

  return output;
}

async function main() {
  const args = parseArgs();

  if (!args.analysis) {
    console.error('Uso: node scorecard-gen.js --analysis analysis.json [--output scorecard.jpg]');
    process.exit(1);
  }

  if (!fs.existsSync(args.analysis)) {
    console.error(`Arquivo nao encontrado: ${args.analysis}`);
    process.exit(1);
  }

  try {
    const analysis = JSON.parse(fs.readFileSync(args.analysis, 'utf-8'));
    const output = await generateScorecard(analysis, args.output);
    console.log(JSON.stringify({ success: true, output, score: analysis.score_total }));
  } catch (err) {
    console.error(`[SCORECARD] Erro: ${err.message}`);
    process.exit(1);
  }
}

main();
