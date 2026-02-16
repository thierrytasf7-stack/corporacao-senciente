# AIOS Agent Invocation Protocol - Agent Zero v3

**STATUS**: MANDATORY | **PRIORITY**: CRITICAL | **ENFORCEMENT**: AUTOMATIC

---

## 📜 PROTOCOLO INEGOCIÁVEL

Quando Agent Zero precisa **INVOCAR/ATIVAR** um agente AIOS, este protocolo é **OBRIGATÓRIO**.

```
INVOCAR AGENTE AIOS = AIOS AGENT INJECTION OBRIGATÓRIO
```

---

## ⚡ GOLDEN RULE: Agent Definition Injection

**SEMPRE** que invocar agente AIOS via Agent Zero:

### Campos OBRIGATÓRIOS no JSON:

```json
{
  "task_type": "invoke-aios-agent",
  "agent": "{aios-agent-id}",
  "aios_agent_path": ".aios-core/development/agents/{agent}.md",
  "context_files": [
    "{exemplo-relevante-1}",
    "{exemplo-relevante-2}"
  ],
  "tools_required": ["file_read", "skill_call"]
}
```

### ❌ NUNCA FAZER:

```json
{
  "prompt": "age como @dev e implementa X",
  "agent": "dev"
  // ❌ SEM aios_agent_path
  // ❌ SEM context_files
  // ❌ SEM skill_call tool
}
```

**RESULTADO**: Agent Zero age GENERICAMENTE, sem seguir processo AIOS.

---

## 🎯 Por Que Este Protocolo é OBRIGATÓRIO

### Com AIOS Agent Injection (CORRETO):

✅ Agent Zero lê `.aios-core/development/agents/{agent}.md` ($0)
✅ Absorve persona, role, style, commands do agente
✅ Segue processo específico do agente (tasks, checklists)
✅ Usa context_files como referência
✅ Qualidade: **10/10** (segue padrão AIOS)
✅ Consistência: **100%** (sempre segue mesmo processo)

### Sem AIOS Agent Injection (ERRADO):

❌ Agent Zero age genericamente
❌ NÃO segue processo do agente
❌ NÃO usa persona/style correto
❌ Output inconsistente com AIOS
❌ Qualidade: **6/10** (genérico)
❌ Consistência: **30%** (varia a cada execução)

---

## 🔬 Casos de Uso

### 1. Implementação de Código (@dev)

**Request**: "Agent Zero, implementa feature de autenticação usando @dev"

**JSON Correto**:
```json
{
  "id": "implement-auth",
  "task_type": "invoke-aios-agent",
  "agent": "dev",
  "aios_agent_path": ".aios-core/development/agents/dev.md",
  "context_files": [
    "src/auth/existing-module.ts",
    "docs/stories/active/auth-story.md"
  ],
  "tools_required": ["file_read", "file_write", "skill_call"],

  "prompt": "INVOCA @dev (Dex) para implementar autenticação.\n\nLeia aios_agent_path e ABSORVA:\n- Persona: Desenvolvedor full-stack\n- Style: Pragmático, test-driven\n- Process: Implementação + testes + docs\n\nUse context_files como base.\n\nTASK:\n1. Implementar módulo auth com JWT\n2. Criar testes unitários\n3. Atualizar docs\n\nCRITERIA:\n- Código TypeScript strict\n- Testes com >80% coverage\n- Docs atualizadas\n\nOUTPUT: Arquivos criados/modificados",

  "acceptance_criteria": [
    "src/auth/jwt.ts criado",
    "tests/auth/jwt.test.ts com >80% coverage",
    "docs/auth.md atualizada"
  ],

  "max_tool_iterations": 15
}
```

---

### 2. Review de Código (@qa)

**Request**: "Agent Zero, revisa PR usando @qa"

**JSON Correto**:
```json
{
  "id": "review-pr-auth",
  "task_type": "invoke-aios-agent",
  "agent": "qa",
  "aios_agent_path": ".aios-core/development/agents/qa.md",
  "context_files": [
    "src/auth/jwt.ts",
    "tests/auth/jwt.test.ts",
    ".aios-core/development/checklists/code-review-checklist.md"
  ],
  "tools_required": ["file_read", "skill_call"],

  "prompt": "INVOCA @qa (Quinn) para revisar código de autenticação.\n\nLeia aios_agent_path e ABSORVA:\n- Persona: QA Engineer\n- Style: Meticuloso, orientado a qualidade\n- Process: Review checklist + testes + segurança\n\nUse context_files e checklist.\n\nTASK:\n1. Revisar src/auth/jwt.ts\n2. Validar testes\n3. Verificar segurança (injection, XSS, etc)\n4. Gerar relatório\n\nCRITERIA:\n- Todos os itens do checklist verificados\n- Issues de segurança identificados\n- Sugestões de melhoria\n\nOUTPUT: Review report markdown",

  "acceptance_criteria": [
    "Checklist completo",
    "Security issues listados",
    "Sugestões documentadas",
    "Aprovação ou rejeição com motivos"
  ],

  "max_tool_iterations": 10
}
```

