#!/usr/bin/env node
/**
 * FNW PUV Score - Document Generator
 * Gera documento PDF com plano de reposicionamento (6 secoes)
 *
 * Usage: node document-gen.js --analysis analysis.json [--output report.pdf]
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--analysis' && args[i+1]) parsed.analysis = args[++i];
    else if (args[i] === '--output' && args[i+1]) parsed.output = args[++i];
    else if (args[i] === '--theme' && args[i+1]) parsed.theme = args[++i];
  }
  return parsed;
}

function getLogoBase64() {
  try {
    const logoPath = path.resolve(__dirname, '../assets/fnw-logo.png');
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.error('[DOCUMENT] Erro ao carregar logo:', e.message);
    return '';
  }
}

function getClassificacao(score) {
  if (score <= 5) return 'Fraco';
  if (score <= 9) return 'Abaixo da Media';
  if (score <= 13) return 'Media';
  if (score <= 17) return 'Forte';
  return 'Excelente';
}

/**
 * Converte texto corrido do Qwen em HTML formatado
 * Detecta: parágrafos, listas numeradas, bullets, ANTES/DEPOIS, bold patterns
 */
function formatPlainText(text) {
  if (!text) return '';
  // Se já contém HTML tags, retornar como está
  if (/<[a-z][\s\S]*>/i.test(text)) return text;

  return text
    // Quebra em parágrafos por ponto final seguido de maiúscula ou números
    .replace(/\. ([A-Z(])/g, '.</p><p>$1')
    // Padrão "ANTES:" e "DEPOIS:" como highlight boxes
    .replace(/ANTES:\s*['"]([^'"]+)['"]/g, '<div class="warning-box"><strong>ANTES:</strong> "$1"</div>')
    .replace(/DEPOIS:\s*['"]([^'"]+)['"]/g, '<div class="highlight-box"><strong>DEPOIS:</strong> "$1"</div>')
    // Padrão "(N)" como lista numerada
    .replace(/\((\d)\)\s*/g, '</p><p><strong>($1)</strong> ')
    // Bold para palavras em CAPS com 4+ letras
    .replace(/\b([A-Z]{4,})\b/g, '<strong>$1</strong>')
    // Wrap em parágrafo
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    // Limpar parágrafos vazios
    .replace(/<p>\s*<\/p>/g, '');
}

function generateDocumentHTML(analysis, theme, logoBase64) {
  const isWhite = theme === 'white';
  const BG = isWhite ? '#FFFFFF' : '#0A0A0A';
  const BG_SURFACE = isWhite ? '#F4F4F5' : '#161616';
  const TEXT = isWhite ? '#111827' : 'rgba(255,255,255,0.9)';
  const TEXT_DIM = isWhite ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';
  const TEXT_META = isWhite ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
  const ACCENT = isWhite ? '#0891B2' : '#00F5FF';
  const BORDER = isWhite ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)';
  const BORDER_ACCENT = isWhite ? 'rgba(8,145,178,0.3)' : 'rgba(0,245,255,0.3)';
  const TH_COLOR = isWhite ? '#FFF' : '#000';
  const EVEN_ROW = isWhite ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)';
  const HIGHLIGHT_BG = isWhite ? 'rgba(8,145,178,0.08)' : 'rgba(0, 245, 255, 0.05)';
  const WARNING_BG = isWhite ? 'rgba(220,38,38,0.08)' : 'rgba(255, 59, 48, 0.05)';
  const WARNING_BORDER = isWhite ? '#DC2626' : '#FF3B30';
  const logoImg = logoBase64 ? `<img class="logo-header" src="${logoBase64}" alt="Logo" />` : '';
  const alvo = analysis.alvo?.nome || 'Analise PUV';
  const url = analysis.alvo?.url || '';
  const canal = analysis.alvo?.canal || '';
  const score = analysis.score_total || 0;
  const classificacao = analysis.classificacao || getClassificacao(score);
  const criterios = analysis.criterios || [];
  const docSecoes = analysis.documento_secoes || {};
  const meta = analysis._meta || {};

  const css = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@600&family=Space+Mono&display=swap');
      @page { size: A4; margin: 40px 50px; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Inter', sans-serif;
        font-size: 14px; line-height: 1.7; color: ${TEXT};
        background-color: ${BG};
        max-width: 800px; margin: 0 auto;
        position: relative;
      }
      .logo-header {
        position: fixed;
        top: 20px; left: 30px;
        height: 50px;
        z-index: 1000;
      }
      .cover {
        text-align: center; padding: 80px 40px;
        page-break-after: always;
        display: flex; flex-direction: column;
        justify-content: center; min-height: 100vh;
      }
      .cover h1 {
        font-family: 'JetBrains Mono', monospace;
        font-size: 32px; color: ${ACCENT};
        margin-bottom: 10px; text-transform: uppercase;
      }
      .cover .subtitle { font-size: 18px; color: ${TEXT_DIM}; margin-bottom: 40px; }
      .cover .score-display {
        font-family: 'JetBrains Mono', monospace;
        font-size: 96px; font-weight: 900; color: ${isWhite ? '#111827' : '#FFFFFF'};
      }
      .cover .score-max { font-size: 24px; color: ${ACCENT}; opacity: 0.5; }
      .cover .badge {
        display: inline-block; padding: 8px 24px; border-radius: 4px;
        font-size: 18px; font-weight: 700; color: ${isWhite ? '#FFF' : '#000'}; margin-top: 16px;
        font-family: 'Space Mono', monospace;
      }
      .cover .meta {
        margin-top: 60px; font-size: 12px; color: ${TEXT_META};
        font-family: 'Space Mono', monospace;
      }

      h2 {
        font-family: 'JetBrains Mono', monospace;
        font-size: 22px; color: ${ACCENT}; margin: 40px 0 16px;
        padding-bottom: 8px; border-bottom: 0.5px solid ${BORDER_ACCENT};
        page-break-after: avoid;
        text-transform: uppercase;
      }
      h3 {
        font-family: 'JetBrains Mono', monospace;
        font-size: 16px; color: ${isWhite ? '#111827' : '#FFFFFF'}; margin: 24px 0 12px;
        text-transform: uppercase;
      }
      p { margin-bottom: 12px; }

      table {
        width: 100%; border-collapse: collapse; margin: 16px 0;
        page-break-inside: avoid;
        background: ${BG_SURFACE}; border: 0.5px solid ${BORDER};
      }
      th {
        background: ${ACCENT}; color: ${TH_COLOR}; padding: 10px 16px;
        text-align: left; font-size: 11px; text-transform: uppercase;
        font-family: 'Space Mono', monospace;
      }
      td {
        padding: 12px 16px; border-bottom: 0.5px solid ${BORDER};
        font-family: 'Inter', sans-serif;
      }
      tr:nth-child(even) { background: ${EVEN_ROW}; }

      .section { margin: 30px 0; page-break-inside: avoid; }
      .section-content { padding: 16px 0; }

      .highlight-box {
        padding: 16px 20px; margin: 16px 0;
        background: ${HIGHLIGHT_BG}; border-left: 2px solid ${ACCENT};
        border-radius: 0 4px 4px 0;
      }
      .warning-box {
        padding: 16px 20px; margin: 16px 0;
        background: ${WARNING_BG}; border-left: 2px solid ${WARNING_BORDER};
        border-radius: 0 4px 4px 0;
      }

      .footer {
        text-align: center; padding: 20px;
        border-top: 0.5px solid ${BORDER}; margin-top: 40px;
        font-size: 10px; color: ${TEXT_META};
        font-family: 'Space Mono', monospace; text-transform: uppercase;
      }

      ul, ol { margin: 12px 0 12px 24px; }
      li { margin: 6px 0; }
    </style>
  `;

  const criteriosTable = criterios.map(c =>
    `<tr><td>${c.nome}</td><td style="text-align:center;font-weight:700;">${c.score}/4</td><td>${getClassificacao(c.score * 5)}</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8">${css}</head>
