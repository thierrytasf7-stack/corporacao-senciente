# Usando API REST do Atlassian (Funcionando ✅)

## Status

✅ **Jira**: Funcionando via API REST  
✅ **Confluence**: Funcionando via API REST  
⚠️ **MCP OAuth**: Pendente (não bloqueia trabalho)

## Configuração

### Variáveis de Ambiente Necessárias

No arquivo `env.local`, certifique-se de ter:

```env
ATLASSIAN_SITE=https://coorporacaoautonoma.atlassian.net
ATLASSIAN_CLOUD_ID=177fb6d9-9eeb-46df-abac-6fd61f449415
ATLASSIAN_API_TOKEN=ATATT...  (classic API token)
ATLASSIAN_EMAIL=thierry.tasf7@gmail.com
```

### Como Obter o Token

1. Acesse: https://id.atlassian.com/manage-profile/security/api-tokens
2. Clique em "Create API token"
3. Dê um nome (ex: "Cursor REST API")
4. Copie o token (prefixo `ATATT...`)
5. Cole em `env.local` como `ATLASSIAN_API_TOKEN`

## Scripts Disponíveis

### 1. Testar Conexão

```bash
node scripts/test_atlassian_rest_api.js
```

**Resultado esperado:**
- ✅ Autenticação OK
- ✅ Lista de projetos do Jira
- ✅ Lista de espaços do Confluence
- ✅ Lista de páginas do Confluence

### 2. Criar Tasks no Jira

```bash
node scripts/create_jira_tasks.js
```

**Funcionalidades:**
- Criar tasks individuais
- Criar múltiplas tasks
- Vincular a épicos
- Usar ADF (Atlassian Document Format) para descrições

**Exemplo de uso programático:**

```javascript
import { createTask } from './scripts/jira_rest_api.js';

const task = await createTask({
  projectKey: 'AUP',
  summary: 'Implementar feature X',
  description: 'Descrição detalhada...',
  issueType: 'Task',
  labels: ['feature', 'backend'],
  epicLink: 'AUP-123' // opcional
});

console.log(`Task criada: ${task.key}`);
```

### 3. Criar Páginas no Confluence

```bash
node scripts/setup_confluence_pages.js
```

**Funcionalidades:**
- Criar páginas em espaços
- Criar páginas filhas (hierarquia)
- Converter Markdown para ADF
- Atualizar páginas existentes

**Exemplo de uso programático:**

```javascript
import { createPage } from './scripts/confluence_rest_api.js';

const page = await createPage({
  spaceKey: 'AUP',
  title: 'Nova Documentação',
  body: '# Título\n\nConteúdo em markdown...',
  parentId: '123456789' // opcional, para criar como filha
});

console.log(`Página criada: ${page.id}`);
```

### 4. Setup Completo (Jira + Confluence)

```bash
node scripts/setup_atlassian_complete.js
```

**Funcionalidades:**
- Criar épico no Jira
- Criar tasks vinculadas ao épico
- Criar páginas no Confluence
- Vincular páginas do Confluence às tasks do Jira

## Autenticação

Todos os scripts usam **Basic Authentication**:

```javascript
const base64Auth = Buffer.from(`${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}`).toString('base64');

const response = await fetch(url, {
  headers: {
    'Authorization': `Basic ${base64Auth}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});
```

## Endpoints Úteis

### Jira

```javascript
// Listar projetos
GET /rest/api/3/project

// Criar issue
POST /rest/api/3/issue
Body: {
  fields: {
    project: { key: 'AUP' },
    summary: 'Título',
    issuetype: { name: 'Task' },
    description: { ...ADF... }
  }
}

// Buscar issues (JQL)
POST /rest/api/3/search
Body: {
  jql: 'project = AUP ORDER BY created DESC',
  maxResults: 50
}
```

### Confluence

```javascript
// Listar espaços
GET /wiki/rest/api/space?limit=100

// Criar página
POST /wiki/rest/api/content
Body: {
  type: 'page',
  title: 'Título',
  space: { key: 'AUP' },
  body: {
    storage: {
      value: '<p>HTML content</p>',
      representation: 'storage'
    }
  }
}

// Listar páginas de um espaço
GET /wiki/rest/api/content?spaceKey=AUP&limit=100
```

## Formato de Descrição (ADF)

O Jira usa **Atlassian Document Format (ADF)** para descrições. Exemplo:

```javascript
const description = {
  type: 'doc',
  version: 1,
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Este é um parágrafo de texto.'
        }
      ]
    }
  ]
};
```

**Helper para converter Markdown para ADF:**

Use a biblioteca `markdown-to-adf` ou crie um helper simples:

```javascript
function markdownToADF(markdown) {
  // Converter markdown para ADF
  // Pode usar biblioteca como markdown-to-adf
  // ou criar conversor simples
}
```

## Exemplos Práticos

### Exemplo 1: Criar Epic no Jira

```javascript
import { createTask } from './scripts/jira_rest_api.js';

