/**
 * Exportador da Truth Base para Vetores/Embeddings
 * Prepara axiomas e fatos para retrieval semântico
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

/** Documento exportável */
export interface TruthDocument {
  id: string;
  type: 'axiom' | 'fact' | 'decision';
  title: string;
  content: string;
  metadata: {
    source: string;
    category?: string;
    version?: string;
    created?: string;
    updated?: string;
    axiom_base?: string;
    keywords?: string[];
  };
}

/** Resultado de exportação */
export interface ExportResult {
  documents: TruthDocument[];
  totalCount: number;
  exportedAt: string;
  outputPath: string;
}

/**
 * Exportador da Truth Base
 */
export class TruthBaseExporter {
  private truthBasePath: string;
  private documents: TruthDocument[] = [];

  constructor(truthBasePath?: string) {
    this.truthBasePath = truthBasePath || path.join(process.cwd(), 'Axioms', 'Truth_Base');
  }

  /**
   * Executa exportação completa
   */
  async export(outputPath?: string): Promise<ExportResult> {
    // Limpa documentos anteriores
    this.documents = [];

    // Coleta documentos
    await this.collectAxioms();
    await this.collectFacts();
    await this.collectDecisions();

    // Prepara resultado
    const result: ExportResult = {
      documents: this.documents,
      totalCount: this.documents.length,
      exportedAt: new Date().toISOString(),
      outputPath: outputPath || path.join(this.truthBasePath, 'exports', 'truth-base-vectors.json')
    };

    // Salva em disco
    await this.saveExport(result);

    return result;
  }

  /**
   * Coleta axiomas
   */
  private async collectAxioms(): Promise<void> {
    const axiomsPath = path.join(this.truthBasePath, 'axioms', 'CORE_AXIOMS.md');

    try {
      const content = await fs.readFile(axiomsPath, 'utf-8');

      // Extrai cada axioma
      const axiomRegex = /## (AXIOMA \d+): (.+?)\n\n\*\*Enunciado:\*\* (.+?)\n\n\*\*Implicações:\*\*\n([\s\S]+?)(?=\n---|\n## |$)/g;
      let match;

      while ((match = axiomRegex.exec(content)) !== null) {
        const [, id, title, enunciado, implicacoes] = match;

        this.documents.push({
          id: id.replace(/\s/g, '_'),
          type: 'axiom',
          title,
          content: `${enunciado}\n\nImplicações:\n${implicacoes.trim()}`,
          metadata: {
            source: 'CORE_AXIOMS.md',
            keywords: this.extractKeywords(title + ' ' + enunciado)
          }
        });
      }
    } catch (error) {
      console.error('Erro ao coletar axiomas:', error);
    }
  }

