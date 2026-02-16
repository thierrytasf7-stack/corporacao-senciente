/**
 * Validador de Consistência Textual - Verdade Base
 * Valida inputs do Criador contra axiomas e fatos de negócio
 */

import fs from 'fs'
import path from 'path'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  axiomConflicts: string[]
  timestamp: string
}

interface TextContent {
  text: string
  author: 'creator' | 'system'
  source: string
  priority?: 'ALTA' | 'MEDIA' | 'BAIXA'
}

interface Axiom {
  id: number
  title: string
  statement: string
  keywords: string[]
}

/**
 * ConsistencyValidator - Valida textos contra axiomas e facts
 */
export class ConsistencyValidator {
  private axioms: Axiom[] = []
  private businessFacts: Map<string, string> = new Map()
  private validationLog: ValidationResult[] = []

  constructor(axiomsPath: string) {
    this.loadAxioms(axiomsPath)
  }

  /**
   * Carrega axiomas do arquivo markdown
   */
  private loadAxioms(axiomsPath: string): void {
    try {
      const content = fs.readFileSync(axiomsPath, 'utf-8')
      const axiomSections = content.split(/## Axioma \d+:/)

      let axiomId = 1
      for (let i = 1; i < axiomSections.length; i++) {
        const section = axiomSections[i]
        const titleMatch = section.match(/(.+?)\n/)
        const statementMatch = section.match(/\*\*Enunciado:\*\*\s*(.+?)(?:\n\n|\n\*\*)/)

        if (titleMatch && statementMatch) {
          this.axioms.push({
            id: axiomId++,
            title: titleMatch[1].trim(),
            statement: statementMatch[1].trim(),
            keywords: this.extractKeywords(statementMatch[1])
          })
        }
      }

      console.log(`✓ Carregados ${this.axioms.length} axiomas`)
    } catch (error) {
      console.error(`✗ Erro ao carregar axiomas: ${error}`)
      throw error
    }
  }

  /**
   * Extrai palavras-chave de um texto
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'o', 'a', 'de', 'da', 'do', 'e', 'é', 'um', 'uma', 'ou', 'para', 'com',
      'não', 'em', 'que', 'se', 'por', 'na', 'no', 'seu', 'sua'
    ])

    return text
      .toLowerCase()
      .match(/\b\w{4,}\b/g)?.filter(w => !stopWords.has(w)) || []
  }

  /**
   * Detecta contradições lógicas
   */
  private detectContradictions(text: string): string[] {
    const contradictions: string[] = []
    const patterns = [
      { pattern: /sempre.*nunca|nunca.*sempre/gi, msg: 'Contradição temporal: sempre/nunca' },
      { pattern: /deve.*não deve/gi, msg: 'Contradição normativa: deve/não deve' },
      { pattern: /verdadeiro.*falso|falso.*verdadeiro/gi, msg: 'Contradição lógica: verdadeiro/falso' },
      { pattern: /possível.*impossível|impossível.*possível/gi, msg: 'Contradição modal: possível/impossível' }
    ]

    for (const { pattern, msg } of patterns) {
      if (pattern.test(text)) {
        contradictions.push(msg)
      }
    }

    return contradictions
  }

  /**
   * Valida text contra axiomas
   */
  private validateAgainstAxioms(text: string): {
    conflicts: string[]
    alignments: string[]
  } {
    const result = {
      conflicts: [] as string[],
      alignments: [] as string[]
    }

    const textKeywords = this.extractKeywords(text)

    for (const axiom of this.axioms) {
      // Verifica se há keywords de axioma no texto
      const alignmentScore = textKeywords.filter(kw =>
        axiom.keywords.some(ak => ak.includes(kw) || kw.includes(ak))
      ).length

      if (alignmentScore > 0) {
        result.alignments.push(`[Axioma ${axiom.id}] ${axiom.title}: ${alignmentScore} alinhamentos`)
      }

      // Detecta possíveis conflitos
      const conflictPatterns = [
        { pattern: /ia\s+(pode|deve)\s+ignorar|ignorar\s+criador/gi, axiom: 1 },
        { pattern: /contradição|inconsistência|conflito/gi, axiom: 2 },
        { pattern: /caixa\s+preta|opaco|secreto/gi, axiom: 3 },
        { pattern: /autônoma?|sem\s+validação|sem\s+aprovação/gi, axiom: 4 },
        { pattern: /teórica?|especulação|sem\s+dados/gi, axiom: 5 }
      ]

      for (const { pattern, axiom: axiomNum } of conflictPatterns) {
        if (pattern.test(text)) {
          result.conflicts.push(
            `[Axioma ${axiomNum}] "${axiom.title}" pode estar em conflito`
          )
        }
      }
    }

    return result
  }

  /**
   * Valida um input de texto
   */
  validate(content: TextContent): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const axiomConflicts: string[] = []

    // 1. Validações básicas
    if (!content.text || content.text.trim().length === 0) {
      errors.push('Texto vazio ou nulo')
    }

    if (content.text.length > 50000) {
      warnings.push('Texto muito longo (>50KB) - performance pode ser afetada')
    }

    // 2. Detecta contradições
    const contradictions = this.detectContradictions(content.text)
    errors.push(...contradictions)

    // 3. Valida contra axiomas
    const { conflicts, alignments } = this.validateAgainstAxioms(content.text)
    axiomConflicts.push(...conflicts)
    console.log(`  Alinhamentos: ${alignments.join(' | ')}`)

    // 4. Validações específicas por autor
    if (content.author === 'creator') {
      // Inputs do Criador são axiomáticos, mas ainda checamos coerência
      if (content.priority === 'ALTA' && errors.length === 0) {
        console.log(`  ✓ Input do Criador [${content.priority}] validado como axiomático`)
      }
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      axiomConflicts,
      timestamp: new Date().toISOString()
    }

    this.validationLog.push(result)
    return result
  }

