# Integração com Fontes de Verdade - Coordenador

## Visão Geral

O coordenador central precisa manter sincronização com todas as fontes de verdade:

1. **Supabase** - Memória vetorial e dados
2. **Jira** - Projetos e issues
3. **Confluence** - Documentação
4. **Git** - Código e histórico

## Supabase

### Estrutura

- **Cada empresa**: Projeto Supabase próprio
- **Coordenador**: Projeto global (apenas memória agregada)

### Memória Global

O coordenador mantém `orchestrator_global_memory` no projeto global:

```sql
-- Tabela de memória global
create table orchestrator_global_memory (
  id bigserial primary key,
  content text not null,
  embedding vector(384) not null,
  source_instance text,  -- Qual empresa
  category text not null,
  shared boolean default false,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
```

### Agregação

```javascript
import { addGlobalMemory } from './scripts/orchestrator/global_memory.js';

// Após iteração bem-sucedida
await addGlobalMemory({
  content: aprendizado,
  sourceInstance: 'empresa-a',
  category: 'insight',
  shared: true,
});
```

## Jira

### Estrutura

- **Cada empresa**: Projeto Jira próprio
- **Coordenador**: Projeto global "ORCH" (cross-empresa insights)

### Sincronização

```javascript
import { searchIssues, createTask } from './scripts/jira_rest_api.js';

// Buscar issues de uma empresa
const issues = await searchIssues(
  `project = AUP AND updated > -7d`,
  'coorporacaoautonoma.atlassian.net',
  token
);

// Criar insight global
await createTask({
  projectKey: 'ORCH',
  summary: 'Padrão detectado: Solução X funcionou em empresa A',
  description: '...',
});
```

## Confluence

### Estrutura

- **Cada empresa**: Space próprio
- **Coordenador**: Space global "Orchestrator" (documentação cross-empresa)

### Documentação Global

```javascript
import { createPage } from './scripts/confluence_rest_api.js';

// Criar página de insight global
await createPage({
  spaceKey: 'ORCH',
  title: 'Solução X - Padrão Cross-Empresa',
  body: '...',
  parentId: null,
});
```

## Git

### Estrutura

- **Código compartilhado**: Repo único (microservices)
- **Dados/contextos**: Isolados por empresa (não versionados ou em subdiretórios)

### Tracking

O coordenador pode usar GitKraken MCP para:

```javascript
// Rastrear mudanças em microservices
// (via GitKraken MCP)

// Detectar novos componentes
// Analisar padrões em commits
// Sugerir compartilhamentos
```

### Integração com git_executor.js

```javascript
import { createBranch, createCommit, createPR } from './scripts/git_executor.js';

// Ao compartilhar componente, criar PR
await createPR({
  title: `[ORCH] Compartilhar componente: ${componentName}`,
  body: `Componente criado por ${sourceInstance}`,
  head: branchName,
  base: 'main',
});
```

## Documentação

### Estrutura

- **Local**: `docs/` compartilhado
- **Vetorial**: Memória global do coordenador
- **Jira/Confluence**: Por empresa + global

### Sincronização

1. Documentação local → Confluence (por empresa)
2. Insights → Confluence global + memória vetorial
3. Padrões → Jira global + memória vetorial

## Fluxo de Sincronização

```
Mudança significativa em Empresa A
  ↓
Coordenador detecta (via Git/API)
  ↓
Valida se é compartilhável
  ↓
Se sim:
  - Adiciona à memória global (Supabase)
  - Cria issue/task no Jira global
  - Documenta no Confluence global
  - Oferece para outras empresas
```

## Exemplo Completo

```javascript
import {
  addGlobalMemory,
  searchGlobalMemory,
} from './scripts/orchestrator/global_memory.js';
import { createTask } from './scripts/jira_rest_api.js';
import { createPage } from './scripts/confluence_rest_api.js';

// 1. Detectar solução interessante
const solution = {
  content: 'Solução de cache que melhorou performance em 50%',
  sourceInstance: 'empresa-a',
  technology: 'redis',
};

// 2. Adicionar à memória global
await addGlobalMemory({
  content: solution.content,
  sourceInstance: solution.sourceInstance,
  category: 'solution',
  shared: true,
  metadata: { technology: solution.technology },
});

// 3. Criar task no Jira global
await createTask({
  projectKey: 'ORCH',
  summary: `[${solution.sourceInstance}] Solução: ${solution.content}`,
  description: `Solução compartilhável detectada...`,
});

// 4. Documentar no Confluence global
await createPage({
  spaceKey: 'ORCH',
  title: `Solução: ${solution.content}`,
  body: `Origem: ${solution.sourceInstance}\n\n${solution.content}`,
});
```

---

**Referências:**
- [ORQUESTRADOR_CENTRAL.md](ORQUESTRADOR_CENTRAL.md)
- [MEMORIA_GLOBAL.md](MEMORIA_GLOBAL.md)
- [COMPARTILHAMENTO_COMPONENTES.md](COMPARTILHAMENTO_COMPONENTES.md)

























