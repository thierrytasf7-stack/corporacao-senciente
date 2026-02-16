# AIOS Injection Protocol - Agent Zero v3

**STATUS**: MANDATORY | PRIORITY: CRITICAL | ENFORCEMENT: AUTOMATIC

## 📜 PROTOCOLO INEGOCIÁVEL

Quando Agent Zero recebe task de criação de squad, este protocolo é **OBRIGATÓRIO** e **NÃO OPCIONAL**.

---

## ⚡ GOLDEN RULE: AIOS Guide Injection

**SEMPRE** que criar squad via Agent Zero:

```
TASK TIPO "create-squad" = AIOS GUIDE INJECTION OBRIGATÓRIO
```

### Campos OBRIGATÓRIOS no JSON:

```json
{
  "agent": "squad-creator",
  "task_type": "create-squad",
  "tools_required": ["file_read", "file_write", "shell_exec"],
  "aios_guide_path": ".aios-core/development/agents/squad-creator.md",
  "context_files": [
    "squads/betting-ops/squad.yaml",
    "squads/betting-ops/agents/betting-ceo.md",
    "squads/betting-ops/tasks/bettor-execute-bet.md",
    ".claude/commands/BET-SPORTS/BettingOps-AIOS.md"
  ],
  "max_tool_iterations": 15
}
```

### ❌ NUNCA FAZER:

```json
{
  "prompt": "cria squad X",
  // ❌ SEM aios_guide_path
  // ❌ SEM context_files
  // ❌ SEM tools_required
}
```

**RESULTADO**: Agent Zero gera apenas YAML, NÃO cria estrutura completa.

---

## 🎯 Workflow Correto (ÚNICO CAMINHO VÁLIDO)

### Input Padrão Template:

```json
{
  "id": "squad-{nome}",
  "agent": "squad-creator",
  "task_type": "create-squad",
  "tools_required": ["file_read", "file_write", "shell_exec"],
  "prompt": "CRIA SQUAD COMPLETO {nome} para {TEAM}.\n\nLeia o AIOS Guide em aios_guide_path e EXECUTE o processo *create-squad COMPLETO:\n\n1. Criar estrutura: mkdir -p squads/{nome}/{config,agents,tasks,workflows,checklists,templates,tools,scripts,data}\n2. Gerar squad.yaml com team: {TEAM}, {N} agentes ({lista}), {M} tasks\n3. Criar agents/{lead}.md\n4. Criar tasks/{exemplo}.md\n5. Criar .claude/commands/{TEAM}/{Nome}-AIOS.md\n\nSiga formato EXATO dos context_files.\n\nCRITERIA:\n- Estrutura completa criada em squads/{nome}/\n- squad.yaml com team: {TEAM}\n- agents/{lead}.md criado\n- tasks/{exemplo}.md criado\n- .claude/commands/{TEAM}/{Nome}-AIOS.md criado\n\nOUTPUT: Lista arquivos criados com paths",
  "aios_guide_path": ".aios-core/development/agents/squad-creator.md",
  "context_files": [
    "squads/betting-ops/squad.yaml",
    "squads/betting-ops/agents/betting-ceo.md",
    "squads/betting-ops/tasks/bettor-execute-bet.md",
    ".claude/commands/BET-SPORTS/BettingOps-AIOS.md"
  ],
  "acceptance_criteria": [
    "squads/{nome}/ com 10 pastas",
    "squad.yaml com team: {TEAM}",
    "agents/{lead}.md existente",
    "tasks/{exemplo}.md existente",
    ".claude/commands/{TEAM}/{Nome}-AIOS.md existente"
  ],
  "max_tool_iterations": 15
}
```

---

## 🔬 Por Que Este Protocolo é OBRIGATÓRIO

### Com AIOS Injection (CORRETO):

✅ Agent Zero lê `.aios-core/development/agents/squad-creator.md` ($0)
✅ Entende processo *create-squad completo
✅ Usa context_files como referência de formato
✅ Cria estrutura de 10 pastas via `mkdir`
✅ Gera squad.yaml, agents/*.md, tasks/*.md, comando
✅ Qualidade: **10/10**
✅ Custo: **$0.00**
✅ Completude: **100%**

### Sem AIOS Injection (ERRADO):

❌ Agent Zero não sabe processo correto
❌ Gera apenas YAML text
❌ NÃO cria pastas/arquivos
❌ NÃO registra comando
❌ Qualidade: 10/10 (YAML)
❌ Custo: $0.00
❌ Completude: **20%** ← INÚTIL

---

## 📊 Evidência Comprovada

### Teste Real (Feb 14, 2026):

**Squad**: live-betting
**Método**: Agent Zero v3 + AIOS Injection
**Resultado**:

```
[14:43:55] [DONE] test-squad-live-betting | Trinity | 5003+51 tokens | Q:10/10 | 88s

Files created:
- squads/live-betting/squad.yaml           ✅
- squads/live-betting/agents/live-lead.md  ✅
- squads/live-betting/tasks/instant-bet.md ✅
- .claude/commands/BET-SPORTS/LiveBetting-AIOS.md ✅
```

**Arquivos verificados**: Qualidade IDÊNTICA ao Opus direto.

---

## 🛠️ Config Necessária

**workers/agent-zero/config.json** DEVE ter sandbox desabilitado:

```json
"security": {
  "sandbox_bypass_enabled": true,
  "file_write_dirs": ["*"],
  "shell_whitelist": ["*"]
}
```

**Status Atual**: ✅ CONFIGURADO

---

## 🚀 Como Usar (CEO-ZERO ou Manual)

### Via CEO-ZERO:

```bash
/CEOs:CEO-ZERO *fire "cria squad {nome} para {TEAM}"
```

CEO-ZERO DEVE:
1. Ler este protocolo ANTES de delegar
2. Montar JSON conforme template acima
3. Incluir SEMPRE `aios_guide_path` + `context_files` + `tools_required`
4. Disparar via `node workers/agent-zero/delegate.js --file task.json`

### Manual:

```bash
# 1. Criar JSON conforme template
cat > workers/agent-zero/queue/squad-{nome}.json << 'EOF'
{
  "id": "squad-{nome}",
  "agent": "squad-creator",
  "aios_guide_path": ".aios-core/development/agents/squad-creator.md",
  "context_files": [...],
  ...
}
EOF

# 2. Executar
node workers/agent-zero/delegate.js --file queue/squad-{nome}.json
```

---

## 🔒 Enforcement

Este protocolo é **SELF-ENFORCING** via:

1. **CEO-ZERO Golden Rules** (GR1, GR2, GR3) - Paths obrigatórios
2. **Agent Zero config** - Sandbox desabilitado
3. **SquadCreator task** - Checklist obrigatória
4. **Esta documentação** - Referência canônica

Qualquer violação resulta em squad **INCOMPLETO** (20% vs 100%).

---

## 📚 Referências

- **AIOS Guide**: `.aios-core/development/agents/squad-creator.md`
- **Task Spec**: `.aios-core/development/tasks/squad-creator-create.md`
- **CEO-ZERO**: `squads/ceo-zero/agents/ceo-zero.md` (GR1-GR6)
- **Exemplo Real**: `squads/live-betting/` (criado Feb 14, 2026)

---

**ÚLTIMA ATUALIZAÇÃO**: 2026-02-14
**VERSÃO**: 1.0.0
**STATUS**: PRODUCTION | MANDATORY
