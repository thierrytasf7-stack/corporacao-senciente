# Auto-Planning Protocol - CEO-ZERO v4

**STATUS**: PRODUCTION | **VERSÃO**: 1.0.0 | **DATA**: 2026-02-14

---

## 🎯 Visão Geral

O **Auto-Planning Protocol** (Golden Rule GR7) permite que CEO-ZERO **se autofacilite a vida** ao decompor tasks complexas em subtasks atômicas executáveis por especialistas AIOS.

### Por Que Existe

**Problema Original**: Agent Zero falha em tasks complexas (Q:1/10) quando recebe tudo de uma vez.

**Exemplo Real**:
```
Task: "implementa frontend completo betting Week 7-8" (30 arquivos React+Vite)
Agent Zero direto: Q:1/10 (apenas bash commands, sem implementação)
Opus direto: $0.25 (muito caro)
```

**Solução GR7**: CEO-ZERO decompõe via @pm ($0) → subtasks F1-F3 → batch paralelo → Q:9/10, $0.02

---

## 🔥 Triggers Automáticos

CEO-ZERO ativa auto-planning quando detecta:

| Trigger | Descrição | Exemplo |
|---------|-----------|---------|
| **F-score >= 4** | Task complexa | "implementa sistema auth completo" |
| **>3 fases** | Múltiplas etapas | setup → implement → test → deploy |
| **Multi-domínio** | Frontend+Backend+DB | "cria API REST com UI React" |
| **>30min estimado** | Task longa | "refatora arquitetura inteira" |
| **Custo Opus >$0.10** | Economicamente viável | Tasks que gerariam >400 tokens Opus |

**Regra de Ouro**: Se você pensaria "isso é muito complexo para uma task só" → GR7 ativa automaticamente.

---

## 📊 Workflow Completo (6 Passos)

### PASSO 1: Detecção de Complexidade

```javascript
// CEO-ZERO analisa task recebida
const task = "implementa frontend betting Week 7-8"

// Estima F-score baseado em keywords
const fScore = estimateFScore(task)
// → F5 (frontend completo, 30 arquivos, múltiplas libs)

// Detecta múltiplas fases
const phases = detectPhases(task)
// → [setup, config, implement-stores, implement-components, implement-pages, integration, test]

// TRIGGER: F5 >= 4 && phases.length > 3
// → AUTO-PLANNING ATIVADO
```

### PASSO 2: Decomposição via @pm

```json
// CEO-ZERO monta JSON usando template pm-decomposition.json
{
  "agent": "pm",
  "task_type": "decompose-task",
  "aios_guide_path": ".aios-core/development/agents/pm.md",
  "context_files": [
    "workers/agent-zero/results/betting-fullstack-plan.md"
  ],
  "prompt": "TASK COMPLEXA PARA DECOMPOR:\nimplementa frontend completo betting Week 7-8\n\n[...template completo...]",
  "acceptance_criteria": [
    "Array JSON com 4-10 subtasks",
    "70%+ das subtasks sao F1-F3"
  ]
}
```

```bash
# Executa
node workers/agent-zero/delegate.js --file pm-decompose-betting-frontend.json
```

**Output do @pm** (array de subtasks):
```json
[
  {
    "id": "setup-vite",
    "title": "Cria projeto Vite+React",
    "description": "npm create vite, deps basicas",
    "agent_aios": "dev",
    "f_score": 2,
    "dependencies": [],
    "acceptance_criteria": ["package.json OK", "vite.config.ts OK"]
  },
  {
    "id": "config-shadcn",
    "title": "Configura shadcn/ui",
    "description": "npx shadcn init, tailwind",
    "agent_aios": "dev",
    "f_score": 2,
    "dependencies": ["setup-vite"],
    "acceptance_criteria": ["shadcn instalado", "components/ui/ criado"]
  },
  // ... mais 5 subtasks
]
```

### PASSO 3: Validação do Plano

