#!/usr/bin/env node
/**
 * Agent Zero v2.0 - Metrics CLI
 * Check savings, quality scores, and usage stats.
 *
 * Usage:
 *   node metrics-cli.js              → Latest session summary
 *   node metrics-cli.js --lifetime   → All-time stats
 *   node metrics-cli.js --json       → Raw JSON output
 */
const fs = require('fs');
const path = require('path');

const METRICS_FILE = path.resolve(__dirname, 'data', 'metrics.json');

function loadHistory() {
  try {
    if (fs.existsSync(METRICS_FILE)) return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));
  } catch (_) {}
  return [];
}

function aggregate(sessions) {
  return {
    total_sessions: sessions.length,
    total_tasks: sessions.reduce((s, e) => s + (e.tasks_total || 0), 0),
    tasks_completed: sessions.reduce((s, e) => s + (e.tasks_completed || 0), 0),
    tasks_failed: sessions.reduce((s, e) => s + (e.tasks_failed || 0), 0),
    tasks_low_quality: sessions.reduce((s, e) => s + (e.tasks_low_quality || 0), 0),
    tokens_in: sessions.reduce((s, e) => s + (e.tokens_in_total || 0), 0),
    tokens_out: sessions.reduce((s, e) => s + (e.tokens_out_total || 0), 0),
    savings_usd: +sessions.reduce((s, e) => s + (e.estimated_savings_usd || 0), 0).toFixed(4),
    avg_quality: sessions.flatMap(e => e.quality_scores || []).length > 0
      ? +(sessions.flatMap(e => e.quality_scores || []).reduce((a, b) => a + b, 0) / sessions.flatMap(e => e.quality_scores || []).length).toFixed(1)
      : 'N/A',
    models_used: sessions.reduce((acc, e) => {
      for (const [k, v] of Object.entries(e.models_used || {})) acc[k] = (acc[k] || 0) + v;
      return acc;
    }, {})
  };
}

const args = process.argv.slice(2);
const history = loadHistory();

if (history.length === 0) {
  console.log('No metrics recorded yet. Run tasks via delegate.js first.');
  process.exit(0);
}

if (args.includes('--json')) {
  console.log(JSON.stringify(args.includes('--lifetime') ? aggregate(history) : history[history.length - 1], null, 2));
} else if (args.includes('--lifetime')) {
  const a = aggregate(history);
  console.log('=== Agent Zero v2.0 - Lifetime Metrics ===');
  console.log(`Sessions:    ${a.total_sessions}`);
  console.log(`Tasks:       ${a.tasks_completed} ok / ${a.tasks_failed} fail / ${a.tasks_low_quality} low-q (${a.total_tasks} total)`);
  console.log(`Quality:     ${a.avg_quality}/10 avg`);
  console.log(`Tokens:      ${a.tokens_in.toLocaleString()} in + ${a.tokens_out.toLocaleString()} out`);
  console.log(`Savings:     $${a.savings_usd} vs Opus`);
  console.log(`Models:      ${JSON.stringify(a.models_used)}`);
} else {
  const s = history[history.length - 1];
  const scores = s.quality_scores || [];
  const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A';
  console.log('=== Agent Zero v2.0 - Last Session ===');
  console.log(`Started:  ${s.started_at}`);
  console.log(`Tasks:    ${s.tasks_completed} ok / ${s.tasks_failed} fail / ${s.tasks_low_quality} low-q`);
  console.log(`Quality:  ${avg}/10 avg`);
  console.log(`Tokens:   ${s.tokens_in_total} in + ${s.tokens_out_total} out`);
  console.log(`Time:     ${(s.elapsed_ms_total / 1000).toFixed(1)}s total`);
  console.log(`Savings:  $${(s.estimated_savings_usd || 0).toFixed(4)} vs Opus`);
  console.log(`Models:   ${JSON.stringify(s.models_used)}`);
}
