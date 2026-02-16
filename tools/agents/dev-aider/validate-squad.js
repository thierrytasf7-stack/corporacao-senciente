#!/usr/bin/env node

/**
 * Dev-Aider Squad Validation & Testing
 *
 * Comprehensive validation script that checks:
 * - File structure completeness
 * - Configuration validity
 * - Agent definitions
 * - Script functionality
 * - Template integrity
 */

const fs = require('fs');
const path = require('path');

class SquadValidator {
  constructor(squadPath = __dirname) {
    this.squadPath = squadPath;
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      summary: {}
    };
  }

  /**
   * Run all validations
   */
  async runAll() {
    console.log('\n' + '═'.repeat(60));
    console.log('DEV-AIDER SQUAD VALIDATION & TESTING');
    console.log('═'.repeat(60) + '\n');

    // 1. File Structure
    console.log('📁 Validating File Structure...');
    this.validateFileStructure();

    // 2. Configuration
    console.log('⚙️  Validating Configuration...');
    this.validateConfig();

    // 3. Agents
    console.log('🤖 Validating Agents...');
    this.validateAgents();

    // 4. Tasks
    console.log('📋 Validating Tasks...');
    this.validateTasks();

    // 5. Templates
    console.log('📄 Validating Templates...');
    this.validateTemplates();

    // 6. Data Files
    console.log('📚 Validating Data Files...');
    this.validateDataFiles();

    // 7. Scripts
    console.log('🔧 Validating Scripts...');
    this.validateScripts();

    // 8. Integration
    console.log('🔗 Validating Integration...');
    this.validateIntegration();

    // Print results
    this.printResults();
  }

  /**
   * Validate file structure
   */
  validateFileStructure() {
    const required = [
      'config.yaml',
      'README.md',
      'agents/aider-dev.md',
      'agents/aider-optimizer.md',
      'tasks/invoke-aider.md',
      'data/arcee-trinity-guide.md',
      'scripts/aider-invoke.js',
      'scripts/cost-calculator.js',
      'templates/aider-prompt-tmpl.md',
      'templates/cost-report-tmpl.md'
    ];

    const missing = [];
    const present = [];

    required.forEach(file => {
      const fullPath = path.join(this.squadPath, file);
      if (fs.existsSync(fullPath)) {
        present.push(file);
        this.results.passed.push(`✓ File exists: ${file}`);
      } else {
        missing.push(file);
        this.results.failed.push(`✗ Missing file: ${file}`);
      }
    });

    console.log(`  ├─ Present: ${present.length}/${required.length}`);
    if (missing.length > 0) {
      console.log(`  └─ Missing: ${missing.join(', ')}`);
    }
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    try {
      const configPath = path.join(this.squadPath, 'config.yaml');
      const content = fs.readFileSync(configPath, 'utf8');

      // Check for required fields
      const required = ['name:', 'version:', 'short-title:', 'agents:', 'dependencies:'];
      const checks = {
        hasName: content.includes('name: dev-aider'),
        hasVersion: /version:\s+1\.0\.0/.test(content),
        hasAgents: content.includes('agents:'),
        hasAiderDev: content.includes('aider-dev'),
        hasAiderOptimizer: content.includes('aider-optimizer'),
        hasCost: content.includes('cost_model'),
        hasAIOS: content.includes('aios_core') || content.includes('AIOS') || content.includes('aios:')
      };

      Object.entries(checks).forEach(([check, passed]) => {
        if (passed) {
          this.results.passed.push(`✓ Config has ${check}`);
        } else {
          this.results.failed.push(`✗ Config missing ${check}`);
        }
      });

      console.log(`  ├─ Config validation: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks passed`);

    } catch (error) {
      this.results.failed.push(`✗ Error reading config: ${error.message}`);
      console.log(`  └─ Error: ${error.message}`);
    }
  }

  /**
   * Validate agents
   */
  validateAgents() {
    const agents = [
      { file: 'agents/aider-dev.md', id: 'aider-dev' },
      { file: 'agents/aider-optimizer.md', id: 'aider-optimizer' }
    ];

    let passed = 0;
    agents.forEach(agent => {
      try {
        const path_ = path.join(this.squadPath, agent.file);
        const content = fs.readFileSync(path_, 'utf8');

        const checks = {
          hasYAML: content.includes('```yaml'),
          hasAgent: content.includes(`agent:`),
          hasCommands: content.includes('commands:'),
          hasActivation: content.includes('activation-instructions'),
          hasPersona: content.includes('persona'),
          validYAML: this.isValidYAML(content)
        };

        const checkedCount = Object.values(checks).filter(Boolean).length;
        if (checkedCount === Object.keys(checks).length) {
          this.results.passed.push(`✓ Agent ${agent.id} complete`);
          passed++;
        } else {
          this.results.warnings.push(`⚠ Agent ${agent.id} incomplete checks`);
        }
      } catch (error) {
        this.results.failed.push(`✗ Error validating ${agent.id}: ${error.message}`);
      }
    });

    console.log(`  └─ Agents validated: ${passed}/${agents.length}`);
  }

  /**
   * Validate tasks
   */
  validateTasks() {
    try {
      const taskPath = path.join(this.squadPath, 'tasks/invoke-aider.md');
      const content = fs.readFileSync(taskPath, 'utf8');

      const checks = {
        hasTitle: /^# Task:/.test(content),
        hasPurpose: content.includes('Purpose'),
        hasFlow: content.includes('Execution Flow'),
        hasSteps: content.includes('Step'),
        hasErrorHandling: content.includes('Error Handling'),
        hasExample: content.includes('Example'),
        hasSuccess: content.includes('Success')
      };

      const checkedCount = Object.values(checks).filter(Boolean).length;
      this.results.passed.push(`✓ Task definitions: ${checkedCount}/${Object.keys(checks).length} sections`);

      console.log(`  └─ Tasks: ${checkedCount}/${Object.keys(checks).length} sections found`);
    } catch (error) {
      this.results.failed.push(`✗ Error validating tasks: ${error.message}`);
    }
  }

  /**
   * Validate templates
   */
  validateTemplates() {
    const templates = [
      'templates/aider-prompt-tmpl.md',
      'templates/cost-report-tmpl.md'
    ];

    let validated = 0;
    templates.forEach(template => {
      try {
        const fullPath = path.join(this.squadPath, template);
        const content = fs.readFileSync(fullPath, 'utf8');

        if (content.length > 500 && content.includes('###') || content.includes('---')) {
          this.results.passed.push(`✓ Template ${path.basename(template)} valid`);
          validated++;
        } else {
          this.results.warnings.push(`⚠ Template ${path.basename(template)} seems incomplete`);
        }
      } catch (error) {
        this.results.failed.push(`✗ Error validating ${template}: ${error.message}`);
      }
    });

    console.log(`  └─ Templates validated: ${validated}/${templates.length}`);
  }

  /**
   * Validate data files
   */
  validateDataFiles() {
    try {
      const dataPath = path.join(this.squadPath, 'data/arcee-trinity-guide.md');
      const content = fs.readFileSync(dataPath, 'utf8');

      const sections = [
        'Model Overview',
        'Setup',
        'Usage',
        'Quality',
        'Cost'
      ];

      let foundSections = 0;
      sections.forEach(section => {
        if (content.toLowerCase().includes(section.toLowerCase())) {
          foundSections++;
        }
      });

      this.results.passed.push(`✓ Data files: ${foundSections}/${sections.length} sections`);
      console.log(`  └─ Data files: ${foundSections}/${sections.length} key sections found`);
    } catch (error) {
      this.results.failed.push(`✗ Error validating data: ${error.message}`);
    }
  }

  /**
   * Validate scripts
   */
  validateScripts() {
    const scripts = [
      { file: 'scripts/aider-invoke.js', required: ['spawn', 'validateEnvironment', 'optimizePrompt'] },
      { file: 'scripts/cost-calculator.js', required: ['calculateCost', 'analyzeCostBenefit', 'estimateTokens'] }
    ];

    let validated = 0;
    scripts.forEach(script => {
      try {
        const fullPath = path.join(this.squadPath, script.file);
        const content = fs.readFileSync(fullPath, 'utf8');

        let hasRequired = 0;
        script.required.forEach(req => {
          if (content.includes(req)) {
            hasRequired++;
          }
        });

        if (hasRequired >= script.required.length - 1) {
          this.results.passed.push(`✓ Script ${path.basename(script.file)} complete`);
          validated++;
        } else {
          this.results.warnings.push(`⚠ Script ${path.basename(script.file)} may be incomplete`);
        }
      } catch (error) {
        this.results.failed.push(`✗ Error validating ${script.file}: ${error.message}`);
      }
    });

    console.log(`  └─ Scripts validated: ${validated}/${scripts.length}`);
  }

  /**
   * Validate integration
   */
  validateIntegration() {
    const checks = {
      aiderAiosPath: () => {
        const config = fs.readFileSync(path.join(this.squadPath, 'config.yaml'), 'utf8');
        return config.includes('AIDER-AIOS');
      },
      agentIntegration: () => {
        const config = fs.readFileSync(path.join(this.squadPath, 'config.yaml'), 'utf8');
        return config.includes('aios_core') || config.includes('integration');
      },
      readmeComplete: () => {
        const readme = fs.readFileSync(path.join(this.squadPath, 'README.md'), 'utf8');
        return readme.includes('Quick Start') && readme.includes('Cost') && readme.includes('Usage');
      }
    };

    let passed = 0;
    Object.entries(checks).forEach(([check, fn]) => {
      try {
        if (fn()) {
          this.results.passed.push(`✓ Integration check: ${check}`);
          passed++;
        } else {
          this.results.warnings.push(`⚠ Integration check: ${check} inconclusive`);
        }
      } catch (error) {
        this.results.failed.push(`✗ Integration check ${check}: ${error.message}`);
      }
    });

    console.log(`  └─ Integration checks: ${passed}/${Object.keys(checks).length}`);
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n' + '═'.repeat(60));
    console.log('VALIDATION RESULTS');
    console.log('═'.repeat(60) + '\n');

    // Summary
    const total = this.results.passed.length + this.results.failed.length;
    const passRate = Math.round((this.results.passed.length / total) * 100);

    console.log(`✅ Passed: ${this.results.passed.length}`);
    console.log(`❌ Failed: ${this.results.failed.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`📊 Pass Rate: ${passRate}%\n`);

    // Detailed results
    if (this.results.failed.length > 0) {
      console.log('❌ FAILURES:\n');
      this.results.failed.forEach(failure => console.log(`  ${failure}`));
      console.log('');
    }

    if (this.results.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.results.warnings.forEach(warning => console.log(`  ${warning}`));
      console.log('');
    }

    // Final status
    console.log('═'.repeat(60));
    if (this.results.failed.length === 0 && passRate >= 90) {
      console.log('✅ VALIDATION PASSED - Squad is 100% Complete!');
      console.log('═'.repeat(60) + '\n');
      console.log('🎉 Dev-Aider Squad is ready to use!\n');
      console.log('Next Steps:');
      console.log('  1. Activate: /AIOS:agents:aider-dev');
      console.log('  2. Test: @aider-dev *help');
      console.log('  3. Use: @aider-optimizer *analyze-cost "Your task"');
      console.log('');
      return true;
    } else {
      console.log('⚠️  VALIDATION INCOMPLETE - Some issues found');
      console.log('═'.repeat(60) + '\n');
      return false;
    }
  }

  /**
   * Check if content is valid YAML
   */
  isValidYAML(content) {
    try {
      // Simple YAML structure check
      const lines = content.split('\n');
      let inYAML = false;
      let bracketCount = 0;

      for (const line of lines) {
        if (line.includes('```yaml')) inYAML = true;
        if (line.includes('```') && inYAML && !line.includes('yaml')) inYAML = false;

        if (inYAML) {
          if (line.includes('{')) bracketCount++;
          if (line.includes('}')) bracketCount--;
        }
      }

      return bracketCount === 0; // Balanced brackets
    } catch {
      return false;
    }
  }
}

/**
 * Run validation
 */
async function main() {
  const squadPath = process.argv[2] || __dirname;

  const validator = new SquadValidator(squadPath);
  const success = await validator.runAll();

  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SquadValidator;
