/**
 * Task Splitter - Auto-divide complex tasks into manageable sub-batches
 * v1.0 - Feb 14, 2026
 */

class TaskSplitter {
  constructor(config) {
    this.config = config.task_splitting || {
      enabled: true,
      thresholds: {
        f_score_max: 3,
        max_files_per_task: 5,
        max_tool_iterations: 15,
        max_lines_per_file: 200
      },
      strategy: 'horizontal'
    };
  }

  /**
   * Analisa task e determina se deve ser dividida
   * @param {Object} task - Task definition
   * @returns {Object} { shouldSplit: boolean, reason: string, complexity: number }
   */
  shouldSplit(task) {
    if (!this.config.enabled) {
      return { shouldSplit: false, reason: 'Task splitting disabled' };
    }

    const analysis = {
      shouldSplit: false,
      reason: '',
      complexity: 0,
      metrics: {}
    };

    // 1. Check F-score (complexity rating)
    if (task.f_score && task.f_score > this.config.thresholds.f_score_max) {
      analysis.shouldSplit = true;
      analysis.reason = `F-score ${task.f_score} > ${this.config.thresholds.f_score_max} (high complexity)`;
      analysis.complexity = task.f_score;
      analysis.metrics.f_score = task.f_score;
    }

    // 2. Count files to create (estimate from prompt)
    const fileCount = this._estimateFileCount(task.prompt);
    if (fileCount > this.config.thresholds.max_files_per_task) {
      analysis.shouldSplit = true;
      analysis.reason = `Estimated ${fileCount} files > ${this.config.thresholds.max_files_per_task} max`;
      analysis.complexity = Math.max(analysis.complexity, Math.ceil(fileCount / this.config.thresholds.max_files_per_task));
      analysis.metrics.file_count = fileCount;
    }

    // 3. Check max tool iterations
    if (task.max_tool_iterations && task.max_tool_iterations > this.config.thresholds.max_tool_iterations) {
      analysis.shouldSplit = true;
      analysis.reason = `Max iterations ${task.max_tool_iterations} > ${this.config.thresholds.max_tool_iterations}`;
      analysis.complexity = Math.max(analysis.complexity, 3);
      analysis.metrics.max_iterations = task.max_tool_iterations;
    }

    // 4. Detect multi-step workflows (multiple EXECUTE sections)
    const steps = this._countExecutionSteps(task.prompt);
    if (steps > 4) {
      analysis.shouldSplit = true;
      analysis.reason = `${steps} execution steps > 4 max`;
      analysis.complexity = Math.max(analysis.complexity, Math.ceil(steps / 4));
      analysis.metrics.steps = steps;
    }

    return analysis;
  }

  /**
   * Divide task em sub-batches menores
   * @param {Object} task - Task original
   * @param {number} numBatches - Número de batches (default: auto)
   * @returns {Array} Array de sub-tasks
   */
  split(task, numBatches = null) {
    const analysis = this.shouldSplit(task);

    if (!analysis.shouldSplit) {
      return [task]; // Não precisa dividir
    }

    const batchCount = numBatches || Math.min(analysis.complexity, 5); // Max 5 batches
    const subtasks = [];

    if (this.config.strategy === 'horizontal') {
      // Horizontal: divide por etapas sequenciais
      subtasks.push(...this._splitHorizontal(task, batchCount));
    } else {
      // Vertical: divide por componentes paralelos
      subtasks.push(...this._splitVertical(task, batchCount));
    }

    return subtasks;
  }

  /**
   * Split horizontal (por etapas sequenciais)
   * Exemplo: Setup → Config → Implementation → Testing
   */
  _splitHorizontal(task, numBatches) {
    const subtasks = [];
    const prompt = task.prompt;

    // Parse EXECUTE sections
    const executeMatch = prompt.match(/EXECUTE:\n([\s\S]+?)(?:\n\nACCEPTANCE|$)/);
    if (!executeMatch) {
      // Fallback: split by numbered steps
      return this._splitBySteps(task, numBatches);
    }

    const steps = executeMatch[1]
      .split(/\n\d+\./)
      .filter(s => s.trim())
      .map(s => s.trim());

    const stepsPerBatch = Math.ceil(steps.length / numBatches);

    for (let i = 0; i < numBatches; i++) {
      const batchSteps = steps.slice(i * stepsPerBatch, (i + 1) * stepsPerBatch);
      if (batchSteps.length === 0) break;

      const subtask = {
        ...task,
        id: `${task.id || 'task'}-batch-${i + 1}`,
        prompt: this._rebuildPrompt(task, batchSteps, i + 1, numBatches),
        max_tool_iterations: Math.ceil((task.max_tool_iterations || 20) / numBatches),
        dependencies: i === 0 ? task.dependencies : [`${task.id}-batch-${i}`],
        _batch_info: {
          batch_num: i + 1,
          total_batches: numBatches,
          parent_task: task.id
        }
      };

      subtasks.push(subtask);
    }

    return subtasks;
  }

  /**
   * Split vertical (por componentes paralelos)
   * Exemplo: Component A | Component B | Component C (podem rodar em paralelo)
   */
  _splitVertical(task, numBatches) {
    // TODO: Implementar split por componentes paralelos
    // Por ora, usar horizontal como fallback
    return this._splitHorizontal(task, numBatches);
  }

