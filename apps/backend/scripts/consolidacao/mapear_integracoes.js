#!/usr/bin/env node
/**
 * Script para mapear todas as integrações
 * Task 1.1.4 do plano de reestruturação
 */

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const integrations = [
    {
        name: 'Protocolo L.L.B. (Letta)',
        type: 'State Management',
        configKeys: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
        testScript: 'scripts/memory/test_letta.js',
        docs: ['docs/02-architecture/LETTA.md'],
        note: 'Substitui Jira para gerenciamento de estado e tarefas'
    },
    {
        name: 'Protocolo L.L.B. (LangMem)',
        type: 'Knowledge Management',
        configKeys: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
        testScript: 'scripts/memory/test_langmem.js',
        docs: ['docs/02-architecture/LANGMEM.md'],
        note: 'Substitui Confluence para armazenamento de conhecimento'
    },
    {
        name: 'Protocolo L.L.B. (ByteRover)',
        type: 'Code Intelligence',
        configKeys: [],
        testScript: 'scripts/memory/test_byterover.js',
        docs: ['docs/02-architecture/BYTEROVER.md'],
        note: 'Substitui GitKraken para navegação e análise de código'
    },
    // DESCONTINUADO - Substituído pelo Protocolo L.L.B.
    /*
    {
        name: 'Jira (DESCONTINUADO)',
        type: 'MCP',
        configKeys: ['ATLASSIAN_EMAIL', 'ATLASSIAN_API_TOKEN', 'ATLASSIAN_DOMAIN'],
        testScript: null,
        docs: ['docs/MCP_STATUS.md', 'docs/JIRA_TEMPLATES.md', 'README_MCP.md'],
        note: 'Substituído por Letta (Protocolo L.L.B.)'
    },
    {
        name: 'Confluence (DESCONTINUADO)',
        type: 'MCP',
        configKeys: ['ATLASSIAN_EMAIL', 'ATLASSIAN_API_TOKEN', 'ATLASSIAN_DOMAIN'],
        testScript: null,
        docs: ['docs/MCP_STATUS.md', 'docs/CONFLUENCE_TEMPLATES.md'],
        note: 'Substituído por LangMem (Protocolo L.L.B.)'
    },
    {
        name: 'GitKraken (DESCONTINUADO)',
        type: 'MCP',
        configKeys: [],
        testScript: null,
        docs: ['docs/GITKRAKEN_MCP.md'],
        note: 'Substituído por ByteRover (Protocolo L.L.B.)'
    },
    */
    {
        name: 'Supabase',
        type: 'Database',
        configKeys: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
        testScript: null,
        docs: []
    },
    {
        name: 'Google Ads',
        type: 'API',
        configKeys: ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_REFRESH_TOKEN'],
        testScript: 'scripts/test_google_ads_connection.js',
        docs: ['docs/CONFIGURACAO_GOOGLE_ADS_COMPLETA.md']
    },
    {
        name: 'WordPress',
        type: 'CMS',
        configKeys: ['WORDPRESS_URL', 'WORDPRESS_USER', 'WORDPRESS_PASSWORD'],
        testScript: 'scripts/test_wordpress_server.js',
        docs: ['README_WORDPRESS.md', 'docs/WORDPRESS_SETUP.md']
    },
    {
        name: 'Ollama',
        type: 'LLM',
        configKeys: ['OLLAMA_URL'],
        testScript: 'scripts/test_ollama_simple.js',
        docs: ['docs/CONFIGURACAO_OLLAMA_FINAL.md']
    }
];

function checkConfig(integration) {
    const missing = [];
    const present = [];

    integration.configKeys.forEach(key => {
        if (process.env[key]) {
            present.push(key);
        } else {
            missing.push(key);
        }
    });

    return {
        configured: missing.length === 0,
        missing,
        present
    };
}

function checkTestScript(integration) {
    if (!integration.testScript) {
        return { exists: false, runnable: false };
    }

    const scriptPath = path.resolve(process.cwd(), integration.testScript);
    const exists = fs.existsSync(scriptPath);

    if (!exists) {
        return { exists: false, runnable: false };
    }

    // Verificar se script é executável (tem shebang ou pode ser executado)
    try {
        const content = fs.readFileSync(scriptPath, 'utf8');
        const isExecutable = content.includes('#!/usr/bin/env node') ||
            content.includes('import') ||
            content.includes('require');
        return { exists: true, runnable: isExecutable };
    } catch {
        return { exists: true, runnable: false };
    }
}

function checkDocs(integration) {
    const found = [];
    const missing = [];

    integration.docs.forEach(doc => {
        const docPath = path.resolve(process.cwd(), doc);
        if (fs.existsSync(docPath)) {
            found.push(doc);
        } else {
            missing.push(doc);
        }
    });

    return { found, missing };
}

