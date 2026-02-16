/**
 * Agent Zero v3.0 - Tool Executor
 * Executes tool calls from LLM function calling responses.
 * Each tool is a self-contained module in ./tools/
 */
const path = require('path');
const fs = require('fs');

const TOOLS_DIR = path.join(__dirname, 'tools');

class ToolExecutor {
  constructor(config) {
    this.config = config?.tool_use || {};
    this.tools = {};
    this.projectRoot = path.resolve(__dirname, '..', '..', '..');
    this._loadTools();
  }

  _loadTools() {
    const enabledTools = this.config.tools_enabled || [];
    const indexPath = path.join(TOOLS_DIR, 'index.js');

    if (fs.existsSync(indexPath)) {
      const registry = require(indexPath);
      for (const [name, ToolClass] of Object.entries(registry)) {
        if (enabledTools.length === 0 || enabledTools.includes(name)) {
          this.tools[name] = new ToolClass(this.config, this.projectRoot);
        }
      }
    }
  }

  /**
   * Get OpenAI-compatible tool definitions for the LLM
   * @param {object} task - Task object (to filter relevant tools)
   * @returns {Array} tool definitions
   */
  getToolDefinitions(task) {
    const requested = task?.tools_required || [];
    const definitions = [];

    for (const [name, tool] of Object.entries(this.tools)) {
      if (requested.length === 0 || requested.includes(name)) {
        definitions.push({
          type: 'function',
          function: tool.definition()
        });
      }
    }

    return definitions;
  }

  /**
   * Execute a single tool call
   * @param {object} toolCall - { id, function: { name, arguments } }
   * @returns {object} { success, data/error }
   */
  async execute(toolCall) {
    const fnName = toolCall.function?.name;
    const rawArgs = toolCall.function?.arguments;

    if (!fnName) {
      return { success: false, error: 'No function name in tool call' };
    }

    const tool = this.tools[fnName];
    if (!tool) {
      return { success: false, error: `Unknown tool: ${fnName}` };
    }

    let args;
    try {
      args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs || {};
    } catch (e) {
      return { success: false, error: `Invalid arguments JSON: ${e.message}` };
    }

    const timeout = this.config.timeouts?.[fnName] || 30000;

    try {
      const result = await Promise.race([
        tool.execute(args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Tool timeout: ${timeout}ms`)), timeout)
        )
      ]);

      // Truncate large outputs
      const maxChars = this.config.security?.max_output_chars || 10000;
      if (result.data && typeof result.data === 'string' && result.data.length > maxChars) {
        result.data = result.data.substring(0, maxChars) + '\n[...truncated]';
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Check if a task needs tool use
   * Auto-detects based on task_type and prompt keywords if tools_required not specified
   */
  needsTools(task) {
    // Explicit tools_required takes priority
    if (Array.isArray(task?.tools_required) && task.tools_required.length > 0) {
      return true;
    }

    // Auto-detect: implement tasks ALWAYS need tools
    if (task.task_type === 'implement') {
      return true;
    }

    // Auto-detect: keywords in prompt that indicate file operations
    const prompt = (task.prompt || '').toLowerCase();
    const fileKeywords = ['cria arquivo', 'cria diretório', 'modifica', 'implementa', 'adiciona rota'];
    const commandKeywords = ['npm install', 'git', 'executa'];

    if (fileKeywords.some(kw => prompt.includes(kw)) || commandKeywords.some(kw => prompt.includes(kw))) {
      return true;
    }

    return false;
  }

  getLoadedTools() {
    return Object.keys(this.tools);
  }
}

module.exports = { ToolExecutor };
