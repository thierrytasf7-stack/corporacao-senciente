# CEO-ZERO → Agent Zero Delegation Protocol

**PRIORITY**: CRITICAL | **STATUS**: MANDATORY | **VERSION**: 1.0.0

---

## 🎯 Quando Delegar para Agent Zero

CEO-ZERO delega para Agent Zero quando:

1. **Task é F1-F3** (complexidade baixa-média)
2. **NÃO é sagrado** (review/security/deploy/architect/database)
3. **Custo Opus > Overhead de gestão**
4. **Tools locais suficientes** (file, web, pdf, db, shell)

---

## ⚡ PROTOCOLO OBRIGATÓRIO: AIOS Injection

### Golden Rules Aplicadas

**GR1**: Enviar PATHS, não contents
- ✅ `aios_guide_path`: path do .md do agente AIOS
- ❌ `aios_guide`: conteúdo copiado do .md

**GR2**: AIOS Guide Path OBRIGATÓRIO
- TODA task DEVE ter `aios_guide_path`
- Agent Zero lê o arquivo sozinho ($0)
- Opus NÃO lê o guide

**GR3**: Context Files OBRIGATÓRIO
- TODA task DEVE ter `context_files` (1-3 paths)
- Agent Zero lê os exemplos sozinho ($0)
- Opus só identifica os paths corretos

**GR4**: Prompt Mínimo
- O QUE fazer + CRITERIA + OUTPUT
- O COMO está no aios_guide_path
- Os EXEMPLOS estão nos context_files

---

## 📋 Template Padrão

### Para Squad Creation:

```json
{
  "id": "squad-{nome}",
  "agent": "squad-creator",
  "task_type": "create-squad",
  "tools_required": ["file_read", "file_write", "shell_exec"],

  "prompt": "CRIA SQUAD COMPLETO {nome} para {TEAM}.\n\nLeia o AIOS Guide em aios_guide_path e EXECUTE o processo *create-squad COMPLETO:\n\n1. Criar estrutura: mkdir -p squads/{nome}/{config,agents,tasks,workflows,checklists,templates,tools,scripts,data}\n2. Gerar squad.yaml com team: {TEAM}, {N} agentes, {M} tasks\n3. Criar agents/{lead}.md\n4. Criar tasks/{exemplo}.md\n5. Criar .claude/commands/{TEAM}/{Nome}-AIOS.md\n\nSiga formato EXATO dos context_files.\n\nCRITERIA:\n- Estrutura completa criada\n- squad.yaml com team: {TEAM}\n- agents/{lead}.md criado\n- tasks/{exemplo}.md criado\n- Comando registrado\n\nOUTPUT: Lista arquivos criados",

  "aios_guide_path": ".aios-core/development/agents/squad-creator.md",

  "context_files": [
    "squads/betting-ops/squad.yaml",
    "squads/betting-ops/agents/betting-ceo.md",
    "squads/betting-ops/tasks/bettor-execute-bet.md",
    ".claude/commands/BET-SPORTS/BettingOps-AIOS.md"
  ],

  "acceptance_criteria": [
    "Estrutura 10 pastas criada",
    "squad.yaml com team presente",
    "Agent exemplo criado",
    "Task exemplo criada",
    "Comando registrado"
  ],

  "max_tool_iterations": 15
}
```

### Para Outras Tasks (Generic):

```json
{
  "id": "task-{id}",
  "agent": "{aios-agent-id}",
  "task_type": "{tipo}",
  "tools_required": ["file_read", "file_write", "shell_exec"],

  "prompt": "{descricao}. Leia AIOS Guide e siga processo {*comando}. Use context_files como referência. CRITERIA: {criterios}. OUTPUT: {formato}",

  "aios_guide_path": ".aios-core/development/agents/{agent}.md",

  "context_files": [
    "{path1}",
    "{path2}",
    "{path3}"
  ],

  "acceptance_criteria": [
    "{criterio1}",
    "{criterio2}"
  ]
}
```

---

## 🚫 NUNCA FAZER

### ❌ Delegação SEM AIOS Injection:

```json
{
  "prompt": "cria squad X",
  "agent": "squad-creator"
  // FALTANDO: aios_guide_path
  // FALTANDO: context_files
  // FALTANDO: tools_required
}
```

