#!/usr/bin/env node
/**
 * Agent Zero v2.0 - Task Submitter
 * Helper to submit tasks to queue from CLI or Claude Code.
 *
 * Usage:
 *   node submit-task.js --agent dev --type implement --prompt "Create isKebabCase function"
 *   node submit-task.js --agent qa --type review --prompt "Review this file" --context src/file.ts
 *   node submit-task.js --file task.json
 *   node submit-task.js --inline '{"agent":"dev","task_type":"implement","prompt":"..."}'
 *   node submit-task.js --direct --agent dev --type implement --prompt "..."  (runs immediately, no queue)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const QUEUE_DIR = path.resolve(__dirname, 'queue');
const RESULTS_DIR = path.resolve(__dirname, 'results');

function generateId() {
  return `az-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--agent': parsed.agent = args[++i]; break;
      case '--type': parsed.task_type = args[++i]; break;
      case '--prompt': parsed.prompt = args[++i]; break;
      case '--context':
        if (!parsed.context_files) parsed.context_files = [];
        parsed.context_files.push(args[++i]);
        break;
      case '--criteria':
        if (!parsed.acceptance_criteria) parsed.acceptance_criteria = [];
        parsed.acceptance_criteria.push(args[++i]);
        break;
      case '--max-tokens': parsed.max_tokens = parseInt(args[++i]); break;
      case '--model': parsed.model_preference = args[++i]; break;
      case '--priority': parsed.priority = args[++i]; break;
      case '--file': parsed._file = args[++i]; break;
      case '--inline': parsed._inline = args[++i]; break;
      case '--direct': parsed._direct = true; break;
      case '--wait': parsed._wait = true; break;
    }
  }

  return parsed;
}

async function waitForResult(taskId, timeoutMs = 180000) {
  const statusFile = path.join(RESULTS_DIR, `${taskId}.status`);
  const resultFile = path.join(RESULTS_DIR, `${taskId}.json`);
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(statusFile)) {
      const status = fs.readFileSync(statusFile, 'utf-8').trim();
      if (status === 'completed' || status === 'failed') {
        if (fs.existsSync(resultFile)) {
          return JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
        }
        return { status, task_id: taskId };
      }
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  return { status: 'timeout', task_id: taskId };
}

async function runDirect(task) {
  const { TaskRunner } = require('./lib/task-runner');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
  const runner = new TaskRunner(config);
  return runner.processTask(task);
}

async function main() {
  const opts = parseArgs();
  let task;

  if (opts._file) {
    task = JSON.parse(fs.readFileSync(opts._file, 'utf-8'));
  } else if (opts._inline) {
    task = JSON.parse(opts._inline);
  } else if (opts.prompt) {
    task = {
      agent: opts.agent || 'dev',
      task_type: opts.task_type || 'implement',
      prompt: opts.prompt,
      context_files: opts.context_files || [],
      acceptance_criteria: opts.acceptance_criteria || [],
      max_tokens: opts.max_tokens,
      model_preference: opts.model_preference,
      priority: opts.priority || 'normal'
    };
  } else {
    console.error('Usage: node submit-task.js --agent dev --type implement --prompt "..."');
    console.error('       node submit-task.js --file task.json');
    console.error('       node submit-task.js --direct --agent dev --type implement --prompt "..."');
    process.exit(1);
  }

  // Ensure ID
  if (!task.id) task.id = generateId();
  task.created_at = new Date().toISOString();
  task.status = 'pending';

  if (opts._direct) {
    // Run immediately without queue
    const result = await runDirect(task);
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Write to queue
    if (!fs.existsSync(QUEUE_DIR)) fs.mkdirSync(QUEUE_DIR, { recursive: true });
    const filePath = path.join(QUEUE_DIR, `${task.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(task, null, 2));
    console.log(JSON.stringify({ submitted: true, task_id: task.id, queue: filePath }));

    // Optionally wait for result
    if (opts._wait) {
      console.error(`Waiting for result (timeout 180s)...`);
      const result = await waitForResult(task.id);
      console.log(JSON.stringify(result, null, 2));
    }
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
