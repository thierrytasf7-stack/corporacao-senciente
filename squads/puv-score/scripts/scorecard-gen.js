#!/usr/bin/env node
/**
 * FNW PUV Score - Scorecard Generator v3
 * Tema único: white com alto contraste funcional (WCAG AA)
 *
 * Usage: node scorecard-gen.js --analysis analysis.json [--output scorecard.jpg]
 */

const fs   = require('fs');
const path = require('path');

function parseArgs() {
  const args   = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--analysis' && args[i+1]) parsed.analysis = args[++i];
    else if (args[i] === '--output'   && args[i+1]) parsed.output   = args[++i];
    // --theme aceito mas ignorado (single theme)
  }
  return parsed;
}

function getLogoBase64() {
  try {
    const logoPath = path.resolve(__dirname, '../assets/fnw-logo.png');
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.error('[SCORECARD] Erro ao carregar logo:', e.message);
    return '';
  }
}

function getClassificacao(score) {
  if (score <= 5)  return 'Fraco';
  if (score <= 9)  return 'Abaixo da Media';
  if (score <= 13) return 'Media';
  if (score <= 17) return 'Forte';
  return 'Excelente';
}

function getCriterioLevel(score) {
  if (score <= 1) return { label: 'Fraco',     css: 'level-fraco'    };
  if (score <= 2) return { label: 'Medio',     css: 'level-medio'    };
  if (score <= 3) return { label: 'Forte',     css: 'level-forte'    };
  return            { label: 'Excelente', css: 'level-excelente' };
}

function getScoreVisuals(score) {
  if (score <= 5) return {
    gaugeStart: '#C0392B', gaugeEnd: '#C05030',
    scoreColorClass: 'sclr-low',
    alertBox: 'alert-box-critico', alertTitle: 'alert-title-critico',
    alertSubtitle: 'Requer acao imediata',
    alertDesc: 'A proposta de valor apresenta falhas criticas em multiplos criterios. Intervencao urgente necessaria para evitar perda expressiva de conversao.'
  };
  if (score <= 9) return {
    gaugeStart: '#C0392B', gaugeEnd: '#C07A00',
    scoreColorClass: 'sclr-low',
    alertBox: 'alert-box-critico', alertTitle: 'alert-title-critico',
    alertSubtitle: 'Abaixo do esperado',
    alertDesc: 'A proposta de valor necessita de melhorias significativas. Ha oportunidades claras que podem impactar diretamente a taxa de conversao.'
  };
  if (score <= 13) return {
    gaugeStart: '#C07A00', gaugeEnd: '#0A7B8F',
    scoreColorClass: 'sclr-mid',
    alertBox: 'alert-box-atencao', alertTitle: 'alert-title-atencao',
    alertSubtitle: 'Oportunidade de melhoria',
    alertDesc: 'A proposta de valor esta na media do mercado. Ajustes estrategicos nos criterios mais fracos podem elevar significativamente o impacto comercial.'
  };
  if (score <= 17) return {
    gaugeStart: '#0A7B8F', gaugeEnd: '#1A7A3C',
    scoreColorClass: 'sclr-good',
    alertBox: 'alert-box-bom', alertTitle: 'alert-title-bom',
    alertSubtitle: 'Acima da media',
    alertDesc: 'A proposta de valor esta bem estruturada. Otimizacoes pontuais podem alcançar o nivel de excelencia competitiva.'
  };
  return {
    gaugeStart: '#1A7A3C', gaugeEnd: '#2A9A50',
    scoreColorClass: 'sclr-great',
    alertBox: 'alert-box-bom', alertTitle: 'alert-title-bom',
    alertSubtitle: 'Excelente',
    alertDesc: 'A proposta de valor e referencia no segmento. Continue monitorando e iterando para manter a vantagem competitiva.'
  };
}

