#!/usr/bin/env node
/**
 * Agent Zero v3 - PUV Pipeline Dispatcher
 * Creates a task JSON from the PUV template and drops it in the queue.
 *
 * Usage:
 *   node dispatch-puv.js --url "https://example.com" --slug "meu-negocio"
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let url, slug;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) url = args[++i];
  else if (args[i] === '--slug' && args[i + 1]) slug = args[++i];
}

if (!url) {
  console.error('Usage: node dispatch-puv.js --url "https://..." --slug "nome-negocio"');
  process.exit(1);
}

if (!slug) {
  // Auto-generate slug from URL hostname
  try {
    slug = new URL(url).hostname.replace(/^www\./, '').replace(/\./g, '-');
  } catch (_) {
    slug = 'site';
  }
}

const date = new Date().toISOString().substring(0, 10);
const templatePath = path.join(__dirname, 'puv-pipeline.json');
let template = fs.readFileSync(templatePath, 'utf-8');

// Replace placeholders
template = template.replace(/\{\{URL\}\}/g, url);
template = template.replace(/\{\{SLUG\}\}/g, slug);
template = template.replace(/\{\{DATE\}\}/g, date);

const task = JSON.parse(template);
const taskFile = `task-puv-${slug}-${date}.json`;
const queueDir = path.resolve(__dirname, '..', 'queue');

if (!fs.existsSync(queueDir)) {
  fs.mkdirSync(queueDir, { recursive: true });
}

const dest = path.join(queueDir, taskFile);
fs.writeFileSync(dest, JSON.stringify(task, null, 2));

console.log(`[PUV] Task created: ${taskFile}`);
console.log(`[PUV] Queue: ${dest}`);
console.log(`[PUV] URL: ${url}`);
console.log(`[PUV] Slug: ${slug}`);
console.log(`[PUV] Tools: web_fetch, file_write, html_to_pdf`);
console.log(`[PUV] Max iterations: ${task.max_tool_iterations}`);