```javascript
// CEO-ZERO valida o plano retornado
const subtasks = parsePmOutput(result)

// Check 1: Dependencies formam DAG (sem ciclos)
const isDAG = validateDependencies(subtasks)
// → true ✅

// Check 2: Agents AIOS válidos
const validAgents = ['dev', 'qa', 'architect', 'data-engineer', 'devops', 'ux-design-expert']
subtasks.every(st => validAgents.includes(st.agent_aios))
// → true ✅

// Check 3: F-scores realísticos (70%+ são F1-F3)
const lowFScorePercent = subtasks.filter(st => st.f_score <= 3).length / subtasks.length
// → 85% ✅ (6 de 7 são F1-F3)

// Se TODAS validações passam → PASSO 4
// Se ALGUMA falha → solicitar @pm refazer com feedback
```

### PASSO 4: Enfileiramento Inteligente (Waves)

```javascript
// CEO-ZERO agrupa subtasks em waves (paralelas)
const waves = buildExecutionWaves(subtasks)

// Wave 1: Subtasks sem dependencies
waves[0] = [
  { id: "setup-vite", ... }
]

// Wave 2: Subtasks que dependem apenas de wave 1
waves[1] = [
  { id: "config-shadcn", dependencies: ["setup-vite"], ... },
  { id: "config-trpc", dependencies: ["setup-vite"], ... }
]

// Wave 3: Subtasks que dependem de wave 2
waves[2] = [
  { id: "implement-stores", dependencies: ["config-shadcn", "config-trpc"], ... },
  { id: "implement-components", dependencies: ["config-shadcn"], ... },
  { id: "implement-pages", dependencies: ["config-shadcn"], ... }
]

// Wave 4: Integration + Test (dependem de wave 3)
waves[3] = [
  { id: "integration-backend", dependencies: ["implement-stores"], ... }
]

waves[4] = [
  { id: "test-build", dependencies: ["integration-backend"], ... }
]
```

**Benefício**: Waves independentes executam em **paralelo** (batch-runner.js).

### PASSO 5: Execução por Especialista

Para cada wave, CEO-ZERO executa subtasks:

**Wave 1: Setup (1 subtask)**
```json
// workers/agent-zero/queue/subtask-setup-vite.json
{
  "agent": "dev",
  "task_type": "implement",
  "aios_guide_path": ".aios-core/development/agents/dev.md",
  "context_files": [],
  "prompt": "Cria projeto Vite+React. npm create vite@latest, deps basicas.",
  "acceptance_criteria": ["package.json OK", "vite.config.ts OK"]
}
```

**Wave 2: Config (2 subtasks em paralelo)**
```bash
# Batch paralelo
node workers/agent-zero/batch-runner.js
# Executa subtask-config-shadcn.json + subtask-config-trpc.json simultaneamente
```

**Wave 3: Implement (3 subtasks em paralelo)**
```bash
# Batch paralelo
node workers/agent-zero/batch-runner.js
# Executa stores + components + pages simultaneamente
```

**Wave 4-5: Integration + Test (sequencial)**
```bash
# Sequencial (dependencies)
node workers/agent-zero/delegate.js --file subtask-integration.json
node workers/agent-zero/delegate.js --file subtask-test-build.json
```

### PASSO 6: Agregação de Resultados

```javascript
// CEO-ZERO coleta outputs de todas subtasks
const results = subtasks.map(st => {
  const output = readResultFile(`results/subtask-${st.id}.json`)
  return {
    id: st.id,
    status: output.status,
    quality: output.quality_score,
    files: output.files_created || []
  }
})

// Valida que TODAS passaram
const allPassed = results.every(r => r.status === 'completed' && r.quality >= 7)

if (allPassed) {
  // Agrega lista de arquivos criados
  const totalFiles = results.flatMap(r => r.files)

  // Reporta resultado consolidado
  return {
    status: 'completed',
    summary: `Frontend MVP completo. ${subtasks.length} subtasks executadas. ${totalFiles.length} arquivos criados.`,
    files: totalFiles,
    quality_avg: results.reduce((sum, r) => sum + r.quality, 0) / results.length
  }
}
```

