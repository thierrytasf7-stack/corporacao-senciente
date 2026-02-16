/**
 * Test Runner - Execução Automática de Testes
 * 
 * Detecta e executa testes automaticamente:
 * - Detecta framework de testes (Jest, Vitest, Mocha, etc)
 * - Executa testes
 * - Parseia resultados
 * - Valida cobertura mínima (se configurado)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { config } from 'dotenv';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

/**
 * Detecta qual framework de testes está sendo usado
 */
export function detectTestFramework() {
  const packageJsonPath = 'package.json';
  
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Verificar por framework
    if (deps.jest || packageJson.scripts?.test?.includes('jest')) {
      return 'jest';
    }
    if (deps.vitest || packageJson.scripts?.test?.includes('vitest')) {
      return 'vitest';
    }
    if (deps.mocha || packageJson.scripts?.test?.includes('mocha')) {
      return 'mocha';
    }
    if (deps.ava || packageJson.scripts?.test?.includes('ava')) {
      return 'ava';
    }
    if (deps.tape || packageJson.scripts?.test?.includes('tape')) {
      return 'tape';
    }

    // Verificar por script de teste genérico
    if (packageJson.scripts?.test) {
      return 'custom';
    }

    return null;
  } catch (error) {
    console.warn(`⚠️  Erro ao detectar framework: ${error.message}`);
    return null;
  }
}

/**
 * Executa testes com Jest
 */
async function runJest() {
  try {
    const command = 'npm test -- --json --coverage';
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    const result = JSON.parse(output);

    return {
      success: result.success,
      totalTests: result.numTotalTests,
      passedTests: result.numPassedTests,
      failedTests: result.numFailedTests,
      coverage: result.coverageMap ? {
        statements: result.coverageMap.total.statements.pct,
        branches: result.coverageMap.total.branches.pct,
        functions: result.coverageMap.total.functions.pct,
        lines: result.coverageMap.total.lines.pct,
      } : null,
      failures: result.testResults
        .filter(r => r.status === 'failed')
        .map(r => ({
          name: r.name,
          message: r.message,
        })),
    };
  } catch (error) {
    // Jest pode retornar erro mesmo com JSON
    try {
      const output = error.stdout || error.stderr || error.message;
      const result = JSON.parse(output);
      return {
        success: false,
        error: 'Testes falharam',
        totalTests: result.numTotalTests || 0,
        passedTests: result.numPassedTests || 0,
        failedTests: result.numFailedTests || 0,
        failures: result.testResults?.filter(r => r.status === 'failed').map(r => ({
          name: r.name,
          message: r.message,
        })) || [],
      };
    } catch (parseError) {
      throw new Error(`Erro ao executar Jest: ${error.message}`);
    }
  }
}

/**
 * Executa testes com Vitest
 */
async function runVitest() {
  try {
    const command = 'npm test -- --reporter=json --coverage';
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    const result = JSON.parse(output);

    return {
      success: result.numFailedTestSuites === 0 && result.numFailedTests === 0,
      totalTests: result.numTotalTests,
      passedTests: result.numPassedTests,
      failedTests: result.numFailedTests,
      failures: result.testResults
        .filter(r => r.status === 'failed')
        .map(r => ({
          name: r.name,
          message: r.failureMessages?.join('\n') || '',
        })),
    };
  } catch (error) {
    try {
      const output = error.stdout || error.stderr || error.message;
      const result = JSON.parse(output);
      return {
        success: false,
        error: 'Testes falharam',
        totalTests: result.numTotalTests || 0,
        passedTests: result.numPassedTests || 0,
        failedTests: result.numFailedTests || 0,
        failures: result.testResults?.filter(r => r.status === 'failed').map(r => ({
          name: r.name,
          message: r.failureMessages?.join('\n') || '',
        })) || [],
      };
    } catch (parseError) {
      throw new Error(`Erro ao executar Vitest: ${error.message}`);
    }
  }
}

/**
 * Executa testes genéricos (npm test)
 */
