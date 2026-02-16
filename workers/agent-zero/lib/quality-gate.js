/**
 * Agent Zero v2.0 - Quality Gate
 * Validates LLM output before accepting it.
 * Syntax checks, confidence scoring, acceptance criteria verification.
 */

class QualityGate {
  /**
   * Run all quality checks on LLM output
   * @param {object} task - Original task
   * @param {object} result - LLM result from TaskRunner
   * @returns {object} { passed, score, issues, enhanced_result }
   */
  validate(task, result) {
    if (result.status === 'failed') {
      return { passed: false, score: 0, issues: ['Task execution failed: ' + result.error] };
    }

    const issues = [];
    let score = 10;

    // 1. Empty content check
    if (!result.content || result.content.trim().length < 10) {
      issues.push('Output is empty or too short');
      score -= 5;
    }

    // 2. Syntax validation for code outputs
    if (['implement', 'test', 'types', 'refactor'].includes(task.task_type)) {
      const syntaxResult = this._validateCodeSyntax(result.content, task);
      issues.push(...syntaxResult.issues);
      score -= syntaxResult.penalty;
    }

    // 3. Acceptance criteria check
    if (task.acceptance_criteria?.length) {
      const criteriaResult = this._checkAcceptanceCriteria(result.content, task.acceptance_criteria);
      issues.push(...criteriaResult.issues);
      score -= criteriaResult.penalty;
    }

    // 4. Output format check
    const formatResult = this._checkOutputFormat(result.content, task);
    issues.push(...formatResult.issues);
    score -= formatResult.penalty;

    // 5. Truncation check
    if (result.finish_reason === 'length') {
      issues.push('Output was truncated (hit token limit)');
      score -= 2;
    }

    score = Math.max(0, Math.min(10, score));

    return {
      passed: score >= (task.min_quality || 6),
      score,
      issues,
      enhanced_result: {
        ...result,
        quality_score: score,
        quality_issues: issues
      }
    };
  }

  /**
   * Basic syntax validation for code blocks
   */
  _validateCodeSyntax(content, task) {
    const issues = [];
    let penalty = 0;

    // Extract code from markdown code blocks if present
    const codeMatch = content.match(/```(?:\w+)?\n([\s\S]+?)```/);
    const code = codeMatch ? codeMatch[1] : content;

    // Check for common syntax errors
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
      penalty += 3;
    }

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
      penalty += 3;
    }

    // Check for obvious placeholder text
    if (/TODO|FIXME|PLACEHOLDER|YOUR_.*_HERE|xxx/i.test(code)) {
      issues.push('Output contains placeholder/TODO text');
      penalty += 2;
    }

    // For TypeScript/JS: check for `any` type (coding standard violation)
    if (task.task_type === 'types' || task.task_type === 'implement') {
      const anyCount = (code.match(/:\s*any\b/g) || []).length;
      if (anyCount > 0) {
        issues.push(`Uses 'any' type ${anyCount} times (coding standard violation)`);
        penalty += 1;
      }
    }

    // Check for export statement if required
    if (task.acceptance_criteria?.some(c => /export/i.test(c))) {
      if (!/export\s/.test(code)) {
        issues.push('Missing export statement');
        penalty += 1;
      }
    }

    return { issues, penalty };
  }

  /**
   * Check if output addresses acceptance criteria (keyword-based)
   */
  _checkAcceptanceCriteria(content, criteria) {
    const issues = [];
    let penalty = 0;
    const contentLower = content.toLowerCase();

    for (const criterion of criteria) {
      // Extract key terms from criterion
      const terms = criterion.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 3);

      // Check if at least half the key terms appear
      const matchCount = terms.filter(t => contentLower.includes(t)).length;
      const matchRatio = terms.length > 0 ? matchCount / terms.length : 1;

      if (matchRatio < 0.3) {
        issues.push(`Criterion may not be met: "${criterion.substring(0, 60)}..."`);
        penalty += 1;
      }
    }

    return { issues, penalty };
  }

  /**
   * Check output format expectations
   */
  _checkOutputFormat(content, task) {
    const issues = [];
    let penalty = 0;

    // Code tasks should have code blocks or raw code
    if (['implement', 'test', 'types'].includes(task.task_type)) {
      const hasCode = /```|function\s|const\s|class\s|interface\s|import\s|export\s|def\s|param\s/.test(content);
      if (!hasCode) {
        issues.push('Expected code output but none detected');
        penalty += 3;
      }
    }

    // Review tasks should have bullet points or numbered list
    if (task.task_type === 'review') {
      const hasStructure = /[-*•]\s|^\d+\./m.test(content);
      if (!hasStructure) {
        issues.push('Review output lacks structured format (bullets/numbers)');
        penalty += 1;
      }
    }

    // Check for excessive preamble
    if (/^(Sure|Here|I'll|Let me|Of course|Certainly)/i.test(content.trim())) {
      issues.push('Output starts with unnecessary preamble');
      penalty += 0.5;
    }

    return { issues, penalty };
  }
}

module.exports = { QualityGate };
