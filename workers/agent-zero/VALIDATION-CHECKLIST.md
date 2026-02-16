# Agent Zero - Task Validation Checklist

**Use este checklist ANTES de enviar task para Agent Zero.**

---

## ✅ Checklist Obrigatório

### 1. Task Type Identificado

- [ ] Task é F1-F3 (complexidade baixa-média)
- [ ] Task NÃO é sagrada (review/security/deploy/architect/database)
- [ ] Agent Zero tem tools necessários (file/web/pdf/db/shell)

### 2. AIOS Injection Preparado

- [ ] Campo `agent` identificado (ex: squad-creator, po, sm, dev, qa)
- [ ] Campo `aios_guide_path` mapeado via resolution table
- [ ] Campo `context_files` identificados (1-3 exemplos)
- [ ] Campo `tools_required` definido (file_read, file_write, shell_exec)

### 3. JSON Válido

- [ ] Template usado: `templates/create-squad-template.json` (ou similar)
- [ ] Placeholders substituídos: {nome}, {TEAM}, {agentes}, etc.
- [ ] Prompt é mínimo: O QUE + CRITERIA + OUTPUT
- [ ] Acceptance criteria verificáveis (3-5 itens)
- [ ] max_tool_iterations suficiente (15 para squads, 10 default)

### 4. Paths Válidos

- [ ] `aios_guide_path` existe e aponta para .md correto
- [ ] `context_files` existem e são relevantes
- [ ] Paths são relativos ao project root
- [ ] Nenhum path absoluto usado

### 5. Config Verificada

- [ ] Sandbox desabilitado: `file_write_dirs: ["*"]`
- [ ] Shell desbloqueado: `shell_whitelist: ["*"]`
- [ ] Tools habilitados: 9 tools disponíveis
- [ ] Max iterations adequado

---

## ⚠️ Red Flags (NÃO PROCEDER)

### ❌ Task NÃO é adequada para Agent Zero se:

- Task requer review humano (code review, security audit)
- Task é F5+ (alta complexidade)
- Task é deploy/push/PR (exclusivo @devops)
- Task requer decisões arquiteturais críticas
- Task tem múltiplas dependências externas

### ❌ JSON incompleto se falta:

- `aios_guide_path` ausente ou vazio
- `context_files` array vazio ou ausente
- `tools_required` ausente quando task precisa I/O
- `prompt` genérico sem CRITERIA
- `acceptance_criteria` vagos ou não verificáveis

---

## 📋 Quick Validation

### Teste Rápido (5 segundos):

```bash
# JSON tem os 3 campos críticos?
cat queue/minha-task.json | jq 'has("aios_guide_path") and has("context_files") and has("tools_required")'

# Deve retornar: true
```

### Se retornar `false`:

**PARAR** → Completar JSON usando template → Validar novamente

---

## 🎯 Templates por Task Type

| Task Type | Template |
|-----------|----------|
| Squad creation | `templates/create-squad-template.json` |
| Story creation | TBD |
| Task decomposition | TBD |
| Code implementation | TBD |
| Docs generation | TBD |

---

## ✅ Exemplo de JSON VÁLIDO

```json
{
  "id": "squad-live-betting",
  "agent": "squad-creator",
  "task_type": "create-squad",
  "tools_required": ["file_read", "file_write", "shell_exec"],
  "prompt": "CRIA SQUAD COMPLETO live-betting para BET-SPORTS...",
  "aios_guide_path": ".aios-core/development/agents/squad-creator.md",
  "context_files": [
    "squads/betting-ops/squad.yaml",
    "squads/betting-ops/agents/betting-ceo.md",
    "squads/betting-ops/tasks/bettor-execute-bet.md",
    ".claude/commands/BET-SPORTS/BettingOps-AIOS.md"
  ],
  "acceptance_criteria": [
    "squads/live-betting/ com 10 pastas",
    "squad.yaml com team: BET-SPORTS",
    "agents/live-lead.md existente",
    "tasks/instant-bet.md existente",
    ".claude/commands/BET-SPORTS/LiveBetting-AIOS.md existente"
  ],
  "max_tool_iterations": 15
}
```

**Status**: ✅ VÁLIDO - Pode enviar para Agent Zero

---

## ❌ Exemplo de JSON INVÁLIDO

```json
{
  "prompt": "cria squad live-betting",
  "agent": "squad-creator"
}
```

**Problemas**:
- ❌ `aios_guide_path` AUSENTE
- ❌ `context_files` AUSENTE
- ❌ `tools_required` AUSENTE
- ❌ `prompt` sem CRITERIA
- ❌ `acceptance_criteria` AUSENTE

**Status**: ❌ INVÁLIDO - Completar usando template

---

## 🔄 Workflow de Validação

```
1. Identificar task type
      ↓
2. Verificar se adequada para Zero (F1-F3, não sagrada)
      ↓
3. Copiar template apropriado
      ↓
4. Substituir placeholders
      ↓
5. Executar quick validation (jq)
      ↓
6. Se válido → Enviar
   Se inválido → Revisar checklist
```

---

## 📈 Resultado Esperado

### Com checklist seguido:

✅ Quality score: 10/10
✅ Completude: 100%
✅ Custo: $0.00
✅ Tempo: 60-90s (squad creation)

### Sem checklist:

❌ Quality score: 6/10
❌ Completude: 20%
❌ Custo: $0.00
❌ Tempo: 30s (mas INÚTIL)

---

**REGRA DE OURO**: Se dúvida sobre algum item → Consultar AIOS-INJECTION-PROTOCOL.md

**ÚLTIMA ATUALIZAÇÃO**: 2026-02-14
