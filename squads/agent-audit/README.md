# Agent Audit Squad

Auditoria, otimizacao e versionamento de agentes AIOS. Pega 1 agente, analisa profundamente, otimiza, e registra evolucao com metricas versionadas no proprio agente.

## Agent

**Helix** - Agent Quality Specialist & Evolution Architect (Alchemist)

## Core Concept: Measurable Evolution

Cada agente AIOS carrega um **Evolution Header** no seu YAML com:
- Version (Semantic Versioning)
- Quality Score (0-100)
- Lineage (historico de scores por versao)
- Changelog (link para historico detalhado)

A evolucao e **linear e rastreavel** — scores nunca regridem (zero regression policy).

## 7 Dimensoes de Auditoria (100pts)

| Dimensao | Max | O Que Cobre |
|----------|-----|-------------|
| Persona Quality | 15 | name, archetype, tone, vocabulary, identity, whenToUse |
| Commands Coverage | 15 | help/exit, visibility, naming, descriptions, coverage |
| Task Alignment | 15 | command<->task mapping, orphans, phantoms, frontmatter |
| Principles Coherence | 10 | alignment com role/focus, contradicoes, CRITICAL usage |
| Greeting/Activation | 10 | steps 1-5, greeting_levels, halt, signature |
| Dependencies Integrity | 10 | tasks/checklists/templates existem em disco |
| Collaboration Map | 5 | relacoes entre agentes, workflow placement |
| Documentation | 10 | Quick Commands, Guide, README, examples |
| Evolution Tracking | 10 | header present, changelog, lineage |

## Quick Start

```
# Ativar o agente
/Audit:AgentEvolver-AIOS

# Auditoria completa
*audit-full @dev

# Score de TODOS os agentes
*batch-audit

# Otimizar
*optimize @dev

# Versionar
*version @dev minor

# Relatorio
*report @dev
```

## Rating System

| Score | Rating | Significado |
|-------|--------|-------------|
| 95-100 | S | Exemplar - referencia |
| 85-94 | A | Excelente - producao ready |
| 75-84 | B | Bom - melhorias menores |
| 65-74 | C | Aceitavel - otimizacoes necessarias |
| 50-64 | D | Abaixo do padrao |
| 0-49 | F | Critico - reescrita necessaria |

---

*Agent Audit Squad v1.0.0 - Helix, evolucao mensuravel*
