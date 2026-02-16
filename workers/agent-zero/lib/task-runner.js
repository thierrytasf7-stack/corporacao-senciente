/**
 * Agent Zero v2.0 - Task Runner
 * Processes tasks from queue, calls LLM via PromptBuilder + LLMClient,
 * writes results. Core execution engine.
 */
const fs = require('fs');
const path = require('path');
const { LLMClient } = require('./llm-client');
const { PromptBuilder } = require('./prompt-builder');
const { QualityGate } = require('./quality-gate');
const { MetricsLogger } = require('./metrics');
const { HealthCollector } = require('./health-collector');
const { ToolExecutor } = require('./tool-executor');

class TaskRunner {
  constructor(config) {
    this.config = config;
    this.client = new LLMClient(config);
    this.promptBuilder = new PromptBuilder();
    this.qualityGate = new QualityGate();
    this.metrics = new MetricsLogger();
    this.health = new HealthCollector(config);
    this.toolExecutor = new ToolExecutor(config);
    this.projectRoot = path.resolve(__dirname, '..', '..', '..');
    this.queueDir = path.resolve(this.projectRoot, config.queue_path);
    this.resultsDir = path.resolve(this.projectRoot, config.results_path);
    this.logsDir = path.resolve(this.projectRoot, config.logs_path);

    // Ensure dirs exist
    [this.queueDir, this.resultsDir, this.logsDir].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  /**
   * Process a single task
   * @param {object} task - Task object from JSON file
   * @returns {object} result
   */
  async processTask(task) {
    const startTime = Date.now();
    this._log(`[TASK] ${task.id} | ${task.task_type} | agent:${task.agent || 'auto'}`);

    try {
      // 1. Update status
      this._writeStatus(task.id, 'running');

      // 2. Build prompt with AIOS context
      const messages = this.promptBuilder.build(task);

      // 3. Select model cascade based on task type
      const modelConfig = this._selectModelConfig(task.task_type);

      // 4. Check if task needs tool use
      const useTools = this.toolExecutor.needsTools(task);
      const tools = useTools ? this.toolExecutor.getToolDefinitions(task) : [];

      if (useTools) {
        const toolNames = tools.map(t => t.function.name).join(', ') || 'all';
        this._log(`[TOOLS] Enabled (${tools.length}): ${toolNames}`);
      }

      // 5. Call LLM (with tool use loop if needed)
      this._log(`[LLM] Model cascade: ${modelConfig.cascade.join(' → ')}`);
      let response;
      let toolCallsTotal = 0;

      if (useTools && tools.length > 0) {
        // Tool use loop - NEVER GIVE UP UNTIL MAX ITERATIONS
        const maxIter = task.max_tool_iterations || this.config.tool_use?.max_iterations || 5;
        let iterations = 0;

        this._log(`[TOOL LOOP] Starting with max ${maxIter} iterations available - will use ALL if needed`);

        while (iterations < maxIter) {
          try {
            response = await this.client.call(
              modelConfig.cascade,
              messages,
              {
                max_tokens: task.max_tokens || modelConfig.max_tokens,
                temperature: modelConfig.temperature,
                tools
              }
            );
          } catch (callErr) {
            // Check for rate limit and record it
            if (callErr.message.includes('429') || callErr.message.includes('rate')) {
              const currentKeyIndex = this.client.keyIndex % this.client.keys.length;
              this.health.recordRateLimit(`key_${currentKeyIndex}`);
            }
            throw callErr;
          }

          // If no tool calls, LLM is done
          if (!response.tool_calls || response.tool_calls.length === 0) {
            this._log(`[TOOL LOOP] LLM signaled completion at iteration ${iterations}/${maxIter}`);
            break;
          }

          // Execute tool calls
          const assistantMsg = { role: 'assistant', content: response.content || null, tool_calls: response.tool_calls };
          messages.push(assistantMsg);

          for (const toolCall of response.tool_calls) {
            this._log(`[TOOL] ${toolCall.function?.name}(${(toolCall.function?.arguments || '').substring(0, 100)})`);
            const toolResult = await this.toolExecutor.execute(toolCall);
            toolCallsTotal++;

            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult)
            });

            this._log(`[TOOL] ${toolCall.function?.name} → ${toolResult.success ? 'OK' : 'FAIL: ' + toolResult.error}`);

            // Log failures but NEVER give up - LLM will learn from errors
            if (!toolResult.success) {
              this._log(`[RETRY] Tool failed but continuing - ${maxIter - iterations - 1} iterations remaining to fix`);
            }
          }

          iterations++;
          this._log(`[PROGRESS] Iteration ${iterations}/${maxIter} complete, ${toolCallsTotal} total tool calls so far`);
        }

        if (iterations >= maxIter && response.tool_calls?.length > 0) {
          this._log(`[WARN] Reached max iterations (${maxIter}) - making final text-only call`);
          // Make one final call without tools to get text response
          response = await this.client.call(modelConfig.cascade, messages, {
            temperature: modelConfig.temperature
          });
        }
      } else {
        // Standard text-only call (v2 compatible)
        response = await this.client.call(
          modelConfig.cascade,
          messages,
          {
            max_tokens: task.max_tokens || modelConfig.max_tokens,
            temperature: modelConfig.temperature
          }
        );
      }

