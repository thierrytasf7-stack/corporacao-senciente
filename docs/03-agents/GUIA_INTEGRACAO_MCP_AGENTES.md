# Guia Prático: Integrar MCPs nos Agentes

## 🎯 Objetivo

Usar os MCPs **já disponíveis** para elevar os agentes de 4.1/10 para 6.5/10 rapidamente.

---

## ✅ MCPs Disponíveis

1. **Supabase MCP** (`mcp-supabase-coorporacao-autonoma`)
2. **GitKraken MCP** (`GitKraken`)
3. **Jira MCP** (`jira-rovo-remote`)
4. **Browser MCP** (`cursor-ide-browser`)

---

## 🔧 Como Integrar MCPs nos Agentes

### Exemplo 1: Dev Agent - Criar PR via GitKraken MCP

```javascript
// Em scripts/cerebro/agent_executor.js

case 'dev':
    tools.create_pr = async (params) => {
        const { title, body, sourceBranch, targetBranch = 'main' } = params;
        
        try {
            // Usar GitKraken MCP para criar PR
            // Nota: Em produção, isso seria chamado via MCP server
            // Por enquanto, podemos usar diretamente se MCP estiver disponível
            
            // Exemplo de integração (ajustar conforme implementação MCP)
            const prResult = await callMCP('GitKraken', 'pull_request_create', {
                repository_name: 'coorporacao-autonoma',
                repository_organization: 'seu-org',
                title,
                body,
                source_branch: sourceBranch,
                target_branch: targetBranch,
                provider: 'github'
            });
            
            return `PR criado: ${prResult.url || prResult.id}`;
        } catch (error) {
            log.error('Erro ao criar PR', { error: error.message });
            return `Erro ao criar PR: ${error.message}`;
        }
    };
    
    tools.get_git_status = async () => {
        // Usar GitKraken MCP
        const status = await callMCP('GitKraken', 'git_status', {
            directory: process.cwd()
        });
        return status;
    };
    
    tools.get_recent_commits = async (params) => {
        const { limit = 5 } = params;
        const commits = await callMCP('GitKraken', 'git_log_or_diff', {
            directory: process.cwd(),
            action: 'log'
        });
        return commits.slice(0, limit);
    };
    break;
```

### Exemplo 2: Data Agent - Executar SQL via Supabase MCP

```javascript
case 'data':
    tools.execute_sql = async (params) => {
        const { query, limit = 100 } = params;
        
        try {
            // Usar Supabase MCP para executar SQL
            const result = await callMCP('mcp-supabase-coorporacao-autonoma', 'execute_sql', {
                query: `${query} LIMIT ${limit}`
            });
            
            return `Resultado: ${JSON.stringify(result, null, 2)}`;
        } catch (error) {
            log.error('Erro ao executar SQL', { error: error.message });
            return `Erro ao executar SQL: ${error.message}`;
        }
    };
    
    tools.list_tables = async () => {
        const tables = await callMCP('mcp-supabase-coorporacao-autonoma', 'list_tables', {
            schemas: ['public']
        });
        return `Tabelas disponíveis: ${tables.map(t => t.name).join(', ')}`;
    };
    break;
```

### Exemplo 3: Todos Agentes - Criar Issue no Jira

```javascript
// Ferramenta comum para todos agentes
tools.create_jira_issue = async (params) => {
    const { title, description, issueType = 'Task', project = 'PSCC' } = params;
    
    try {
        // Usar Jira MCP (se disponível via MCP server)
        // Por enquanto, usar API direta
        const issue = await createJiraIssue({
            title,
            description,
            issueType,
            project
        });
        
        return `Issue criada: ${issue.key} - ${issue.url}`;
    } catch (error) {
        log.error('Erro ao criar issue Jira', { error: error.message });
        return `Erro ao criar issue: ${error.message}`;
    }
};
```

### Exemplo 4: Todos Agentes - Pesquisa Web via Browser MCP

```javascript
// Ferramenta comum para todos agentes
tools.search_web = async (params) => {
    const { query, maxResults = 5 } = params;
    
    try {
        // Usar Browser MCP para pesquisa
        // Navegar para Google/Bing
        await callMCP('cursor-ide-browser', 'browser_navigate', {
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
        });
        
        // Capturar snapshot
        const snapshot = await callMCP('cursor-ide-browser', 'browser_snapshot');
        
        // Extrair resultados (ajustar conforme estrutura)
        return `Resultados da pesquisa: ${snapshot.text}`;
    } catch (error) {
        log.error('Erro na pesquisa web', { error: error.message });
        return `Erro na pesquisa: ${error.message}`;
    }
};
```

---

## 📋 Checklist de Integração

### Para Cada Agente Crítico:

- [ ] **Dev Agent**
  - [ ] `create_pr` via GitKraken MCP
  - [ ] `get_git_status` via GitKraken MCP
  - [ ] `get_recent_commits` via GitKraken MCP
  - [ ] `create_jira_issue` para tracking

- [ ] **Data Agent**
  - [ ] `execute_sql` via Supabase MCP
  - [ ] `list_tables` via Supabase MCP
  - [ ] `get_table_schema` via Supabase MCP

- [ ] **Architect Agent**
  - [ ] `analyze_code` via GitKraken MCP (blame, diff)
  - [ ] `create_jira_issue` para decisões arquiteturais
  - [ ] `search_web` para padrões arquiteturais

- [ ] **Product Agent**
  - [ ] `create_jira_issue` para features
  - [ ] `search_web` para pesquisa de mercado
  - [ ] `get_recent_commits` para contexto

- [ ] **Copywriting Agent**
  - [ ] `search_web` para pesquisa de copy
  - [ ] `create_jira_issue` para tracking de conteúdo

- [ ] **Marketing Agent**
  - [ ] `search_web` para pesquisa de mercado
  - [ ] `create_jira_issue` para campanhas
  - [ ] `execute_sql` para analytics (se dados no Supabase)

- [ ] **Sales Agent**
  - [ ] `create_jira_issue` para leads/oportunidades
  - [ ] `search_web` para pesquisa de prospects

---

## 🚀 Implementação Imediata

### Passo 1: Criar Wrapper para MCP Calls

```javascript
// scripts/utils/mcp_client.js

export async function callMCP(serverName, functionName, params) {
    // Implementar chamada MCP
    // Por enquanto, retornar mock ou usar API direta
    log.info('Chamando MCP', { serverName, functionName, params });
    
    // TODO: Implementar chamada real via MCP protocol
    throw new Error('MCP integration not yet implemented');
}
```

### Passo 2: Integrar no Agent Executor

Adicionar tools que usam MCPs no `buildToolsForAgent`.

### Passo 3: Testar

Criar testes para cada tool integrada.

---

## 📊 Impacto Esperado

Após integrar MCPs:
- **Tools & MCPs**: 3.2/10 → **6.5/10** (+103%)
- **Capacidade de Execução**: 2.1/10 → **5.0/10** (+138%)
- **Nota Geral**: 4.1/10 → **6.0/10** (+46%)

---

**Próximo passo**: Implementar wrapper MCP e integrar 1 tool por agente crítico.






