<body>

${logoImg}

<div class="cover">
  <h1>Plano de Reposicionamento Comercial</h1>
  <p class="subtitle">${alvo}</p>
  <p style="color:${TEXT_DIM};">${canal.toUpperCase()} | ${url}</p>
  <div style="margin:40px 0;">
    <span class="score-display">${score}</span><span class="score-max">/20</span>
  </div>
  <div><span class="badge" style="background:${score >= 14 ? '#1A7A3C' : score >= 10 ? '#B45F00' : '#C0392B'}">${classificacao}</span></div>
  <p class="meta">Data: ${new Date().toLocaleDateString('pt-BR')} | FNW - Freenat Work</p>
</div>

<h2>1. Diagnostico de Performance</h2>
<div class="section-content">
  ${formatPlainText(docSecoes.diagnostico_performance || docSecoes.diagnostico) || '<p>Analise detalhada do desempenho atual da presenca digital.</p>'}

  <h3>Score Breakdown</h3>
  <table>
    <tr><th>Criterio</th><th>Score</th><th>Nivel</th></tr>
    ${criteriosTable}
    <tr style="font-weight:700;background:${isWhite ? '#e8f4ff' : '#1a2a3a'};">
      <td>TOTAL</td><td style="text-align:center;">${score}/20</td><td>${classificacao}</td>
    </tr>
  </table>
