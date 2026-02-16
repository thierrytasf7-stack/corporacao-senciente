# API REST do Atlassian - Guia Rápido

## ✅ Status: Funcionando

- **Jira**: ✅ API REST funcionando
- **Confluence**: ✅ API REST funcionando
- **MCP OAuth**: ⏳ Pendente (opcional)

## 🚀 Começar Rápido

### 1. Testar Conexão

```bash
node scripts/test_atlassian_rest_api.js
```

### 2. Usar nos Seus Scripts

```javascript
// Jira
import { createTask, searchIssues, listProjects } from './scripts/jira_rest_api.js';

// Confluence
import { createPage, listSpaces, listPages } from './scripts/confluence_rest_api.js';
```

### 3. Exemplo Completo

```javascript
import { createTask } from './scripts/jira_rest_api.js';
import { createPage } from './scripts/confluence_rest_api.js';

// Criar task
const task = await createTask({
  projectKey: 'AUP',
  summary: 'Minha Task',
  description: 'Descrição da task',
  issueType: 'Task'
});

// Criar página
const page = await createPage({
  spaceKey: 'AUP',
  title: 'Minha Página',
  body: '# Título\n\nConteúdo...'
});
```

## 📚 Documentação Completa

Veja `docs/USAR_API_REST_ATLASSIAN.md` para documentação detalhada.

## 🔧 Configuração

Certifique-se de ter em `env.local`:

```env
ATLASSIAN_SITE=https://coorporacaoautonoma.atlassian.net
ATLASSIAN_API_TOKEN=ATATT...
ATLASSIAN_EMAIL=seu@email.com
```

## 📝 Scripts Disponíveis

- `scripts/test_atlassian_rest_api.js` - Testar conexão
- `scripts/jira_rest_api.js` - Módulo Jira (importável)
- `scripts/confluence_rest_api.js` - Módulo Confluence (importável)

























