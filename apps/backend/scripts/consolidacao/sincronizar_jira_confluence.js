/**
 * Script para sincronizar documentação com Jira e Confluence via REST API
 * Usa API REST diretamente (não MCP OAuth) pois está mais estável
 */

import { config } from "dotenv";
import fs from "fs";

config({ path: fs.existsSync(".env") ? ".env" : "env.local" });

const {
  ATLASSIAN_SITE,
  ATLASSIAN_EMAIL,
  ATLASSIAN_API_TOKEN,
  ATLASSIAN_API_TOKEN_ADMIN,
  ATLASSIAN_CLOUD_ID,
} = process.env;

const token = ATLASSIAN_API_TOKEN_ADMIN || ATLASSIAN_API_TOKEN;
const auth = Buffer.from(`${ATLASSIAN_EMAIL}:${token}`).toString("base64");

const JIRA_BASE = `${ATLASSIAN_SITE}/rest/api/3`;
const CONFLUENCE_BASE = `${ATLASSIAN_SITE}/wiki/rest/api`;

/**
 * Faz requisição autenticada
 */
async function apiRequest(baseUrl, endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Converte texto simples para ADF (Atlassian Document Format)
 */
function textToADF(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const content = lines.map(line => {
    if (line.startsWith('#')) {
      const level = (line.match(/^#+/) || [''])[0].length;
      const text = line.replace(/^#+\s*/, '');
      return {
        type: 'heading',
        attrs: { level },
        content: [{ type: 'text', text }]
      };
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.replace(/^[-*]\s*/, '');
      return {
        type: 'bulletList',
        content: [{
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text }]
          }]
        }]
      };
    } else {
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: line }]
      };
    }
  });

  return {
    type: 'doc',
    version: 1,
    content: content.flat()
  };
}

/**
 * Busca issues no Jira usando JQL
 * Usa POST /rest/api/3/search/jql (novo endpoint)
 */
async function searchJiraIssues(jql) {
  const result = await apiRequest(JIRA_BASE, '/search/jql', {
    method: 'POST',
    body: JSON.stringify({
      jql,
      maxResults: 50,
      fields: ['summary', 'status', 'description', 'labels']
    })
  });
  return result;
}

/**
 * Cria issue no Jira
 */
async function createJiraIssue(projectKey, summary, description, issueType = 'Task', labels = []) {
  const adfDescription = textToADF(description);

  const result = await apiRequest(JIRA_BASE, '/issue', {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary,
        description: adfDescription,
        issuetype: { name: issueType },
        labels
      }
    })
  });
  return result;
}

/**
 * Atualiza issue no Jira
 */
async function updateJiraIssue(issueKey, updates) {
  const result = await apiRequest(JIRA_BASE, `/issue/${issueKey}`, {
    method: 'PUT',
    body: JSON.stringify({
      fields: updates
    })
  });
  return result;
}

/**
 * Adiciona comentário em issue do Jira
 */
async function addJiraComment(issueKey, comment) {
  const adfComment = textToADF(comment);
  const result = await apiRequest(JIRA_BASE, `/issue/${issueKey}/comment`, {
    method: 'POST',
    body: JSON.stringify({
      body: adfComment
    })
  });
  return result;
}

/**
 * Busca páginas no Confluence
 */
async function searchConfluencePages(spaceKey, titleQuery = '') {
  const cql = titleQuery
    ? `space = ${spaceKey} AND title ~ "${titleQuery}"`
    : `space = ${spaceKey}`;

  const result = await apiRequest(CONFLUENCE_BASE, `/content/search?cql=${encodeURIComponent(cql)}&limit=50`);
  return result;
}

/**
 * Cria página no Confluence
 */
async function createConfluencePage(spaceKey, title, body, parentId = null) {
  const htmlBody = body
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h])/gm, '<p>')
    .replace(/(?![h]>)$/gm, '</p>');

  const pageData = {
    type: 'page',
    title,
    space: { key: spaceKey },
    body: {
      storage: {
        value: htmlBody,
        representation: 'storage'
      }
    }
  };

  if (parentId) {
    pageData.ancestors = [{ id: parentId }];
  }

  const result = await apiRequest(CONFLUENCE_BASE, '/content', {
    method: 'POST',
    body: JSON.stringify(pageData)
  });
  return result;
}

/**
 * Atualiza página no Confluence
 */
async function updateConfluencePage(pageId, title, body, version) {
  const htmlBody = body
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h])/gm, '<p>')
    .replace(/(?![h]>)$/gm, '</p>');

  const result = await apiRequest(CONFLUENCE_BASE, `/content/${pageId}`, {
    method: 'PUT',
    body: JSON.stringify({
      id: pageId,
      type: 'page',
      title,
      version: { number: version + 1 },
      body: {
        storage: {
          value: htmlBody,
          representation: 'storage'
        }
      }
    })
  });
  return result;
}