      const elapsed = Date.now() - startTime;

      // 6. Build result
      const result = {
        task_id: task.id,
        status: 'completed',
        content: response.content,
        model_used: response.model,
        tokens_in: response.tokens_in,
        tokens_out: response.tokens_out,
        tool_calls_total: toolCallsTotal || 0,
        elapsed_ms: elapsed,
        finish_reason: response.finish_reason,
        timestamp: new Date().toISOString()
      };

      // 6. Quality gate validation
      const quality = this.qualityGate.validate(task, result);
      result.quality_score = quality.score;
      result.quality_issues = quality.issues;
      result.quality_passed = quality.passed;

      if (!quality.passed) {
        result.status = 'low_quality';
        this._log(`[WARN] ${task.id} | quality=${quality.score}/10 | issues: ${quality.issues.join('; ')}`);
      }

      // 7. Write result
      this._writeResult(task.id, result);
      this._writeStatus(task.id, quality.passed ? 'completed' : 'low_quality');
      this._log(`[DONE] ${task.id} | ${response.model} | ${response.tokens_in}+${response.tokens_out} tokens | Q:${quality.score}/10 | ${elapsed}ms`);

      // 8. Record metrics
      this.metrics.record(result);

      // 9. Record health metrics
      this.health.recordSuccess({
        model: response.model,
        elapsed_ms: elapsed,
        tokens_in: response.tokens_in,
        tokens_out: response.tokens_out
      });

      return result;

    } catch (err) {
      const elapsed = Date.now() - startTime;
      const result = {
        task_id: task.id,
        status: 'failed',
        error: err.message,
        elapsed_ms: elapsed,
        timestamp: new Date().toISOString()
      };

      this._writeResult(task.id, result);
      this._writeStatus(task.id, 'failed');
      this._log(`[FAIL] ${task.id} | ${err.message} | ${elapsed}ms`);

      // Record error in health metrics
      this.health.recordError(err, { task_id: task.id, task_type: task.task_type });

      return result;
    }
  }

  /**
   * Poll queue directory for pending tasks
   */
  async pollOnce() {
    if (!fs.existsSync(this.queueDir)) return [];

    const files = fs.readdirSync(this.queueDir)
      .filter(f => f.endsWith('.json'))
      .sort(); // Process in order

    const results = [];
    for (const file of files) {
      const filePath = path.join(this.queueDir, file);
      try {
        const taskData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Process task
        const result = await this.processTask(taskData);
        results.push(result);

        // Move to logs (completed)
        const destPath = path.join(this.logsDir, `done-${file}`);
        fs.renameSync(filePath, destPath);

      } catch (err) {
        this._log(`[ERROR] Failed to process ${file}: ${err.message}`);
        // Move to logs (error)
        const destPath = path.join(this.logsDir, `error-${file}`);
        try { fs.renameSync(filePath, destPath); } catch (_) {}
      }
    }

    return results;
  }

  /**
   * Run continuous polling loop
   */
  async startLoop() {
    const interval = this.config.poll_interval_ms || 3000;
    this._log(`[LOOP] Agent Zero v2.0 started | polling every ${interval}ms`);
    this._log(`[LOOP] Queue: ${this.queueDir}`);
    this._log(`[LOOP] Results: ${this.resultsDir}`);

    while (true) {
      try {
        const results = await this.pollOnce();
        if (results.length > 0) {
          this._log(`[LOOP] Processed ${results.length} tasks | Stats: ${JSON.stringify(this.client.getStats())}`);
        }
      } catch (err) {
        this._log(`[LOOP-ERROR] ${err.message}`);
      }

      // Check for stop signal
      const stopFile = path.resolve(this.projectRoot, 'workers', 'agent-zero', '.stop');
      if (fs.existsSync(stopFile)) {
        this._log('[LOOP] Stop signal received. Shutting down.');
        try { fs.unlinkSync(stopFile); } catch (_) {}
        break;
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    this._log(`[LOOP] Final stats: ${JSON.stringify(this.client.getStats())}`);
  }

  _selectModelConfig(taskType) {
    const routing = this.config.task_routing || {};
    const category = routing[taskType] || 'general';
    return this.config.models[category] || this.config.models.general;
  }

  _writeResult(taskId, result) {
    const filePath = path.join(this.resultsDir, `${taskId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
  }

  _writeStatus(taskId, status) {
    const filePath = path.join(this.resultsDir, `${taskId}.status`);
    fs.writeFileSync(filePath, status);
  }

  _log(message) {
    const ts = new Date().toISOString().substring(11, 19);
    const line = `[${ts}] ${message}`;
    console.log(line);

    // Also write to log file
    const logFile = path.join(this.logsDir, `agent-zero-${new Date().toISOString().substring(0, 10)}.log`);
    try {
      fs.appendFileSync(logFile, line + '\n');
    } catch (_) {}
  }
}

module.exports = { TaskRunner };
