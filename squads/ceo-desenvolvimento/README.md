# CEO de Desenvolvimento - Squad

**Prometheus** - Chief Development Officer da Diana Corporacao Senciente.

Recebe masterplans e transforma em software funcionando em producao, orquestrando autonomamente todo o time de desenvolvimento.

## O Problema que Resolve

Athena (CEO-Planejamento) gera masterplans perfeitos. Mas alguem precisa **fazer acontecer** — coordenar dev, qa, data-engineer, devops, aiders, quality gates, sprints, releases. Prometheus e esse alguem.

## Quick Start

```
# Ativar Prometheus
/Squads:CeoDev-AIOS

# Executar masterplan completo
*execute

# Executar uma story
*execute-story 1.1

# Executar sprint
*execute-sprint

# Hotfix urgente
*hotfix "Fix login timeout"
```

## Pipeline

```
MASTERPLAN → Sprint Plan → [DB Prep] → Dev → QA Loop → Ship → PRODUCAO
```

## Time de Execucao

### AIOS Core
| Agente | Role | Autoridade |
|--------|------|-----------|
| @dev (Dex) | Implementation | commit, merge (NOT push) |
| @qa (Quinn) | Quality Gates | read-only git |
| @data-engineer (Dara) | Database | read-only git |
| @devops (Gage) | **EXCLUSIVE push** | push, PR, release |

### Aiders ($0)
| Agente | When |
|--------|------|
| @dev-aider | Fibonacci 1-3 |
| @qa-aider | Quick validation |
| @deploy-aider | Simple git ops |

## Estrutura

```
squads/ceo-desenvolvimento/
├── squad.yaml
├── agents/ceo-desenvolvimento.md
├── tasks/ (15 tasks)
├── workflows/ (4 pipelines)
├── checklists/ (5 gates)
└── templates/ (4 templates)
```

---

*Prometheus, CDO | Planos viram codigo 🔥*
