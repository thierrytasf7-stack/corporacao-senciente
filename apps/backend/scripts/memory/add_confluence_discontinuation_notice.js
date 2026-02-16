#!/usr/bin/env node
/**
 * Script para Adicionar Aviso de Descontinuação no Confluence
 * 
 * Cria página de descontinuação e adiciona banners em páginas principais
 * 
 * Uso:
 *   node scripts/memory/add_confluence_discontinuation_notice.js [--dry-run] [--space=SPACE_KEY]
 */

import { config } from 'dotenv';
import fs from 'fs';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'confluence_discontinuation' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

/**
 * Template da página de descontinuação
 */
function getDiscontinuationPageTemplate() {
    return {
        title: '🚨 DESCONTINUAÇÃO: Confluence substituído por Protocolo L.L.B. (LangMem)',
        content: `
<h1>🚨 DESCONTINUAÇÃO: Confluence substituído por Protocolo L.L.B. (LangMem)</h1>

<p>Este projeto migrou para o Protocolo L.L.B. (LangMem, Letta, ByteRover).</p>

<p>O Confluence foi substituído pelo <strong>LangMem</strong> - arquivo de sabedoria.</p>

<h2>📚 Documentação</h2>

<ul>
<li><strong>LangMem</strong>: <a href="docs/02-architecture/LANGMEM.md">docs/02-architecture/LANGMEM.md</a></li>
<li><strong>Protocolo L.L.B.</strong>: <a href="docs/02-architecture/LLB_PROTOCOL.md">docs/02-architecture/LLB_PROTOCOL.md</a></li>
<li><strong>Guia de Migração</strong>: <a href="docs/02-architecture/LLB_MIGRATION.md">docs/02-architecture/LLB_MIGRATION.md</a></li>
</ul>

<h2>🔄 Como Migrar Documentação</h2>

<ol>
<li>Páginas importantes foram migradas automaticamente para LangMem</li>
<li>Nova documentação deve ser armazenada via Protocolo L.L.B.</li>
<li>Buscar sabedoria: Use <code>LangMem.getWisdom(query)</code></li>
</ol>

<h2>📅 Data de Descontinuação</h2>

<p><strong>2025-01-XX</strong> - Este Confluence não será mais atualizado.</p>

<p>⚠️ Use o Protocolo L.L.B. para armazenar e buscar sabedoria arquitetural.</p>
        `.trim()
    };
}

/**
 * Template do banner de descontinuação
 */
function getDiscontinuationBanner() {
    return `
<div style="background-color: #ff6b6b; color: white; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
  <strong>🚨 DESCONTINUAÇÃO:</strong> Esta página foi migrada para o Protocolo L.L.B. (LangMem).
  Esta página no Confluence não será mais atualizada.
  <a href="docs/02-architecture/LANGMEM.md" style="color: white; text-decoration: underline;">Ver documentação</a>
</div>
    `.trim();
}

/**
 * Adiciona aviso de descontinuação no Confluence
 */
async function addConfluenceDiscontinuationNotice(spaceKey, dryRun = false) {
    log.info('Adicionando aviso de descontinuação no Confluence', { spaceKey, dryRun });

    // Nota: Este script requer integração com API REST do Confluence
    // Use scripts/_archive/confluence_rest_api.js ou scripts/consolidacao/sincronizar_jira_confluence.js como base

    if (dryRun) {
        log.info('DRY RUN: Criaria página de descontinuação', {
            template: getDiscontinuationPageTemplate()
        });
        log.info('DRY RUN: Adicionaria banners em páginas principais');
        return;
    }

    // Implementação real requer:
    // 1. Criar página de descontinuação via API REST do Confluence
    // 2. Buscar todas páginas principais
    // 3. Adicionar banner em cada página

    log.info(`
╔══════════════════════════════════════════════════════════════╗
║  AVISO DE DESCONTINUAÇÃO NO CONFLUENCE                      ║
╚══════════════════════════════════════════════════════════════╝

Para adicionar avisos no Confluence:

1. Use a API REST do Confluence:
   - scripts/_archive/confluence_rest_api.js
   - scripts/consolidacao/sincronizar_jira_confluence.js

2. Criar página de descontinuação:
   const page = await createConfluencePage(getDiscontinuationPageTemplate());

3. Adicionar banners em páginas principais:
   const mainPages = await fetchConfluencePages({ space: spaceKey });
   for (const page of mainPages) {
       await updateConfluencePage(page.id, {
           content: getDiscontinuationBanner() + page.body.storage.value
       });
   }

Documentação:
  - docs/02-architecture/CONFLUENCE_DISCONTINUATION.md
    `);
}

/**
 * Função principal
 */
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const spaceKey = args.find(arg => arg.startsWith('--space='))?.split('=')[1] || 'SPACE';

    await addConfluenceDiscontinuationNotice(spaceKey, dryRun);
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => {
        log.error('Erro fatal', { error: err.message, stack: err.stack });
        process.exit(1);
    });
}

export { addConfluenceDiscontinuationNotice, getDiscontinuationBanner, getDiscontinuationPageTemplate };



