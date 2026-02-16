---
task: Commands Coverage Audit
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - agent_yaml: YAML parseado do agente
Saida: |
  - score: Score da dimensao (0-15)
  - findings: Issues de commands
Checklist:
  - "[ ] Tem *help command (1pt)"
  - "[ ] Tem *exit command (1pt)"
  - "[ ] Todos commands tem visibility metadata (2pts)"
  - "[ ] Descriptions claras e acionaveis (3pts)"
  - "[ ] Naming kebab-case, verbo-substantivo (2pts)"
  - "[ ] Key commands cobrem funcionalidade principal (3pts)"
  - "[ ] Sem duplicados ou sobrepostos (2pts)"
  - "[ ] Numero adequado ao escopo (1pt)"
---

# *audit-commands

Auditoria de cobertura e qualidade dos comandos.

## Regras

### Obrigatorios
- `*help` - DEVE existir (visibility: [full, quick, key])
- `*exit` - DEVE existir (visibility: [full, quick, key])

### Visibility
- `full` - Aparece no *help completo
- `quick` - Aparece no greeting/quick commands
- `key` - Comando principal, sempre visivel

### Naming Convention
```
# BOM - verbo + substantivo, kebab-case
*create-story
*validate-squad
*audit-full
*develop-yolo

# RUIM
*story (sem verbo)
*createStory (camelCase)
*do-the-thing (vago)
*audit_full (snake_case)
```

### Description Quality
```
# BOM - Claro, com sintaxe e retorno
"Auditoria completa do backend - todas as dimensoes. Sintaxe: *audit-full {path}. Retorna: relatorio."

# RUIM - Vago
"Does the audit thing"
"Runs audit"
```

### Coverage Analysis
Verificar que os commands `key` cobrem o core do agente:
- Dev agent: develop, create commands
- QA agent: validate, test commands
- Architect: design, review commands
- Auditor: audit, report commands

## Formato de Finding

```markdown
### [CMD-001] Missing *exit command
- **Score Impact:** -1pt
- **Fix:** Adicionar: `{ name: exit, visibility: [full, quick, key], description: "Sai do modo {agent}" }`
```