</div>

<h2>2. Desconstrucao da PUV</h2>
<div class="section-content">
  ${formatPlainText(docSecoes.desconstrucao_puv || docSecoes.desconstrucao) || criterios.map(c =>
    `<h3>${c.nome} (${c.score}/4)</h3><p>${c.justificativa}</p>`
  ).join('')}
</div>

<h2>3. Reposicionamento por Persona</h2>
<div class="section-content">
  ${formatPlainText(docSecoes.reposicionamento_persona || docSecoes.reposicionamento) || '<p>Analise de segmentacao de audiencia e personas.</p>'}
</div>

<h2>4. Engenharia de Linguagem</h2>
<div class="section-content">
  ${formatPlainText(docSecoes.engenharia_linguagem || docSecoes.linguagem) || '<p>Recomendacoes de copy e linguagem persuasiva.</p>'}
</div>

<h2>5. Estrategias de Autoridade</h2>
<div class="section-content">
  ${formatPlainText(docSecoes.estrategias_autoridade || docSecoes.autoridade) || '<p>Estrategias para construir credibilidade e prova social.</p>'}
</div>

<h2>6. Plano de Acao Imediato</h2>
<div class="section-content">
  ${formatPlainText(docSecoes.plano_acao_imediato || docSecoes.plano_acao) || '<p>Acoes priorizadas com timeline de implementacao.</p>'}
</div>

<div class="footer">
  <p>- Grupo FNW - PUV SCORE - Coorp.Diana Senciente.</p>
</div>

</body></html>`;
}

async function main() {
  const args = parseArgs();

  if (!args.analysis) {
    console.error('Uso: node document-gen.js --analysis analysis.json [--output report.pdf]');
    process.exit(1);
  }

  if (!fs.existsSync(args.analysis)) {
    console.error(`Arquivo nao encontrado: ${args.analysis}`);
    process.exit(1);
  }

  try {
    const puppeteer = require(path.resolve(__dirname, '../node_modules/puppeteer'));
    const analysis = JSON.parse(fs.readFileSync(args.analysis, 'utf-8'));
    const logoBase64 = getLogoBase64();

    const theme = args.theme || 'black';
    console.error(`[DOCUMENT] Gerando documento PDF (${theme})...`);
    const html = generateDocumentHTML(analysis, theme, logoBase64);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const output = args.output || path.resolve(process.cwd(), 'report.pdf');
    const dir = path.dirname(output);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await page.pdf({
      path: output,
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', right: '50px', bottom: '40px', left: '50px' }
    });

    await browser.close();
    console.error(`[DOCUMENT] Salvo em ${output}`);
    console.log(JSON.stringify({ success: true, output }));

  } catch (err) {
    console.error(`[DOCUMENT] Erro: ${err.message}`);
    process.exit(1);
  }
}

main();