---

### 3. Análise de Negócio (@analyst)

**Request**: "Agent Zero, analisa viabilidade usando @analyst"

**JSON Correto**:
```json
{
  "id": "analyze-betting-market",
  "task_type": "invoke-aios-agent",
  "agent": "analyst",
  "aios_agent_path": ".aios-core/development/agents/analyst.md",
  "context_files": [
    "docs/market-research/competitors.md",
    "docs/market-research/analysis-template.md"
  ],
  "tools_required": ["file_read", "web_fetch", "skill_call"],

  "prompt": "INVOCA @analyst (Alex) para analisar mercado de apostas esportivas.\n\nLeia aios_agent_path e ABSORVA:\n- Persona: Business Analyst\n- Style: Data-driven, analítico\n- Process: Pesquisa + análise competitiva + viabilidade\n\nUse context_files e web_fetch para dados.\n\nTASK:\n1. Pesquisar mercado de betting (web)\n2. Analisar competidores principais\n3. Avaliar viabilidade\n4. Gerar relatório\n\nCRITERIA:\n- Dados de mercado atualizados\n- 5+ competidores analisados\n- SWOT analysis\n- Recomendação clara\n\nOUTPUT: Market analysis report markdown",

  "acceptance_criteria": [
    "Market size e growth",
    "Competitor analysis (5+)",
    "SWOT matrix",
    "Go/No-go recommendation"
  ],

  "max_tool_iterations": 12
}
```

---

### 4. Invocação de Squad Completo (@binance-ceo)

**Request**: "Agent Zero, ativa squad binance-ceo para análise de mercado"

**JSON Correto**:
```json
{
  "id": "invoke-binance-ceo",
  "task_type": "invoke-aios-squad",
  "squad": "binance-ceo",
  "lead_agent": "ceo",
  "aios_squad_path": "squads/binance-ceo/squad.yaml",
  "aios_agent_path": "squads/binance-ceo/agents/ceo.md",
  "context_files": [
    "modules/binance-bot/backend/data/trading-strategies.json",
    "modules/binance-bot/backend/data/spot-rotative-config.json"
  ],
  "tools_required": ["file_read", "db_query", "skill_call"],

  "prompt": "INVOCA SQUAD binance-ceo (CEO coordena trader, analyst, quant, risk-manager).\n\nLeia aios_squad_path e aios_agent_path.\n\nABSORVA:\n- Squad structure: 6 agentes coordenados\n- Lead: CEO (orquestrador)\n- Process: Daily briefing + portfolio review + strategy decision\n\nUse context_files para estado atual.\n\nTASK:\n1. CEO faz daily briefing\n2. Analyst analisa mercado BTC/ETH\n3. Quant avalia estratégias ativas\n4. Risk manager calcula exposição\n5. CEO decide ações\n\nCRITERIA:\n- Briefing completo\n- Market analysis atualizado\n- Risk assessment\n- Action plan\n\nOUTPUT: Daily briefing report",

  "acceptance_criteria": [
    "Market overview (BTC, ETH, BNB)",
    "Active strategies performance",
    "Risk exposure atual",
    "Recommended actions"
  ],

  "max_tool_iterations": 20
}
```

---

## 📊 AIOS Agent Resolution Table

| Agente | Path | Quando Invocar |
|--------|------|----------------|
| @dev | `.aios-core/development/agents/dev.md` | Implementar código, features, refactoring |
| @qa | `.aios-core/development/agents/qa.md` | Review de código, testes, quality gates |
| @architect | `.aios-core/development/agents/architect.md` | Design de sistema, arquitetura técnica |
| @po | `.aios-core/development/agents/po.md` | Criar/refinar stories, backlog management |
| @sm | `.aios-core/development/agents/sm.md` | Decompor sprints, criar tasks detalhadas |
| @pm | `.aios-core/development/agents/pm.md` | PRDs, roadmap, priorização |
| @analyst | `.aios-core/development/agents/analyst.md` | Pesquisa de mercado, análise competitiva |
| @data-engineer | `.aios-core/development/agents/data-engineer.md` | Database design, migrations, queries |
| @ux-design-expert | `.aios-core/development/agents/ux-design-expert.md` | UX/UI design, usability |
| @devops | `.aios-core/development/agents/devops.md` | **NÃO via Zero** - Deploy exclusivo via Opus |
| @squad-creator | `.aios-core/development/agents/squad-creator.md` | Criar squads (já documentado) |

---

## 🎯 Context Files Resolution por Agente

| Agente | Context Files Típicos |
|--------|----------------------|
| @dev | `["src/{modulo}/*.ts", "tests/{modulo}/*.test.ts", "docs/stories/active/{story}.md"]` |
| @qa | `["{codigo-a-revisar}", "tests/*", ".aios-core/development/checklists/code-review-checklist.md"]` |
| @architect | `["docs/architecture/*.md", "docs/framework/ARCHITECTURE-INDEX.md"]` |
| @po | `["docs/stories/active/{exemplo}.md", "docs/stories/completed/{exemplo}.md"]` |
| @sm | `["docs/stories/active/{story}.md", ".aios-core/development/tasks/{exemplo}.md"]` |
| @analyst | `["docs/market-research/*.md", "docs/prd/*.md"]` |

