/**
 * Exportador de Verdade Base para Vetores
 * Converte axiomas e fatos em embeddings para retrieval semântico
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

interface VectorEntry {
  id: string
  source: 'axiom' | 'fact' | 'hierarchy'
  sourceId: string
  title: string
  content: string
  keywords: string[]
  embedding?: number[]
  hash: string
  timestamp: string
}

interface ExportConfig {
  includeEmbeddings: boolean
  format: 'json' | 'jsonl' | 'csv'
  outputPath: string
  maxTokensPerEntry: number
}

/**
 * VectorExporter - Exporta Verdade Base para formato vetorial
 */
export class VectorExporter {
  private vectors: VectorEntry[] = []
  private config: ExportConfig

  constructor(config: Partial<ExportConfig> = {}) {
    this.config = {
      includeEmbeddings: false,
      format: 'json',
      outputPath: './Axioms/Truth_Base/exports',
      maxTokensPerEntry: 500,
      ...config
    }

    // Criar diretório de saída se não existir
    if (!fs.existsSync(this.config.outputPath)) {
      fs.mkdirSync(this.config.outputPath, { recursive: true })
    }
  }

  /**
   * Calcula hash SHA-256 do conteúdo
   */
  private calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)
  }

  /**
   * Extrai keywords de texto
   */
  private extractKeywords(text: string, maxKeywords: number = 10): string[] {
    const stopWords = new Set([
      'o', 'a', 'de', 'da', 'do', 'e', 'é', 'um', 'uma', 'ou', 'para', 'com',
      'não', 'em', 'que', 'se', 'por', 'na', 'no', 'seu', 'sua', 'este', 'esse'
    ])

    const words = text
      .toLowerCase()
      .match(/\b\w{3,}\b/g)?.filter(w => !stopWords.has(w)) || []

    // Contar frequência
    const freq: Record<string, number> = {}
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1
    }

    // Retornar top keywords por frequência
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word)
  }

  /**
   * Processa arquivo de axiomas
   */
  processAxiomsFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const axiomSections = content.split(/## Axioma \d+:/)

      let axiomId = 1
      for (let i = 1; i < axiomSections.length; i++) {
        const section = axiomSections[i]
        const titleMatch = section.match(/(.+?)\n/)
        const statementMatch = section.match(/\*\*Enunciado:\*\*\s*(.+?)(?:\n\n|\n\*\*)/)
        const fundamentationMatch = section.match(/\*\*Fundamentação:\*\*\s*([\s\S]+?)(?:\n\n|\n\*\*)/)

        if (titleMatch && statementMatch) {
          const title = titleMatch[1].trim()
          const statement = statementMatch[1].trim()
          const fundamentation = fundamentationMatch ? fundamentationMatch[1].trim() : ''

          const fullContent = `${statement}\n\nFundamentação:\n${fundamentation}`
          const truncatedContent = fullContent.substring(0, this.config.maxTokensPerEntry * 4) // ~4 chars per token

          const entry: VectorEntry = {
            id: `axiom-${axiomId}`,
            source: 'axiom',
            sourceId: `AXIOMA-${axiomId}`,
            title: `Axioma ${axiomId}: ${title}`,
            content: truncatedContent,
            keywords: this.extractKeywords(fullContent),
            hash: this.calculateHash(fullContent),
            timestamp: new Date().toISOString()
          }

          this.vectors.push(entry)
          axiomId++
        }
      }

      console.log(`✓ Processados ${this.vectors.length} axiomas`)
    } catch (error) {
      console.error(`✗ Erro ao processar axiomas: ${error}`)
      throw error
    }
  }

  /**
   * Processa arquivo de Fatos de Negócio
   */
  processBusinessFactsFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const factSections = content.split(/### FATO-\d+:/)

      let factId = 1
      for (let i = 1; i < factSections.length; i++) {
        const section = factSections[i]
        const titleMatch = section.match(/(.+?)\n/)
        const valueMatch = section.match(/\*\*Valor:\*\*\s*([\s\S]+?)(?:\n\n|$)/)

        if (titleMatch && valueMatch) {
          const title = titleMatch[1].trim()
          const value = valueMatch[1].trim()

          const truncatedContent = value.substring(0, this.config.maxTokensPerEntry * 4)

          const entry: VectorEntry = {
            id: `fact-${factId}`,
            source: 'fact',
            sourceId: `FATO-${String(factId).padStart(3, '0')}`,
            title: `Fato ${factId}: ${title}`,
            content: truncatedContent,
            keywords: this.extractKeywords(value),
            hash: this.calculateHash(value),
            timestamp: new Date().toISOString()
          }

          this.vectors.push(entry)
          factId++
        }
      }

      console.log(`✓ Processados ${factId - 1} fatos de negócio`)
    } catch (error) {
      console.error(`✗ Erro ao processar fatos: ${error}`)
      throw error
    }
  }

  /**
   * Processa arquivo de Hierarquia de Decisão
   */
  processHierarchyFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')

      // Extrai seções de níveis
      const levels = [
        { pattern: /### Nível 1:[\s\S]+?(?=### Nível|$)/, levelId: 1 },
        { pattern: /### Nível 2:[\s\S]+?(?=### Nível|$)/, levelId: 2 },
        { pattern: /### Nível 3:[\s\S]+?(?=### Nível|$)/, levelId: 3 },
        { pattern: /### Nível 4:[\s\S]+?(?=### Nível|$)/, levelId: 4 },
        { pattern: /### Nível 5:[\s\S]+?(?=### Nível|$)/, levelId: 5 }
      ]

      for (const { pattern, levelId } of levels) {
        const match = content.match(pattern)
        if (match) {
          const sectionContent = match[0]
          const titleMatch = sectionContent.match(/### Nível \d+:\s*(.+?)\n/)

          if (titleMatch) {
            const title = titleMatch[1].trim()
            const truncatedContent = sectionContent.substring(0, this.config.maxTokensPerEntry * 4)

            const entry: VectorEntry = {
              id: `hierarchy-level-${levelId}`,
              source: 'hierarchy',
              sourceId: `LEVEL-${levelId}`,
              title: `Hierarquia - Nível ${levelId}: ${title}`,
              content: truncatedContent,
              keywords: this.extractKeywords(sectionContent),
              hash: this.calculateHash(sectionContent),
              timestamp: new Date().toISOString()
            }

            this.vectors.push(entry)
          }
        }
      }

      console.log(`✓ Processados 5 níveis de hierarquia`)
    } catch (error) {
      console.error(`✗ Erro ao processar hierarquia: ${error}`)
      throw error
    }
  }

  /**
   * Exporta vetores para arquivo
   */
  export(filename: string = 'truth-base-vectors'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('-').slice(0, 4).join('-')
    const baseName = `${filename}-${timestamp}`

    let outputPath = ''

    switch (this.config.format) {
      case 'json':
        outputPath = path.join(this.config.outputPath, `${baseName}.json`)
        fs.writeFileSync(outputPath, JSON.stringify(
          {
            metadata: {
              exportDate: new Date().toISOString(),
              totalVectors: this.vectors.length,
              format: 'JSON',
              includeEmbeddings: this.config.includeEmbeddings
            },
            vectors: this.vectors
          },
          null,
          2
        ))
        break

      case 'jsonl':
        outputPath = path.join(this.config.outputPath, `${baseName}.jsonl`)
        const jsonlContent = this.vectors
          .map(v => JSON.stringify(v))
          .join('\n')
        fs.writeFileSync(outputPath, jsonlContent)
        break

      case 'csv':
        outputPath = path.join(this.config.outputPath, `${baseName}.csv`)
        const csvHeader = 'id,source,sourceId,title,keywords,hash,timestamp\n'
        const csvContent = this.vectors
          .map(v => `"${v.id}","${v.source}","${v.sourceId}","${v.title.replace(/"/g, '""')}","${v.keywords.join('|')}","${v.hash}","${v.timestamp}"`)
          .join('\n')
        fs.writeFileSync(outputPath, csvHeader + csvContent)
        break
    }

    console.log(`✓ Exportado para: ${outputPath}`)
    return outputPath
  }

  /**
   * Gera relatório de exportação
   */
  generateReport(): string {
    const reportPath = path.join(this.config.outputPath, 'export-report.md')

    const report = `# Relatório de Exportação - Verdade Base para Vetores

**Data:** ${new Date().toISOString()}

## Sumário

- **Total de Vetores:** ${this.vectors.length}
- **Formato:** ${this.config.format.toUpperCase()}
- **Incluir Embeddings:** ${this.config.includeEmbeddings ? 'Sim' : 'Não'}
- **Max Tokens/Entrada:** ${this.config.maxTokensPerEntry}

## Distribuição por Fonte

| Fonte | Quantidade |
|-------|-----------|
${this.vectors.reduce((acc, v) => {
  const source = v.source
  const count = this.vectors.filter(vec => vec.source === source).length
  const seen = acc.find(line => line.includes(source))
  return seen ? acc : [...acc, \`| \${source} | \${count} |\`]
}, []).join('\n')}

## Entradas

${this.vectors.map((v, i) => `
### ${i + 1}. ${v.sourceId}

- **Título:** ${v.title}
- **ID:** ${v.id}
- **Hash:** ${v.hash}
- **Keywords:** ${v.keywords.join(', ')}
- **Tamanho:** ${v.content.length} chars
- **Timestamp:** ${v.timestamp}
`).join('\n')}

## Observações

- Todos os vetores possuem hash SHA-256 para integridade
- Keywords extraídas automaticamente
- Conteúdo truncado para otimização
- Formato permite retrieval semântico

---

**Arquivo Gerado:** ${new Date().toISOString()}
`

    fs.writeFileSync(reportPath, report)
    console.log(`✓ Relatório gerado: ${reportPath}`)
    return reportPath
  }

  /**
   * Lista vetores processados
   */
  listVectors(): VectorEntry[] {
    return this.vectors
  }

  /**
   * Retorna contagem de vetores
   */
  getVectorCount(): number {
    return this.vectors.length
  }
}

/**
 * Função auxiliar para exportação
 */
export async function exportTruthBaseToVectors(
  truthBasePath: string = './Axioms/Truth_Base',
  outputPath: string = './Axioms/Truth_Base/exports'
): Promise<void> {
  console.log('🔄 Iniciando exportação de Verdade Base para vetores...\n')

  const exporter = new VectorExporter({
    includeEmbeddings: false,
    format: 'json',
    outputPath,
    maxTokensPerEntry: 500
  })

  // Processa arquivos
  exporter.processAxiomsFile(path.join(truthBasePath, 'axioms.md'))
  exporter.processBusinessFactsFile(path.join(truthBasePath, 'business-facts.md'))
  exporter.processHierarchyFile(path.join(truthBasePath, 'decision-hierarchy.md'))

  // Exporta em múltiplos formatos
  console.log('\n📤 Exportando...')
  exporter.export('truth-base-vectors')

  // Gera relatório
  exporter.generateReport()

  console.log(`\n✓ Exportação concluída com ${exporter.getVectorCount()} vetores`)
}
