#!/usr/bin/env node
/**
 * Agent Zero Executor with GR9 Auto-Retry
 *
 * Wrapper around delegate.js that automatically retries failed tasks
 * up to 5 times with progressive adjustments.
 *
 * Usage:
 *   node execute-with-auto-retry.js --file task.json
 *   node execute-with-auto-retry.js '{"agent":"dev","prompt":"..."}'
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_RETRIES = 5;

async function executeWithRetry(taskFile, retryCount = 0) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[ATTEMPT ${retryCount + 1}/${MAX_RETRIES + 1}] Executing: ${path.basename(taskFile)}`);
  console.log('='.repeat(60));

  // Execute delegate.js
  const cmd = `node ${path.join(__dirname, 'delegate.js')} --file "${taskFile}"`;
  let result;

  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    result = JSON.parse(output);
  } catch (error) {
    console.error(`❌ Execution error:`, error.message);
    result = { status: 'failed', error: error.message };
  }

  // Check if retry is needed
  const needsRetry = shouldRetry(result, retryCount);

  if (!needsRetry) {
    console.log(`\n✅ Task completed successfully (Q:${result.quality_score || 'N/A'}/10)`);
    return result;
  }

  if (retryCount >= MAX_RETRIES) {
    console.log(`\n❌ FALHA PERSISTENTE após ${MAX_RETRIES + 1} tentativas`);
    reportPersistentFailure(taskFile, result, retryCount);
    return result;
  }

  // Apply retry strategy
  const retryTaskFile = applyRetryStrategy(taskFile, result, retryCount);

  // Recursive retry
  return executeWithRetry(retryTaskFile, retryCount + 1);
}

function shouldRetry(result, retryCount) {
  if (retryCount >= MAX_RETRIES) return false;
  if (result.status === 'failed') return true;
  if (result.quality_score < 8) return true;
  if (result.quality_issues && result.quality_issues.length > 0) return true;

  return false;
}

function applyRetryStrategy(taskFile, result, retryCount) {
  const task = JSON.parse(fs.readFileSync(taskFile, 'utf-8'));
  task.retry_count = retryCount + 1;

  const strategies = [
    increaseIterations,
    simplifyPrompt,
    cascadeModel,
    decomposeTask,
    reportFailure
  ];

  const strategy = strategies[retryCount];
  console.log(`\n⚠️  Q:${result.quality_score || 'N/A'}/10. Aplicando estratégia ${retryCount + 1}/5...`);

  const updatedTask = strategy(task, result);

  const retryFile = taskFile.replace('.json', `-retry${retryCount + 1}.json`);
  fs.writeFileSync(retryFile, JSON.stringify(updatedTask, null, 2));

  return retryFile;
}

// Retry Strategy 1: Increase iterations
function increaseIterations(task, result) {
  console.log(`   → Aumentando max_tool_iterations +5`);
  task.max_tool_iterations = (task.max_tool_iterations || 10) + 5;
  return task;
}

// Retry Strategy 2: Simplify prompt
function simplifyPrompt(task, result) {
  console.log(`   → Simplificando prompt (foco no primeiro critério)`);
  const topCriterion = task.acceptance_criteria?.[0] || "complete the task";
  task.prompt = `CRITICAL: Focus ONLY on: ${topCriterion}\n\n${task.prompt}`;
  return task;
}

// Retry Strategy 3: Cascade to next model
function cascadeModel(task, result) {
  const modelCascade = [
    "arcee-ai/trinity-large-preview:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "google/gemma-3-27b-it:free"
  ];

  const currentIndex = modelCascade.indexOf(task.model || modelCascade[0]);
  const nextModel = modelCascade[Math.min(currentIndex + 1, modelCascade.length - 1)];

  console.log(`   → Mudando modelo: ${nextModel.split('/')[1].split(':')[0]}`);
  task.model = nextModel;
  return task;
}

// Retry Strategy 4: Decompose task (GR7)
function decomposeTask(task, result) {
  console.log(`   → Marcando para decomposição (GR7)`);
  task.should_decompose = true;
  task.decompose_reason = `Failed ${task.retry_count}x with Q:${result.quality_score}/10`;
  return task;
}

// Retry Strategy 5: Report failure
function reportFailure(task, result) {
  console.log(`   → Falha persistente - sem mais retries`);
  return task;
}

function reportPersistentFailure(taskFile, finalResult, retryCount) {
  const report = `
${'='.repeat(60)}
RELATÓRIO DE FALHA PERSISTENTE
${'='.repeat(60)}

Task: ${path.basename(taskFile)}
Tentativas: ${retryCount + 1}
Quality Score Final: ${finalResult.quality_score || 'N/A'}/10

Estratégias aplicadas:
  1. Increase iterations (+5)
  2. Simplify prompt
  3. Cascade model (Trinity → Mistral → Gemma)
  4. Decompose task (GR7)
  5. Report failure

Output parcial: workers/agent-zero/results/${path.basename(taskFile, '.json')}.json

Recomendação:
  - Simplificar acceptance_criteria manualmente
  - Quebrar task em subtasks menores
  - Revisar aios_guide_path (pode estar incorreto)
${'='.repeat(60)}
`;

  console.log(report);

  const reportFile = path.join(__dirname, 'results', `${path.basename(taskFile, '.json')}-failure-report.txt`);
  fs.writeFileSync(reportFile, report);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  let taskFile;

  if (args.includes('--file')) {
    taskFile = args[args.indexOf('--file') + 1];
  } else if (args[0]?.startsWith('{')) {
    // Inline JSON - save to temp file
    const tempFile = path.join(__dirname, 'queue', `temp-${Date.now()}.json`);
    fs.writeFileSync(tempFile, args.join(' '));
    taskFile = tempFile;
  } else {
    console.error('Usage: node execute-with-auto-retry.js --file task.json');
    console.error('   or: node execute-with-auto-retry.js \'{"agent":"dev","prompt":"..."}\'');
    process.exit(1);
  }

  const result = await executeWithRetry(taskFile);

  // Output final result as JSON
  console.log('\n' + JSON.stringify(result, null, 2));
}

main().catch(console.error);
