---
task: Generate Harmony Report
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - findings: Todos os findings coletados
  - metrics: Metricas por dimensao
Saida: |
  - report: Relatorio de harmonia em Markdown
Checklist:
  - "[ ] Consolidar findings de todas as dimensoes"
  - "[ ] Calcular harmony score (0-100)"
  - "[ ] Gerar endpoint map (backend <-> frontend)"
  - "[ ] Priorizar por severidade"
  - "[ ] Gerar executive summary"
  - "[ ] Criar fix roadmap"
---

# *report

Gera relatorio final de harmonia.

## Harmony Score Calculation

```
Base Score: 100

Deducoes por finding:
- CRITICAL: -20 pontos (comunicacao quebrada)
- HIGH:     -10 pontos (fluxo impactado)
- MEDIUM:   -4 pontos (dessintonia parcial)
- LOW:      -1 ponto (melhoria)

Minimo: 0
```

### Score Classification
| Score | Rating | Status |
|-------|--------|--------|
| 90-100 | Harmonia Perfeita | Comunicacao impecavel |
| 80-89 | Boa Harmonia | Dessintonias menores |
| 60-79 | Harmonia Parcial | Dessintonias significativas |
| 40-59 | Dessintonia | Fluxos quebrados |
| 0-39 | Comunicacao Quebrada | Camadas nao conversam |

## Endpoint Map

Gerar tabela cruzada:

| Backend Endpoint | Frontend Call | Status | Notes |
|-----------------|---------------|--------|-------|
| GET /api/users | useSWR('/api/users') | ✅ | OK |
| POST /api/users | axios.post('/api/users') | ⚠️ | Missing error handling |
| PUT /api/users/:id | (nenhum) | ⚠️ | Dead endpoint |
| (nenhum) | fetch('/api/settings') | ❌ | 404 garantido |

## Dimension Scores

| Dimensao | Score |
|----------|-------|
| API Contracts | /100 |
| Data Flow | /100 |
| Auth Flow | /100 |
| Error Propagation | /100 |
| Real-time | /100 |
| CORS & Headers | /100 |
| State Sync | /100 |
| Loading States | /100 |
| Type Consistency | /100 |
| Env & Config | /100 |

## Report Template

Usar `harmony-report-tmpl.md`
