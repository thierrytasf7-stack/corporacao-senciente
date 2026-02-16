# 🔗 PLANO DE INTEGRAÇÃO BACKEND → DASHBOARD

**Data:** 03/02/2026 03:30 UTC  
**Objetivo:** Conectar todas as abas do dashboard com dados reais do backend Diana  
**Status:** 📋 PLANEJAMENTO

---

## 🎯 OBJETIVO

Remover **TODOS** os mocks e simulações do dashboard AIOS, conectando cada aba com as APIs reais do backend Diana.

---

## 📊 MAPEAMENTO: ABAS vs BACKEND

### 1. Home (/) ✅ PARCIAL
**Status Atual:** Usa dados Diana customizados (30 agentes)  
**Mock:** Métricas de holding são estáticas  
**Backend Disponível:**
- `GET /api/agents` - Lista de agentes
- `GET /api/metrics` - Métricas gerais
- `GET /api/finances` - Finanças da holding

**Ação:**
- Conectar métricas de holding com `/api/finances`
- Atualizar stats de agentes com `/api/agents`

---

### 2. Agents (/agents) ✅ PARCIAL
**Status Atual:** Usa DIANA_AGENTS (30 agentes customizados)  
**Mock:** Status e métricas são estáticos  
**Backend Disponível:**
- `GET /api/agents` - Lista completa
- `GET /api/agents/:id` - Detalhes do agente
- `GET /api/agents/:id/opinions` - Opiniões do agente

**Ação:**
- Conectar lista de agentes com `/api/agents`
- Adicionar detalhes dinâmicos por agente
- Mostrar opiniões e status real

---

### 3. Kanban (/kanban) ❌ MOCKADO
**Status Atual:** Usa MOCK_STORIES  
**Mock:** Todas as stories são simuladas  
**Backend Disponível:**
- `GET /api/tasks` - Lista de tarefas
- `GET /api/tasks/:id` - Detalhes da tarefa
- `POST /api/tasks` - Criar tarefa

**Ação:**
- Substituir MOCK_STORIES por `/api/tasks`
- Implementar drag & drop com atualização no backend
- Adicionar criação/edição de tarefas

---

### 4. Monitor (/monitor) ❌ MOCKADO
**Status Atual:** Usa Server-Sent Events (SSE) mockados  
**Mock:** Eventos simulados  
**Backend Disponível:**
- `GET /api/events` - Stream de eventos (SSE)
- `GET /api/orchestrator/state` - Estado do orquestrador
- `GET /api/brain/status` - Status do cérebro

**Ação:**
- Conectar SSE com `/api/events`
- Mostrar estado real do orquestrador
- Exibir métricas do cérebro

---

### 5. Terminals (/terminals) ❌ MOCKADO
**Status Atual:** Usa MOCK_TERMINAL_SESSIONS  
**Mock:** Sessões de terminal simuladas  
**Backend Disponível:**
- `GET /api/cli/status` - Status do CLI
- `POST /api/cli/command` - Executar comando
- `GET /api/daemon/status` - Status dos daemons

**Ação:**
- Conectar com `/api/cli/status`
- Implementar execução real de comandos
- Mostrar logs dos daemons

---

### 6. GitHub (/github) ❌ MOCKADO
**Status Atual:** Usa MOCK_GITHUB_DATA  
**Mock:** Commits, PRs, issues simulados  
**Backend Disponível:**
- `GET /api/repositories` - Lista de repositórios
- `GET /api/repositories/:id` - Detalhes do repo
- `GET /api/github/*` - Integração GitHub

**Ação:**
- Conectar com `/api/repositories`
- Mostrar commits reais
- Exibir PRs e issues reais

---

### 7. Settings (/settings) ✅ FUNCIONAL
**Status Atual:** Usa useSettingsStore (Zustand)  
**Mock:** Configurações locais (useMockData toggle)  
**Backend Disponível:**
- `GET /api/settings` - Configurações
- `PUT /api/settings` - Atualizar configurações

**Ação:**
- Sincronizar settings com backend
- Persistir configurações no servidor
- Remover toggle useMockData (tudo será real)

---

### 8. QA (/qa) ❌ MOCKADO
**Status Atual:** Usa MOCK_QA_METRICS  
**Mock:** Métricas de qualidade simuladas  
**Backend Disponível:**
- `GET /api/qa` - Métricas de QA
- `GET /api/metrics` - Métricas gerais

**Ação:**
- Conectar com `/api/qa`
- Mostrar métricas reais de qualidade
- Exibir testes e cobertura

---