/**
 * Função principal de sincronização
 */
async function sincronizar() {
  console.log('🔄 Iniciando sincronização com Jira e Confluence...\n');

  try {
    // 1. Buscar tasks relacionadas à reestruturação no Jira
    console.log('📋 Buscando tasks relacionadas à reestruturação...');
    // Buscar com termos mais amplos
    const jql = "project = AUP ORDER BY updated DESC";
    let issues;
    try {
      issues = await searchJiraIssues(jql);
    } catch (error) {
      console.log(`   ⚠️  Erro ao buscar issues: ${error.message}`);
      issues = { total: 0, issues: [] };
    }

    // Filtrar issues relacionadas localmente
    const issuesRelacionadas = issues.issues?.filter(i => {
      const summary = i.fields?.summary?.toLowerCase() || '';
      return summary.includes('reestruturação') ||
        summary.includes('reestruturacao') ||
        summary.includes('fase 1') ||
        summary.includes('consolidação') ||
        summary.includes('consolidacao') ||
        summary.includes('arquitetura chat') ||
        summary.includes('chat/ide');
    }) || [];

    console.log(`   ✅ Encontradas ${issuesRelacionadas.length} issues relacionadas (de ${issues.total || 0} total)\n`);

    // 2. Atualizar ou criar task da Fase 1
    const fase1Issue = issuesRelacionadas.find(i =>
      i.fields?.summary?.toLowerCase().includes('fase 1') ||
      i.fields?.summary?.toLowerCase().includes('consolidação') ||
      i.fields?.summary?.toLowerCase().includes('consolidacao')
    );

    if (fase1Issue) {
      console.log(`📝 Atualizando task ${fase1Issue.key}: ${fase1Issue.fields.summary}`);
      await addJiraComment(fase1Issue.key, `
Status: 96% completa (82/85 tasks)

✅ Completado:
- Documentação organizada (73 arquivos → 3 arquivos na raiz)
- Inventários completos (docs, scripts, agentes, integrações)
- READMEs consolidados
- RESUMOs consolidados e arquivados
- Scripts obsoletos arquivados (194 scripts)
- Imports quebrados corrigidos
- Documentos alinhados com arquitetura Chat/IDE
- Git sincronizado (3 commits)

⏳ Pendente:
- Jira/Confluence sincronização (em progresso)

Commits:
- 205dfcc: docs: Atualizar documentação para arquitetura Chat/IDE
- 3ee16f4: docs: Adicionar guia de sincronização de documentos
- 8b83f40: docs: Adicionar status de sincronização

Ver: docs/05-operations/SINCRONIZACAO_STATUS.md
      `);
      console.log(`   ✅ Task ${fase1Issue.key} atualizada\n`);
    } else {
      console.log('📝 Criando task para Fase 1: Consolidação e Limpeza...');
      const fase1IssueNew = await createJiraIssue(
        'AUP',
        'Fase 1: Consolidação e Limpeza - Reestruturação',
        `Consolidação e limpeza da documentação e código:

## Status: 96% completa (82/85 tasks)

✅ Completado:
- Documentação organizada (73 arquivos → 3 arquivos na raiz)
- Inventários completos (docs, scripts, agentes, integrações)
- READMEs consolidados
- RESUMOs consolidados e arquivados
- Scripts obsoletos arquivados (194 scripts)
- Imports quebrados corrigidos
- Documentos alinhados com arquitetura Chat/IDE
- Git sincronizado (3 commits)

⏳ Pendente:
- Jira/Confluence sincronização (em progresso)

## Referências
- docs/05-operations/SINCRONIZACAO_STATUS.md
- .cursor/plans/reestruturação_completa_corporação_senciente_b4623469.plan copy.md
        `,
        'Task',
        ['fase-1', 'consolidação', 'reestruturação']
      );
      console.log(`   ✅ Task criada: ${fase1IssueNew.key}\n`);
    }

    // 3. Criar task para Fase 2 se não existir
    const fase2Exists = issuesRelacionadas.some(i =>
      i.fields?.summary?.toLowerCase().includes('fase 2') ||
      i.fields?.summary?.toLowerCase().includes('arquitetura chat')
    );

    if (!fase2Exists) {
      console.log('📝 Criando task para Fase 2: Arquitetura de Swarm Chat/IDE...');
      const fase2Issue = await createJiraIssue(
        'AUP',
        'Fase 2: Arquitetura de Swarm Chat/IDE',
        `Implementar arquitetura baseada em incorporação via prompts:

## Objetivos
- Criar Brain Prompt Generator
- Criar Agent Prompt Generator  
- Criar Chat Interface
- Refatorar Executor para modo híbrido
- Atualizar agentes com suporte a prompts
- Criar daemon simplificado (Brain/Arms)

## Referências
- docs/02-architecture/ARQUITETURA_CHAT_IDE.md
- docs/02-architecture/SWARM_ARCHITECTURE.md
- .cursor/plans/reestruturação_completa_corporação_senciente_b4623469.plan copy.md

## Status
Pendente - Aguardando início da Fase 2`,
        'Task',
        ['fase-2', 'arquitetura', 'chat-ide']
      );
      console.log(`   ✅ Task criada: ${fase2Issue.key}\n`);
    } else {
      console.log('   ℹ️  Task da Fase 2 já existe\n');
    }

    // 4. Buscar páginas do Confluence relacionadas à arquitetura
    console.log('📄 Buscando páginas do Confluence relacionadas à arquitetura...');
    const pages = await searchConfluencePages('AUP', 'arquitetura');
    console.log(`   ✅ Encontradas ${pages.size} páginas\n`);

    // 5. Atualizar ou criar página sobre arquitetura Chat/IDE
    // Buscar página específica pelo título exato primeiro
    let arquiteturaPage = pages.results?.find(p =>
      p.title?.toLowerCase().includes('chat/ide') ||
      p.title?.toLowerCase() === 'arquitetura chat/ide - incorporação via prompts'
    );

    // Se não encontrar, buscar por palavras-chave
    if (!arquiteturaPage) {
      arquiteturaPage = pages.results?.find(p =>
        p.title?.toLowerCase().includes('chat') ||
        p.title?.toLowerCase().includes('ide') ||
        (p.title?.toLowerCase().includes('arquitetura') && p.title?.toLowerCase().includes('incorporação'))
      );
    }

    // Buscar página específica se ainda não encontrou
    if (!arquiteturaPage) {
      try {
        const specificPages = await searchConfluencePages('AUP', 'Arquitetura Chat/IDE');
        arquiteturaPage = specificPages.results?.[0];
      } catch (error) {
        console.log(`   ⚠️  Erro ao buscar página específica: ${error.message}`);
      }
    }

    if (arquiteturaPage) {
      console.log(`📝 Atualizando página: ${arquiteturaPage.title} (${arquiteturaPage.id})`);
      // Buscar versão atual da página
      try {
        const pageDetails = await apiRequest(CONFLUENCE_BASE, `/content/${arquiteturaPage.id}?expand=version`, {
          method: 'GET'
        });
        const docContent = fs.readFileSync('docs/02-architecture/ARQUITETURA_CHAT_IDE.md', 'utf-8');
        await updateConfluencePage(
          arquiteturaPage.id,
          'Arquitetura Chat/IDE - Incorporação via Prompts',
          docContent,
          pageDetails.version?.number || arquiteturaPage.version?.number || 1
        );
        console.log(`   ✅ Página atualizada\n`);
      } catch (error) {
        console.log(`   ⚠️  Erro ao atualizar página: ${error.message}`);
        console.log(`   ℹ️  Página já existe, mas não foi possível atualizar automaticamente\n`);
      }
    } else {
      console.log('📝 Criando página sobre Arquitetura Chat/IDE...');
      try {
        const docContent = fs.readFileSync('docs/02-architecture/ARQUITETURA_CHAT_IDE.md', 'utf-8');
        const newPage = await createConfluencePage(
          'AUP',
          'Arquitetura Chat/IDE - Incorporação via Prompts',
          docContent
        );
        console.log(`   ✅ Página criada: ${newPage.id}\n`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️  Página já existe (título duplicado)\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Sincronização concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - Jira: ${issues.total || 0} issues encontradas`);
    console.log(`   - Confluence: ${pages.size || 0} páginas encontradas`);
    console.log(`   - Task Fase 2: ${fase2Exists ? 'Já existe' : 'Criada'}`);
    console.log(`   - Página Arquitetura: ${arquiteturaPage ? 'Atualizada' : 'Criada'}`);

  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message);
    if (error.message.includes('401')) {
      console.error('   ⚠️  Erro de autenticação. Verifique ATLASSIAN_API_TOKEN no env.local');
    } else if (error.message.includes('403')) {
      console.error('   ⚠️  Erro de permissão. Verifique se o usuário tem acesso ao projeto/espaço');
    }
    process.exit(1);
  }
}

// Executar
sincronizar();