  /**
   * Split por numbered steps (1., 2., 3.)
   * PRESERVA todo contexto: Standards, Deliverables, etc.
   * CAPTURA sub-items multi-line (indentação, bullets)
   */
  _splitBySteps(task, numBatches) {
    // Extract full steps with sub-items (multi-line)
    const steps = this._extractFullSteps(task.prompt);
    if (steps.length === 0) {
      return [task]; // Não consegue dividir
    }

    const stepsPerBatch = Math.ceil(steps.length / numBatches);
    const subtasks = [];

    // Parse sections: everything before first step, and everything after last step
    const firstStepMatch = task.prompt.match(/\n(\d+\.\s)/);
    const firstStepIndex = firstStepMatch ? task.prompt.indexOf(firstStepMatch[0]) : -1;

    const beforeSteps = firstStepIndex >= 0 ? task.prompt.substring(0, firstStepIndex) : '';

    // Find where steps end (usually before "Standards:", "Deliverables:", or "acceptance_criteria")
    const afterStepsMatch = task.prompt.match(/\n(Standards:|Deliverables:|acceptance_criteria)/);
    const afterStepsIndex = afterStepsMatch ? task.prompt.indexOf(afterStepsMatch[0]) : task.prompt.length;
    const afterSteps = task.prompt.substring(afterStepsIndex);

    for (let i = 0; i < numBatches; i++) {
      const batchSteps = steps.slice(i * stepsPerBatch, (i + 1) * stepsPerBatch);
      if (batchSteps.length === 0) break;

      // Build prompt preserving ALL context
      const rebuiltPrompt = `${beforeSteps}

[BATCH ${i + 1}/${numBatches} - Execute these specific steps]

Tasks (this batch):
${batchSteps.join('\n\n')}

${afterSteps}`.trim();

      const subtask = {
        ...task,
        id: `${task.id || 'task'}-batch-${i + 1}`,
        prompt: rebuiltPrompt,
        max_tool_iterations: task.max_tool_iterations || 15, // Keep full iterations per batch
        dependencies: i === 0 ? task.dependencies : [`${task.id}-batch-${i}`]
      };

      subtasks.push(subtask);
    }

    return subtasks;
  }

  /**
   * Extract full multi-line steps including sub-items
   * Example:
   *   1. Cria X.tsx com:
   *      - Item A
   *      - Item B
   * Returns: ["1. Cria X.tsx com:\n   - Item A\n   - Item B"]
   */
  _extractFullSteps(prompt) {
    const lines = prompt.split('\n');
    const steps = [];
    let currentStep = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line is a numbered step (1., 2., etc.)
      const stepMatch = line.match(/^(\d+)\.\s+(.+)$/);

      if (stepMatch) {
        // Save previous step if exists
        if (currentStep) {
          steps.push(currentStep.content.join('\n'));
        }

        // Start new step
        currentStep = {
          number: parseInt(stepMatch[1]),
          content: [line]
        };
      } else if (currentStep && line.match(/^\s+[-•*]|\s{2,}/)) {
        // Line is indented or has bullet → part of current step
        currentStep.content.push(line);
      } else if (currentStep && line.trim() === '') {
        // Empty line → might be part of step (preserve)
        currentStep.content.push(line);
      } else if (currentStep && !line.match(/^(Standards:|Deliverables:|acceptance_criteria|Context:|Tasks:)/)) {
        // Continuation line (not a new section)
        currentStep.content.push(line);
      } else if (currentStep) {
        // Hit a new section → end current step
        steps.push(currentStep.content.join('\n'));
        currentStep = null;
      }
    }

    // Save last step
    if (currentStep) {
      steps.push(currentStep.content.join('\n'));
    }

    return steps;
  }

  /**
   * Reconstrói prompt para sub-batch
   */
  _rebuildPrompt(task, steps, batchNum, totalBatches) {
    const intro = task.prompt.split(/EXECUTE:/)[0].trim();
    const acceptanceCriteria = task.prompt.match(/ACCEPTANCE CRITERIA:[\s\S]+$/)?.[0] || '';

    return `${intro}\n\n[BATCH ${batchNum}/${totalBatches}]\n\nEXECUTE:\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${acceptanceCriteria}`;
  }

  /**
   * Estima número de arquivos a criar pelo prompt
   */
  _estimateFileCount(prompt) {
    // Count patterns: "Cria X.tsx", "Implementa Y.ts", "src/path/file.js"
    const filePatterns = [
      /cria\s+[\w/-]+\.(tsx?|jsx?|css|json|md)/gi,
      /implementa\s+[\w/-]+\.(tsx?|jsx?|css|json|md)/gi,
      /src\/[\w/-]+\.(tsx?|jsx?|css|json|md)/gi,
      /pages\/[\w/-]+\.(tsx?|jsx?)/gi,
      /components\/[\w/-]+\.(tsx?|jsx?)/gi
    ];

    let count = 0;
    for (const pattern of filePatterns) {
      const matches = prompt.match(pattern) || [];
      count += matches.length;
    }

    return count;
  }

  /**
   * Conta steps de execução (numbered 1., 2., 3. ou EXECUTE sections)
   */
  _countExecutionSteps(prompt) {
    const numberedSteps = prompt.match(/^\d+\.\s+/gm) || [];
    const executeBlocks = prompt.match(/EXECUTE:/gi) || [];
    return Math.max(numberedSteps.length, executeBlocks.length);
  }
}

module.exports = TaskSplitter;