async function runGeneric() {
  try {
    const output = execSync('npm test', { encoding: 'utf-8', stdio: 'pipe' });
    
    // Tentar parsear saída comum
    const passedMatch = output.match(/(\d+)\s+passing/);
    const failedMatch = output.match(/(\d+)\s+failing/);

    return {
      success: !failedMatch || parseInt(failedMatch[1]) === 0,
      totalTests: (passedMatch ? parseInt(passedMatch[1]) : 0) + (failedMatch ? parseInt(failedMatch[1]) : 0),
      passedTests: passedMatch ? parseInt(passedMatch[1]) : 0,
      failedTests: failedMatch ? parseInt(failedMatch[1]) : 0,
      output,
    };
  } catch (error) {
    // npm test retorna código de erro se testes falharem
    const output = error.stdout || error.stderr || error.message;
    return {
      success: false,
      error: 'Testes falharam',
      output,
    };
  }
}

/**
 * Executa testes
 */
export async function runTests(options = {}) {
  const {
    framework = null,
    coverageThreshold = null, // { statements: 80, branches: 80, functions: 80, lines: 80 }
  } = options;

  console.log('🧪 Executando testes...\n');

  // Detectar framework se não especificado
  const detectedFramework = framework || detectTestFramework();

  if (!detectedFramework) {
    console.log('⚠️  Nenhum framework de testes detectado');
    return {
      success: true,
      skipped: true,
      reason: 'Nenhum framework de testes detectado',
    };
  }

  console.log(`📦 Framework detectado: ${detectedFramework}\n`);

  let result;

  try {
    switch (detectedFramework) {
      case 'jest':
        result = await runJest();
        break;
      case 'vitest':
        result = await runVitest();
        break;
      case 'custom':
      default:
        result = await runGeneric();
        break;
    }

    // Validar cobertura se configurado
    if (coverageThreshold && result.coverage) {
      const coverageIssues = [];
      
      if (result.coverage.statements < coverageThreshold.statements) {
        coverageIssues.push(`Statements: ${result.coverage.statements}% < ${coverageThreshold.statements}%`);
      }
      if (result.coverage.branches < coverageThreshold.branches) {
        coverageIssues.push(`Branches: ${result.coverage.branches}% < ${coverageThreshold.branches}%`);
      }
      if (result.coverage.functions < coverageThreshold.functions) {
        coverageIssues.push(`Functions: ${result.coverage.functions}% < ${coverageThreshold.functions}%`);
      }
      if (result.coverage.lines < coverageThreshold.lines) {
        coverageIssues.push(`Lines: ${result.coverage.lines}% < ${coverageThreshold.lines}%`);
      }

      if (coverageIssues.length > 0) {
        result.coverageBelowThreshold = true;
        result.coverageIssues = coverageIssues;
        result.success = false; // Falhar se cobertura abaixo do threshold
      }
    }

    // Log resultados
    if (result.success) {
      console.log(`✅ Testes passaram: ${result.passedTests}/${result.totalTests}`);
      if (result.coverage) {
        console.log(`📊 Cobertura: ${result.coverage.lines?.toFixed(1) || 'N/A'}%`);
      }
    } else {
      console.log(`❌ Testes falharam: ${result.failedTests}/${result.totalTests} falharam`);
      if (result.failures && result.failures.length > 0) {
        console.log('\nFalhas:');
        result.failures.slice(0, 5).forEach(f => {
          console.log(`  - ${f.name}`);
        });
      }
      if (result.coverageBelowThreshold) {
        console.log('\n⚠️  Cobertura abaixo do threshold:');
        result.coverageIssues.forEach(issue => console.log(`  - ${issue}`));
      }
    }

    return result;
  } catch (error) {
    console.error(`❌ Erro ao executar testes: ${error.message}`);
    return {
      success: false,
      error: error.message,
      framework: detectedFramework,
    };
  }
}

/**
 * Valida se testes passam
 */
export async function validateTests(options = {}) {
  const result = await runTests(options);
  
  return {
    passed: result.success === true,
    result,
  };
}






