  /**
   * Coleta fatos de negócio
   */
  private async collectFacts(): Promise<void> {
    const factsPattern = path.join(this.truthBasePath, 'wiki', 'business-facts', '**', '*.md');

    try {
      const files = await glob(factsPattern.replace(/\\/g, '/'));

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const frontmatter = this.extractFrontmatter(content);

        if (frontmatter.id) {
          // Remove frontmatter do conteúdo
          const cleanContent = content.replace(/^---[\s\S]+?---\n\n/, '');

          this.documents.push({
            id: frontmatter.id,
            type: 'fact',
            title: frontmatter.title || path.basename(file, '.md'),
            content: cleanContent.trim(),
            metadata: {
              source: path.relative(this.truthBasePath, file),
              category: frontmatter.category,
              version: frontmatter.version,
              created: frontmatter.created,
              updated: frontmatter.updated,
              axiom_base: frontmatter.axiom,
              keywords: this.extractKeywords(frontmatter.title + ' ' + cleanContent)
            }
          });
        }
      }
    } catch (error) {
      console.error('Erro ao coletar fatos:', error);
    }
  }

  /**
   * Coleta decisões (ADRs)
   */
  private async collectDecisions(): Promise<void> {
    const decisionsPath = path.join(this.truthBasePath, 'wiki', 'decisions');

    try {
      await fs.access(decisionsPath);
      const files = await glob(path.join(decisionsPath, '**', '*.md').replace(/\\/g, '/'));

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const frontmatter = this.extractFrontmatter(content);

        if (frontmatter.id) {
          const cleanContent = content.replace(/^---[\s\S]+?---\n\n/, '');

          this.documents.push({
            id: frontmatter.id,
            type: 'decision',
            title: frontmatter.title || path.basename(file, '.md'),
            content: cleanContent.trim(),
            metadata: {
              source: path.relative(this.truthBasePath, file),
              created: frontmatter.created,
              keywords: this.extractKeywords(frontmatter.title + ' ' + cleanContent)
            }
          });
        }
      }
    } catch (error) {
      // Diretório pode não existir ainda
    }
  }

  /**
   * Extrai frontmatter YAML de arquivo Markdown
   */
  private extractFrontmatter(content: string): any {
    const frontmatterRegex = /^---\n([\s\S]+?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) return {};

    const frontmatter: any = {};
    const lines = match[1].split('\n');

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        frontmatter[key.trim()] = valueParts.join(':').trim();
      }
    }

    return frontmatter;
  }

  /**
   * Extrai keywords importantes do texto
   */
  private extractKeywords(text: string): string[] {
    // Remove markdown, pontuação e converte para lowercase
    const clean = text
      .replace(/[#*`]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .toLowerCase();

    // Split em palavras
    const words = clean.split(/\s+/).filter(w => w.length > 3);

    // Remove duplicatas e retorna top 10
    const unique = Array.from(new Set(words));

    // Filtra stopwords comuns
    const stopwords = ['para', 'com', 'que', 'uma', 'como', 'por', 'quando', 'onde', 'seja', 'este', 'esta'];
    const filtered = unique.filter(w => !stopwords.includes(w));

    return filtered.slice(0, 10);
  }

  /**
   * Salva exportação em disco
   */
  private async saveExport(result: ExportResult): Promise<void> {
    const outputDir = path.dirname(result.outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // JSON completo
    await fs.writeFile(
      result.outputPath,
      JSON.stringify(result, null, 2),
      'utf-8'
    );

    // JSONL para embeddings (uma linha por documento)
    const jsonlPath = result.outputPath.replace('.json', '.jsonl');
    const jsonlLines = result.documents.map(doc => JSON.stringify(doc));
    await fs.writeFile(jsonlPath, jsonlLines.join('\n'), 'utf-8');

    // CSV para análise
    const csvPath = result.outputPath.replace('.json', '.csv');
    const csvLines = [
      'id,type,title,content_length,keywords',
      ...result.documents.map(doc =>
        `"${doc.id}","${doc.type}","${doc.title}",${doc.content.length},"${(doc.metadata.keywords || []).join(';')}"`
      )
    ];
    await fs.writeFile(csvPath, csvLines.join('\n'), 'utf-8');

    console.log(`✓ Exportação concluída:`);
    console.log(`  - JSON: ${result.outputPath}`);
    console.log(`  - JSONL: ${jsonlPath}`);
    console.log(`  - CSV: ${csvPath}`);
    console.log(`  - Total: ${result.totalCount} documentos`);
  }

  /**
   * Gera estatísticas da exportação
   */
  generateStats(result: ExportResult): void {
    const byType = result.documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = result.documents
      .filter(doc => doc.metadata.category)
      .reduce((acc, doc) => {
        acc[doc.metadata.category!] = (acc[doc.metadata.category!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    console.log('\n=== ESTATÍSTICAS ===');
    console.log(`Total de documentos: ${result.totalCount}`);
    console.log('\nPor tipo:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    if (Object.keys(byCategory).length > 0) {
      console.log('\nPor categoria:');
      Object.entries(byCategory).forEach(([category, count]) => {
        console.log(`  - ${category}: ${count}`);
      });
    }
  }
}

/**
 * CLI para execução direta
 */
export async function exportTruthBase(): Promise<ExportResult> {
  const exporter = new TruthBaseExporter();
  const result = await exporter.export();
  exporter.generateStats(result);
  return result;
}

// Se executado diretamente
if (require.main === module) {
  exportTruthBase().catch(console.error);
}
