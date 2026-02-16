---
task: Generate Audit Report
responsavel: "@frontend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - findings: Todos os findings coletados
  - screenshots: Screenshots capturados
  - scores: UX scorecard, a11y level, perf metrics
Saida: |
  - report_path: Caminho do relatorio .md
  - summary: Sumario executivo
Checklist:
  - "[ ] Consolidar findings de todas as auditorias"
  - "[ ] Deduplicar findings repetidos"
  - "[ ] Ordenar por severity (CRITICAL first)"
  - "[ ] Agrupar por pagina e por categoria"
  - "[ ] Incluir screenshots como evidencia"
  - "[ ] Incluir UX scorecard"
  - "[ ] Incluir metricas de performance"
  - "[ ] Gerar sumario executivo"
  - "[ ] Listar top 10 fixes prioritarios"
  - "[ ] Salvar em docs/qa/frontend-audit-report.md"
---

# *report

Gera relatorio final consolidado de auditoria frontend.

## Template do Relatorio

```markdown
# Frontend Audit Report

**Aplicacao:** {app_name}
**URL:** {base_url}
**Data:** {date}
**Auditor:** Lupe (Frontend Auditor Squad)

---

## Sumario Executivo

| Severity | Count |
|----------|-------|
| CRITICAL | {n} |
| HIGH | {n} |
| MEDIUM | {n} |
| LOW | {n} |
| **Total** | **{N}** |

**UX Score:** {score}/10
**A11y Level:** {AA|A|None}
**Performance:** {Good|Needs Improvement|Poor}
**Rotas Auditadas:** {count}

---

## Top 10 Fixes Prioritarios

1. [CRITICAL] {descricao} → {fix}
2. ...

---

## Findings por Pagina

### /{route}

**Screenshot:** ![{route}](./screenshots/{route}-1920.png)

| # | Sev | Cat | Issue | Fix |
|---|-----|-----|-------|-----|
| 1 | CRITICAL | ... | ... | ... |

---

## UX Scorecard (Nielsen Heuristics)

| H# | Heuristica | Score |
|----|-----------|-------|
| H1 | ... | .../10 |

---

## Performance Metrics

| Metrica | Valor | Status |
|---------|-------|--------|
| Load Time | ... | ... |

---

## Acessibilidade

| Check | Status | Detalhes |
|-------|--------|----------|
| Keyboard Nav | ... | ... |

---

## Responsividade

| Viewport | Status | Issues |
|----------|--------|--------|
| 320px | ... | ... |
```
