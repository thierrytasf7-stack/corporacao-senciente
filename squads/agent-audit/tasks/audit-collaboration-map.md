---
task: Collaboration Map Audit
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - agent_yaml: YAML parseado do agente
Saida: |
  - score: Score da dimensao (0-5)
  - findings: Issues de colaboracao
Checklist:
  - "[ ] Agent Collaboration section existe (1pt)"
  - "[ ] Relacoes fazem sentido (2pts)"
  - "[ ] Workflow tipico documentado (2pts)"
---

# *audit-collab

Auditoria do mapa de colaboracao do agente.

## Relacoes Validas (AIOS Standard)

| Agente | Colabora Naturalmente Com |
|--------|--------------------------|
| @dev | @qa (review), @sm (stories), @devops (deploy) |
| @qa | @dev (implementacao), @po (requirements) |
| @architect | @dev (implementacao), @pm (requirements) |
| @pm | @po (backlog), @analyst (pesquisa) |
| @po | @sm (stories), @dev (implementacao) |
| @sm | @po (backlog), @dev (tasks) |
| @devops | @dev (code), @qa (tests), @architect (infra) |
| @data-engineer | @architect (design), @dev (implementacao) |
| @ux-design-expert | @dev (implementacao), @pm (requirements) |
| @analyst | @pm (requirements), @architect (viability) |

## Workflow Pattern

Deve seguir o padrao AIOS:
```
@agente-fonte (produz) -> @agente-consumidor (consome) -> @agente-validador (valida)
```

Exemplo:
```
@po (cria story) -> @dev (implementa) -> @qa (valida) -> @devops (deploy)
```

## Formato de Finding

```markdown
### [COLLAB-001] Collaboration section ausente
- **Score Impact:** -3pts
- **Fix:** Adicionar section com relacoes e workflow
```
