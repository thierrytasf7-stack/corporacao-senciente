/**
 * Validador de Consistência Textual para Inputs do Criador
 * Garante que decisões e inputs sejam consistentes com a Truth Base
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/** Fonte de input */
export enum InputSource {
  CREATOR = 'CREATOR',
  AI = 'AI',
  SYSTEM = 'SYSTEM'
}

/** Severidade de violação */
export enum ViolationSeverity {
  CRITICAL = 'CRITICAL',    // Violação de axioma - bloqueia
  WARNING = 'WARNING',      // Inconsistência potencial - alerta
  INFO = 'INFO'            // Sugestão de melhoria
}

/** Resultado de validação */
export interface ValidationResult {
  valid: boolean;
  source: InputSource;
  violations: Violation[];
  timestamp: string;
}

/** Violação detectada */
export interface Violation {
  axiom: string;
  severity: ViolationSeverity;
  message: string;
  suggestion?: string;
}

/** Axioma carregado */
interface Axiom {
  id: string;
  title: string;
  keywords: string[];
  validators: ((input: string) => Violation | null)[];
}

export class ConsistencyValidator {
  private axioms: Axiom[] = [];
  private truthBasePath: string;

  constructor(truthBasePath?: string) {
    this.truthBasePath = truthBasePath || path.join(process.cwd(), 'Axioms', 'Truth_Base');
  }

  /**
   * Inicializa o validador carregando axiomas
   */
  async initialize(): Promise<void> {
    await this.loadAxioms();
  }

  /**
   * Carrega axiomas do disco
   */
  private async loadAxioms(): Promise<void> {
    // AXIOMA 01: Primazia do Criador
    this.axioms.push({
      id: 'AXIOM_01',
      title: 'Primazia do Criador',
      keywords: ['criador', 'autoridade', 'decisão', 'conflito'],
      validators: [
        (input: string) => {
          // IA nunca deve contradizer decisões explícitas do Criador
          const contradictionPatterns = [
            /mas (o criador|você) está errado/i,
            /isso não faz sentido/i,
            /não vou fazer isso/i
          ];

          for (const pattern of contradictionPatterns) {
            if (pattern.test(input)) {
              return {
                axiom: 'AXIOM_01',
                severity: ViolationSeverity.CRITICAL,
                message: 'Input contradiz Axioma 01 - Primazia do Criador',
                suggestion: 'IA deve aceitar decisões do Criador, podendo apenas sugerir alternativas respeitosamente'
              };
            }
          }
          return null;
        }
      ]
    });

    // AXIOMA 02: Arquitetura Nativa Windows
    this.axioms.push({
      id: 'AXIOM_02',
      title: 'Arquitetura Nativa Windows',
      keywords: ['docker', 'container', 'virtualização'],
      validators: [
        (input: string) => {
          const dockerPatterns = [
            /usar docker/i,
            /implementar.*docker/i,
            /docker compose/i,
            /dockerfile/i
          ];

          for (const pattern of dockerPatterns) {
            if (pattern.test(input)) {
              return {
                axiom: 'AXIOM_02',
                severity: ViolationSeverity.CRITICAL,
                message: 'Input viola Axioma 02 - Docker foi explicitamente abandonado',
                suggestion: 'Use PM2, PowerShell ou Rust para implementação nativa Windows'
              };
            }
          }
          return null;
        }
      ]
    });

    // AXIOMA 03: CLI First
    this.axioms.push({
      id: 'AXIOM_03',
      title: 'CLI First',
      keywords: ['ui', 'dashboard', 'interface', 'frontend'],
      validators: [
        (input: string) => {
          const uiFirstPatterns = [
            /começar pelo dashboard/i,
            /primeiro.*interface/i,
            /só.*ui/i,
            /apenas.*frontend/i
          ];

          for (const pattern of uiFirstPatterns) {
            if (pattern.test(input)) {
              return {
                axiom: 'AXIOM_03',
                severity: ViolationSeverity.WARNING,
                message: 'Input pode violar Axioma 03 - CLI First',
                suggestion: 'Implemente funcionalidade completa via CLI antes de criar UI'
              };
            }
          }
          return null;
        }
      ]
    });

    // AXIOMA 04: Consciência de Custo
    this.axioms.push({
      id: 'AXIOM_04',
      title: 'Consciência de Custo',
      keywords: ['custo', 'recurso', 'otimização', 'eficiência'],
      validators: [
        (input: string) => {
          const wastePatterns = [
            /usar opus para tudo/i,
            /não importa o custo/i,
            /máximo de tokens/i
          ];

          for (const pattern of wastePatterns) {
            if (pattern.test(input)) {
              return {
                axiom: 'AXIOM_04',
                severity: ViolationSeverity.WARNING,
                message: 'Input pode violar Axioma 04 - Consciência de Custo',
                suggestion: 'Considere usar Agent Zero ($0.00) ou aplicar Token Economy (Pareto 80/20)'
              };
            }
          }
          return null;
        }
      ]
    });

    // AXIOMA 05: Story-Driven Development
    this.axioms.push({
      id: 'AXIOM_05',
      title: 'Story-Driven Development',
      keywords: ['story', 'desenvolvimento', 'implementação'],
      validators: [
        (input: string) => {
          const adHocPatterns = [
            /implementar sem story/i,
            /não precisa story/i,
            /direto no código/i
          ];

          for (const pattern of adHocPatterns) {
            if (pattern.test(input)) {
              return {
                axiom: 'AXIOM_05',
                severity: ViolationSeverity.WARNING,
                message: 'Input pode violar Axioma 05 - Story-Driven Development',
                suggestion: 'Crie story em docs/stories/ antes de implementar'
              };
            }
          }
          return null;
        }
      ]
    });
  }

