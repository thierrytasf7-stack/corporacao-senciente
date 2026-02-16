#!/usr/bin/env node

/**
 * Story Generator for Dev-Aider
 *
 * Uses Aider subprocess to generate complete user stories from requirements.
 * Optimizes prompts for free models' 4k context window.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class StoryGenerator {
  constructor(options = {}) {
    this.model = options.model || 'arcee-ai/trinity-large-preview:free';
    this.apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
    this.verbose = options.verbose || false;
  }

  /**
   * Build story generation prompt
   */
  buildStoryPrompt(inputs) {
    const { featureName, userPersona, valueStatement } = inputs;

    const prompt = `Generate a user story using this template:

# Story: ${featureName}

## User Persona
${userPersona}

## Value Delivered
${valueStatement}

## Acceptance Criteria
- List specific, testable criteria

## Files Affected
- List expected file changes (max 5 files)

## Complexity
SIMPLE | STANDARD | COMPLEX

## Notes
- Any special considerations
- Known risks or dependencies

Format the response as proper Markdown. Be concise and specific.`;

    // Truncate if needed (4k context = ~3000 words)
    if (prompt.length > 2000) {
      return prompt.substring(0, 1800) + '\n...truncated';
    }

    return prompt;
  }

  /**
   * Generate story via Aider subprocess
   */
  async generateStory(inputs) {
    const prompt = this.buildStoryPrompt(inputs);

    return new Promise((resolve, reject) => {
      // Create a temporary file to hold the prompt
      const tmpFile = path.join(process.cwd(), `.story-prompt-${Date.now()}.md`);
      fs.writeFileSync(tmpFile, '# Story Generation Prompt\n\n' + prompt);

      if (this.verbose) {
        console.log('📝 Generating story...');
        console.log('Prompt:\n', prompt);
      }

      const aiderArgs = [
        '--model', this.model,
        '--api-key', this.apiKey,
        '--no-auto-commits',
        tmpFile,
        '--message', 'Generate a complete user story based on the requirements provided in this file.'
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
        // Clean up temp file
        try { fs.unlinkSync(tmpFile); } catch (e) {}

        if (code === 0) {
          // Extract story from output
          const story = this.extractStoryFromOutput(output);
          resolve({
            success: true,
            story,
            code
          });
        } else {
          reject(new Error(`Aider subprocess failed with code ${code}:\n${stderr}`));
        }
      });

      aider.on('error', (err) => {
        try { fs.unlinkSync(tmpFile); } catch (e) {}
        reject(err);
      });
    });
  }

  /**
   * Extract story content from Aider output
   */
  extractStoryFromOutput(output) {
    // Aider modifies the file in-place. Try to extract story markdown.
    // For now, return the output as-is
    return output || 'Story generated but output unclear. Please review the modified file.';
  }

  /**
   * Format story output
   */
  formatOutput(storyText, inputs) {
    return `# Story: ${inputs.featureName}

Generated: ${new Date().toISOString()}

${storyText}

---
*Generated via Aider + Trinity 127B (Free Model)*`;
  }
}

// CLI Interface
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--feature') result.featureName = args[++i];
    if (args[i] === '--persona') result.userPersona = args[++i];
    if (args[i] === '--value') result.valueStatement = args[++i];
    if (args[i] === '--verbose') result.verbose = true;
  }

  return result;
}

async function main() {
  const args = parseArgs();

  if (!args.featureName || !args.userPersona || !args.valueStatement) {
    console.log(`
Story Generator for Dev-Aider

Usage:
  node story-generator.js --feature "Feature Name" --persona "User Persona" --value "Value Statement"

Example:
  node story-generator.js \\
    --feature "Add JWT Token Refresh" \\
    --persona "Backend API user needing token expiry handling" \\
    --value "Enable long-lived sessions without re-authenticating frequently"

Options:
  --feature <name>    Feature name
  --persona <desc>    User persona
  --value <stmt>      Value statement delivered
  --verbose           Show detailed output

Output:
  Generates a complete user story markdown with acceptance criteria, files affected, and complexity assessment.
`);
    process.exit(1);
  }

  try {
    const generator = new StoryGenerator({ verbose: args.verbose });
    const result = await generator.generateStory(args);

    if (result.success) {
      console.log(generator.formatOutput(result.story, args));
    }
  } catch (err) {
    console.error('Error generating story:', err.message);
    process.exit(1);
  }
}

module.exports = StoryGenerator;
if (require.main === module) { main().catch(console.error); }
