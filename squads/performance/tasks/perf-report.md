# Task: Performance Report

> Blaze (Performance Engineer) | Gerar relatorio completo de performance

## Objetivo
Gerar relatorio consolidado de performance usando template padrao. Combina dados de todas as fontes (audit, profile, benchmarks, budgets) em documento executivo.

## Steps

### Step 1: Gather Data Sources
```
- Verificar audits recentes executados
- Verificar profiles recentes
- Verificar benchmark results
- Verificar budget compliance status
- Se nenhum dado disponivel: sugerir *audit primeiro
```

### Step 2: Executive Summary
```
- Overall health score (0-100)
- Numero de findings por severidade
- Budget compliance rate
- Top 3 riscos
- Top 3 oportunidades
```

### Step 3: Detailed Findings
```
Para cada camada (frontend, backend, database):
- Metricas medidas vs targets
- Findings com severidade
- Trend (melhorando/piorando/estavel)
- Recomendacoes especificas
```

### Step 4: Budget Scorecard
```
- Usar perf-budget-tmpl.md para formato
- Todas metricas vs budgets
- PASS/FAIL/WARNING para cada
- Overall compliance percentage
```

### Step 5: Action Items
```
| # | Action | Severity | Owner | Effort | Impact |
|---|--------|----------|-------|--------|--------|
| 1 | {desc} | CRITICAL | @dev  | M      | HIGH   |
```

### Step 6: Generate Report
```
- Usar perf-audit-report-tmpl.md como base
- Preencher com dados coletados
- Incluir graficos ASCII se possivel
- Incluir historico se baseline disponivel
```

## Output
- Performance report completo em markdown
- Executive summary
- Detailed findings por camada
- Budget scorecard
- Prioritized action items

---
*Task — Blaze, Performance Engineer*
