---
task: Task Alignment Audit
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - agent_yaml: YAML parseado do agente
  - agent_base_path: Path base do agente (para localizar tasks)
Saida: |
  - score: Score da dimensao (0-15)
  - findings: Issues de alinhamento
  - mapping: Mapa command -> task
Checklist:
  - "[ ] Mapear cada command para sua task correspondente (5pts)"
  - "[ ] Detectar orphan tasks - tasks que existem mas nenhum command referencia (3pts)"
  - "[ ] Detectar phantom tasks - commands referenciam tasks que nao existem (3pts)"
  - "[ ] Verificar naming convention: {agent-id}-{action}.md (2pts)"
  - "[ ] Verificar frontmatter correto (task, responsavel, checklist) (2pts)"
---

# *audit-tasks

Auditoria de alinhamento entre commands e tasks.

## Cruzamento

### Mapa Command -> Task
```
COMMANDS                          TASKS (dependencies.tasks)
*audit-full           <--->       audit-full-agent.md        ✅ Match
*audit-persona        <--->       audit-persona-quality.md   ✅ Match
*optimize             <--->       optimize-agent.md          ✅ Match
*some-command         <--->       (nenhuma task)             ❌ Phantom
(nenhum command)      <--->       orphan-task.md             ⚠️ Orphan
```

### Orphan Tasks
Tasks listadas em `dependencies.tasks` que NENHUM command referencia.
- Pode indicar task desatualizada
- Ou command que deveria existir mas nao existe

### Phantom Tasks
Commands que referenciam tasks (via `task:` field ou naming convention) que NAO existem em disco.
- CRITICAL - command vai falhar ao executar

### Naming Convention
```
# Core agents: {agent-id}-{action}.md
dev-develop-story.md
qa-validate-story.md
sm-create-stories.md

# Squad agents: {action}.md (sem prefixo de agent)
audit-full-backend.md
audit-performance.md
```

### Frontmatter Correto
```yaml
---
task: Nome descritivo da task
responsavel: "@agent-id"
responsavel_type: agent
atomic_layer: task  # ou workflow
Entrada: |
  - descricao dos inputs
Saida: |
  - descricao dos outputs
Checklist:
  - "[ ] Item 1"
  - "[ ] Item 2"
---
```

## Formato de Finding

```markdown
### [TASK-001] Phantom task - *validate command referencia validate-schema.md que nao existe
- **Score Impact:** -3pts (phantom)
- **Command:** *validate-schema
- **Expected Task:** .aios-core/development/tasks/validate-schema.md
- **Status:** FILE NOT FOUND
- **Fix:** Criar a task ou remover o command
```
