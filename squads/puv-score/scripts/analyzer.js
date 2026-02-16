#!/usr/bin/env node
/**
 * FNW PUV Score - Analyzer (Claude CLI)
 * Analisa dados scraped usando rubrica PUV Score via Claude Code CLI local
 *
 * Usage: node analyzer.js --data scraped.json [--output analysis.json]
 */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const TIMEOUT = 120000; // 2min para analise

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data' && args[i+1]) parsed.data = args[++i];
    else if (args[i] === '--output' && args[i+1]) parsed.output = args[++i];
  }
  return parsed;
}

function loadPromptTemplate() {
  const templatePath = path.resolve(__dirname, '../templates/puv-prompt.md');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template nao encontrado: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf-8');
}

function runClaudeCLI(prompt) {
  return new Promise((resolve, reject) => {
    console.error('[ANALYZER] Invocando Claude CLI...');
    const startTime = Date.now();

    const child = execFile('claude', ['-p', prompt, '--output-format', 'text'], {
      timeout: TIMEOUT,
      maxBuffer: 1024 * 1024 * 10, // 10MB
      windowsHide: true
    }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;
      if (error) {
        console.error(`[ANALYZER] Erro Claude CLI (${duration}ms): ${error.message}`);
        reject(error);
        return;
      }
      console.error(`[ANALYZER] Resposta recebida (${duration}ms)`);
      resolve({ text: stdout, duration });
    });
  });
}

function extractJSON(text) {
  // Try fenced code block
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }

  // Try direct parse
  try {
    return JSON.parse(text);
  } catch (e) {}

  // Try finding JSON object in text
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    return JSON.parse(braceMatch[0]);
  }

  throw new Error('Claude nao retornou JSON valido');
}

async function main() {
  const args = parseArgs();

  if (!args.data) {
    console.error(JSON.stringify({
      error: true,
      message: 'Uso: node analyzer.js --data scraped.json [--output analysis.json]'
    }, null, 2));
    process.exit(1);
  }

  if (!fs.existsSync(args.data)) {
    console.error(JSON.stringify({
      error: true,
      message: `Arquivo nao encontrado: ${args.data}`
    }, null, 2));
    process.exit(1);
  }

  try {
    const scrapedData = JSON.parse(fs.readFileSync(args.data, 'utf-8'));
    console.error(`[ANALYZER] Analisando: canal=${scrapedData.canal} url=${scrapedData.url}`);

    const promptTemplate = loadPromptTemplate();
    const prompt = promptTemplate.replace('{{SCRAPED_DATA}}', JSON.stringify(scrapedData.content, null, 2));

    const { text, duration } = await runClaudeCLI(prompt);
    const analysis = extractJSON(text);

    // Add metadata
    analysis._meta = {
      engine: 'claude-cli',
      duration_ms: duration,
      analyzed_at: new Date().toISOString(),
      source: {
        canal: scrapedData.canal,
        url: scrapedData.url,
        scraped_at: scrapedData.scraped_at
      }
    };

    const json = JSON.stringify(analysis, null, 2);

    if (args.output) {
      const dir = path.dirname(args.output);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(args.output, json, 'utf-8');
      console.error(`[ANALYZER] Salvo em ${args.output}`);
    }

    console.log(json);

  } catch (err) {
    console.error(JSON.stringify({
      error: true,
      message: err.message,
      analyzed_at: new Date().toISOString()
    }, null, 2));
    process.exit(1);
  }
}

main();
