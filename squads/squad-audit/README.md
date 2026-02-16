# Squad Audit Squad

Auditoria, otimizacao e versionamento de squads AIOS. Pega 1 squad, analisa cada componente holisticamente (manifest, structure, agents, tasks, workflows, checklists, templates, commands, docs), otimiza, e registra evolucao com Semantic Versioning e metricas rastreaveis.

## Agent

**Prism** - Squad Quality Specialist & Evolution Architect (Scientist)

## Core Concept: Holistic Evolution

Cada squad AIOS é um organismo onde cada componente deve funcionar em harmonia com os demais. Prism analisa as **9 dimensoes** de qualidade e registra a evolucao com:

- Version (Semantic Versioning no squad.yaml)
- Quality Score (0-100)
- Lineage (historico de scores por versao)
- Changelog (historico detalhado por versao)

A evolucao e **linear e rastreavel** — scores nunca regridem (zero regression policy).

## 9 Dimensoes de Auditoria (100pts)

| Dimensao | Max | O Que Cobre |
|----------|-----|-------------|
| Manifest Validity | 15 | squad.yaml completo, schema valido, fields, tags, deps |
| Structure Completeness | 10 | Diretorios obrigatorios, naming, file organization |
| Agents Quality | 15 | Cada agente AIOS structure, whenToUse, commands, collaboration |
| Tasks Coverage | 15 | Command<->task mapping, orphans, phantoms, frontmatter |
| Workflows Integrity | 10 | DAG valido, depends_on, steps, input/output |
| Checklists & Templates | 10 | Existem em disco, alinhados, conteudo adequado |
| Command Registration | 5 | .claude/commands/ file correto, path valido |
| Cross-References | 10 | squad.yaml components vs files em disco (ambos sentidos) |
| Documentation | 10 | README, Quick Start, commands table, examples, scoring |

## Quick Start

```
# Ativar o agente
/Audit:SquadEvolver-AIOS

# Auditoria completa
*audit-full backend-audit

# Score de TODAS as squads
*batch-audit

# Otimizar
*optimize frontend-audit

# Versionar
*version backend-audit minor

# Relatorio de evolucao
*report agent-audit
```

## Rating System

| Score | Rating | Significado |
|-------|--------|-------------|
| 95-100 | S | Exemplar - referencia para outras squads |
| 85-94 | A | Excelente - producao ready |
| 75-84 | B | Bom - melhorias menores necessarias |
| 65-74 | C | Aceitavel - otimizacoes recomendadas |
| 50-64 | D | Abaixo do padrao - melhorias urgentes |
| 0-49 | F | Critico - reestruturacao necessaria |

## Severity Guide

| Severity | Criterio |
|----------|----------|
| CRITICAL | squad.yaml invalido, agent missing, task missing, command path errado, workflow cycle |
| HIGH | Agent sem activation-instructions, tasks vazias, README missing, cross-ref mismatch |
| MEDIUM | Checklists missing, tags < 3, docs incompleta, agent sem whenToUse |
| LOW | License missing, description curta, naming improvements, minor doc tweaks |

---

*Squad Audit Squad v1.0.0 - Prism, cada componente importa 🔬*
