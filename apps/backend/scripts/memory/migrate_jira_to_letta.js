#!/usr/bin/env node
/**
 * Script de Migração: Jira → Letta
 * 
 * Migra issues do Jira para o Letta (Protocolo L.L.B.)
 * 
 * Uso:
 *   node scripts/memory/migrate_jira_to_letta.js [--dry-run] [--jira-project=PROJECT_KEY]
 */

import { config } from 'dotenv';
import fs from 'fs';
import { logger } from '../utils/logger.js';
import { getLetta } from './letta.js';

const log = logger.child({ module: 'migrate_jira' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

/**
 * Mapeia status do Jira para status do Letta
 */
function mapJiraStatusToLetta(jiraStatus) {
    const statusMap = {
        'To Do': 'planning',
        'In Progress': 'coding',
        'In Review': 'review',
        'Done': 'done',
        'Blocked': 'blocked',
        'Closed': 'done'
    };

    return statusMap[jiraStatus] || 'planning';
}

/**
 * Converte issue do Jira para formato Letta
 */
function convertJiraIssueToLetta(issue) {
    return {
        task_description: issue.summary || issue.fields?.summary || 'Task sem título',
        status: mapJiraStatusToLetta(issue.fields?.status?.name || 'To Do'),
        metadata: {
            jira_key: issue.key,
            jira_id: issue.id,
            jira_url: issue.self,
            migrated_from: 'jira',
            migrated_at: new Date().toISOString(),
            original_status: issue.fields?.status?.name,
            assignee: issue.fields?.assignee?.displayName,
            priority: issue.fields?.priority?.name,
            labels: issue.fields?.labels || [],
            description: issue.fields?.description || ''
        }
    };
}

/**
 * Migra issues do Jira para Letta
 */
async function migrateJiraToLetta(jiraIssues, dryRun = false) {
    log.info('Iniciando migração Jira → Letta', {
        totalIssues: jiraIssues.length,
        dryRun
    });

    const letta = getLetta();
    const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
    };

    for (const issue of jiraIssues) {
        try {
            const lettaTask = convertJiraIssueToLetta(issue);

            if (dryRun) {
                log.info('DRY RUN: Migraria issue', {
                    jira_key: issue.key,
                    task: lettaTask.task_description.substring(0, 50),
                    status: lettaTask.status
                });
                results.skipped++;
            } else {
                const success = await letta.updateState(
                    lettaTask.task_description,
                    lettaTask.status,
                    lettaTask.metadata
                );

                if (success) {
                    results.success++;
                    log.info('Issue migrada', { jira_key: issue.key });
                } else {
                    results.failed++;
                    results.errors.push({
                        jira_key: issue.key,
                        error: 'Falha ao atualizar estado no Letta'
                    });
                }
            }
        } catch (err) {
            results.failed++;
            results.errors.push({
                jira_key: issue.key || 'unknown',
                error: err.message
            });
            log.error('Erro ao migrar issue', {
                jira_key: issue.key,
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
    const projectKey = args.find(arg => arg.startsWith('--jira-project='))?.split('=')[1];

    log.info('Script de Migração Jira → Letta', { dryRun, projectKey });

    // Nota: Este script requer que você busque as issues do Jira primeiro
    // Exemplo usando API REST do Jira:
    /*
    const jiraIssues = await fetchJiraIssues(projectKey);
    const results = await migrateJiraToLetta(jiraIssues, dryRun);
    */

    // Por enquanto, apenas exibir instruções
    log.info(`
╔══════════════════════════════════════════════════════════════╗
║  MIGRAÇÃO JIRA → LETTA                                       ║
╚══════════════════════════════════════════════════════════════╝

Para migrar issues do Jira para Letta:

1. Busque issues do Jira via API REST:
   - Use: scripts/_archive/jira_rest_api.js como referência
   - Ou use: scripts/consolidacao/sincronizar_jira_confluence.js

2. Execute este script com as issues:
   const jiraIssues = [...]; // Array de issues do Jira
   const results = await migrateJiraToLetta(jiraIssues, false);

3. Valide migração:
   - Verifique task_context no Supabase
   - Teste: letta.getCurrentState()

Exemplo de uso:
  node scripts/memory/migrate_jira_to_letta.js --dry-run
  node scripts/memory/migrate_jira_to_letta.js --jira-project=PROJ

Documentação:
  - docs/02-architecture/LETTA.md
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

export { convertJiraIssueToLetta, mapJiraStatusToLetta, migrateJiraToLetta };