---

## 🔄 Workflow de Invocação

```
1. User request: "Agent Zero, usa @dev para implementar X"
      ↓
2. CEO-ZERO identifica: invocar agente AIOS
      ↓
3. Consultar AIOS Agent Resolution Table
      ↓
4. Montar JSON:
   - aios_agent_path
   - context_files relevantes
   - tools_required
   - prompt com ABSORVA persona/process
      ↓
5. Write JSON em workers/agent-zero/queue/
      ↓
6. Executar: node delegate.js --file {json}
      ↓
7. Agent Zero:
   - Lê aios_agent_path
   - Absorve persona, role, style, commands
   - Lê context_files
   - Executa seguindo processo do agente
   - Auto-review com criteria do agente
      ↓
8. Output: Resultado seguindo padrão AIOS do agente
```

---

## 📋 Template Genérico (Reutilizável)

```json
{
  "id": "invoke-{agent}-{task-id}",
  "task_type": "invoke-aios-agent",
  "agent": "{aios-agent-id}",
  "aios_agent_path": ".aios-core/development/agents/{agent}.md",
  "context_files": [
    "{path-relevante-1}",
    "{path-relevante-2}",
    "{path-relevante-3}"
  ],
  "tools_required": ["file_read", "skill_call"],

  "prompt": "INVOCA @{agent} ({Nome}) para {objetivo}.\n\nLeia aios_agent_path e ABSORVA:\n- Persona: {role}\n- Style: {style}\n- Process: {processo-principal}\n\nUse context_files como base.\n\nTASK:\n{steps numerados}\n\nCRITERIA:\n{criterios verificáveis}\n\nOUTPUT: {formato esperado}",

  "acceptance_criteria": [
    "{criterio-1}",
    "{criterio-2}",
    "{criterio-3}"
  ],

  "max_tool_iterations": 15
}
```

---

## 🛠️ skill_call Tool Integration

Agent Zero v3 tem `skill_call` tool para invocar AIOS skills diretamente.

### Uso do skill_call:

```javascript
// Dentro do Agent Zero execution
{
  "tool": "skill_call",
  "arguments": {
    "skill": "Desenvolvimento:Dev-AIOS",
    "command": "*implement",
    "context": {
      "story": "docs/stories/active/auth-feature.md",
      "target": "src/auth/"
    }
  }
}
```

Quando Agent Zero lê `aios_agent_path`, ele pode usar `skill_call` para delegar ao agente AIOS real via Opus quando necessário.

**Decisão de quando usar skill_call**:
- Task é F4-F5 → skill_call para AIOS via Opus
- Task é F1-F3 → Agent Zero executa seguindo processo do agente

---

## ⚠️ Agentes SAGRADOS (NUNCA via Agent Zero)

Estes agentes SEMPRE via Opus direto, NUNCA via Agent Zero:

| Agente | Motivo |
|--------|--------|
| @devops | Deploy/push exclusivo, requer autorização humana |
| @security | Security audit crítico, requer expertise profunda |
| @architect (F5+) | Decisões arquiteturais críticas |
| @data-engineer (F5+) | Database design crítico |

Para estes: usar Skill tool direto do Opus, não Agent Zero.

---

## 📊 Evidência de Qualidade

### Com AIOS Agent Injection:

```
Agente invocado: @dev
Task: Implementar JWT auth
AIOS Injection: ✅

Resultado:
- Código TypeScript strict ✅
- Testes com 85% coverage ✅
- Docs atualizadas ✅
- Padrão AIOS seguido ✅
Quality: 10/10
```

### Sem AIOS Agent Injection:

```
Agente invocado: (genérico)
Task: Implementar JWT auth
AIOS Injection: ❌

Resultado:
- Código genérico ⚠️
- Testes básicos (40% coverage) ⚠️
- Docs não atualizadas ❌
- Padrão inconsistente ❌
Quality: 6/10
```

---

## 🔒 Enforcement

Este protocolo é **SELF-ENFORCING** via:

1. **Templates obrigatórios** com aios_agent_path
2. **CEO-ZERO** segue Golden Rules (GR2: AIOS Guide obrigatório)
3. **Agent Resolution Table** mapeia agente → path
4. **Context Files Resolution** mapeia agente → exemplos
5. **skill_call tool** permite delegação F4-F5 para AIOS
6. **Esta documentação** como referência canônica

---

## 📚 Referências

- **Protocolo Squad Creation**: `workers/agent-zero/AIOS-INJECTION-PROTOCOL.md`
- **CEO-ZERO Delegation**: `squads/ceo-zero/AGENT-ZERO-DELEGATION.md`
- **Agent Definitions**: `.aios-core/development/agents/*.md`
- **Squad Definitions**: `squads/*/agents/*.md`

---

**ÚLTIMA ATUALIZAÇÃO**: 2026-02-14
**VERSÃO**: 1.0.0
**STATUS**: PRODUCTION | MANDATORY