  /**
   * Valida input contra axiomas
   */
  async validate(input: string, source: InputSource = InputSource.AI): Promise<ValidationResult> {
    const violations: Violation[] = [];

    // Se fonte é CREATOR, apenas log - não bloqueia
    if (source === InputSource.CREATOR) {
      return {
        valid: true,
        source,
        violations: [],
        timestamp: new Date().toISOString()
      };
    }

    // Valida contra todos os axiomas
    for (const axiom of this.axioms) {
      for (const validator of axiom.validators) {
        const violation = validator(input);
        if (violation) {
          violations.push(violation);
        }
      }
    }

    // Crítico bloqueia, warning permite
    const hasCritical = violations.some(v => v.severity === ViolationSeverity.CRITICAL);

    return {
      valid: !hasCritical,
      source,
      violations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formata resultado de validação para log
   */
  formatResult(result: ValidationResult): string {
    const lines: string[] = [];

    lines.push(`=== VALIDAÇÃO DE CONSISTÊNCIA ===`);
    lines.push(`Fonte: ${result.source}`);
    lines.push(`Status: ${result.valid ? '✓ VÁLIDO' : '✗ INVÁLIDO'}`);
    lines.push(`Timestamp: ${result.timestamp}`);

    if (result.violations.length > 0) {
      lines.push(`\nViolações Detectadas: ${result.violations.length}`);

      for (const violation of result.violations) {
        const icon = violation.severity === ViolationSeverity.CRITICAL ? '🔴' :
                     violation.severity === ViolationSeverity.WARNING ? '⚠️' : 'ℹ️';

        lines.push(`\n${icon} ${violation.severity} - ${violation.axiom}`);
        lines.push(`   ${violation.message}`);
        if (violation.suggestion) {
          lines.push(`   💡 ${violation.suggestion}`);
        }
      }
    } else {
      lines.push('\n✓ Nenhuma violação detectada');
    }

    return lines.join('\n');
  }

  /**
   * Salva log de validação
   */
  async saveValidationLog(result: ValidationResult, context?: string): Promise<void> {
    const logDir = path.join(this.truthBasePath, 'validators', 'logs');
    await fs.mkdir(logDir, { recursive: true });

    const logFile = path.join(logDir, `validation-${Date.now()}.json`);
    const logData = {
      ...result,
      context: context || 'N/A'
    };

    await fs.writeFile(logFile, JSON.stringify(logData, null, 2), 'utf-8');
  }
}

/**
 * Utilitário para validação rápida
 */
export async function validateInput(
  input: string,
  source: InputSource = InputSource.AI
): Promise<ValidationResult> {
  const validator = new ConsistencyValidator();
  await validator.initialize();
  return await validator.validate(input, source);
}
