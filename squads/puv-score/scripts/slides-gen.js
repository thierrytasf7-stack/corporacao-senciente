#!/usr/bin/env node
/**
 * FNW PUV Score - Slides Generator
 * Gera apresentacao PDF com 10+ slides a partir de analise PUV Score
 *
 * Usage: node slides-gen.js --analysis analysis.json [--output slides.pdf]
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

function getScoreColor(score) {
  if (score <= 1) return '#ff4444';
  if (score <= 2) return '#ff8800';
  if (score <= 3) return '#44cc44';
  return '#00cc88';
}

function generateSlidesHTML(analysis) {
  const alvo = analysis.alvo?.nome || 'Analise PUV';
  const url = analysis.alvo?.url || '';
  const canal = analysis.alvo?.canal || '';
  const score = analysis.score_total || 0;
  const classificacao = analysis.classificacao || 'N/A';
  const criterios = analysis.criterios || [];
  const acoes = analysis.top3_acoes || [];
  const oportunidades = analysis.oportunidades_salto || [];
  const persona = analysis.persona_detectada || {};
  const docSecoes = analysis.documento_secoes || {};

  const slideStyle = `
    <style>
      @page { size: landscape; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; }
      .slide {
        width: 1280px; height: 720px;
        padding: 60px 80px;
        page-break-after: always;
        position: relative;
        overflow: hidden;
      }
      .slide:last-child { page-break-after: avoid; }
      .dark { background: linear-gradient(135deg, #0a0a2e, #1a1a4e); color: #fff; }
      .light { background: #f8f9fa; color: #1a1a2e; }
      .accent { background: linear-gradient(135deg, #1a1a4e, #2a1a6e); color: #fff; }
      h1 { font-size: 42px; margin-bottom: 20px; }
      h2 { font-size: 36px; margin-bottom: 24px; color: #00d4ff; }
      h3 { font-size: 28px; margin-bottom: 16px; }
      p { font-size: 20px; line-height: 1.6; }
      .score-big { font-size: 96px; font-weight: 900; color: #ffd700; }
      .score-label { font-size: 28px; color: #8899aa; }
      .footer { position: absolute; bottom: 20px; right: 40px; font-size: 14px; color: #556; }
      .badge {
        display: inline-block; padding: 8px 20px; border-radius: 20px;
        font-size: 20px; font-weight: 700;
      }
      .criterio-row {
        display: flex; align-items: center; margin: 14px 0;
        font-size: 20px;
      }
      .criterio-name { width: 300px; }
      .criterio-bar-bg {
        flex: 1; height: 24px; background: rgba(255,255,255,0.1);
        border-radius: 12px; margin: 0 16px; overflow: hidden;
      }
      .criterio-bar {
        height: 100%; border-radius: 12px;
        transition: width 0.3s;
      }
      .criterio-val { width: 60px; text-align: right; font-weight: 700; color: #ffd700; }
      .action-item {
        padding: 16px 20px; margin: 12px 0;
        background: rgba(255,255,255,0.05); border-radius: 12px;
        border-left: 4px solid #ffd700; font-size: 19px;
      }
      .two-col { display: flex; gap: 40px; }
      .col { flex: 1; }
      .highlight { color: #ffd700; }
      .subtitle { font-size: 22px; color: #8899aa; margin-bottom: 30px; }
    </style>
  `;

  const slides = [];

  // Slide 1: Capa
  slides.push(`
    <div class="slide dark">
      <div style="display:flex;flex-direction:column;justify-content:center;height:100%;text-align:center;">
        <p style="font-size:18px;color:#00d4ff;letter-spacing:6px;margin-bottom:20px;">DIAGNOSTICO DE POSICIONAMENTO</p>
        <h1 style="font-size:52px;margin-bottom:16px;">${alvo}</h1>
        <p class="subtitle">${canal.toUpperCase()} | ${url}</p>
        <div style="margin-top:40px;">
          <span class="score-big">${score}</span><span class="score-label">/20</span>
        </div>
        <p style="margin-top:16px;"><span class="badge" style="background:${score>=14?'#44cc44':score>=10?'#ffcc00;color:#333':'#ff8800'}">${classificacao}</span></p>
      </div>
      <div class="footer">FNW - Freenat Work | Powered by Diana AIOS</div>
    </div>
  `);

  // Slide 2: Score Overview
  slides.push(`
    <div class="slide dark">
      <h2>Score Overview</h2>
      <div style="display:flex;gap:40px;margin-top:20px;">
        <div style="flex:1;">
          ${criterios.map((c, i) => `
            <div class="criterio-row">
              <span class="criterio-name">${c.nome || 'Criterio '+(i+1)}</span>
              <div class="criterio-bar-bg">
                <div class="criterio-bar" style="width:${(c.score||0)/4*100}%;background:${getScoreColor(c.score||0)}"></div>
              </div>
              <span class="criterio-val">${c.score||0}/4</span>
            </div>
          `).join('')}
        </div>
        <div style="width:250px;text-align:center;padding-top:20px;">
          <div class="score-big">${score}</div>
          <div class="score-label">/20</div>
          <div style="margin-top:16px;"><span class="badge" style="background:${score>=14?'#44cc44':score>=10?'#ffcc00;color:#333':'#ff8800'}">${classificacao}</span></div>
        </div>
      </div>
      <div class="footer">FNW - Freenat Work</div>
    </div>
  `);

  // Slides 3-7: One per criterio
  criterios.forEach((c, i) => {
    const exemplos = (c.exemplos_do_alvo || []).join(', ') || 'N/A';
    const salto = c.oportunidade_salto || 'Buscar melhoria continua neste criterio';
    slides.push(`
      <div class="slide ${i % 2 === 0 ? 'dark' : 'accent'}">
        <h2>Criterio ${i+1}: ${c.nome || ''}</h2>
        <div style="display:flex;gap:40px;">
          <div style="flex:2;">
            <p style="margin-bottom:20px;">${c.justificativa || ''}</p>
            <h3 style="color:#ffd700;font-size:22px;">Evidencias encontradas:</h3>
            <p style="color:#ccc;">${exemplos}</p>
            <div style="margin-top:30px;padding:20px;background:rgba(255,215,0,0.1);border-radius:12px;border:1px solid rgba(255,215,0,0.3);">
              <h3 style="color:#ffd700;font-size:20px;">Oportunidade de Salto (${c.score || 0} → ${Math.min((c.score||0)+1, 4)})</h3>
              <p style="color:#eee;margin-top:8px;">${salto}</p>
            </div>
          </div>
          <div style="width:200px;text-align:center;padding-top:30px;">
            <div style="font-size:72px;font-weight:900;color:${getScoreColor(c.score||0)}">${c.score || 0}</div>
            <div style="font-size:20px;color:#8899aa;">/4</div>
          </div>
        </div>
        <div class="footer">FNW - Freenat Work</div>
      </div>
    `);
  });

  // Slide 8: Oportunidades de Salto
  slides.push(`
    <div class="slide dark">
      <h2>Onde Podemos Escalar</h2>
      <p class="subtitle">O salto de 3 para 4 em cada criterio</p>
      ${criterios.map((c, i) => {
        const salto = c.oportunidade_salto || oportunidades[i] || '';
        if (!salto) return '';
        return `<div class="action-item"><strong style="color:#00d4ff;">${c.nome}:</strong> ${salto}</div>`;
      }).join('')}
      <div class="footer">FNW - Freenat Work</div>
    </div>
  `);

  // Slide 9: Top Acoes
  slides.push(`
    <div class="slide accent">
      <h2>Top ${acoes.length || 3} Acoes Priorizadas</h2>
      ${acoes.map((a, i) => `
        <div class="action-item" style="border-left-color:${i===0?'#ff4444':i===1?'#ff8800':'#ffd700'}">
          <strong style="color:#ffd700;">${i+1}.</strong> ${a}
        </div>
      `).join('')}
      ${persona.primaria ? `
        <div style="margin-top:30px;padding:20px;background:rgba(0,212,255,0.1);border-radius:12px;">
          <h3 style="color:#00d4ff;font-size:20px;">Persona Primaria</h3>
          <p>${persona.primaria}</p>
          ${persona.conflito ? `<p style="color:#ff8800;margin-top:8px;">Conflito: ${persona.conflito}</p>` : ''}
        </div>
      ` : ''}
      <div class="footer">FNW - Freenat Work</div>
    </div>
  `);

  // Slide 10: Proximos Passos
  slides.push(`
    <div class="slide dark">
      <div style="display:flex;flex-direction:column;justify-content:center;height:100%;text-align:center;">
        <h2 style="font-size:40px;">Proximos Passos</h2>
        <p style="font-size:24px;color:#ccc;margin:20px 0 40px;">
          Implemente as acoes recomendadas e acompanhe a evolucao do seu PUV Score.
        </p>
        <div style="padding:30px;background:rgba(255,215,0,0.1);border-radius:16px;border:1px solid #ffd700;display:inline-block;margin:0 auto;">
          <p style="font-size:22px;color:#ffd700;font-weight:700;">DESBLOQUEAR RELATORIO COMPLETO</p>
          <p style="font-size:16px;color:#ccc;margin-top:8px;">Plano detalhado com 6 secoes de recomendacoes</p>
          <div style="width:120px;height:120px;background:#fff;margin:16px auto 0;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#333;font-size:14px;">QR CODE</div>
        </div>
        <p style="margin-top:40px;color:#556;font-size:16px;">FNW - Freenat Work | contato@fnw.com.br</p>
      </div>
    </div>
  `);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${slideStyle}</head><body>${slides.join('\n')}</body></html>`;
}

async function main() {
  const args = parseArgs();

  if (!args.analysis) {
    console.error('Uso: node slides-gen.js --analysis analysis.json [--output slides.pdf]');
    process.exit(1);
  }

  if (!fs.existsSync(args.analysis)) {
    console.error(`Arquivo nao encontrado: ${args.analysis}`);
    process.exit(1);
  }

  try {
    const puppeteer = require(path.resolve(__dirname, '../node_modules/puppeteer'));
    const analysis = JSON.parse(fs.readFileSync(args.analysis, 'utf-8'));

    console.error('[SLIDES] Gerando apresentacao...');
    const html = generateSlidesHTML(analysis);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const output = args.output || path.resolve(process.cwd(), 'slides.pdf');
    const dir = path.dirname(output);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await page.pdf({
      path: output,
      width: '1280px',
      height: '720px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    console.error(`[SLIDES] Salvo em ${output}`);
    console.log(JSON.stringify({ success: true, output, slides_count: 10 }));

  } catch (err) {
    console.error(`[SLIDES] Erro: ${err.message}`);
    process.exit(1);
  }
}

main();
