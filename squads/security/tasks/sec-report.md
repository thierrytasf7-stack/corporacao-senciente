---
task: Security Report
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*report"
Entrada: |
  - scope: Escopo (full | code | deps | secrets | api)
  - format: Formato (terminal | markdown) default: terminal
  - output: Caminho para salvar (se markdown)
Saida: |
  - report: Relatorio completo de seguranca
Checklist:
  - "[ ] Executar audit completo (ou parcial conforme scope)"
  - "[ ] Coletar todas as metricas"
  - "[ ] Gerar relatorio usando template"
  - "[ ] Incluir executive summary"
  - "[ ] Incluir findings detalhados"
  - "[ ] Incluir recommendations priorizadas"
  - "[ ] Calcular security score"
---

# *report - Security Report

Gerar relatorio de seguranca completo usando o template `sec-audit-report-tmpl.md`.

## Flow

```
1. Run full audit (or partial based on scope)
   ├── Collect SAST findings
   ├── Collect dependency findings
   ├── Collect secret scan findings
   ├── Collect API security findings
   └── Collect header check findings

2. Calculate metrics
   ├── Total findings by severity
   ├── Security score (0-100)
   ├── OWASP coverage percentage
   ├── Dependency health score
   └── Comparison with last report (if exists)

3. Generate report
   ├── Load sec-audit-report-tmpl.md
   ├── Fill executive summary
   ├── Fill findings per domain
   ├── Fill recommendations (prioritized)
   ├── Fill action items with owners
   └── Include gate decision (PASS/WARN/FAIL)

4. Output
   ├── If terminal → display formatted
   └── If markdown → save to output path
```
