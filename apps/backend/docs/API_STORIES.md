# 📚 API de Stories - Documentação Técnica

**Versão:** 1.0.0  
**Última Atualização:** 05 Fevereiro 2026  
**Arquivo:** `backend/src_api/story-workflow.js`

---

## 📋 Visão Geral

API RESTful para gerenciamento completo de stories (user stories) com suporte a workflow automático integrado ao Aider.

### Funcionalidades Principais

- ✅ CRUD completo de stories
- ✅ Workflow automático em 6 steps
- ✅ Integração com Aider para execução
- ✅ Filtros por status, categoria e prioridade
- ✅ Persistência em arquivos JSON

---

## 🔌 Endpoints Disponíveis

### 1. Criar Story

**POST** `/api/stories`

Cria uma nova story no sistema.

**Request Body:**
```json
{
  "title": "string (obrigatório)",
  "description": "string (obrigatório)",
  "category": "string (opcional, default: 'feature')",
  "complexity": "string (opcional, default: 'standard')",
  "priority": "string (opcional, default: 'medium')",
  "acceptanceCriteria": ["string"] (opcional, default: []),
  "technicalNotes": "string (opcional, default: '')"
}
```

**Valores Válidos:**
- `category`: "feature", "bug", "task", "infrastructure", "documentation"
- `complexity`: "simple", "standard", "complex"
- `priority`: "low", "medium", "high", "critical"

**Response (200):**
```json
{
  "success": true,
  "story": {
    "id": "story-abc12345",
    "title": "Implementar autenticação",
    "description": "Sistema de login com JWT",
    "category": "feature",
    "complexity": "standard",
    "priority": "high",
    "status": "backlog",
    "currentStep": null,
    "workflowState": null,
    "aiderSession": null,
    "acceptanceCriteria": [
      "Usuário pode fazer login",
      "Token JWT é gerado"
    ],
    "technicalNotes": "Usar bcrypt para hash",
    "createdAt": "2026-02-05T10:00:00.000Z",
    "updatedAt": "2026-02-05T10:00:00.000Z",
    "assignedAgent": null
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Title and description are required"
}
```

---

### 2. Listar Stories

**GET** `/api/stories`

Lista todas as stories com filtros opcionais.

**Query Parameters (opcionais):**
- `status`: Filtrar por status (ex: "backlog", "in_progress", "done")
- `category`: Filtrar por categoria (ex: "feature", "bug")
- `priority`: Filtrar por prioridade (ex: "high", "critical")

**Exemplos:**
```
GET /api/stories
GET /api/stories?status=backlog
GET /api/stories?category=feature&priority=high
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "story-abc12345",
      "title": "Implementar autenticação",
      "status": "backlog",
      "category": "feature",
      "priority": "high",
      ...
    }
  ],
  "total": 42
}
```

**Nota:** O campo `data` (não `stories`) é usado para compatibilidade com o frontend.

---

### 3. Obter Story por ID

**GET** `/api/stories/:id`

Retorna detalhes completos de uma story específica.

**Parâmetros:**
- `id`: ID da story (ex: "story-abc12345")

**Response (200):**
```json
{
  "success": true,
  "story": {
    "id": "story-abc12345",
    "title": "Implementar autenticação",
    "description": "Sistema de login com JWT",
    ...
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Story not found: story-abc12345"
}
```

---

### 4. Atualizar Story

**PUT** `/api/stories/:id`

Atualiza campos permitidos de uma story existente.

**Parâmetros:**
- `id`: ID da story

