---
task: Principles Coherence Audit
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - agent_yaml: YAML parseado do agente
Saida: |
  - score: Score da dimensao (0-10)
  - findings: Issues de coerencia
Checklist:
  - "[ ] core_principles alinham com role (3pts)"
  - "[ ] core_principles alinham com focus (3pts)"
  - "[ ] Sem principios contraditorios entre si (2pts)"
  - "[ ] Principios CRITICAL sao realmente criticos (2pts)"
---

# *audit-principles

Auditoria de coerencia dos core_principles.

## Verificacoes

### Alignment com Role
O role define O QUE o agente faz. Principios devem suportar esse role.

```yaml
# COERENTE
role: "Full Stack Developer"
core_principles:
  - "Story has ALL info you need"          # Suporta o dev workflow
  - "Follow develop-story command"          # Alinha com implementacao
  - "CodeRabbit Pre-Commit Review"          # Qualidade de codigo

# INCOERENTE
role: "Full Stack Developer"
core_principles:
  - "Always run load tests"                 # Isso e QA/DevOps
  - "Design UX wireframes first"            # Isso e UX
```

### Alignment com Focus
O focus define COMO o agente trabalha. Principios devem reforcar esse foco.

### Contradicoes
```yaml
# CONTRADIÇÃO
core_principles:
  - "CRITICAL: Never modify files without user permission"
  - "CRITICAL: Execute all tasks autonomously without stopping"
  # ^ Estes dois se contradizem!
```

### CRITICAL Usage
Apenas principios genuinamente criticos (que se violados quebram o agente) devem ser marcados CRITICAL.

```yaml
# BOM uso de CRITICAL
- "CRITICAL: ONLY @devops can push to remote"      # Seguranca real

# MAU uso de CRITICAL
- "CRITICAL: Always use emojis in greetings"        # Nao e critico
```

## Formato de Finding

```markdown
### [PRINC-001] Principio nao alinha com role de Developer
- **Score Impact:** -2pts
- **Principio:** "Always validate user stories before development"
- **Role:** "Full Stack Developer"
- **Issue:** Validacao de stories e responsabilidade do PO/QA, nao do Dev
- **Fix:** Remover ou reformular como "Follow story requirements exactly"
```
