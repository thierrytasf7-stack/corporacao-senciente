#!/usr/bin/env node

/**
 * Cost Calculator for Dev-Aider Squad
 *
 * Calculates cost-benefit analysis of using Aider vs Claude for tasks.
 * Helps optimize AI development budget and track savings.
 */

class CostCalculator {
  constructor() {
    // OpenRouter pricing (as of 2026-02)
    this.models = {
      'arcee-trinity': {
        name: 'Arcee Trinity 127B',
        input_per_mtok: 0,
        output_per_mtok: 0,
        context_size: 4096,
        quality_score: 8,
        speed_multiplier: 1.0
      },
      'claude-opus': {
        name: 'Claude Opus',
        input_per_mtok: 15,
        output_per_mtok: 60,
        context_size: 200000,
        quality_score: 10,
        speed_multiplier: 0.5 // Faster because better at first try
      },
      'qwen-7b': {
        name: 'Qwen 2.5 7B',
        input_per_mtok: 0,
        output_per_mtok: 0,
        context_size: 8192,
        quality_score: 7,
        speed_multiplier: 1.2
      }
    };

    // Task complexity scoring
    this.complexityScores = {
      'SIMPLE': 1,
      'STANDARD': 5,
      'COMPLEX': 10
    };

    // Task type quality multipliers
    this.taskTypeMultipliers = {
      'implementation': { aider: 0.9, claude: 1.0 }, // Aider is good at impl
      'refactoring': { aider: 0.95, claude: 1.0 },    // Aider excellent at refactoring
      'testing': { aider: 0.85, claude: 1.0 },        // Aider good at tests
      'documentation': { aider: 0.95, claude: 1.0 },  // Aider excellent at docs
      'bug_fix': { aider: 0.75, claude: 1.0 },        // Depends on complexity
      'design': { aider: 0.5, claude: 1.0 },          // Claude much better
      'optimization': { aider: 0.7, claude: 1.0 },    // Claude better
      'architecture': { aider: 0.4, claude: 1.0 }     // Claude much better
    };
  }

  /**
   * Estimate tokens from task description
   */
  estimateTokens(prompt, fileCount = 1, complexity = 'STANDARD') {
    // Base estimation
    let promptTokens = Math.ceil(prompt.length / 4);
    let outputTokens = 0;

    // Add tokens for file context
    promptTokens += fileCount * 500;

    // Estimate output based on complexity
    const complexityScore = this.complexityScores[complexity] || 5;
    outputTokens = 1000 * complexityScore;

    return { promptTokens, outputTokens, totalTokens: promptTokens + outputTokens };
  }

  /**
   * Calculate cost for using a specific model
   */
  calculateCost(modelKey, tokens) {
    const model = this.models[modelKey];
    if (!model) throw new Error(`Unknown model: ${modelKey}`);

    const inputCost = (tokens.promptTokens / 1_000_000) * model.input_per_mtok;
    const outputCost = (tokens.outputTokens / 1_000_000) * model.output_per_mtok;

    return {
      model: model.name,
      input_cost: Math.round(inputCost * 10000) / 10000,
      output_cost: Math.round(outputCost * 10000) / 10000,
      total_cost: Math.round((inputCost + outputCost) * 10000) / 10000
    };
  }

  /**
   * Estimate time to complete task
   */
  estimateTime(complexity, taskType, iterations = 1) {
    const baseTime = {
      'SIMPLE': 1,      // 1 hour
      'STANDARD': 4,    // 4 hours
      'COMPLEX': 8      // 8 hours
    };

    let time = baseTime[complexity] || 4;

    // Adjust for task type
    if (taskType === 'refactoring' || taskType === 'documentation') {
      time *= 0.7; // Faster for these
    } else if (taskType === 'architecture' || taskType === 'design') {
      time *= 1.5; // Slower for these
    }

    // Factor in iterations (revisions)
    time *= iterations;

    return time;
  }