**Request Body (campos opcionais):**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "complexity": "string",
  "priority": "string",
  "acceptanceCriteria": ["string"],
  "technicalNotes": "string"
}
```

**Campos NÃO Atualizáveis:**
- `id`, `status`, `currentStep`, `workflowState`, `aiderSession`, `createdAt`, `assignedAgent`

**Response (200):**
```json
{
  "success": true,
  "story": {
    "id": "story-abc12345",
    "title": "Novo título",
    ...
  }
}
```

---

### 5. Deletar Story

**DELETE** `/api/stories/:id`

Remove uma story do sistema.

**Parâmetros:**
- `id`: ID da story

**Response (200):**
```json
{
  "success": true,
  "message": "Story deleted successfully"
}
```

**Response (500):**
```json
{
  "success": false,
  "error": "File not found"
}
```

---

## 🔄 Endpoints de Workflow

### 6. Iniciar Workflow

**POST** `/api/stories/:id/start`

Inicia o workflow automático (Steps 1-3).

**Parâmetros:**
- `id`: ID da story

**Steps Executados:**
1. **Requirements Analysis** - Análise de requisitos
2. **Design** - Criação do design técnico
3. **Tasks** - Geração de tasks de implementação

**Response (200):**
```json
{
  "success": true,
  "story": {
    "id": "story-abc12345",
    "status": "review_pending",
    "currentStep": 3,
    "workflowState": "awaiting_review",
    "aiderSession": {
      "sessionId": "session-xyz789",
      "startedAt": "2026-02-05T10:05:00.000Z"
    },
    ...
  },
  "message": "Workflow started successfully. Story is now in review_pending phase."
}
```

**Response (200 - erro):**
```json
{
  "success": false,
  "error": "Story not found"
}
```

---

### 7. Continuar Workflow

**POST** `/api/stories/:id/continue`

Continua o workflow automático (Steps 4-6).

**Parâmetros:**
- `id`: ID da story

**Steps Executados:**
4. **Implementation** - Implementação do código
5. **Testing** - Criação e execução de testes
6. **Documentation** - Documentação do código

**Response (200):**
```json
{
  "success": true,
  "story": {
    "id": "story-abc12345",
    "status": "done",
    "currentStep": 6,
    "workflowState": "completed",
    ...
  },
  "message": "Workflow completed successfully. Story is now done."
}
```

---

### 8. Status do Workflow

**GET** `/api/stories/:id/workflow-status`

Retorna o status atual do workflow de uma story.

**Parâmetros:**
- `id`: ID da story

**Response (200):**
```json
{
  "success": true,
  "workflowState": "awaiting_review",
  "currentStep": 3,
  "status": "review_pending",
  "aiderSession": {
    "sessionId": "session-xyz789",
    "startedAt": "2026-02-05T10:05:00.000Z"
  }
}
```

---

## 📊 Modelo de Dados

### Story Object

```typescript
interface Story {
  id: string;                    // Gerado automaticamente (story-{uuid})
  title: string;                 // Título da story
  description: string;           // Descrição detalhada
  category: string;              // Categoria (feature, bug, task, etc.)
  complexity: string;            // Complexidade (simple, standard, complex)
  priority: string;              // Prioridade (low, medium, high, critical)
  status: string;                // Status atual (backlog, in_progress, review_pending, done)
  currentStep: number | null;    // Step atual do workflow (1-6)
  workflowState: string | null;  // Estado do workflow (awaiting_review, completed, etc.)
  aiderSession: object | null;   // Informações da sessão Aider
  acceptanceCriteria: string[];  // Critérios de aceitação
  technicalNotes: string;        // Notas técnicas
  createdAt: string;             // Data de criação (ISO 8601)
  updatedAt: string;             // Data de atualização (ISO 8601)
  assignedAgent: string | null;  // Agente responsável
}
```

### Workflow States

| Estado | Descrição |
|--------|-----------|
| `null` | Workflow não iniciado |
| `awaiting_review` | Aguardando revisão (após steps 1-3) |
| `in_progress` | Workflow em execução |
| `completed` | Workflow concluído |
| `failed` | Workflow falhou |

### Story Status

| Status | Descrição |
|--------|-----------|
| `backlog` | Story criada, aguardando início |
| `planning` | Em planejamento |
| `in_progress` | Em desenvolvimento |
| `review_pending` | Aguardando revisão |
| `done` | Concluída |

---

## 🔧 Integração com Aider

O workflow automático utiliza o **Aider** para executar as tasks de forma autônoma.

### Como Funciona

1. **Step 1-3 (start):** Aider analisa requisitos, cria design e gera tasks
2. **Pausa para Revisão:** Usuário revisa o plano gerado
3. **Step 4-6 (continue):** Aider implementa código, testes e documentação

### Configuração Necessária

```javascript
// backend/services/story-workflow-engine.js
const AIDER_PATH = 'aider';  // Comando Aider no PATH
const AIDER_MODEL = 'gpt-4'; // Modelo LLM a usar
```

---

## 💾 Persistência

### Armazenamento

Stories são salvas como arquivos JSON individuais:

```
backend/docs/stories/
  ├── story-abc12345.json
  ├── story-def67890.json
  └── story-ghi11121.json