**Output final para usuário**:
```
✅ Task "implementa frontend betting Week 7-8" COMPLETA

📊 Breakdown:
- 7 subtasks executadas
- 5 waves (2 paralelas, 3 sequenciais)
- 28 arquivos criados
- Qualidade média: 9.1/10
- Custo total: $0.02
- Tempo total: ~45s

📁 Arquivos criados:
- package.json
- vite.config.ts
- src/components/ui/button.tsx
- src/stores/strategyStore.ts
[... lista completa ...]

✅ Build: PASSING
✅ Testes: 12/12 OK
```

---

## 🧠 AIOS Routing Matrix

Quando @pm cria subtask, CEO-ZERO consulta esta matriz para escolher especialista:

| Tipo de Trabalho | Agent AIOS | Exemplo |
|------------------|------------|---------|
| **setup_project** | dev | "npm create vite" |
| **install_dependencies** | dev | "npm install react" |
| **configure_tools** | dev | "configura tailwind" |
| **implement_feature** | dev | "cria login component" |
| **write_tests** | qa | "testa login flow" |
| **validate_quality** | qa | "valida build" |
| **design_architecture** | architect | "projeta API REST" |
| **design_database** | data-engineer | "cria schema users" |
| **create_migration** | data-engineer | "migration add_role" |
| **design_ui** | ux-design-expert | "wireframe dashboard" |
| **write_documentation** | docs-generator | "documenta API" |
| **deploy_production** | devops | "deploy AWS" |
| **setup_ci_cd** | devops | "configura GitHub Actions" |

**Fallback**: Se tipo desconhecido, usa keywords no prompt + consulta `aios_guide_resolution` table.

---

## 💰 Análise de Custo (Caso Real)

### Cenário: betting-frontend-mvp

**Task Original**: "implementa frontend completo betting Week 7-8"
- 30 arquivos TypeScript
- React 19 + Vite + shadcn/ui + tRPC + Zustand
- 4 páginas + 12 components

### Opção 1: Opus Direto (SEM auto-planning)
```
Custo: ~$0.25
Tempo: ~3min
Qualidade: 9.7/10 (excelente, mas caro)
```

### Opção 2: Agent Zero Direto (SEM auto-planning)
```
Custo: $0.00
Tempo: ~3s
Qualidade: 1/10 (FALHA - task muito complexa)
Resultado: Apenas bash commands, sem implementação
```

### Opção 3: CEO-ZERO Auto-Planning (GR7)
```
PASSO 1: Decomposição via @pm
  Custo: $0.00 (Agent Zero free)
  Tempo: ~8s
  Output: 7 subtasks (F2-F4 cada)

PASSO 2: Execução por waves
  Wave 1 (setup): $0.00 | ~4s | Q:9/10
  Wave 2 (config): $0.00 | ~6s (paralelo) | Q:9/10
  Wave 3 (implement): $0.00 | ~12s (paralelo) | Q:9/10
  Wave 4 (integration): $0.00 | ~5s | Q:9/10
  Wave 5 (test): $0.00 | ~3s | Q:9/10

TOTAL:
  Custo: $0.02 (gestão Opus mínima)
  Tempo: ~45s (waves paralelas)
  Qualidade: 9.1/10 (média das subtasks)

ECONOMIA vs Opus: $0.23 (92% mais barato)
SPEEDUP vs sequencial: 2.8x (paralelo)
```

---

## 📝 Exemplo Completo End-to-End

### Input do Usuário
```
/CEOs:CEO-ZERO *auto-plan "implementa sistema de notificações push com backend Node.js + frontend React"
```

### CEO-ZERO Detecta Complexidade
```
F-score estimado: 6 (backend + frontend + notificações)
Fases: [backend-api, frontend-ui, push-integration, test]
Multi-domínio: backend, frontend
→ TRIGGER GR7: AUTO-PLANNING
```