async function generateScorecard(analysisData, outputPath) {
  const puppeteer    = require(path.resolve(__dirname, '../node_modules/puppeteer'));
  const templatePath = path.resolve(__dirname, '../templates/scorecard.html');
  let html           = fs.readFileSync(templatePath, 'utf-8');

  const alvoNome     = analysisData.alvo?.nome || 'Analise PUV';
  const alvoUrl      = analysisData.alvo?.url  || '';
  const scoreTotal   = analysisData.score_total || 0;
  const classificacao = analysisData.classificacao || getClassificacao(scoreTotal);

  const circumference = 502.65;
  const gaugeOffset   = circumference - (circumference * scoreTotal / 20);
  const visuals       = getScoreVisuals(scoreTotal);

  const now           = new Date();
  const dataAvaliacao = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  const logoBase64    = getLogoBase64();

  const criterios = analysisData.criterios || [];
  const c = [0,1,2,3,4].map(i => criterios[i]?.score || 0);
  const l = c.map(getCriterioLevel);

  const acoes = analysisData.top3_acoes || ['Melhorar posicionamento', 'Otimizar CTA', 'Adicionar prova social'];

  html = html
    .replace(/\{\{ALVO_NOME\}\}/g,        alvoNome)
    .replace(/\{\{ALVO_URL\}\}/g,         alvoUrl)
    .replace(/\{\{DATA_AVALIACAO\}\}/g,   dataAvaliacao)
    .replace(/\{\{LOGO_PATH\}\}/g,        logoBase64)
    .replace(/\{\{SCORE_TOTAL\}\}/g,      scoreTotal)
    .replace(/\{\{GAUGE_OFFSET\}\}/g,     gaugeOffset)
    .replace(/\{\{GAUGE_COLOR_START\}\}/g, visuals.gaugeStart)
    .replace(/\{\{GAUGE_COLOR_END\}\}/g,   visuals.gaugeEnd)
    .replace(/\{\{SCORE_COLOR_CLASS\}\}/g, visuals.scoreColorClass)
    .replace(/\{\{CLASSIFICACAO\}\}/g,    classificacao)
    .replace(/\{\{ALERT_BOX_CLASS\}\}/g,   visuals.alertBox)
    .replace(/\{\{ALERT_TITLE_CLASS\}\}/g, visuals.alertTitle)
    .replace(/\{\{ALERT_SUBTITLE\}\}/g,    visuals.alertSubtitle)
    .replace(/\{\{ALERT_DESC\}\}/g,        visuals.alertDesc)
    .replace(/\{\{C1\}\}/g, c[0]).replace(/\{\{C1_PCT\}\}/g, c[0]/4*100)
    .replace(/\{\{C1_LEVEL\}\}/g, l[0].label).replace(/\{\{C1_LEVEL_CLASS\}\}/g, l[0].css)
    .replace(/\{\{C2\}\}/g, c[1]).replace(/\{\{C2_PCT\}\}/g, c[1]/4*100)
    .replace(/\{\{C2_LEVEL\}\}/g, l[1].label).replace(/\{\{C2_LEVEL_CLASS\}\}/g, l[1].css)
    .replace(/\{\{C3\}\}/g, c[2]).replace(/\{\{C3_PCT\}\}/g, c[2]/4*100)
    .replace(/\{\{C3_LEVEL\}\}/g, l[2].label).replace(/\{\{C3_LEVEL_CLASS\}\}/g, l[2].css)
    .replace(/\{\{C4\}\}/g, c[3]).replace(/\{\{C4_PCT\}\}/g, c[3]/4*100)
    .replace(/\{\{C4_LEVEL\}\}/g, l[3].label).replace(/\{\{C4_LEVEL_CLASS\}\}/g, l[3].css)
    .replace(/\{\{C5\}\}/g, c[4]).replace(/\{\{C5_PCT\}\}/g, c[4]/4*100)
    .replace(/\{\{C5_LEVEL\}\}/g, l[4].label).replace(/\{\{C5_LEVEL_CLASS\}\}/g, l[4].css)
    .replace(/\{\{ACAO1\}\}/g, acoes[0] || '')
    .replace(/\{\{ACAO2\}\}/g, acoes[1] || '')
    .replace(/\{\{ACAO3\}\}/g, acoes[2] || '');

  // QR code
  try {
    const QRCode   = require(path.resolve(__dirname, '../node_modules/qrcode'));
    const qrData   = await QRCode.toDataURL('https://fnw.com.br/desbloquear', { width: 96, margin: 1 });
    html = html.replace(
      '<div id="qrCode">QR CODE</div>',
      `<img src="${qrData}" style="width:96px;height:96px;" />`
    );
  } catch (e) { /* QR opcional */ }

  console.error('[SCORECARD] Gerando imagem...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page    = await browser.newPage();

  await page.setViewport({ width: 1080, height: 1920 });
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });

  const output = outputPath || path.resolve(process.cwd(), 'scorecard.jpg');
  const dir    = path.dirname(output);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await page.screenshot({ path: output, type: 'jpeg', quality: 93,
    fullPage: false, clip: { x:0, y:0, width:1080, height:1920 } });

  await browser.close();
  console.error(`[SCORECARD] Salvo em ${output}`);
  return output;
}

async function main() {
  const args = parseArgs();
  if (!args.analysis || !fs.existsSync(args.analysis)) {
    console.error('Uso: node scorecard-gen.js --analysis analysis.json [--output scorecard.jpg]');
    process.exit(1);
  }
  try {
    const analysis = JSON.parse(fs.readFileSync(args.analysis, 'utf-8'));
    const output   = await generateScorecard(analysis, args.output);
    console.log(JSON.stringify({ success: true, output, score: analysis.score_total }));
  } catch (err) {
    console.error(`[SCORECARD] Erro: ${err.message}`);
    process.exit(1);
  }
}

main();
