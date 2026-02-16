---
task: Documentation Coverage Audit
responsavel: "@docs-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*audit"
Entrada: |
  - scope: Escopo (full | category | module)
Saida: |
  - coverage: % de features documentadas
  - freshness: % de docs atualizados (<90d)
  - quality_score: Score geral (0-100)
  - gaps: Lista de lacunas identificadas
Checklist:
  - "[ ] Inventariar features/modulos do projeto"
  - "[ ] Verificar quais tem documentacao"
  - "[ ] Verificar freshness dos docs existentes"
  - "[ ] Calcular coverage e quality scores"
  - "[ ] Identificar gaps prioritarios"
  - "[ ] Gerar recomendacoes"
---

# *audit - Documentation Coverage Audit

Audita cobertura e qualidade da documentacao em relacao ao codebase.

## Metricas

| Metrica | Calculo | Target |
|---------|---------|--------|
| Coverage | Features com doc / Total features | >= 80% |
| Freshness | Docs atualizados (<90d) / Total docs | >= 70% |
| Frontmatter | Docs com frontmatter completo / Total | >= 90% |
| Links | Links validos / Total links | >= 95% |
| i18n | Docs com traducao / Docs necessarios | >= 50% |

## Flow

```
1. Inventory codebase features
   ├── Agents: .aios-core/development/agents/ (11 agents)
   ├── Squads: squads/ (all squads)
   ├── Services: apps/ + modules/ (all services)
   ├── APIs: endpoints discovered
   ├── Scripts: scripts/ (key scripts)
   └── Build feature list

2. Inventory existing docs
   ├── Scan docs/ recursively
   ├── Extract titles and categories
   ├── Map docs to features
   └── Identify mapped vs unmapped

3. Calculate metrics
   ├── Coverage: mapped / total features
   ├── Freshness: modified <90d / total docs
   ├── Frontmatter: complete / total docs
   ├── Links: run validate → link health
   └── Overall quality score (weighted avg)

4. Identify gaps
   ├── Features without any documentation
   ├── Stale docs (>90 days old)
   ├── Missing ADRs for known decisions
   ├── APIs without endpoint documentation
   └── Squads without README

5. Generate report
   ├── Overall scores (traffic light)
   ├── Category breakdown
   ├── Top priority gaps
   ├── Recommended actions with owners
   └── Comparison with previous audit (if exists)
```

## Quality Score

| Score | Grade | Status |
|-------|-------|--------|
| 90-100 | A | Excellent documentation |
| 80-89 | B | Good - minor gaps |
| 70-79 | C | Fair - needs attention |
| 60-69 | D | Poor - significant gaps |
| <60 | F | Critical - docs sprint needed |
