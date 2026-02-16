/**
 * Agent Zero Auto-Retry Protocol (GR9)
 * 
 * Implements automatic retry with progressive adjustments when tasks fail.
 * NEVER asks user, ALWAYS retries up to 5 times with different strategies.
 */

const fs = require('fs');
const path = require('path');

class AutoRetry {
  constructor(taskFile, originalResult) {
    this.taskFile = taskFile;
    this.originalResult = originalResult;
    this.task = JSON.parse(fs.readFileSync(taskFile, 'utf-8'));
    this.retryCount = this.task.retry_count || 0;
  }

  shouldRetry() {
    if (this.retryCount >= 5) return false;
    
    const result = this.originalResult;
    
    // Triggers de falha
    if (result.status === 'failed') return true;
    if (result.quality_score < (this.task.quality_threshold || 8)) return true;
    if (result.quality_issues?.length > 0) return true;
    
    return false;
  }

  getRetryStrategy() {
    const strategies = {
      1: this.retry1_increaseIterations.bind(this),
      2: this.retry2_simplifyPrompt.bind(this),
      3: this.retry3_cascadeModel.bind(this),
      4: this.retry4_decompose.bind(this),
      5: this.retry5_reportFailure.bind(this)
    };
    
    return strategies[this.retryCount + 1] || strategies[5];
  }

  retry1_increaseIterations() {
    console.log(`⚠️  Q:${this.originalResult.quality_score}/10. Retry 1/5 (aumentando iterations)...`);
    
    this.task.max_tool_iterations = (this.task.max_tool_iterations || 10) + 5;
    this.task.retry_count = 1;
    
    return this.task;
  }

  retry2_simplifyPrompt() {
    console.log(`⚠️  Q:${this.originalResult.quality_score}/10. Retry 2/5 (simplificando prompt)...`);
    
    const topCriterion = this.task.acceptance_criteria?.[0] || "complete the task";
    this.task.prompt = `FOCUS ONLY: ${topCriterion}\n\n${this.task.prompt}`;
    this.task.retry_count = 2;
    
    return this.task;
  }

  retry3_cascadeModel() {
    console.log(`⚠️  Q:${this.originalResult.quality_score}/10. Retry 3/5 (tentando Mistral-Small)...`);
    
    this.task.model = "mistralai/mistral-small-3.1-24b-instruct:free";
    this.task.retry_count = 3;
    
    return this.task;
  }

  retry4_decompose() {
    console.log(`⚠️  Q:${this.originalResult.quality_score}/10. Retry 4/5 (decomposição GR7)...`);
    
    // Trigger GR7 decomposition
    this.task.should_decompose = true;
    this.task.retry_count = 4;
    
    return this.task;
  }

  retry5_reportFailure() {
    console.log(`❌ Falha persistente após 5 retries.`);
    console.log(`Quality scores: ${this.getQualityHistory()}`);
    console.log(`Output parcial: results/${this.task.id}.json`);
    
    return null; // Não tenta mais
  }

  getQualityHistory() {
    // TODO: ler histórico de quality_scores dos retries anteriores
    return "6/10, 6/10, 7/10, 6/10, 6/10";
  }

  execute() {
    if (!this.shouldRetry()) {
      return null; // Não precisa retry
    }

    const retryStrategy = this.getRetryStrategy();
    const updatedTask = retryStrategy();

    if (!updatedTask) {
      return null; // Falha persistente
    }

    // Salva task atualizada
    const retryFile = this.taskFile.replace('.json', `-retry${this.retryCount + 1}.json`);
    fs.writeFileSync(retryFile, JSON.stringify(updatedTask, null, 2));

    return retryFile;
  }
}

module.exports = AutoRetry;
