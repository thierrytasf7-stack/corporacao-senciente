#!/usr/bin/env node
/**
 * Agent Zero v2.0 - LLM-Powered AIOS Worker
 *
 * Modes:
 *   node index.js              → Start polling loop (daemon)
 *   node index.js --once       → Process queue once and exit
 *   node index.js --task <file> → Process single task file
 *   node index.js --submit     → Read task JSON from stdin
 */
const fs = require('fs');
const path = require('path');
const { TaskRunner } = require('./lib/task-runner');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

async function main() {
  const args = process.argv.slice(2);
  const runner = new TaskRunner(config);

  if (args.includes('--once')) {
    // Process queue once
    const results = await runner.pollOnce();
    console.log(JSON.stringify({ processed: results.length, results }, null, 2));

  } else if (args.includes('--task')) {
    // Process single task file
    const taskFile = args[args.indexOf('--task') + 1];
    if (!taskFile || !fs.existsSync(taskFile)) {
      console.error('Usage: node index.js --task <file.json>');
      process.exit(1);
    }
    const task = JSON.parse(fs.readFileSync(taskFile, 'utf-8'));
    const result = await runner.processTask(task);
    console.log(JSON.stringify(result, null, 2));

  } else if (args.includes('--submit')) {
    // Read task from stdin
    let input = '';
    process.stdin.setEncoding('utf-8');
    for await (const chunk of process.stdin) {
      input += chunk;
    }
    const task = JSON.parse(input);

    // Ensure ID
    if (!task.id) task.id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const result = await runner.processTask(task);
    console.log(JSON.stringify(result, null, 2));

  } else {
    // Default: start daemon loop
    console.log('==========================================================');
    console.log('   AGENT ZERO v2.0 : LLM-POWERED AIOS WORKER');
    console.log('==========================================================');
    console.log(`Keys loaded: ${runner.client.keys.length}`);
    console.log(`Models: reasoning(${config.models.reasoning.cascade.length}) coding(${config.models.coding.cascade.length}) general(${config.models.general.cascade.length})`);
    console.log('');
    await runner.startLoop();
  }
}

main().catch(err => {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