  /**
   * Analyze cost-benefit of Aider vs Claude
   */
  analyzeCostBenefit(taskSpec) {
    const {
      prompt,
      complexity = 'STANDARD',
      taskType = 'implementation',
      fileCount = 1,
      qualityRequired = 8,
      iterations = 1
    } = taskSpec;

    // Estimate tokens
    const tokens = this.estimateTokens(prompt, fileCount, complexity);

    // Calculate costs
    const aiderCost = this.calculateCost('arcee-trinity', tokens);
    const claudeCost = this.calculateCost('claude-opus', tokens);

    // Estimate times (in hours)
    const aiderTime = this.estimateTime(complexity, taskType, iterations);
    const claudeTime = this.estimateTime(complexity, taskType, 0.5); // Claude usually faster

    // Get quality multipliers
    const multipliers = this.taskTypeMultipliers[taskType] || { aider: 0.8, claude: 1.0 };

    // Calculate effective quality
    const aiderQuality = Math.min(10, 10 * multipliers.aider);
    const claudeQuality = 10 * multipliers.claude;

    // Calculate value (quality / cost)
    const aiderValue = aiderCost.total_cost === 0 ? Infinity : aiderQuality / aiderCost.total_cost;
    const claudeValue = claudeQuality / claudeCost.total_cost;

    // Determine recommendation
    let recommendation = 'AIDER';
    let rationale = '';

    if (qualityRequired >= 9 || complexity === 'COMPLEX') {
      recommendation = 'CLAUDE';
      rationale = 'Quality or complexity requirement exceeds Aider capability';
    } else if (aiderValue > claudeValue) {
      recommendation = 'AIDER';
      rationale = `Better value (${aiderValue.toFixed(2)} vs ${claudeValue.toFixed(2)})`;
    } else {
      recommendation = 'AIDER';
      rationale = 'Cost savings justify slight quality trade-off';
    }

    return {
      task: taskSpec.description || 'Unnamed task',
      tokens,
      costs: {
        aider: aiderCost,
        claude: claudeCost,
        savings: Math.round((claudeCost.total_cost - aiderCost.total_cost) * 10000) / 10000
      },
      times: {
        aider: aiderTime,
        claude: claudeTime
      },
      quality: {
        aider: Math.round(aiderQuality * 10) / 10,
        claude: Math.round(claudeQuality * 10) / 10,
        required: qualityRequired
      },
      value: {
        aider: aiderValue === Infinity ? '∞' : Math.round(aiderValue * 100) / 100,
        claude: Math.round(claudeValue * 100) / 100
      },
      recommendation,
      rationale
    };
  }

  /**
   * Calculate monthly budget impact
   */
  calculateMonthlyImpact(taskStats) {
    const {
      totalTasks = 20,
      aiderTasks = 15,
      claudeTasks = 5
    } = taskStats;

    // Average costs per task
    const avgAiderCost = 0; // Always free
    const avgClaudeCost = 10; // Average $10 per complex task

    const aiderTotal = aiderTasks * avgAiderCost;
    const claudeTotal = claudeTasks * avgClaudeCost;
    const allClaudeTotal = totalTasks * avgClaudeCost;

    return {
      monthly: {
        aider_approach: aiderTotal + claudeTotal,
        all_claude: allClaudeTotal,
        savings: allClaudeTotal - (aiderTotal + claudeTotal)
      },
      yearly: {
        aider_approach: (aiderTotal + claudeTotal) * 12,
        all_claude: allClaudeTotal * 12,
        savings: (allClaudeTotal - (aiderTotal + claudeTotal)) * 12
      },
      breakdown: {
        aider_tasks: `${aiderTasks} × $0 = $0`,
        claude_tasks: `${claudeTasks} × $${avgClaudeCost} = $${claudeTotal}`,
        all_claude_tasks: `${totalTasks} × $${avgClaudeCost} = $${allClaudeTotal}`
      }
    };
  }

  /**
   * Generate decision matrix for task types
   */
  getDecisionMatrix() {
    return {
      'SIMPLE + implementation': {
        recommendation: 'AIDER',
        savings: '100%',
        rationale: 'Simple implementation is perfect for Aider'
      },
      'SIMPLE + refactoring': {
        recommendation: 'AIDER',
        savings: '100%',
        rationale: 'Aider excels at refactoring'
      },
      'SIMPLE + testing': {
        recommendation: 'AIDER',
        savings: '100%',
        rationale: 'Good quality at zero cost'
      },
      'STANDARD + implementation': {
        recommendation: 'AIDER',
        savings: '100%',
        rationale: 'Standard implementation is Aiders sweet spot'
      },
      'STANDARD + refactoring': {
        recommendation: 'AIDER',
        savings: '100%',
        rationale: 'Aider is excellent at refactoring'
      },
      'STANDARD + bug_fix': {
        recommendation: 'AIDER',
        savings: '100%',
        rationale: 'Good for moderate-complexity bugs'
      },
      'STANDARD + documentation': {
        recommendation: 'AIDER',
        savings: '100%',
        rationale: 'Aider very good at documentation'
      },
      'COMPLEX + implementation': {
        recommendation: 'CLAUDE',
        savings: '0% (but worth it)',
        rationale: 'Quality matters more than cost for complex tasks'
      },
      'COMPLEX + design': {
        recommendation: 'CLAUDE',
        savings: '0% (necessary)',
        rationale: 'Architecture requires Claude level reasoning'
      },
      'COMPLEX + architecture': {
        recommendation: 'CLAUDE',
        savings: '0% (necessary)',
        rationale: 'System design must use Claude'
      },
      'CRITICAL + security': {
        recommendation: 'CLAUDE',
        savings: '0% (non-negotiable)',
        rationale: 'Security decisions need Claude expertise'
      }
    };
  }

