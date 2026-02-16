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
  }
  return parsed;
}

function getClassificacao(score) {
  if (score <= 5) return 'Fraco';
  if (score <= 9) return 'Abaixo da Media';
  if (score <= 13) return 'Media';
  if (score <= 17) return 'Forte';
  return 'Excelente';
}

function generateDocumentHTML(analysis) {
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
      @page { size: A4; margin: 40px 50px; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px; line-height: 1.7; color: #1a1a2e;
        max-width: 800px; margin: 0 auto;
      }
      .cover {
        text-align: center; padding: 80px 40px;
        page-break-after: always;
        display: flex; flex-direction: column;
        justify-content: center; min-height: 100vh;
      }
      .cover h1 { font-size: 32px; color: #1a1a4e; margin-bottom: 10px; }
      .cover .subtitle { font-size: 18px; color: #666; margin-bottom: 40px; }
      .cover .score-display { font-size: 72px; font-weight: 900; color: #1a1a4e; }
      .cover .score-max { font-size: 24px; color: #999; }
      .cover .badge {
        display: inline-block; padding: 8px 24px; border-radius: 20px;
        font-size: 18px; font-weight: 700; color: #fff; margin-top: 16px;
      }
      .cover .meta { margin-top: 60px; font-size: 13px; color: #999; }

      h2 {
        font-size: 24px; color: #1a1a4e; margin: 40px 0 16px;
        padding-bottom: 8px; border-bottom: 3px solid #00d4ff;
        page-break-after: avoid;
      }
      h3 { font-size: 18px; color: #2a2a5e; margin: 24px 0 12px; }
      p { margin-bottom: 12px; }

      table {
        width: 100%; border-collapse: collapse; margin: 16px 0;
        page-break-inside: avoid;
      }
      th {
        background: #1a1a4e; color: #fff; padding: 10px 16px;
        text-align: left; font-size: 13px;
      }
      td { padding: 10px 16px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) { background: #f8f9fa; }

      .section { margin: 30px 0; page-break-inside: avoid; }
      .section-content { padding: 16px 0; }

      .highlight-box {
        padding: 16px 20px; margin: 16px 0;
        background: #f0f7ff; border-left: 4px solid #00d4ff;
        border-radius: 0 8px 8px 0;
      }
      .warning-box {
        padding: 16px 20px; margin: 16px 0;
        background: #fff8e6; border-left: 4px solid #ffd700;
        border-radius: 0 8px 8px 0;
      }

      .footer {
        text-align: center; padding: 20px;
        border-top: 1px solid #eee; margin-top: 40px;
        font-size: 12px; color: #999;
      }

      ul, ol { margin: 12px 0 12px 24px; }
      li { margin: 6px 0; }
    </style>
  `;

  const badgeColor = score >= 14 ? '#44cc44' : score >= 10 ? '#ffcc00' : '#ff4444';

  const criteriosTable = criterios.map(c =>
    `<tr><td>${c.nome}</td><td style="text-align:center;font-weight:700;">${c.score}/4</td><td>${getClassificacao(c.score * 5)}</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8">${css}</head>
<body>

<div class="cover">
  <h1>Plano de Reposicionamento Comercial</h1>
  <p class="subtitle">${alvo}</p>
  <p style="color:#999;">${canal.toUpperCase()} | ${url}</p>
  <div style="margin:40px 0;">
    <span class="score-display">${score}</span><span class="score-max">/20</span>
  </div>
  <div><span class="badge" style="background:${badgeColor}">${classificacao}</span></div>
  <p class="meta">Data: ${new Date().toLocaleDateString('pt-BR')} | FNW - Freenat Work</p>
</div>

<h2>1. Diagnostico de Performance</h2>
<div class="section-content">
  ${docSecoes.diagnostico_performance || docSecoes.diagnostico || '<p>Analise detalhada do desempenho atual da presenca digital.</p>'}

  <h3>Score Breakdown</h3>
  <table>
    <tr><th>Criterio</th><th>Score</th><th>Nivel</th></tr>
    ${criteriosTable}
    <tr style="font-weight:700;background:#e8f4ff;">
      <td>TOTAL</td><td style="text-align:center;">${score}/20</td><td>${classificacao}</td>
    </tr>
  </table>
</div>

<h2>2. Desconstrucao da PUV</h2>
<div class="section-content">
  ${docSecoes.desconstrucao_puv || docSecoes.desconstrucao || criterios.map(c =>
    `<h3>${c.nome} (${c.score}/4)</h3><p>${c.justificativa}</p>`
  ).join('')}
</div>

<h2>3. Reposicionamento por Persona</h2>
<div class="section-content">
  ${docSecoes.reposicionamento_persona || docSecoes.reposicionamento || '<p>Analise de segmentacao de audiencia e personas.</p>'}
</div>

<h2>4. Engenharia de Linguagem</h2>
<div class="section-content">
  ${docSecoes.engenharia_linguagem || docSecoes.linguagem || '<p>Recomendacoes de copy e linguagem persuasiva.</p>'}
</div>

<h2>5. Estrategias de Autoridade</h2>
<div class="section-content">
  ${docSecoes.estrategias_autoridade || docSecoes.autoridade || '<p>Estrategias para construir credibilidade e prova social.</p>'}
</div>

<h2>6. Plano de Acao Imediato</h2>
<div class="section-content">
  ${docSecoes.plano_acao_imediato || docSecoes.plano_acao || '<p>Acoes priorizadas com timeline de implementacao.</p>'}
</div>

<div class="footer">
  <p>Relatorio gerado por FNW - Freenat Work | Powered by Diana AIOS</p>
  <p>Para implementar este plano, entre em contato.</p>
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

    console.error('[DOCUMENT] Gerando documento PDF...');
    const html = generateDocumentHTML(analysis);

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
