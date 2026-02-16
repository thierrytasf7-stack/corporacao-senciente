#!/usr/bin/env node
/**
 * Agent Zero v2.0 - Delegation Protocol for Claude Code
 *
 * This is the main interface Claude Code uses to delegate tasks.
 * Runs the task directly (no queue) and returns structured result.
 *
 * Usage from Claude Code Bash tool:
 *   node workers/agent-zero/delegate.js <JSON_TASK>
 *
 * JSON_TASK format:
 *   {"agent":"dev","task_type":"implement","prompt":"...","acceptance_criteria":["..."]}
 *
 * Or via file:
 *   node workers/agent-zero/delegate.js --file path/to/task.json
 *
 * Or pipe:
 *   echo '{"agent":"dev","prompt":"..."}' | node workers/agent-zero/delegate.js --stdin
 *
 * Returns JSON to stdout:
 *   {"status":"completed","content":"...","quality_score":9,"model_used":"...","tokens_in":...,"tokens_out":...,"elapsed_ms":...}
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function main() {
  const args = process.argv.slice(2);
  let task;

  if (args.includes('--file')) {
    const filePath = args[args.indexOf('--file') + 1];
    task = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else if (args.includes('--stdin')) {
    let input = '';
    process.stdin.setEncoding('utf-8');
    for await (const chunk of process.stdin) { input += chunk; }
    task = JSON.parse(input);
  } else if (args.length > 0 && args[0].startsWith('{')) {
    // Inline JSON argument
    task = JSON.parse(args.join(' '));
  } else {
    // Try to read from stdin if no args (piped)
    if (!process.stdin.isTTY) {
      let input = '';
      process.stdin.setEncoding('utf-8');
      for await (const chunk of process.stdin) { input += chunk; }
      task = JSON.parse(input);
    } else {
      process.stderr.write('Usage: node delegate.js \'{"agent":"dev","task_type":"implement","prompt":"..."}\'\n');
      process.exit(1);
    }
  }

  // Ensure required fields
  if (!task.id) task.id = `az-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  if (!task.task_type) task.task_type = 'implement';
  if (!task.agent) task.agent = 'dev';

  // AUTO-SPLIT: Check if task should be divided into sub-batches
  const TaskSplitter = require('./lib/task-splitter.js');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
  const splitter = new TaskSplitter(config);
  const splitAnalysis = splitter.shouldSplit(task);

  if (splitAnalysis.shouldSplit) {
    process.stderr.write(`[AUTO-SPLIT] ${splitAnalysis.reason}\n`);
    process.stderr.write(`[AUTO-SPLIT] Complexity: ${splitAnalysis.complexity}, dividing into ${splitAnalysis.complexity} batches\n`);

    const subtasks = splitter.split(task, splitAnalysis.complexity);
    const maxConcurrent = config.task_splitting.max_concurrent_batches || 3;
    process.stderr.write(`[AUTO-SPLIT] Created ${subtasks.length} sub-batches (max ${maxConcurrent} concurrent)\n`);

    // Execute sub-batches in groups of max_concurrent_batches
    const { TaskRunner } = require('./lib/task-runner.js');
    const taskRunner = new TaskRunner(config);
    const results = [];
    let shouldStop = false;

    for (let i = 0; i < subtasks.length; i += maxConcurrent) {
      if (shouldStop) break;

      const batchGroup = subtasks.slice(i, i + maxConcurrent);
      const groupNum = Math.floor(i / maxConcurrent) + 1;
      const totalGroups = Math.ceil(subtasks.length / maxConcurrent);

      process.stderr.write(`[AUTO-SPLIT] Executing group ${groupNum}/${totalGroups} (${batchGroup.length} batches in parallel)...\n`);

      // Execute batches in group concurrently
      const groupPromises = batchGroup.map((subtask, idx) => {
        const batchNum = i + idx + 1;
        process.stderr.write(`[AUTO-SPLIT]   - Batch ${batchNum}/${subtasks.length} starting...\n`);
        return taskRunner.processTask(subtask);
      });

      const groupResults = await Promise.all(groupPromises);
      results.push(...groupResults);

      // Check if any batch in group failed
      for (let j = 0; j < groupResults.length; j++) {
        const result = groupResults[j];
        const batchNum = i + j + 1;

        if (result.status === 'low_quality' || result.status === 'failed') {
          process.stderr.write(`[AUTO-SPLIT] Batch ${batchNum} failed (Q:${result.quality_score}/10), stopping execution\n`);
          shouldStop = true;
          break;
        } else {
          process.stderr.write(`[AUTO-SPLIT]   - Batch ${batchNum} completed (Q:${result.quality_score}/10)\n`);
        }
      }
    }

    // Consolidar resultados
    const consolidatedResult = {
      task_id: task.id,
      status: results.every(r => r.status === 'completed') ? 'completed' : 'low_quality',
      content: results.map((r, i) => `Batch ${i + 1}: ${r.content}`).join('\n\n'),
      batches: results.length,
      quality_score: Math.round(results.reduce((sum, r) => sum + (r.quality_score || 0), 0) / results.length),
      tokens_total: results.reduce((sum, r) => sum + (r.tokens_in || 0) + (r.tokens_out || 0), 0),
      elapsed_ms_total: results.reduce((sum, r) => sum + (r.elapsed_ms || 0), 0),
      split_analysis: splitAnalysis,
      batch_results: results
    };

    process.stdout.write(JSON.stringify(consolidatedResult, null, 2) + '\n');
    process.exit(consolidatedResult.status === 'completed' ? 0 : 1);
  }

  // Suppress logs to stderr so stdout is clean JSON
  const origLog = console.log;
  const origError = console.error;
  console.log = (...a) => process.stderr.write(a.join(' ') + '\n');

  try {
    const { TaskRunner } = require('./lib/task-runner');
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
    const runner = new TaskRunner(config);

    const result = await runner.processTask(task);

    // Output clean JSON to stdout
    origLog(JSON.stringify(result));
  } catch (err) {
    origLog(JSON.stringify({
      task_id: task.id,
      status: 'failed',
      error: err.message,
      timestamp: new Date().toISOString()
    }));
    process.exit(1);
  }
}

main();