### 9. Roadmap (/roadmap) ❌ MOCKADO
**Status Atual:** Usa MOCK_ROADMAP_ITEMS  
**Mock:** Itens de roadmap simulados  
**Backend Disponível:**
- `GET /api/goals` - Objetivos e metas
- `GET /api/projects` - Projetos

**Ação:**
- Conectar com `/api/goals`
- Mostrar projetos reais
- Exibir progresso real

---

### 10. Insights (/insights) ❌ MOCKADO
**Status Atual:** Usa MOCK_INSIGHTS  
**Mock:** Analytics simulados  
**Backend Disponível:**
- `GET /api/metrics` - Métricas gerais
- `GET /api/memory/insights` - Insights derivados
- `GET /api/forge/llm-usage` - Uso de LLMs

**Ação:**
- Conectar com `/api/metrics`
- Mostrar insights reais
- Exibir uso de LLMs

---

## 🔧 ARQUITETURA DA INTEGRAÇÃO

### Backend Diana (Express)
```
http://localhost:3001
├── /api/agents
├── /api/tasks
├── /api/metrics
├── /api/finances
├── /api/events (SSE)
├── /api/cli
├── /api/repositories
├── /api/settings
├── /api/qa
├── /api/goals
└── /api/memory
```

### Dashboard (Next.js)
```
http://localhost:3000
├── src/app/api/* (proxy para backend)
├── src/hooks/* (SWR para fetch)
├── src/stores/* (Zustand para state)
└── src/lib/* (configuração)
```

### Fluxo de Dados
```
Dashboard → Next.js API Routes → Backend Diana → Database/Services
```

---

## 📝 PLANO DE EXECUÇÃO

### Fase 1: Configuração Base (30min)
1. ✅ Verificar backend rodando (http://localhost:3001)
2. ✅ Criar arquivo de configuração de API
3. ✅ Implementar proxy no Next.js
4. ✅ Testar conectividade

### Fase 2: Agents & Home (45min)
1. Conectar `/api/agents` com useAgents hook
2. Atualizar AgentStats com dados reais
3. Conectar HoldingMetrics com `/api/finances`
4. Remover MOCK_AGENTS

### Fase 3: Kanban & Tasks (1h)
1. Conectar `/api/tasks` com useStories hook
2. Implementar CRUD de tarefas
3. Adicionar drag & drop funcional
4. Remover MOCK_STORIES

### Fase 4: Monitor & Events (45min)
1. Conectar SSE com `/api/events`
2. Implementar stream de eventos real
3. Mostrar estado do orquestrador
4. Remover MOCK_EVENTS

### Fase 5: Terminals & CLI (1h)
1. Conectar `/api/cli/status`
2. Implementar execução de comandos
3. Mostrar logs dos daemons
4. Remover MOCK_TERMINAL_SESSIONS

### Fase 6: GitHub & Repos (45min)
1. Conectar `/api/repositories`
2. Mostrar commits reais
3. Exibir PRs e issues
4. Remover MOCK_GITHUB_DATA

### Fase 7: Settings & Config (30min)
1. Sincronizar com `/api/settings`
2. Persistir no backend
3. Remover toggle useMockData

### Fase 8: QA, Roadmap, Insights (1h)
1. Conectar `/api/qa`
2. Conectar `/api/goals`
3. Conectar `/api/metrics`
4. Remover todos os mocks restantes

### Fase 9: Testes & Validação (1h)
1. Testar todas as abas
2. Verificar performance
3. Validar dados reais
4. Documentar

### Fase 10: Limpeza & Otimização (30min)
1. Remover arquivos de mock
2. Otimizar queries
3. Adicionar cache
4. Documentação final

---

## ⏱️ TEMPO ESTIMADO

**Total:** 7h30min

- Fase 1: 30min
- Fase 2: 45min
- Fase 3: 1h
- Fase 4: 45min
- Fase 5: 1h
- Fase 6: 45min
- Fase 7: 30min
- Fase 8: 1h
- Fase 9: 1h
- Fase 10: 30min

---

## 🚀 INÍCIO IMEDIATO

### Pré-requisitos
- [x] Backend rodando (http://localhost:3001)
- [x] Dashboard rodando (http://localhost:3000)
- [x] Backup criado
- [x] Documentação lida

### Próximo Passo
**Iniciar Fase 1: Configuração Base**

---

**Criado por:** Kiro AI Assistant  
**Data:** 03/02/2026 03:30 UTC  
**Status:** 📋 PRONTO PARA EXECUTAR  
**Aprovação:** Aguardando Corporate Will