### Decomposição via @pm
```json
[
  {
    "id": "backend-api",
    "title": "Cria API notificações",
    "agent_aios": "dev",
    "f_score": 3,
    "dependencies": []
  },
  {
    "id": "backend-push",
    "title": "Integra FCM/APNs",
    "agent_aios": "dev",
    "f_score": 4,
    "dependencies": ["backend-api"]
  },
  {
    "id": "frontend-ui",
    "title": "Cria UI notificações",
    "agent_aios": "dev",
    "f_score": 3,
    "dependencies": []
  },
  {
    "id": "frontend-integration",
    "title": "Integra frontend com API",
    "agent_aios": "dev",
    "f_score": 3,
    "dependencies": ["backend-api", "frontend-ui"]
  },
  {
    "id": "test-e2e",
    "title": "Testa fluxo end-to-end",
    "agent_aios": "qa",
    "f_score": 3,
    "dependencies": ["backend-push", "frontend-integration"]
  }
]
```

### Waves de Execução
```
Wave 1 (paralelo): [backend-api, frontend-ui]
Wave 2 (sequencial): [backend-push, frontend-integration]
Wave 3 (sequencial): [test-e2e]
```

### Execução
```bash
# Wave 1 (paralelo)
node workers/agent-zero/batch-runner.js
# → backend-api.json + frontend-ui.json (simultâneos)

# Wave 2 (sequencial - dependencies)
node workers/agent-zero/delegate.js --file backend-push.json
node workers/agent-zero/delegate.js --file frontend-integration.json

# Wave 3 (sequencial - dependencies)
node workers/agent-zero/delegate.js --file test-e2e.json
```

### Output Final
```
✅ Sistema de notificações push COMPLETO

📊 Breakdown:
- 5 subtasks executadas
- 3 waves (1 paralela, 2 sequenciais)
- 18 arquivos criados (backend: 8, frontend: 10)
- Qualidade média: 9.2/10
- Custo total: $0.03
- Tempo total: ~52s

Backend:
✅ API REST /notifications (GET/POST/DELETE)
✅ Integração FCM + APNs
✅ Webhook handlers
✅ Testes unitários

Frontend:
✅ Notification Center component
✅ Toast notifications
✅ Service Worker para push
✅ Testes E2E

🚀 PRONTO PARA DEPLOY
```

---

## 🎓 Best Practices

### DO ✅

1. **Confie no @pm**: Deixe ele decompor, não tente fazer manualmente
2. **Use context_files**: Passe PRDs, arquitetura, planos existentes
3. **Valide o plano**: Sempre verifique DAG, agents, F-scores antes de executar
4. **Aproveite paralelismo**: Waves independentes = speedup grátis
5. **Monitore qualidade**: Se subtask falha, revise e reexecute

### DON'T ❌

1. **Não decompor demais**: 4-10 subtasks é ideal, 20+ é over-engineering
2. **Não ignorar dependencies**: Subtask deve ter deps claras ou ser independente
3. **Não misturar F-scores**: Se maioria é F5+, talvez não seja para Agent Zero
4. **Não pular validação**: Plano inválido = execução falha
5. **Não usar para tasks simples**: F1-F2 direto é mais eficiente que decompor

---

## 🔧 Comandos Práticos

### Decompor task complexa
```bash
/CEOs:CEO-ZERO *auto-plan "implementa dashboard analytics com graficos D3.js"
```

### Executar plano existente
```bash
# CEO-ZERO lê plano de pm-decompose-*.json e executa automaticamente
```

### Ver status de execução
```bash
/CEOs:CEO-ZERO *status
# Mostra waves em andamento, subtasks completas, próximas
```

---

## 📚 Referências

- **Golden Rule GR7**: `squads/ceo-zero/agents/ceo-zero.md` (linhas 128-178)
- **AIOS Routing Matrix**: `squads/ceo-zero/agents/ceo-zero.md` (linhas 180-230)
- **PM Decomposition Template**: `squads/ceo-zero/templates/pm-decomposition.json`
- **Agent Zero Delegate**: `workers/agent-zero/delegate.js`
- **Batch Runner**: `workers/agent-zero/batch-runner.js`

---

**ÚLTIMA ATUALIZAÇÃO**: 2026-02-14
**VERSÃO**: 1.0.0
**STATUS**: PRODUCTION | MANDATORY for F4+ tasks