  /**
   * Registra um Fato de Negócio
   */
  registerBusinessFact(key: string, value: string): void {
    this.businessFacts.set(key, value)
    console.log(`✓ Fato de Negócio registrado: ${key}`)
  }

  /**
   * Obtém Fato de Negócio
   */
  getBusinessFact(key: string): string | undefined {
    return this.businessFacts.get(key)
  }

  /**
   * Lista todos os Fatos de Negócio
   */
  listBusinessFacts(): Record<string, string> {
    return Object.fromEntries(this.businessFacts)
  }

  /**
   * Gera relatório de validação
   */
  generateReport(): string {
    const totalValidations = this.validationLog.length
    const successfulValidations = this.validationLog.filter(v => v.isValid).length
    const failedValidations = totalValidations - successfulValidations

    let report = `
# Relatório de Validação - Consistência Textual

**Data:** ${new Date().toISOString()}
**Total de Validações:** ${totalValidations}
**✓ Sucesso:** ${successfulValidations}
**✗ Falha:** ${failedValidations}

## Detalhes

`

    for (let i = 0; i < this.validationLog.length; i++) {
      const log = this.validationLog[i]
      report += `
### Validação ${i + 1} (${log.timestamp})
- **Status:** ${log.isValid ? '✓ VÁLIDO' : '✗ INVÁLIDO'}
- **Erros:** ${log.errors.length > 0 ? log.errors.join('; ') : 'Nenhum'}
- **Avisos:** ${log.warnings.length > 0 ? log.warnings.join('; ') : 'Nenhum'}
- **Conflitos de Axioma:** ${log.axiomConflicts.length > 0 ? log.axiomConflicts.join('; ') : 'Nenhum'}
`
    }

    return report
  }
}

/**
 * Função auxiliar para exportar
 */
export function createValidator(axiomsPath: string): ConsistencyValidator {
  return new ConsistencyValidator(axiomsPath)
}