console.log('🔍 Mapeando integrações...\n');

const results = integrations.map(integration => {
    const configStatus = checkConfig(integration);
    const testStatus = checkTestScript(integration);
    const docsStatus = checkDocs(integration);

    let status = 'desconhecido';
    let works = false;

    if (configStatus.configured && testStatus.runnable) {
        status = 'configurado_e_testavel';
        works = true; // Assumir que funciona se está configurado e tem teste
    } else if (configStatus.configured) {
        status = 'configurado';
        works = false; // Não sabemos se funciona sem teste
    } else if (testStatus.runnable) {
        status = 'testavel_mas_nao_configurado';
        works = false;
    } else {
        status = 'nao_configurado';
        works = false;
    }

    return {
        ...integration,
        configStatus,
        testStatus,
        docsStatus,
        status,
        works
    };
});

// Estatísticas
const configured = results.filter(r => r.configStatus.configured).length;
const testable = results.filter(r => r.testStatus.runnable).length;
const working = results.filter(r => r.works).length;

console.log(`\n📊 Estatísticas:`);
console.log(`   Total de integrações: ${results.length}`);
console.log(`   Configuradas: ${configured}`);
console.log(`   Testáveis: ${testable}`);
console.log(`   Funcionando: ${working}`);

// Criar tabela markdown
const tableRows = results.map(r => {
    const statusIcon = r.works ? '✅' : r.configStatus.configured ? '⚠️' : '❌';
    return `| ${r.name} | ${r.type} | ${r.configStatus.configured ? 'Sim' : 'Não'} | ${r.testStatus.runnable ? 'Sim' : 'Não'} | ${r.works ? 'Sim' : 'Não'} | ${statusIcon} |`;
});

const markdownContent = `# Status das Integrações

Gerado automaticamente em ${new Date().toISOString()}

## Resumo

- Total: ${results.length} integrações
- Configuradas: ${configured} (${((configured / results.length) * 100).toFixed(1)}%)
- Testáveis: ${testable} (${((testable / results.length) * 100).toFixed(1)}%)
- Funcionando: ${working} (${((working / results.length) * 100).toFixed(1)}%)

## Tabela Completa

| Integração | Tipo | Configurada | Testável | Funciona | Status |
|------------|------|-------------|----------|----------|--------|
${tableRows.join('\n')}

## Detalhes por Integração

${results.map(r => `
### ${r.name}

- **Tipo:** ${r.type}
- **Status:** ${r.status}
- **Funciona:** ${r.works ? 'Sim' : 'Não'}
- **Configuração:**
  ${r.configStatus.configured ? '✅ Todas variáveis presentes' : `❌ Faltando: ${r.configStatus.missing.join(', ')}`}
  ${r.configStatus.present.length > 0 ? `  - Presentes: ${r.configStatus.present.join(', ')}` : ''}
- **Teste:**
  ${r.testStatus.exists ? `✅ Script existe: ${r.testScript}` : '❌ Script não encontrado'}
  ${r.testStatus.runnable ? '✅ Executável' : '❌ Não executável'}
- **Documentação:**
  ${r.docsStatus.found.length > 0 ? `✅ Encontrados: ${r.docsStatus.found.join(', ')}` : '❌ Nenhum documento encontrado'}
  ${r.docsStatus.missing.length > 0 ? `⚠️ Faltando: ${r.docsStatus.missing.join(', ')}` : ''}
`).join('\n')}

## Requisitos de Configuração

Para configurar cada integração, adicione as seguintes variáveis ao \`.env\` ou \`env.local\`:

${results.map(r => `
### ${r.name}

${r.configKeys.length > 0 ? r.configKeys.map(key => `- \`${key}\``).join('\n') : 'Nenhuma variável necessária'}
`).join('\n')}
`;

const outputFile = path.resolve(process.cwd(), 'docs', '04-integrations', 'STATUS.md');
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
fs.writeFileSync(outputFile, markdownContent, 'utf8');
console.log(`\n✅ Status salvo em: ${outputFile}`);

// Salvar JSON também
const jsonOutput = path.resolve(process.cwd(), 'integracoes_inventory.json');
fs.writeFileSync(jsonOutput, JSON.stringify({
    generated: new Date().toISOString(),
    total: results.length,
    statistics: {
        configured,
        testable,
        working
    },
    integrations: results
}, null, 2), 'utf8');
console.log(`✅ JSON salvo em: ${jsonOutput}`);

console.log('\n✅ Mapeamento de integrações completo!');