```

### Formato do Arquivo

```json
{
  "id": "story-abc12345",
  "title": "Implementar autenticação",
  "description": "Sistema de login com JWT",
  "category": "feature",
  "complexity": "standard",
  "priority": "high",
  "status": "backlog",
  "currentStep": null,
  "workflowState": null,
  "aiderSession": null,
  "acceptanceCriteria": [
    "Usuário pode fazer login",
    "Token JWT é gerado"
  ],
  "technicalNotes": "Usar bcrypt para hash",
  "createdAt": "2026-02-05T10:00:00.000Z",
  "updatedAt": "2026-02-05T10:00:00.000Z",
  "assignedAgent": null
}
```

---

## 🧪 Exemplos de Uso

### Criar e Executar Story Completa

```bash
# 1. Criar story
curl -X POST http://localhost:3002/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar autenticação",
    "description": "Sistema de login com JWT",
    "category": "feature",
    "priority": "high",
    "acceptanceCriteria": [
      "Usuário pode fazer login",
      "Token JWT é gerado"
    ]
  }'

# Response: { "success": true, "story": { "id": "story-abc12345", ... } }

# 2. Iniciar workflow (Steps 1-3)
curl -X POST http://localhost:3002/api/stories/story-abc12345/start

# 3. Verificar status
curl http://localhost:3002/api/stories/story-abc12345/workflow-status

# 4. Continuar workflow (Steps 4-6)
curl -X POST http://localhost:3002/api/stories/story-abc12345/continue

# 5. Verificar conclusão
curl http://localhost:3002/api/stories/story-abc12345
```

### Listar Stories por Status

```bash
# Todas as stories em backlog
curl http://localhost:3002/api/stories?status=backlog

# Features de alta prioridade
curl http://localhost:3002/api/stories?category=feature&priority=high
```

---

## 🔍 Troubleshooting

### Erro: "Title and description are required"

**Causa:** Campos obrigatórios não fornecidos  
**Solução:** Incluir `title` e `description` no body

### Erro: "Story not found"

**Causa:** ID inválido ou story deletada  
**Solução:** Verificar ID com `GET /api/stories`

### Workflow não inicia

**Causa:** Aider não configurado ou não no PATH  
**Solução:** Instalar Aider e configurar `AIDER_PATH`

### Stories não aparecem no frontend

**Causa:** Frontend espera campo `data`, não `stories`  
**Solução:** API já retorna `data` corretamente (linha 186)

---

## 📚 Arquivos Relacionados

### Backend
- `backend/src_api/story-workflow.js` - API endpoints (este arquivo)
- `backend/services/story-workflow-engine.js` - Engine de workflow
- `backend/server.js` - Registro de rotas

### Frontend
- `apps/dashboard/src/hooks/use-stories.ts` - Hook de integração
- `apps/dashboard/src/hooks/use-story-workflow.ts` - Hook de workflow
- `apps/dashboard/src/components/kanban/KanbanBoard.tsx` - UI Kanban
- `apps/dashboard/src/stores/story-store.ts` - Store Zustand

### Documentação
- `SPEC_WORKFLOW_AUTONOMO_STORIES.md` - Especificação completa
- `RESUMO_FINAL_SESSAO_WORKFLOW.md` - Resumo de implementação
- `VALIDACAO_FINAL_WORKFLOW_FRONTEND.md` - Validação frontend

---

## 🚀 Próximas Melhorias

### Planejadas
- [ ] Suporte a anexos (imagens, arquivos)
- [ ] Comentários em stories
- [ ] Histórico de mudanças
- [ ] Notificações de workflow
- [ ] Integração com GitHub Issues

### Em Consideração
- [ ] Webhooks para eventos de workflow
- [ ] API GraphQL alternativa
- [ ] Suporte a templates de stories
- [ ] Métricas de performance de workflow

---

**Última Atualização:** 05 Fevereiro 2026  
**Mantido por:** Kiro AI (Autonomia Extrema)  
**Versão da API:** 1.0.0
