---
task: Full Agent Audit
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: workflow
elicit: true
Entrada: |
  - agent: Nome ou path do agente AIOS
Saida: |
  - quality_score: Score de qualidade 0-100
  - findings: Issues por dimensao
  - optimizations: Otimizacoes sugeridas
Checklist:
  - "[ ] Localizar arquivo do agente (.aios-core/development/agents/ ou squads/)"
  - "[ ] Parsear YAML block completo"
  - "[ ] Executar audit-persona-quality"
  - "[ ] Executar audit-commands-coverage"
  - "[ ] Executar audit-task-alignment"
  - "[ ] Executar audit-principles-coherence"
  - "[ ] Executar audit-greeting-activation"
  - "[ ] Executar audit-dependencies-integrity"
  - "[ ] Executar audit-collaboration-map"
  - "[ ] Calcular quality score por dimensao"
  - "[ ] Calcular quality score total"
  - "[ ] Gerar lista de otimizacoes priorizadas"
  - "[ ] Comparar com score anterior (se evolution header existe)"
---

# *audit-full

Auditoria completa de um agente AIOS.

## Fase 0: Localizacao

Encontrar o arquivo do agente:
1. `.aios-core/development/agents/{agent-id}.md` (core agents)
2. `squads/{squad-name}/agents/{agent-id}.md` (squad agents)

## Fase 1: Parsing

Extrair do YAML block:
- `agent` section (name, id, title, icon, whenToUse, customization)
- `persona_profile` (archetype, zodiac, communication)
- `persona` (role, style, identity, focus, core_principles)
- `commands` (name, visibility, description)
- `dependencies` (tasks, checklists, templates)
- `evolution` header (se existir)

## Fase 2: Auditoria por Dimensao

Executar cada sub-audit e coletar scores:

| Dimensao | Max | Checks |
|----------|-----|--------|
| Persona Quality | 15 | name, id, title, icon, archetype, tone, vocabulary, identity, whenToUse |
| Commands Coverage | 15 | help, exit, visibility, descriptions, naming, coverage, duplicates |
| Task Alignment | 15 | command->task mapping, orphans, phantoms, naming, frontmatter |
| Principles Coherence | 10 | align with role, align with focus, contradictions, CRITICAL usage |
| Greeting/Activation | 10 | steps 1-5, greeting_levels, halt, signature, REQUEST-RESOLUTION |
| Dependencies Integrity | 10 | tasks exist, checklists exist, templates exist, no broken refs |
| Collaboration Map | 5 | section exists, relationships valid, workflow documented |
| Documentation | 10 | Quick Commands, Guide, README, examples |
| Evolution Tracking | 10 | header present, changelog exists, lineage history |

**Total: 100 pontos**

## Fase 3: Score Calculation

```
quality_score = sum(dimension_scores)

Rating:
  95-100: S  (Exemplar - referencia para outros agentes)
  85-94:  A  (Excelente - producao ready)
  75-84:  B  (Bom - melhorias menores)
  65-74:  C  (Aceitavel - otimizacoes necessarias)
  50-64:  D  (Abaixo do padrao - refactoring necessario)
  0-49:   F  (Critico - reescrita necessaria)
```

## Fase 4: Delta Analysis

Se evolution header existe:
- Comparar score atual vs anterior
- Calcular delta (melhora/piora)
- Identificar dimensoes que regrediram
- Flag regressoes como CRITICAL

## Fase 5: Optimization Plan

Priorizar otimizacoes por impacto:
1. CRITICAL findings primeiro (score < 50% da dimensao)
2. HIGH findings (score 50-70% da dimensao)
3. Quick wins (1 pt cada, rapidos de implementar)
4. Strategic improvements (multi-point, mais complexos)
