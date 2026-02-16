#!/usr/bin/env node
/**
 * Script de Migração: Confluence → LangMem
 * 
 * Migra páginas do Confluence para o LangMem (Protocolo L.L.B.)
 * 
 * Uso:
 *   node scripts/memory/migrate_confluence_to_langmem.js [--dry-run] [--space=SPACE_KEY]
 */

import { config } from 'dotenv';
import fs from 'fs';
import { logger } from '../utils/logger.js';
import { getLangMem } from './langmem.js';

const log = logger.child({ module: 'migrate_confluence' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

/**
 * Determina categoria LangMem baseado no espaço do Confluence
 */
function determineCategory(confluenceSpace) {
    const categoryMap = {
        'Architecture': 'architecture',
        'Engineering': 'architecture',
        'Product': 'business_rules',
        'Business': 'business_rules',
        'Patterns': 'patterns',
        'Technical': 'patterns'
    };

    return categoryMap[confluenceSpace] || 'architecture';
}

/**
 * Extrai grafos de dependência do conteúdo do Confluence (se houver)
 */
function extractDependencies(content) {
    // Tentar extrair dependências de listas ou tabelas
    const dependencies = {
        required: [],
        optional: [],
        conflicts: []
    };

    // Procurar por padrões como "Depende de:", "Requer:", etc.
    const requiredMatch = content.match(/(?:Depende de|Requer|Requires?):\s*([^\n]+)/i);
    if (requiredMatch) {
        dependencies.required = requiredMatch[1]
            .split(',')
            .map(d => d.trim())
            .filter(d => d.length > 0);
    }

    return dependencies;
}

/**
 * Converte página do Confluence para formato LangMem
 */
function convertConfluencePageToLangMem(page) {
    const content = page.body?.storage?.value || page.body?.view?.value || '';
    const category = determineCategory(page.space?.key || '');
    const dependencies = extractDependencies(content);

    return {
        content: content,
        category: category,
        graph_dependencies: Object.keys(dependencies).length > 0 ? dependencies : null,
        metadata: {
            confluence_id: page.id,
            confluence_title: page.title,
            confluence_space: page.space?.key,
            confluence_url: page._links?.webui,
            migrated_from: 'confluence',
            migrated_at: new Date().toISOString()
        }
    };
}

/**
 * Migra páginas do Confluence para LangMem
 */
async function migrateConfluenceToLangMem(confluencePages, dryRun = false) {
    log.info('Iniciando migração Confluence → LangMem', {
        totalPages: confluencePages.length,
        dryRun
    });

    const langmem = getLangMem();
    const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
    };

    for (const page of confluencePages) {
        try {
            const langmemWisdom = convertConfluencePageToLangMem(page);

            if (dryRun) {
                log.info('DRY RUN: Migraria página', {
                    confluence_id: page.id,
                    title: page.title?.substring(0, 50),
                    category: langmemWisdom.category
                });
                results.skipped++;
            } else {
                const success = await langmem.storeWisdom(
                    langmemWisdom.content,
                    langmemWisdom.category,
                    langmemWisdom.graph_dependencies
                );

                if (success) {
                    results.success++;
                    log.info('Página migrada', { confluence_id: page.id, title: page.title });
                } else {
                    results.failed++;
                    results.errors.push({
                        confluence_id: page.id,
                        title: page.title,
                        error: 'Falha ao armazenar sabedoria no LangMem'
                    });
                }
            }
        } catch (err) {
            results.failed++;
            results.errors.push({
                confluence_id: page.id || 'unknown',
                title: page.title || 'unknown',
                error: err.message
            });
            log.error('Erro ao migrar página', {
                confluence_id: page.id,
                error: err.message
            });
        }
    }

    return results;
}

/**
 * Função principal
 */
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const spaceKey = args.find(arg => arg.startsWith('--space='))?.split('=')[1];

    log.info('Script de Migração Confluence → LangMem', { dryRun, spaceKey });

    // Nota: Este script requer que você busque as páginas do Confluence primeiro
    // Exemplo usando API REST do Confluence:
    /*
    const confluencePages = await fetchConfluencePages(spaceKey);
    const results = await migrateConfluenceToLangMem(confluencePages, dryRun);
    */

    // Por enquanto, apenas exibir instruções
    log.info(`
╔══════════════════════════════════════════════════════════════╗
║  MIGRAÇÃO CONFLUENCE → LANGMEM                               ║
╚══════════════════════════════════════════════════════════════╝

Para migrar páginas do Confluence para LangMem:

1. Busque páginas do Confluence via API REST:
   - Use: scripts/_archive/confluence_rest_api.js como referência
   - Ou use: scripts/consolidacao/sincronizar_jira_confluence.js

2. Execute este script com as páginas:
   const confluencePages = [...]; // Array de páginas do Confluence
   const results = await migrateConfluenceToLangMem(confluencePages, false);

3. Valide migração:
   - Verifique corporate_memory no Supabase
   - Teste: langmem.getWisdom('query')

Exemplo de uso:
  node scripts/memory/migrate_confluence_to_langmem.js --dry-run
  node scripts/memory/migrate_confluence_to_langmem.js --space=SPACE_KEY

Documentação:
  - docs/02-architecture/LANGMEM.md
  - docs/02-architecture/LLB_MIGRATION.md
    `);

    if (dryRun) {
        log.info('Modo DRY RUN ativado - nenhuma mudança será feita');
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => {
        log.error('Erro fatal', { error: err.message, stack: err.stack });
        process.exit(1);
    });
}

export { convertConfluencePageToLangMem, determineCategory, migrateConfluenceToLangMem };