  /**
   * Format analysis for display
   */
  formatAnalysis(analysis) {
    const separator = '═'.repeat(50);

    return `
${separator}
COST-BENEFIT ANALYSIS
${separator}

Task: ${analysis.task}

TOKENS:
  - Input: ${analysis.tokens.promptTokens.toLocaleString()}
  - Output: ${analysis.tokens.outputTokens.toLocaleString()}
  - Total: ${analysis.tokens.totalTokens.toLocaleString()}

COST COMPARISON:
  Aider (FREE):
    - Input: $${analysis.costs.aider.input_cost}
    - Output: $${analysis.costs.aider.output_cost}
    - Total: $${analysis.costs.aider.total_cost}

  Claude Opus:
    - Input: $${analysis.costs.claude.input_cost}
    - Output: $${analysis.costs.claude.output_cost}
    - Total: $${analysis.costs.claude.total_cost}

  💰 SAVINGS: $${analysis.costs.savings} (${Math.round((analysis.costs.savings / analysis.costs.claude.total_cost) * 100)}%)

QUALITY:
  - Aider: ${analysis.quality.aider}/10
  - Claude: ${analysis.quality.claude}/10
  - Required: ${analysis.quality.required}/10

VALUE (Quality ÷ Cost):
  - Aider: ${analysis.value.aider}
  - Claude: ${analysis.value.claude}

TIME ESTIMATE:
  - Aider: ${analysis.times.aider.toFixed(1)} hours
  - Claude: ${analysis.times.claude.toFixed(1)} hours

RECOMMENDATION: ${analysis.recommendation}
Rationale: ${analysis.rationale}

${separator}
    `;
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const calculator = new CostCalculator();

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Cost Calculator for Dev-Aider Squad

Usage: node cost-calculator.js [command] [options]

Commands:
  analyze         Analyze cost-benefit for a task
  monthly         Show monthly budget impact
  matrix          Display decision matrix
  help            Show this help

Examples:
  # Analyze specific task
  node cost-calculator.js analyze \\
    --prompt "Implement user CRUD API" \\
    --complexity STANDARD \\
    --type implementation

  # Show monthly impact
  node cost-calculator.js monthly \\
    --total-tasks 20 \\
    --aider-tasks 15 \\
    --claude-tasks 5

  # Show decision matrix
  node cost-calculator.js matrix
    `);
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case 'analyze': {
      const options = parseArgs(args.slice(1));
      const analysis = calculator.analyzeCostBenefit({
        description: options.description || options.prompt,
        prompt: options.prompt || '',
        complexity: options.complexity || 'STANDARD',
        taskType: options.type || 'implementation',
        fileCount: parseInt(options.files) || 1,
        qualityRequired: parseInt(options.quality) || 8,
        iterations: parseInt(options.iterations) || 1
      });

      console.log(calculator.formatAnalysis(analysis));
      break;
    }

    case 'monthly': {
      const options = parseArgs(args.slice(1));
      const impact = calculator.calculateMonthlyImpact({
        totalTasks: parseInt(options['total-tasks']) || 20,
        aiderTasks: parseInt(options['aider-tasks']) || 15,
        claudeTasks: parseInt(options['claude-tasks']) || 5
      });

      console.log(`
═══════════════════════════════════════════════════
MONTHLY BUDGET IMPACT
═══════════════════════════════════════════════════

Approach 1: All Claude
  ${impact.breakdown.all_claude_tasks}
  Monthly: $${impact.monthly.all_claude}
  Yearly: $${impact.yearly.all_claude}

Approach 2: Dev-Aider Mix
  ${impact.breakdown.aider_tasks}
  ${impact.breakdown.claude_tasks}
  Monthly: $${impact.monthly.aider_approach}
  Yearly: $${impact.yearly.aider_approach}

💰 ANNUAL SAVINGS: $${impact.yearly.savings}

═══════════════════════════════════════════════════
      `);
      break;
    }

    case 'matrix': {
      const matrix = calculator.getDecisionMatrix();
      console.log('\n📊 DECISION MATRIX\n');

      Object.entries(matrix).forEach(([key, value]) => {
        console.log(`${key.padEnd(35)} → ${value.recommendation.padEnd(8)} (${value.savings.padEnd(8)}) - ${value.rationale}`);
      });

      console.log('');
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      options[key] = args[++i] || '';
    }
  }

  return options;
}

// Export for use as module
module.exports = CostCalculator;

// Run CLI if executed directly
if (require.main === module) {
  main().catch(console.error);
}