const epic = await createTask({
  projectKey: 'AUP',
  summary: 'Implementar Autocura de Código',
  description: 'Epic para implementar sistema de autocura de código para Industry 6.0',
  issueType: 'Epic',
  labels: ['self-heal', 'industry-6.0']
});

console.log(`Epic criada: ${epic.key}`);
```

### Exemplo 2: Criar Página no Confluence

```javascript
import { createPage } from './scripts/confluence_rest_api.js';

const page = await createPage({
  spaceKey: 'AUP',
  title: 'Documentação do Projeto',
  body: `
# Título Principal

## Seção 1

Conteúdo da seção...

## Seção 2

Mais conteúdo...
  `,
  parentId: null // página raiz
});

console.log(`Página criada: ${page.id}`);
```

### Exemplo 3: Buscar Issues do Projeto

```javascript
import { searchIssues } from './scripts/jira_rest_api.js';

const results = await searchIssues(
  'project = AUP ORDER BY created DESC',
  {
    maxResults: 50,
    fields: ['summary', 'status', 'assignee']
  }
);

console.log(`Total: ${results.total} issues`);
results.issues.forEach(issue => {
  console.log(`${issue.key}: ${issue.fields.summary}`);
});
```

### Exemplo 4: Listar Espaços e Páginas do Confluence

```javascript
import { listSpaces, listPages } from './scripts/confluence_rest_api.js';

// Listar espaços
const spaces = await listSpaces();
console.log(`Espaços encontrados: ${spaces.size}`);
spaces.results.forEach(space => {
  console.log(`- ${space.key}: ${space.name}`);
});

// Listar páginas de um espaço
const pages = await listPages('AUP');
console.log(`Páginas no espaço AUP: ${pages.size}`);
pages.results.forEach(page => {
  console.log(`- ${page.title} (${page.type})`);
});
```

### Exemplo 5: Workflow Completo (Epic + Tasks + Página)

```javascript
import { createTask } from './scripts/jira_rest_api.js';
import { createPage } from './scripts/confluence_rest_api.js';

// 1. Criar Epic
const epic = await createTask({
  projectKey: 'AUP',
  summary: 'Sistema de Autocura',
  description: 'Implementar sistema de autocura para Industry 6.0',
  issueType: 'Epic',
  labels: ['self-heal']
});

console.log(`Epic criada: ${epic.key}`);

// 2. Criar Tasks vinculadas
const task1 = await createTask({
  projectKey: 'AUP',
  summary: 'Implementar detector de falhas',
  description: 'Detectar falhas em testes automaticamente',
  issueType: 'Task',
  labels: ['backend'],
  epicLink: epic.key
});

const task2 = await createTask({
  projectKey: 'AUP',
  summary: 'Implementar corretor automático',
  description: 'Corrigir código automaticamente quando possível',
  issueType: 'Task',
  labels: ['ai'],
  epicLink: epic.key
});

// 3. Criar página de documentação
const docPage = await createPage({
  spaceKey: 'AUP',
  title: `Documentação: ${epic.key}`,
  body: `
# ${epic.key}: Sistema de Autocura

## Tasks

- ${task1.key}: Implementar detector de falhas
- ${task2.key}: Implementar corretor automático

## Progresso

Em desenvolvimento...
  `
});

console.log(`Documentação criada: ${docPage.id}`);
```

## Troubleshooting

### Erro 401 Unauthorized

- Verifique se `ATLASSIAN_API_TOKEN` está correto
- Verifique se `ATLASSIAN_EMAIL` está correto
- O token deve ser um **classic API token** (prefixo `ATATT...`)

### Erro 403 Forbidden

- Verifique se o usuário tem permissões no projeto/espaço
- Verifique se o token foi gerado pelo usuário correto

### Erro 404 Not Found

- Verifique se o `ATLASSIAN_SITE` está correto
- Verifique se o projeto/espaço existe

### Erro 410 Gone (API removida)

- Alguns endpoints antigos foram removidos
- Use os endpoints atualizados (ex: `/rest/api/3/search` com POST em vez de GET)

## Próximos Passos

1. ✅ **Usar scripts REST existentes** para criar conteúdo
2. ⏳ **Configurar MCP OAuth** (opcional, para integração nativa)
3. 📝 **Automatizar workflows** usando os scripts

## Scripts Disponíveis

Todos os scripts estão em `scripts/`:

### Scripts de Teste
- `test_atlassian_rest_api.js` - Testar conexão completa

### Scripts de Configuração
- `create_jira_tasks.js` - Criar tasks no Jira (exemplo)
- `setup_confluence_pages.js` - Criar páginas no Confluence (exemplo)
- `setup_atlassian_complete.js` - Setup completo (exemplo)

### Módulos Reutilizáveis (Novo ✅)
- `jira_rest_api.js` - Módulo para Jira (importável)
- `confluence_rest_api.js` - Módulo para Confluence (importável)

**Use os módulos reutilizáveis em seus próprios scripts!**

## Referências

- [Jira REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Confluence REST API](https://developer.atlassian.com/cloud/confluence/rest/)
- [Atlassian Document Format](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/)

