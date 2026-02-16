---
task: Dependencies Integrity Audit
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - agent_yaml: YAML parseado do agente
  - agent_base_path: Path base para resolver dependencias
Saida: |
  - score: Score da dimensao (0-10)
  - findings: Dependencias quebradas
Checklist:
  - "[ ] Todas tasks listadas existem em disco (4pts)"
  - "[ ] Todos checklists listados existem (2pts)"
  - "[ ] Todos templates listados existem (2pts)"
  - "[ ] Sem referencias a arquivos inexistentes (2pts)"
---

# *audit-deps

Auditoria de integridade de dependencias.

## Procedimento

### 1. Resolver Base Path

**Core agents:** `.aios-core/development/`
- Tasks: `.aios-core/development/tasks/{name}`
- Checklists: `.aios-core/development/checklists/{name}`
- Templates: `.aios-core/development/templates/{name}`

**Squad agents:** `squads/{squad-name}/`
- Tasks: `squads/{squad-name}/tasks/{name}`
- Checklists: `squads/{squad-name}/checklists/{name}`
- Templates: `squads/{squad-name}/templates/{name}`

### 2. Verificar Cada Dependencia

Para cada item em `dependencies.tasks`:
- Verificar se arquivo existe no path resolvido
- Se nao existe: CRITICAL finding

Para cada item em `dependencies.checklists`:
- Verificar se arquivo existe
- Se nao existe: HIGH finding

Para cada item em `dependencies.templates`:
- Verificar se arquivo existe
- Se nao existe: MEDIUM finding

### 3. Reverse Check

Listar TODOS os arquivos na pasta tasks/ do agente e verificar se estao listados nas dependencies.
- Arquivo existe mas nao esta nas dependencies: WARNING (unlisted dependency)

## Formato de Finding

```markdown
### [DEP-001] Task audit-security.md listada mas nao existe em disco
- **Score Impact:** -2pts
- **Dependency:** tasks: audit-security.md
- **Expected Path:** squads/backend-audit/tasks/audit-security.md
- **Status:** FILE NOT FOUND
- **Impacto:** Command *audit-sec vai falhar
- **Fix:** Criar o arquivo ou remover da lista de dependencies
```
