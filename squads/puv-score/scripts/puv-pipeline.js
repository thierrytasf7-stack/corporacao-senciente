#!/usr/bin/env node
/**
 * FNW PUV Score - Pipeline Orquestrador
 * Executa o pipeline completo: scrape → analyze → generate → [deliver]
 *
 * Usage:
 *   node puv-pipeline.js --canal website --link "https://..." --output ./results/
 *   node puv-pipeline.js --canal instagram --link "https://instagram.com/perfil" --output ./results/ --full
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = __dirname;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { full: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--canal' && args[i+1]) parsed.canal = args[++i];
    else if (args[i] === '--link' && args[i+1]) parsed.link = args[++i];
    else if (args[i] === '--output' && args[i+1]) parsed.output = args[++i];
    else if (args[i] === '--full') parsed.full = true;
    else if (args[i] === '--deliver' && args[i+1]) parsed.deliver = args[++i];
    else if (args[i] === '--chat' && args[i+1]) parsed.chat = args[++i];
    else if (args[i] === '--model' && args[i+1]) parsed.model = args[++i];
  }
  return parsed;
}

function log(stage, msg) {
  const ts = new Date().toISOString().split('T')[1].split('.')[0];
  console.error(`[${ts}] [${stage}] ${msg}`);
}

function runScript(scriptName, args) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  const cmd = `node "${scriptPath}" ${args}`;
  log('EXEC', `${scriptName} ${args}`);

  const result = execSync(cmd, {
    encoding: 'utf-8',
    timeout: 300000, // 5 min max per step
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return result.trim();
}

async function runScriptAsync(scriptName, args) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);

  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath, ...args.split(/\s+/)], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => {
      const msg = d.toString().trim();
      if (msg) console.error(msg);
      stderr += msg + '\n';
    });

    child.on('close', code => {
      if (code !== 0) reject(new Error(`${scriptName} exited with code ${code}: ${stderr}`));
      else resolve(stdout.trim());
    });

    // 5 min timeout
    setTimeout(() => {
      child.kill();
      reject(new Error(`${scriptName} timeout (5 min)`));
    }, 300000);
  });
}

async function main() {
  const args = parseArgs();

  if (!args.canal || !args.link) {
    console.error(`
FNW PUV Score Pipeline
======================

Uso: node puv-pipeline.js --canal <canal> --link <URL> [opcoes]

Canais: website, google, instagram, mercadolivre

Opcoes:
  --output <dir>    Diretorio de output (default: ./results/puv-{timestamp}/)
  --full            Gera todos 3 outputs (scorecard + slides + documento)
  --model <model>   Modelo Claude (default: claude-sonnet-4-5-20250929)
  --deliver <tipo>  Entrega automatica (whatsapp)
  --chat <jid>      Chat JID para entrega WhatsApp

Exemplos:
  node puv-pipeline.js --canal website --link "https://www.site.com" --output ./results/
  node puv-pipeline.js --canal instagram --link "https://instagram.com/perfil" --full
  node puv-pipeline.js --canal mercadolivre --link "https://produto.mercadolivre.com.br/..." --deliver whatsapp --chat "5511999999999@s.whatsapp.net"
    `);
    process.exit(1);
  }

  // Setup output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputDir = args.output || path.resolve(process.cwd(), `results/puv-${timestamp}`);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const scrapedPath = path.join(outputDir, 'scraped.json');
  const analysisPath = path.join(outputDir, 'analysis.json');
  const scorecardPath = path.join(outputDir, 'scorecard.jpg');
  const slidesPath = path.join(outputDir, 'slides.pdf');
  const reportPath = path.join(outputDir, 'report.pdf');

  const startTime = Date.now();
  const results = { steps: [], errors: [] };

  console.error('');
  console.error('='.repeat(60));
  console.error('  FNW PUV SCORE PIPELINE');
  console.error(`  Canal: ${args.canal} | Link: ${args.link}`);
  console.error(`  Output: ${outputDir}`);
  console.error(`  Modo: ${args.full ? 'COMPLETO (3 outputs)' : 'MVP (scorecard only)'}`);
  console.error('='.repeat(60));
  console.error('');

  // ====== STEP 1: SCRAPING ======
  try {
    log('SCRAPE', `Iniciando scraping de ${args.canal}...`);
    const stepStart = Date.now();

    runScript('scraper.js', `--canal ${args.canal} --link "${args.link}" --output "${scrapedPath}"`);

    const stepDuration = Date.now() - stepStart;
    log('SCRAPE', `Concluido em ${(stepDuration/1000).toFixed(1)}s`);
    results.steps.push({ step: 'scrape', status: 'ok', duration_ms: stepDuration });
  } catch (err) {
    log('SCRAPE', `ERRO: ${err.message}`);
    results.steps.push({ step: 'scrape', status: 'error', error: err.message });
    results.errors.push('scrape');

    // Save partial results
    fs.writeFileSync(path.join(outputDir, 'pipeline-result.json'), JSON.stringify(results, null, 2));
    console.error('\n[PIPELINE] Falhou no scraping. Abortando.');
    process.exit(1);
  }

  // ====== STEP 2: ANALYSIS ======
  try {
    log('ANALYZE', 'Enviando para Claude API...');
    const stepStart = Date.now();

    const modelArg = args.model ? `--model ${args.model}` : '';
    runScript('analyzer.js', `--data "${scrapedPath}" --output "${analysisPath}" ${modelArg}`);

    const stepDuration = Date.now() - stepStart;
    log('ANALYZE', `Concluido em ${(stepDuration/1000).toFixed(1)}s`);
    results.steps.push({ step: 'analyze', status: 'ok', duration_ms: stepDuration });
  } catch (err) {
    log('ANALYZE', `ERRO: ${err.message}`);
    results.steps.push({ step: 'analyze', status: 'error', error: err.message });
    results.errors.push('analyze');

    fs.writeFileSync(path.join(outputDir, 'pipeline-result.json'), JSON.stringify(results, null, 2));
    console.error('\n[PIPELINE] Falhou na analise. Dados scraped salvos.');
    process.exit(1);
  }

  // ====== STEP 3: GENERATE SCORECARD (always) ======
  try {
    log('SCORECARD', 'Gerando infografico...');
    const stepStart = Date.now();

    runScript('scorecard-gen.js', `--analysis "${analysisPath}" --output "${scorecardPath}"`);

    const stepDuration = Date.now() - stepStart;
    log('SCORECARD', `Concluido em ${(stepDuration/1000).toFixed(1)}s`);
    results.steps.push({ step: 'scorecard', status: 'ok', duration_ms: stepDuration, output: scorecardPath });
  } catch (err) {
    log('SCORECARD', `ERRO: ${err.message}`);
    results.steps.push({ step: 'scorecard', status: 'error', error: err.message });
    results.errors.push('scorecard');
  }

  // ====== STEP 4-5: SLIDES + DOCUMENT (if --full) ======
  if (args.full) {
    // Run slides and document in parallel
    const promises = [];

    promises.push(
      runScriptAsync('slides-gen.js', `--analysis "${analysisPath}" --output "${slidesPath}"`)
        .then(() => {
          log('SLIDES', 'Concluido');
          results.steps.push({ step: 'slides', status: 'ok', output: slidesPath });
        })
        .catch(err => {
          log('SLIDES', `ERRO: ${err.message}`);
          results.steps.push({ step: 'slides', status: 'error', error: err.message });
          results.errors.push('slides');
        })
    );

    promises.push(
      runScriptAsync('document-gen.js', `--analysis "${analysisPath}" --output "${reportPath}"`)
        .then(() => {
          log('DOCUMENT', 'Concluido');
          results.steps.push({ step: 'document', status: 'ok', output: reportPath });
        })
        .catch(err => {
          log('DOCUMENT', `ERRO: ${err.message}`);
          results.steps.push({ step: 'document', status: 'error', error: err.message });
          results.errors.push('document');
        })
    );

    log('GENERATE', 'Gerando slides + documento em paralelo...');
    await Promise.all(promises);
  }

  // ====== STEP 6: DELIVER (if requested) ======
  if (args.deliver === 'whatsapp' && args.chat) {
    try {
      log('DELIVER', `Enviando scorecard para ${args.chat}...`);

      // Read scorecard as base64
      if (fs.existsSync(scorecardPath)) {
        const imgBuffer = fs.readFileSync(scorecardPath);
        const base64 = imgBuffer.toString('base64');

        const http = require('http');
        const postData = JSON.stringify({
          chat: args.chat,
          image: `data:image/jpeg;base64,${base64}`,
          caption: `PUV Score: Diagnostico completo gerado! Veja o resultado.`
        });

        const req = http.request({
          hostname: 'localhost',
          port: 21350,
          path: '/api/send',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        }, (res) => {
          log('DELIVER', `WhatsApp response: ${res.statusCode}`);
          results.steps.push({ step: 'deliver', status: 'ok' });
        });

        req.on('error', (err) => {
          log('DELIVER', `ERRO: ${err.message}`);
          results.steps.push({ step: 'deliver', status: 'error', error: err.message });
        });

        req.write(postData);
        req.end();
      }
    } catch (err) {
      log('DELIVER', `ERRO: ${err.message}`);
      results.errors.push('deliver');
    }
  }

  // ====== SUMMARY ======
  const totalDuration = Date.now() - startTime;
  results.total_duration_ms = totalDuration;
  results.output_dir = outputDir;
  results.outputs = {
    scraped: fs.existsSync(scrapedPath) ? scrapedPath : null,
    analysis: fs.existsSync(analysisPath) ? analysisPath : null,
    scorecard: fs.existsSync(scorecardPath) ? scorecardPath : null,
    slides: args.full && fs.existsSync(slidesPath) ? slidesPath : null,
    report: args.full && fs.existsSync(reportPath) ? reportPath : null
  };

  // Read score from analysis
  if (fs.existsSync(analysisPath)) {
    try {
      const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
      results.score = analysis.score_total;
      results.classificacao = analysis.classificacao;
    } catch (e) {}
  }

  // Save pipeline result
  fs.writeFileSync(path.join(outputDir, 'pipeline-result.json'), JSON.stringify(results, null, 2));

  console.error('');
  console.error('='.repeat(60));
  console.error('  PIPELINE COMPLETO');
  console.error(`  Tempo total: ${(totalDuration/1000).toFixed(1)}s`);
  console.error(`  Score: ${results.score || '?'}/20 (${results.classificacao || '?'})`);
  console.error(`  Erros: ${results.errors.length > 0 ? results.errors.join(', ') : 'nenhum'}`);
  console.error(`  Output: ${outputDir}`);
  if (results.outputs.scorecard) console.error(`  Scorecard: ${results.outputs.scorecard}`);
  if (results.outputs.slides) console.error(`  Slides: ${results.outputs.slides}`);
  if (results.outputs.report) console.error(`  Report: ${results.outputs.report}`);
  console.error('='.repeat(60));
  console.error('');

  // Output JSON result
  console.log(JSON.stringify(results, null, 2));
}

main();
