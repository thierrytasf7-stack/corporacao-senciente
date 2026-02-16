#!/usr/bin/env node

/**
 * AIDER-AIOS Invocation Wrapper
 *
 * Bridges Claude AIOS and AIDER-AIOS, allowing cost-optimized development.
 * Executes AIDER-AIOS as a subprocess with optimized prompts for free models.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class AiderInvoker {
  constructor(options = {}) {
    this.aiderAiosPath = options.aiderAiosPath || path.resolve(__dirname, '../../../AIDER-AIOS/aios-core');
    this.model = options.model || 'arcee-ai/trinity-large-preview:free';
    this.fallbackModel = options.fallbackModel || 'qwen/qwen2.5-7b-instruct:free';
    this.apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
    this.verbose = options.verbose || false;
  }

  /**
   * Validate environment and prerequisites
   */
  validateEnvironment() {
    const errors = [];

    // Check AIDER-AIOS path
    if (!fs.existsSync(this.aiderAiosPath)) {
      errors.push(`AIDER-AIOS not found at: ${this.aiderAiosPath}`);
    }

    // Check API key
    if (!this.apiKey) {
      errors.push('OPENROUTER_API_KEY environment variable not set');
    }

    // Check Aider installed
    try {
      execSync('aider --version', { stdio: 'pipe' });
    } catch (e) {
      errors.push('Aider not installed or not on PATH. Run: pip install aider-chat');
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors
      };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Optimize prompt for limited context (4k tokens)
   */
  optimizePrompt(originalPrompt, context = {}) {
    let optimized = originalPrompt;

    // Rule 1: Limit length (4k context is tight)
    if (optimized.length > 2000) {
      optimized = optimized.substring(0, 1800) + '...';
      console.warn('⚠️  Prompt truncated (too long for 4k context)');
    }

    // Rule 2: Add example if not present
    if (!optimized.includes('Example') && !optimized.includes('example')) {
      if (context.exampleCode) {
        optimized += `\n\nExample:\n${context.exampleCode}`;
      }
    }

    // Rule 3: Add specific line numbers if file provided
    if (context.targetFile && context.lineRange) {
      optimized = `In ${context.targetFile} lines ${context.lineRange}:\n${optimized}`;
    }

    // Rule 4: Add success criteria
    if (!optimized.includes('should') && !optimized.includes('must')) {
      optimized += '\n\nSuccess criteria:\n- Code follows existing patterns\n- No syntax errors\n- Handles errors appropriately';
    }

    return optimized;
  }

  /**
   * Execute AIDER-AIOS subprocess
   */
  async invoke(taskSpec) {
    const validation = this.validateEnvironment();
    if (!validation.valid) {
      throw new Error(`Environment validation failed:\n${validation.errors.join('\n')}`);
    }

    const {
      files = [],
      prompt = '',
      mode = 'auto-commit',
      contextFiles = [],
      explanation = ''
    } = taskSpec;

    if (!files.length) {
      throw new Error('No files specified for Aider to edit');
    }

    if (!prompt) {
      throw new Error('No prompt provided for Aider');
    }

    // Optimize prompt
    const optimizedPrompt = this.optimizePrompt(prompt, {
      targetFile: files[0],
      exampleCode: contextFiles.length > 0 ? fs.readFileSync(contextFiles[0], 'utf8').substring(0, 500) : null
    });

    // Build Aider command
    const aiderArgs = [
      '--model', this.model,
      '--api-key', this.apiKey,
      ...(mode !== 'auto-commit' ? ['--no-auto-commits'] : []),
      ...files,
      '--message', optimizedPrompt
    ];

    if (this.verbose) {
      console.log('📋 Aider Command:');
      console.log(`aider ${aiderArgs.join(' ')}`);
      console.log('');
    }

    return new Promise((resolve, reject) => {
      const aider = spawn('aider', aiderArgs, {
        cwd: this.aiderAiosPath,
        stdio: 'inherit',
        env: { ...process.env, OPENROUTER_API_KEY: this.apiKey }
      });

      aider.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            code,
            model: this.model,
            files,
            prompt: optimizedPrompt
          });
        } else {
          reject(new Error(`Aider exited with code ${code}`));
        }
      });

      aider.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Generate cost report
   */
  async generateCostReport(taskSpec, execution) {
    const estimatedClaudeCost = this.estimateClaudeCost(taskSpec);

    const report = {
      timestamp: new Date().toISOString(),
      task: taskSpec.description || 'Unnamed task',
      model: execution.model,
      cost: {
        aider: 0,
        claude_equivalent: estimatedClaudeCost,
        savings: estimatedClaudeCost
      },
      files: execution.files,
      prompt_length: execution.prompt?.length || 0,
      status: 'completed'
    };

    return report;
  }

  /**
   * Estimate equivalent Claude cost
   */
  estimateClaudeCost(taskSpec) {
    const promptLength = (taskSpec.prompt || '').length;
    const fileCount = (taskSpec.files || []).length;

    // Rough estimation: 1k tokens ≈ $0.01 (Claude Opus)
    const estimatedTokens = Math.ceil(promptLength / 4) + (fileCount * 500);
    const inputCost = estimatedTokens * 0.000015; // $15 per million tokens
    const outputCost = estimatedTokens * 0.00006; // $60 per million tokens

    return Math.round((inputCost + outputCost) * 100) / 100;
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
AIDER-AIOS Invocation Wrapper

Usage: node aider-invoke.js [options]

Options:
  --files FILE1,FILE2,...    Files to edit (required)
  --prompt "Your prompt"     Task prompt (required)
  --mode auto-commit|manual  Commit mode (default: auto-commit)
  --description "Task name"  Task description
  --verbose                  Show detailed output
  --help                     Show this help

Environment:
  OPENROUTER_API_KEY        Your OpenRouter API key (required)

Example:
  node aider-invoke.js \\
    --files src/api.js,src/auth.js \\
    --prompt "Add JWT validation to auth module" \\
    --description "JWT implementation" \\
    --verbose
    `);
    process.exit(0);
  }

  const options = parseArgs(args);

  const invoker = new AiderInvoker({
    verbose: options.verbose
  });

  try {
    console.log('🚀 AIDER-AIOS Invocation Started');
    console.log('');

    // Validate environment
    const validation = invoker.validateEnvironment();
    if (!validation.valid) {
      console.error('❌ Environment Validation Failed:');
      validation.errors.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }
    console.log('✓ Environment validated');
    console.log(`  - Model: ${invoker.model}`);
    console.log(`  - API Key: ${invoker.apiKey ? '***' + invoker.apiKey.slice(-4) : 'NOT SET'}`);
    console.log('');

    // Invoke Aider
    console.log('📝 Invoking AIDER-AIOS...');
    const result = await invoker.invoke({
      files: options.files,
      prompt: options.prompt,
      mode: options.mode,
      description: options.description
    });

    console.log('');
    console.log('✅ Execution Completed');

    // Generate cost report
    const report = await invoker.generateCostReport(options, result);
    console.log('');
    console.log('💰 Cost Report:');
    console.log(`  - Aider Cost: $0 (FREE!)`);
    console.log(`  - Claude Equivalent: $${report.cost.claude_equivalent}`);
    console.log(`  - Total Savings: $${report.cost.savings}`);
    console.log('');

    // Save report
    const reportPath = path.join(process.cwd(), `aider-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved: ${reportPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    files: [],
    prompt: '',
    mode: 'auto-commit',
    description: '',
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--files':
        options.files = (args[++i] || '').split(',').map(f => f.trim()).filter(Boolean);
        break;
      case '--prompt':
        options.prompt = args[++i] || '';
        break;
      case '--mode':
        options.mode = args[++i] || 'auto-commit';
        break;
      case '--description':
        options.description = args[++i] || '';
        break;
      case '--verbose':
        options.verbose = true;
        break;
    }
  }

  return options;
}

// Export for use as module
module.exports = AiderInvoker;

// Run CLI if executed directly
if (require.main === module) {
  main().catch(console.error);
}
