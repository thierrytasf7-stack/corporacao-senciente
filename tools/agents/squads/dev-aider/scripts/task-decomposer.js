#!/usr/bin/env node

/**
 * Task Decomposer for Dev-Aider
 *
 * Uses Aider to break stories into atomic, 4k-context-fitting tasks.
 * Validates that each task is independently executable.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TaskDecomposer {
  constructor(options = {}) {
    this.model = options.model || 'arcee-ai/trinity-large-preview:free';
    this.apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
    this.verbose = options.verbose || false;
  }

  /**
   * Build task decomposition prompt
   */
  buildDecompositionPrompt(storyText) {
    const prompt = `Break this story into atomic tasks. Each task must:
1. Reference at most 3 files
2. Have a one-sentence success check (executable command or test)
3. Fit in 4k token context (~500 LOC max)
4. Be independently implementable

Story to decompose:
${storyText}

Output format: Numbered list of tasks with:
- Task name
- Files affected (list)
- Success check (command or test)
- Dependencies (other tasks this depends on)
- Complexity (SIMPLE/STANDARD/COMPLEX)`;

    if (prompt.length > 2000) {
      return prompt.substring(0, 1800) + '\n...truncated';
    }

    return prompt;
  }

  /**
   * Decompose story via Aider
   */
  async decompose(storyText) {
    const prompt = this.buildDecompositionPrompt(storyText);

    return new Promise((resolve, reject) => {
      const tmpFile = path.join(process.cwd(), `.story-${Date.now()}.md`);
      fs.writeFileSync(tmpFile, storyText);

      if (this.verbose) {
        console.log('🔨 Decomposing story into tasks...');
      }

      const aiderArgs = [
        '--model', this.model,
        '--api-key', this.apiKey,
        '--no-auto-commits',
        tmpFile,
        '--message', prompt
      ];

      const aider = spawn('aider', aiderArgs, {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, OPENROUTER_API_KEY: this.apiKey }
      });

      let output = '';
      let stderr = '';

      aider.stdout.on('data', (data) => {
        output += data.toString();
      });

      aider.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      aider.on('close', (code) => {
        try { fs.unlinkSync(tmpFile); } catch (e) {}

        if (code === 0) {
          const tasks = this.extractTasksFromOutput(output);
          const validation = this.validateTasks(tasks);

          resolve({
            success: true,
            tasks,
            validation
          });
        } else {
          reject(new Error(`Aider decomposition failed: ${stderr}`));
        }
      });

      aider.on('error', (err) => {
        try { fs.unlinkSync(tmpFile); } catch (e) {}
        reject(err);
      });
    });
  }

  /**
   * Extract tasks from Aider output
   */
  extractTasksFromOutput(output) {
    // Parse numbered list from output
    const lines = output.split('\n');
    const tasks = [];
    let currentTask = null;

    lines.forEach(line => {
      const match = line.match(/^(\d+)\.\s+(.+)$/);
      if (match) {
        if (currentTask) tasks.push(currentTask);
        currentTask = {
          id: parseInt(match[1]),
          name: match[2],
          files: [],
          successCheck: '',
          dependencies: [],
          complexity: 'STANDARD'
        };
      } else if (currentTask) {
        if (line.includes('Files:')) {
          currentTask.files = line.split(':')[1]?.split(',').map(f => f.trim()) || [];
        }
        if (line.includes('Success:')) {
          currentTask.successCheck = line.split(':')[1]?.trim() || '';
        }
        if (line.includes('Depends:')) {
          currentTask.dependencies = line.split(':')[1]?.split(',').map(d => d.trim()) || [];
        }
        if (line.includes('Complexity:')) {
          currentTask.complexity = line.split(':')[1]?.trim() || 'STANDARD';
        }
      }
    });

    if (currentTask) tasks.push(currentTask);

    return tasks;
  }

  /**
   * Validate that tasks are properly atomic
   */
  validateTasks(tasks) {
    const issues = [];

    tasks.forEach((task, idx) => {
      if (task.files.length > 3) {
        issues.push(`Task ${idx + 1} touches ${task.files.length} files (max 3). Consider splitting.`);
      }
      if (!task.successCheck) {
        issues.push(`Task ${idx + 1} has no success check. Add executable validation.`);
      }
      if (task.complexity === 'COMPLEX') {
        issues.push(`Task ${idx + 1} is COMPLEX. Consider breaking into smaller tasks.`);
      }
    });

    return {
      valid: issues.length === 0,
      issueCount: issues.length,
      issues
    };
  }

  /**
   * Format output as markdown
   */
  formatOutput(tasks, validation) {
    let output = '# Task List\n\n';

    tasks.forEach((task, idx) => {
      output += `## ${idx + 1}. ${task.name}\n`;
      output += `**Files**: ${task.files.join(', ') || 'None'}\n`;
      output += `**Success Check**: ${task.successCheck}\n`;
      output += `**Dependencies**: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}\n`;
      output += `**Complexity**: ${task.complexity}\n\n`;
    });

    if (validation.issues.length > 0) {
      output += '## ⚠️ Validation Issues\n';
      validation.issues.forEach(issue => {
        output += `- ${issue}\n`;
      });
    }

    return output;
  }
}

// CLI Interface
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--story-file') result.storyFile = args[++i];
    if (args[i] === '--story') result.story = args[++i];
    if (args[i] === '--verbose') result.verbose = true;
  }

  return result;
}

async function main() {
  const args = parseArgs();

  if (!args.storyFile && !args.story) {
    console.log(`
Task Decomposer for Dev-Aider

Usage:
  node task-decomposer.js --story-file <path>    Read story from file
  node task-decomposer.js --story "<text>"       Decompose inline story

Example:
  node task-decomposer.js --story-file docs/story.md

Output:
  Generates numbered task list with files, success checks, and dependencies.
`);
    process.exit(1);
  }

  try {
    let storyText = args.story;

    if (args.storyFile) {
      if (!fs.existsSync(args.storyFile)) {
        console.error(`Story file not found: ${args.storyFile}`);
        process.exit(1);
      }
      storyText = fs.readFileSync(args.storyFile, 'utf8');
    }

    const decomposer = new TaskDecomposer({ verbose: args.verbose });
    const result = await decomposer.decompose(storyText);

    console.log(decomposer.formatOutput(result.tasks, result.validation));

    if (!result.validation.valid) {
      console.log('\n⚠️ Warning: Some tasks may not be properly atomic. Review and adjust as needed.');
    }
  } catch (err) {
    console.error('Error decomposing story:', err.message);
    process.exit(1);
  }
}

module.exports = TaskDecomposer;
if (require.main === module) { main().catch(console.error); }
