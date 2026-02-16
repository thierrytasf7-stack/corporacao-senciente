#!/usr/bin/env node
/**
 * Agent Zero - Execute with Retry + GR7 Fallback
 *
 * Strategy:
 * 1. Try task (attempt 1)
 * 2. If fail/low quality, retry (attempt 2)
 * 3. If still fail, apply GR7 (auto-decompose into subtasks)
 * 4. Execute subtasks sequentially
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const taskFile = process.argv[2];
if (!taskFile) {
  console.error('Usage: node execute-with-retry.js <task-file.json>');
  process.exit(1);
}

const MAX_RETRIES = 2;
const QUALITY_THRESHOLD = 7;

async function executeTask(taskPath, attemptNum) {
  console.log(`[ATTEMPT ${attemptNum}/${MAX_RETRIES}] Executing ${taskPath}...`);

  try {
    execSync(`node delegate.js --file ${taskPath}`, {
      cwd: __dirname,
      stdio: 'inherit',
      timeout: 300000 // 5 min timeout
    });

    // Check result quality
    const taskId = path.basename(taskPath, '.json');
    const resultPath = path.join(__dirname, 'results', `${taskId}.json`);

    if (fs.existsSync(resultPath)) {
      const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));

      if (result.status === 'completed' && result.quality_score >= QUALITY_THRESHOLD) {
        console.log(`[SUCCESS] Quality: ${result.quality_score}/10`);
        return { success: true, result };
      } else if (result.status === 'failed') {
        console.log(`[FAILED] ${result.error || 'Unknown error'}`);
        return { success: false, reason: 'failed', result };
      } else {
        console.log(`[LOW_QUALITY] Score: ${result.quality_score}/10 (threshold: ${QUALITY_THRESHOLD})`);
        return { success: false, reason: 'low_quality', result };
      }
    }

    return { success: false, reason: 'no_result' };
  } catch (error) {
    console.log(`[ERROR] ${error.message}`);
    return { success: false, reason: 'exception', error };
  }
}

async function applyGR7Decomposition(taskPath) {
  console.log('\n[GR7] Auto-decomposing task into simpler subtasks...');

  const taskData = JSON.parse(fs.readFileSync(taskPath, 'utf8'));

  // Simple decomposition: split output into smaller pieces
  // For example, if task creates multiple files, create one task per file

  console.log('[GR7] Creating decomposition plan...');

  // This is a simplified GR7 - in production, would call @pm via Agent Zero
  // For now, just log that GR7 would be applied
  console.log('[GR7] Would decompose task:', taskData.id);
  console.log('[GR7] Fallback: Task needs manual intervention or AIOS escalation');

  return { success: false, needsManualIntervention: true };
}

async function main() {
  const taskPath = path.resolve(taskFile);

  console.log('='.repeat(60));
  console.log('Agent Zero - Retry Strategy with GR7 Fallback');
  console.log('='.repeat(60));
  console.log(`Task: ${taskPath}`);
  console.log(`Max Retries: ${MAX_RETRIES}`);
  console.log(`Quality Threshold: ${QUALITY_THRESHOLD}/10`);
  console.log('='.repeat(60));
  console.log('');

  // Attempt 1
  let result = await executeTask(taskPath, 1);

  if (result.success) {
    console.log('\n✅ Task completed successfully on first attempt!');
    process.exit(0);
  }

  // Attempt 2 (retry)
  console.log('\n[RETRY] Attempting second execution...');
  await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay

  result = await executeTask(taskPath, 2);

  if (result.success) {
    console.log('\n✅ Task completed successfully on retry!');
    process.exit(0);
  }

  // Both attempts failed - apply GR7
  console.log('\n⚠️  Both attempts failed. Applying GR7 Auto-Decomposition...');

  const gr7Result = await applyGR7Decomposition(taskPath);

  if (gr7Result.needsManualIntervention) {
    console.log('\n❌ Task requires manual intervention or AIOS escalation');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
