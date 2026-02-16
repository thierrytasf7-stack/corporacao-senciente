#!/usr/bin/env node
/**
 * Script para Adicionar Aviso de Descontinuação no Jira
 * 
 * Cria issue de descontinuação e adiciona comentários em issues ativas
 * 
 * Uso:
 *   node scripts/memory/add_jira_discontinuation_notice.js [--dry-run] [--project=PROJECT_KEY]
 */

import { config } from 'dotenv';
import fs from 'fs';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'jira_discontinuation' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

/**
 * Template da issue de descontinuação
 */
function getDiscontinuationIssueTemplate() {
    return {
        summary: '🚨 DESCONTINUAÇÃO: Jira substituído por Protocolo L.L.B. (Letta)',
        description: `
Este projeto migrou para o Protocolo L.L.B. (LangMem, Letta, ByteRover).

O Jira foi substituído pelo **Letta** - gerenciador de estado e fluxo.

## 📚 Documentação

- **Letta**: [docs/02-architecture/LETTA.md](docs/02-architecture/LETTA.md)
- **Protocolo L.L.B.**: [docs/02-architecture/LLB_PROTOCOL.md](docs/02-architecture/LLB_PROTOCOL.md)
- **Guia de Migração**: [docs/02-architecture/LLB_MIGRATION.md](docs/02-architecture/LLB_MIGRATION.md)

## 🔄 Como Migrar Tasks

1. Tasks ativas foram migradas automaticamente para Letta
2. Novas tasks devem ser criadas via Protocolo L.L.B.
3. Estado atual: Consultar via \`Letta.getCurrentState()\`

## 📅 Data de Descontinuação

**2025-01-XX** - Este Jira não será mais atualizado.

⚠️ Use o Protocolo L.L.B. para gestão de estado.
        `.trim(),
        issuetype: 'Task',
        priority: 'Highest'
    };
}

/**
 * Template do comentário para issues ativas
 */
function getDiscontinuationComment() {
    return `
🚨 Esta issue foi migrada para o Protocolo L.L.B. (Letta).

Para consultar o estado atual desta task:
- Use: \`Letta.getCurrentState()\`
- Ou: \`GET /api/llb/letta/state\`

Esta issue no Jira não será mais atualizada.

📚 Ver documentação: [docs/02-architecture/LETTA.md](docs/02-architecture/LETTA.md)
    `.trim();
}

/**
 * Adiciona aviso de descontinuação no Jira
 */
async function addJiraDiscontinuationNotice(projectKey, dryRun = false) {
    log.info('Adicionando aviso de descontinuação no Jira', { projectKey, dryRun });

    // Nota: Este script requer integração com API REST do Jira
    // Use scripts/_archive/jira_rest_api.js ou scripts/consolidacao/sincronizar_jira_confluence.js como base

    if (dryRun) {
        log.info('DRY RUN: Criaria issue de descontinuação', {
            template: getDiscontinuationIssueTemplate()
        });
        log.info('DRY RUN: Adicionaria comentários em issues ativas');
        return;
    }

    // Implementação real requer:
    // 1. Criar issue de descontinuação via API REST do Jira
    // 2. Buscar todas issues ativas
    // 3. Adicionar comentário em cada issue

    log.info(`
╔══════════════════════════════════════════════════════════════╗
║  AVISO DE DESCONTINUAÇÃO NO JIRA                             ║
╚══════════════════════════════════════════════════════════════╝

Para adicionar avisos no Jira:

1. Use a API REST do Jira:
   - scripts/_archive/jira_rest_api.js
   - scripts/consolidacao/sincronizar_jira_confluence.js

2. Criar issue de descontinuação:
   const issue = await createJiraIssue(getDiscontinuationIssueTemplate());

3. Adicionar comentários em issues ativas:
   const activeIssues = await fetchJiraIssues({ status: ['To Do', 'In Progress'] });
   for (const issue of activeIssues) {
       await addComment(issue.key, getDiscontinuationComment());
   }

Documentação:
  - docs/02-architecture/JIRA_DISCONTINUATION.md
    `);
}

/**
 * Função principal
 */
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const projectKey = args.find(arg => arg.startsWith('--project='))?.split('=')[1] || 'PROJ';

    await addJiraDiscontinuationNotice(projectKey, dryRun);
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => {
        log.error('Erro fatal', { error: err.message, stack: err.stack });
        process.exit(1);
    });
}

export { addJiraDiscontinuationNotice, getDiscontinuationComment, getDiscontinuationIssueTemplate };



