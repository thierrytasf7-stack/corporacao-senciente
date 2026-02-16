#!/usr/bin/env node

/**
 * QA Runner for Dev-Aider
 *
 * Executes lint, typecheck, and test commands sequentially (fail-fast).
 * Captures results and formats a concise summary for Claude QA sign-off.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class QARunner {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.verbose = options.verbose || false;
  }

  /**
   * Run lint check
   */
  runLint() {
    if (this.verbose) console.log('🔍 Running lint...');

    try {
      const output = execSync('npm run lint', {
        cwd: this.projectRoot,
        stdio: 'pipe',
        encoding: 'utf8'
      });

      return {
        passed: true,
        output: output.split('\n').slice(-10).join('\n'),
        exitCode: 0
      };
    } catch (err) {
      const output = err.stdout?.toString() || err.message;
      return {
        passed: false,
        output: output.split('\n').slice(-5).join('\n'),
        exitCode: err.status || 1
      };
    }
  }

  /**
   * Run typecheck
   */
  runTypecheck() {
    if (this.verbose) console.log('📝 Running typecheck...');

    try {
      const output = execSync('npm run typecheck', {
        cwd: this.projectRoot,
        stdio: 'pipe',
        encoding: 'utf8'
      });

      return {
        passed: true,
        output: output.split('\n').slice(-10).join('\n'),
        exitCode: 0
      };
    } catch (err) {
      const output = err.stdout?.toString() || err.message;
      return {
        passed: false,
        output: output.split('\n').slice(-5).join('\n'),
        exitCode: err.status || 1
      };
    }
  }

  /**
   * Run tests
   */
  runTest() {
    if (this.verbose) console.log('✅ Running tests...');

    try {
      const output = execSync('npm test', {
        cwd: this.projectRoot,
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 120000 // 2 minutes max
      });

      // Extract Jest summary
      const summary = this.extractJestSummary(output);

      return {
        passed: true,
        output: summary || output.split('\n').slice(-10).join('\n'),
        exitCode: 0
      };
    } catch (err) {
      const output = err.stdout?.toString() || err.message;
      const summary = this.extractJestSummary(output);

      return {
        passed: false,
        output: summary || output.split('\n').slice(-5).join('\n'),
        exitCode: err.status || 1
      };
    }
  }

  /**
   * Extract Jest summary from test output
   */
  extractJestSummary(output) {
    const lines = output.split('\n');
    const summaryLines = lines.filter(l =>
      l.includes('Tests:') ||
      l.includes('passed') ||
      l.includes('failed') ||
      l.includes('PASS') ||
      l.includes('FAIL')
    );

    return summaryLines.slice(-3).join('\n');
  }

  /**
   * Run all checks in sequence (fail-fast)
   */
  runAll() {
    const results = {
      lint: this.runLint(),
      typecheck: null,
      test: null
    };

    if (!results.lint.passed) {
      if (this.verbose) console.log('❌ Lint failed, stopping here.');
      return results;
    }

    results.typecheck = this.runTypecheck();
    if (!results.typecheck.passed) {
      if (this.verbose) console.log('❌ Typecheck failed, stopping here.');
      return results;
    }

    results.test = this.runTest();
    return results;
  }

  /**
   * Format results as summary table
   */
  formatSummary(results) {
    const lintStatus = results.lint.passed ? '✅ PASS' : '❌ FAIL';
    const typecheckStatus = results.typecheck?.passed !== false ? '✅ PASS' : '❌ FAIL';
    const testStatus = results.test?.passed !== false ? '✅ PASS' : '❌ FAIL';

    let summary = '# QA Summary\n\n';
    summary += `| Check | Status |\n`;
    summary += `|-------|--------|\n`;
    summary += `| Lint | ${lintStatus} |\n`;
    summary += `| Typecheck | ${typecheckStatus} |\n`;
    summary += `| Tests | ${testStatus} |\n`;

    const allPass = results.lint.passed &&
                    results.typecheck?.passed !== false &&
                    results.test?.passed !== false;

    summary += `\n**Overall**: ${allPass ? '✅ ALL PASS' : '❌ BLOCKED'}\n`;

    if (!allPass) {
      summary += '\n## Failures\n';

      if (!results.lint.passed) {
        summary += `\n### Lint\n\`\`\`\n${results.lint.output}\n\`\`\`\n`;
      }

      if (results.typecheck && !results.typecheck.passed) {
        summary += `\n### Typecheck\n\`\`\`\n${results.typecheck.output}\n\`\`\`\n`;
      }

      if (results.test && !results.test.passed) {
        summary += `\n### Tests\n\`\`\`\n${results.test.output}\n\`\`\`\n`;
      }

      summary += '\n## Recommendation\n';
      summary += 'Fix the issues above and re-run qa-aider.\n';
    } else {
      summary += '\n## Recommendation\n';
      summary += 'Ready for @deploy-aider to push to remote.\n';
    }

    return summary;
  }

  /**
   * Format full report with all output
   */
  formatFullReport(results) {
    let report = '# Full QA Report\n\n';

    report += '## Lint Output\n';
    report += `Status: ${results.lint.passed ? '✅ PASS' : '❌ FAIL'}\n`;
    report += `\`\`\`\n${results.lint.output}\n\`\`\`\n\n`;

    if (results.typecheck) {
      report += '## Typecheck Output\n';
      report += `Status: ${results.typecheck.passed ? '✅ PASS' : '❌ FAIL'}\n`;
      report += `\`\`\`\n${results.typecheck.output}\n\`\`\`\n\n`;
    }

    if (results.test) {
      report += '## Test Output\n';
      report += `Status: ${results.test.passed ? '✅ PASS' : '❌ FAIL'}\n`;
      report += `\`\`\`\n${results.test.output}\n\`\`\`\n\n`;
    }

    return report;
  }
}

// CLI Interface
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    lintOnly: args.includes('--lint-only'),
    typecheckOnly: args.includes('--typecheck-only'),
    testOnly: args.includes('--test-only'),
    summary: args.includes('--summary'),
    fullReport: args.includes('--full-report'),
    verbose: args.includes('--verbose')
  };
}

function main() {
  const args = parseArgs();
  const runner = new QARunner({ verbose: args.verbose });

  if (args.lintOnly) {
    const result = runner.runLint();
    console.log(`Lint: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(result.output);
  } else if (args.typecheckOnly) {
    const result = runner.runTypecheck();
    console.log(`Typecheck: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(result.output);
  } else if (args.testOnly) {
    const result = runner.runTest();
    console.log(`Tests: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(result.output);
  } else {
    const results = runner.runAll();

    if (args.fullReport) {
      console.log(runner.formatFullReport(results));
    } else if (args.summary) {
      console.log(runner.formatSummary(results));
    } else {
      // Default: summary
      console.log(runner.formatSummary(results));
    }
  }
}

module.exports = QARunner;
if (require.main === module) { main(); }