**RESULTADO**: Agent Zero gera apenas YAML (20% completude).

### ❌ Copiar Conteúdo no JSON:

```json
{
  "aios_guide": "[390 linhas do squad-creator.md]",  // ❌ NUNCA
  "prompt": "[500 palavras explicando processo]"     // ❌ NUNCA
}
```

**DESPERDÍCIO**: ~5000 tokens Opus vs ~300 com paths.

---

## 📊 AIOS Guide Resolution Table

| Task Type | Agent | Guide Path |
|-----------|-------|------------|
| create-squad | squad-creator | `.aios-core/development/agents/squad-creator.md` |
| create-story | po | `.aios-core/development/agents/po.md` |
| decompose-sprint | sm | `.aios-core/development/agents/sm.md` |
| implement-code | dev | `.aios-core/development/agents/dev.md` |
| write-tests | qa | `.aios-core/development/agents/qa.md` |
| generate-docs | docs-generator | `squads/docs-generator/agents/docs-engineer.md` |
| analyze-business | analyst | `.aios-core/development/agents/analyst.md` |

---

## 🎯 Context Files Resolution

| Task Type | Context Paths |
|-----------|---------------|
| create-squad | `["squads/{exemplo}/squad.yaml", "squads/{exemplo}/agents/{lead}.md", "squads/{exemplo}/tasks/{task}.md", ".claude/commands/{TEAM}/{Comando}.md"]` |
| create-story | `["docs/stories/active/{mais-recente}.md"]` |
| create-task | `[".aios-core/development/tasks/{exemplo}.md"]` |
| implement-code | `["{modulo-alvo}/**/*.{ts,js,py}"]` |

---

## ✅ Validation Checklist

Antes de disparar delegate.js, CEO-ZERO DEVE validar:

- [ ] `aios_guide_path` presente e válido
- [ ] `context_files` array com 1-3 paths
- [ ] `tools_required` presente se task precisa I/O
- [ ] `prompt` é mínimo (O QUE + CRITERIA)
- [ ] `acceptance_criteria` verificáveis
- [ ] `max_tool_iterations` suficiente (15 para squad creation)

---

## 🔄 Workflow Completo

```
1. CEO-ZERO recebe request user
      ↓
2. Classifica: F1-F3? Sagrado?
      ↓
3. Se F1-F3 → Preparar JSON
      ↓
4. Consultar aios_guide_resolution table
      ↓
5. Consultar context_files resolution
      ↓
6. Montar JSON com TODOS os campos obrigatórios
      ↓
7. Write JSON em workers/agent-zero/queue/
      ↓
8. Executar: node workers/agent-zero/delegate.js --file {json}
      ↓
9. Aguardar completion (ou async)
      ↓
10. Ler resultado de workers/agent-zero/results/{id}.json
      ↓
11. Repassar content ao user (fire-and-forget)
```

---

## 📈 Evidência de Sucesso

### live-betting Squad (Feb 14, 2026)

**Input**: Template com AIOS injection completo
**Executor**: Agent Zero v3 (Trinity free)
**Output**:
```
Files created:
- squads/live-betting/squad.yaml
- squads/live-betting/agents/live-lead.md
- squads/live-betting/tasks/instant-bet.md
- .claude/commands/BET-SPORTS/LiveBetting-AIOS.md
```

**Metrics**:
- Quality: 10/10
- Tokens: 5003 in + 51 out
- Cost: $0.00
- Time: 88s
- Completude: 100%

---

## 🔗 Referências

- **Protocolo Completo**: `workers/agent-zero/AIOS-INJECTION-PROTOCOL.md`
- **Template**: `workers/agent-zero/templates/create-squad-template.json`
- **Agent Zero Memory**: `workers/agent-zero/MEMORY.md`
- **CEO-ZERO Guide**: `squads/ceo-zero/agents/ceo-zero.md` (GR0-GR6)

---

**ENFORCEMENT**: Este protocolo é SELF-ENFORCING via Golden Rules.
**ÚLTIMA ATUALIZAÇÃO**: 2026-02-14
**STATUS**: PRODUCTION | MANDATORY
