---
task: Generate Audit Report
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - findings: Todos os findings coletados das auditorias
  - metrics: Metricas coletadas
Saida: |
  - report: Relatorio final em Markdown
Checklist:
  - "[ ] Consolidar findings de todas as dimensoes"
  - "[ ] Deduplicar findings relacionados"
  - "[ ] Calcular health score (0-100)"
  - "[ ] Priorizar por severidade"
  - "[ ] Gerar executive summary"
  - "[ ] Criar roadmap de fixes"
  - "[ ] Gerar relatorio usando template"
---

# *report

Gera relatorio final consolidado.

## Health Score Calculation

O health score (0-100) e calculado com base nos findings:

```
Base Score: 100

Deducoes por finding:
- CRITICAL: -15 pontos cada
- HIGH:     -8 pontos cada
- MEDIUM:   -3 pontos cada
- LOW:      -1 ponto cada

Minimo: 0
```

### Score Classification
| Score | Rating | Status |
|-------|--------|--------|
| 90-100 | A | Excelente - Pronto para producao |
| 80-89 | B | Bom - Melhorias menores necessarias |
| 70-79 | C | Aceitavel - Issues significativos |
| 60-69 | D | Preocupante - Acao necessaria |
| 0-59 | F | Critico - Nao deve ir para producao |

## Dimension Scores

Calcular score individual por dimensao:
- Performance Score (0-100)
- Security Score (0-100)
- Code Quality Score (0-100)
- API Score (0-100)
- Database Score (0-100)
- Architecture Score (0-100)
- Error Handling Score (0-100)
- Observability Score (0-100)
- Dependencies Score (0-100)

## Fix Roadmap

Organizar fixes em sprints sugeridos:

### Sprint 1 (Urgente - Esta Semana)
- Todos os CRITICAL findings
- Security vulnerabilities

### Sprint 2 (Importante - Proxima Semana)
- HIGH findings
- Performance bottlenecks

### Sprint 3 (Planejado - Este Mes)
- MEDIUM findings
- Architecture improvements

### Backlog
- LOW findings
- Nice-to-have improvements

## Report Structure

Usar template `audit-report-tmpl.md` com:
1. Executive Summary (health score, dimensoes, top issues)
2. Findings por dimensao (priorizado)
3. Metricas detalhadas
4. Fix Roadmap
5. Recomendacoes gerais
