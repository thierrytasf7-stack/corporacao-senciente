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
    else if (args[i] === '--theme' && args[i+1]) parsed.theme = args[++i];
  }
  return parsed;
}

function getScoreColor(score) {
  if (score <= 1) return '#C0392B';    // Vermelho escuro (alto contraste)
  if (score <= 2) return '#B45F00';    // Laranja escuro (alto contraste)
  if (score <= 3) return '#0A7B8F';    // Teal escuro (alto contraste)
  return '#1A7A3C';                    // Verde escuro (alto contraste)
}

function getLogoBase64() {
  try {
    const logoPath = path.resolve(__dirname, '../assets/fnw-logo.png');
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.error('[SLIDES] Erro ao carregar logo:', e.message);
    return '';
  }
}

function generateSlidesHTML(analysis, theme, logoBase64) {
  const isWhite = theme === 'white';
  const BG = isWhite ? '#FFFFFF' : '#0A0A0A';
  const BG_SURFACE = isWhite ? '#F4F4F5' : '#161616';
  const TEXT = isWhite ? '#111827' : '#FFFFFF';
  const TEXT_MUTED = isWhite ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)';
  const TEXT_DIM = isWhite ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.2)';
  const ACCENT = isWhite ? '#0891B2' : '#00F5FF';
  const BORDER = isWhite ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';
  const BAR_BG = isWhite ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';
  const logoImg = logoBase64 ? `<img class="logo-header" src="${logoBase64}" alt="Logo" />` : '';
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
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@600&family=Space+Mono&display=swap');
      @page { size: landscape; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; background: ${BG}; color: ${TEXT}; }
      .slide {
        width: 1280px; height: 720px;
        padding: 60px 80px;
        page-break-after: always;
        position: relative;
        overflow: hidden;
        background-color: ${BG};
      }
      .slide:last-child { page-break-after: avoid; }
      .logo-header {
        position: absolute;
        top: 30px; left: 40px;
        height: 60px;
        z-index: 100;
      }
      .dark { background: ${BG}; color: ${TEXT}; }
      .light { background: ${BG_SURFACE}; color: ${TEXT}; border: 0.5px solid ${BORDER}; }
      .accent { background: ${BG}; color: ${TEXT}; border-left: 10px solid ${ACCENT}; }

      h1 { font-family: 'JetBrains Mono', monospace; font-size: 48px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: -2px; }
      h2 { font-family: 'JetBrains Mono', monospace; font-size: 36px; margin-bottom: 24px; color: ${ACCENT}; text-transform: uppercase; }
      h3 { font-family: 'JetBrains Mono', monospace; font-size: 24px; margin-bottom: 16px; color: ${TEXT}; text-transform: uppercase; }
      p { font-size: 20px; line-height: 1.6; color: ${TEXT_MUTED}; }

      .score-big { font-family: 'JetBrains Mono', monospace; font-size: 120px; font-weight: 900; color: ${TEXT}; }
      .score-label { font-family: 'Space Mono', monospace; font-size: 28px; color: ${ACCENT}; opacity: 0.6; }
      .footer { position: absolute; bottom: 40px; right: 40px; font-family: 'Space Mono', monospace; font-size: 12px; color: ${TEXT_DIM}; text-transform: uppercase; }

      .badge {
        display: inline-block; padding: 12px 32px; border-radius: 4px;
        font-size: 20px; font-weight: 700; color: ${isWhite ? '#FFF' : '#000'}; font-family: 'Space Mono', monospace;
      }
      .criterio-row {
        display: flex; align-items: center; margin: 18px 0;
        font-size: 18px;
      }
      .criterio-name { width: 350px; color: ${TEXT_MUTED}; }
      .criterio-bar-bg {
        flex: 1; height: 8px; background: ${BAR_BG};
        border-radius: 0; margin: 0 16px; overflow: hidden;
      }
      .criterio-bar {
        height: 100%; border-radius: 0;
        background: ${ACCENT};
        transition: width 0.3s;
      }
      .criterio-val { width: 60px; text-align: right; font-weight: 700; color: ${ACCENT}; font-family: 'Space Mono', monospace; }

      .action-item {
        padding: 24px; margin: 16px 0;
        background: ${BG_SURFACE}; border-radius: 4px;
        border: 0.5px solid ${BORDER};
        border-left: 4px solid ${ACCENT}; font-size: 19px;
      }
      .two-col { display: flex; gap: 40px; }
      .col { flex: 1; }
      .highlight { color: ${ACCENT}; }
      .subtitle { font-family: 'Space Mono', monospace; font-size: 18px; color: ${TEXT_DIM}; margin-bottom: 30px; }
    </style>
  `;

  const slides = [];

  // Slide 1: Capa
  slides.push(`
    <div class="slide dark">
      ${logoImg}
      <div style="display:flex;flex-direction:column;justify-content:center;height:100%;text-align:center;">
        <p style="font-size:18px;color:${ACCENT};letter-spacing:6px;margin-bottom:20px;">DIAGNOSTICO DE POSICIONAMENTO</p>
        <h1 style="font-size:52px;margin-bottom:16px;">${alvo}</h1>
        <p class="subtitle">${canal.toUpperCase()} | ${url}</p>
        <div style="margin-top:40px;">
          <span class="score-big">${score}</span><span class="score-label">/20</span>
        </div>
        <p style="margin-top:16px;"><span class="badge" style="background:${score>=14?'#1A7A3C':score>=10?'#B45F00':'#C0392B'}">${classificacao}</span></p>
      </div>
      <div class="footer">- Grupo FNW - PUV SCORE - Coorp.Diana Senciente.</div>
    </div>
  `);

  // Slide 2: Score Overview
  slides.push(`
    <div class="slide dark">
      ${logoImg}
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
          <div style="margin-top:16px;"><span class="badge" style="background:${score>=14?'#1A7A3C':score>=10?'#B45F00':'#C0392B'}">${classificacao}</span></div>
        </div>
      </div>
      <div class="footer">- Grupo FNW - PUV SCORE - Coorp.Diana Senciente.</div>
    </div>
  `);

  // Slides 3-7: One per criterio
  criterios.forEach((c, i) => {
    const exemplos = (c.exemplos_do_alvo || []).join(', ') || 'N/A';
    const salto = c.oportunidade_salto || 'Buscar melhoria continua neste criterio';
    slides.push(`
      <div class="slide ${i % 2 === 0 ? 'dark' : 'accent'}">
        ${logoImg}
        <h2>Criterio ${i+1}: ${c.nome || ''}</h2>
        <div style="display:flex;gap:40px;">
          <div style="flex:2;">
            <p style="margin-bottom:20px;">${c.justificativa || ''}</p>
            <h3 style="color:${ACCENT};font-size:22px;">Evidencias encontradas:</h3>
            <p style="color:${TEXT_MUTED};">${exemplos}</p>
            <div style="margin-top:30px;padding:20px;background:rgba(0,212,255,0.1);border-radius:12px;border:1px solid ${ACCENT};">
              <h3 style="color:${ACCENT};font-size:20px;">Oportunidade de Salto (${c.score || 0} → ${Math.min((c.score||0)+1, 4)})</h3>
              <p style="color:${TEXT_MUTED};margin-top:8px;">${salto}</p>
            </div>
          </div>
          <div style="width:200px;text-align:center;padding-top:30px;">
            <div style="font-size:72px;font-weight:900;color:${getScoreColor(c.score||0)}">${c.score || 0}</div>
            <div style="font-size:20px;color:${TEXT_DIM};">/4</div>
          </div>
        </div>
        <div class="footer">- Grupo FNW - PUV SCORE - Coorp.Diana Senciente.</div>
      </div>
    `);
  });

  // Slide 8: Oportunidades de Salto
  slides.push(`
    <div class="slide dark">
      ${logoImg}
      <h2>Onde Podemos Escalar</h2>
      <p class="subtitle">O salto de 3 para 4 em cada criterio</p>
      ${criterios.map((c, i) => {
        const salto = c.oportunidade_salto || oportunidades[i] || '';
        if (!salto) return '';
        return `<div class="action-item" style="border-left-color:${ACCENT}"><strong style="color:${ACCENT};">${c.nome}:</strong> ${salto}</div>`;
      }).join('')}
      <div class="footer">- Grupo FNW - PUV SCORE - Coorp.Diana Senciente.</div>
    </div>
  `);

  // Slide 9: Top Acoes
  slides.push(`
    <div class="slide accent">
      ${logoImg}
      <h2>Top ${acoes.length || 3} Acoes Priorizadas</h2>
      ${acoes.map((a, i) => `
        <div class="action-item" style="border-left-color:${i===0?'#C0392B':i===1?'#B45F00':'#0A7B8F'}">
          <strong style="color:${ACCENT};">${i+1}.</strong> ${a}
        </div>
      `).join('')}
      ${persona.primaria ? `
        <div style="margin-top:30px;padding:20px;background:rgba(0,212,255,0.1);border-radius:12px;">
          <h3 style="color:${ACCENT};font-size:20px;">Persona Primaria</h3>
          <p>${persona.primaria}</p>
          ${persona.conflito ? `<p style="color:#B45F00;margin-top:8px;">Conflito: ${persona.conflito}</p>` : ''}
        </div>
      ` : ''}
      <div class="footer">- Grupo FNW - PUV SCORE - Coorp.Diana Senciente.</div>
    </div>
  `);

  // Slide 10: Proximos Passos
  slides.push(`
    <div class="slide dark">
      ${logoImg}
      <div style="display:flex;flex-direction:column;justify-content:center;height:100%;text-align:center;">
        <h2 style="font-size:40px;">Proximos Passos</h2>
        <p style="font-size:24px;color:${TEXT_MUTED};margin:20px 0 40px;">
          Implemente as acoes recomendadas e acompanhe a evolucao do seu PUV Score.
        </p>
        <div style="padding:30px;background:rgba(0,212,255,0.1);border-radius:16px;border:1px solid ${ACCENT};display:inline-block;margin:0 auto;">
          <p style="font-size:22px;color:${ACCENT};font-weight:700;">DESBLOQUEAR RELATORIO COMPLETO</p>
          <p style="font-size:16px;color:${TEXT_MUTED};margin-top:8px;">Plano detalhado com 6 secoes de recomendacoes</p>
          <div style="width:120px;height:120px;background:#fff;margin:16px auto 0;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#333;font-size:14px;">QR CODE</div>
        </div>
        <p style="margin-top:40px;color:${TEXT_DIM};font-size:16px;">- Grupo FNW - PUV SCORE - Coorp.Diana Senciente.</p>
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
    const logoBase64 = getLogoBase64();

    const theme = args.theme || 'black';
    console.error(`[SLIDES] Gerando apresentacao (${theme})...`);
    const html = generateSlidesHTML(analysis, theme, logoBase64);

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
