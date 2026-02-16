#!/usr/bin/env node

/**
 * Model Selector for Dev-Aider
 *
 * Chooses the optimal free AI model based on estimated context size.
 * Implements fallback chain: Trinity (4k) → Qwen (8k) → DeepSeek (4k, emergency).
 */

class ModelSelector {
  constructor() {
    this.models = {
      'arcee-trinity': {
        id: 'arcee-ai/trinity-large-preview:free',
        name: 'Arcee Trinity 127B',
        contextSize: 4096,
        quality: { code: 8, reasoning: 6 },
        cost: 0,
        description: 'Best quality, perfect for most tasks'
      },
      'qwen-7b': {
        id: 'qwen/qwen2.5-7b-instruct:free',
        name: 'Qwen 2.5 7B',
        contextSize: 8192,
        quality: { code: 7, reasoning: 5 },
        cost: 0,
        description: 'Larger context, acceptable quality'
      },
      'deepseek-r1': {
        id: 'deepseek/deepseek-r1-distill-qwen-1.5b:free',
        name: 'DeepSeek R1 1.5B Distill',
        contextSize: 4096,
        quality: { code: 6, reasoning: 6 },
        cost: 0,
        description: 'Emergency fallback only'
      }
    };

    this.fallbackChain = {
      'arcee-trinity': ['qwen-7b', 'deepseek-r1'],
      'qwen-7b': ['deepseek-r1'],
      'deepseek-r1': []
    };
  }

  /**
   * Estimate context needed for a task
   * Formula: prompt_chars/4 + file_lines*50 + num_files*200
   */
  estimateContextNeeded(prompt, fileCount = 1, totalLines = 100) {
    const promptTokens = Math.ceil(prompt.length / 4);
    const fileTokens = Math.ceil(totalLines * 50 / 1000);
    const fileCountTokens = fileCount * 200;

    return promptTokens + fileTokens + fileCountTokens;
  }

  /**
   * Select model based on context needed
   */
  selectModel(contextNeeded) {
    if (contextNeeded <= 4000) {
      return {
        selected: 'arcee-trinity',
        model: this.models['arcee-trinity'],
        reason: 'Context fits in 4k, using best quality model'
      };
    } else if (contextNeeded <= 8000) {
      return {
        selected: 'qwen-7b',
        model: this.models['qwen-7b'],
        reason: 'Context requires 8k window, using Qwen fallback'
      };
    } else if (contextNeeded <= 12000) {
      return {
        selected: 'deepseek-r1',
        model: this.models['deepseek-r1'],
        reason: 'Context large, using emergency fallback (quality will be lower)'
      };
    } else {
      return {
        selected: null,
        model: null,
        reason: `Context too large (${contextNeeded} tokens). Exceeds all free models. Escalate to Claude or split task.`
      };
    }
  }

  /**
   * Get fallback chain for a model
   */
  getFallbackChain(modelId) {
    const fallbacks = this.fallbackChain[modelId] || [];
    return fallbacks.map(id => this.models[id]);
  }

  /**
   * Get full model information
   */
  getModelInfo(modelId) {
    return this.models[modelId] || null;
  }

  /**
   * Get all models
   */
  getAllModels() {
    return this.models;
  }

  /**
   * Format recommendation as human-readable string
   */
  formatRecommendation(contextNeeded) {
    const selection = this.selectModel(contextNeeded);

    if (!selection.model) {
      return `❌ ESCALATE: ${selection.reason}`;
    }

    return `✅ Recommended: ${selection.model.name}
Context needed: ${contextNeeded} tokens
Model context: ${selection.model.contextSize} tokens
Quality: Code ${selection.model.quality.code}/10, Reasoning ${selection.model.quality.reasoning}/10
Cost: FREE (${selection.model.cost === 0 ? 'no charge' : '$' + selection.model.cost})
Reason: ${selection.reason}`;
  }

  /**
   * Format all models as table
   */
  formatTable() {
    let table = 'Available Free Models:\n';
    table += '='.repeat(80) + '\n';
    table += '| Model | Context | Code Quality | Reasoning | Cost |\n';
    table += '|-------|---------|------|-----------|------|\n';

    Object.values(this.models).forEach(m => {
      table += `| ${m.name.padEnd(25)} | ${m.contextSize}k | ${m.quality.code}/10 | ${m.quality.reasoning}/10 | FREE |\n`;
    });

    table += '='.repeat(80) + '\n';
    return table;
  }
}

// CLI Interface
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    command: args[0] || 'help',
    context: parseInt(args[1] || 0) || null,
    option: args[1]
  };
}

async function main() {
  const { command, context, option } = parseArgs();
  const selector = new ModelSelector();

  switch (command) {
    case 'select':
      if (!context) {
        console.error('Usage: node model-selector.js select --context <tokens>');
        process.exit(1);
      }
      console.log(selector.formatRecommendation(context));
      break;

    case 'estimate':
      // node model-selector.js estimate --prompt "..." --files 2 --lines 500
      const prompt = option || 'default prompt';
      console.log(`Estimated context: ${selector.estimateContextNeeded(prompt, 2, 500)} tokens`);
      console.log(selector.formatRecommendation(selector.estimateContextNeeded(prompt, 2, 500)));
      break;

    case 'table':
    case 'list':
      console.log(selector.formatTable());
      break;

    case 'fallback':
      if (!option) {
        console.error('Usage: node model-selector.js fallback <model-id>');
        process.exit(1);
      }
      const chain = selector.getFallbackChain(option);
      console.log(`Fallback chain for ${option}:`);
      chain.forEach((m, idx) => console.log(`  ${idx + 1}. ${m.name}`));
      break;

    case 'help':
    default:
      console.log(`
Model Selector for Dev-Aider

Usage:
  node model-selector.js select --context <tokens>     Select model for context size
  node model-selector.js estimate --prompt "..." --files 2 --lines 500   Estimate context
  node model-selector.js table                          Show all models
  node model-selector.js fallback <model-id>            Show fallback chain
  node model-selector.js help                           Show this help

Examples:
  node model-selector.js select --context 3000         → Uses Trinity (best quality)
  node model-selector.js select --context 6000         → Uses Qwen (larger context)
  node model-selector.js select --context 15000        → Escalate to Claude
`);
      break;
  }
}

module.exports = ModelSelector;
if (require.main === module) { main().catch(console.error); }
