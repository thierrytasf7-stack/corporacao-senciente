---
task: Generate Evolution Report
responsavel: "@agent-evolver"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - agent: Nome do agente
  - audit_results: Resultados da auditoria
  - history: Historico de versoes
Saida: |
  - report: Relatorio de evolucao
Checklist:
  - "[ ] Gerar executive summary com score atual"
  - "[ ] Incluir score breakdown por dimensao"
  - "[ ] Incluir grafico de evolucao (ASCII)"
  - "[ ] Listar findings ativos"
  - "[ ] Incluir roadmap de proximas otimizacoes"
  - "[ ] Comparar com media dos outros agentes"
---

# *report

Gera relatorio de evolucao do agente.

## ASCII Evolution Graph

```
Score
100 |
 90 |                              ●  v2.0.0 (85)
 80 |                    ●  v1.2.0 (78)
 70 |          ●  v1.1.0 (71)
 60 |  ●  v1.0.0 (62)
 50 |
    +----+----+----+----+----+----+---> Time
    Jan15 Jan22 Feb01 Feb12
```

## Batch Audit Table

Para `*batch-audit`, gerar tabela com todos os agentes:

```
| Agent | Score | Rating | Version | Last Audit |
|-------|-------|--------|---------|------------|
| @dev (Dex) | 85/100 | A | v2.0.0 | 2026-02-12 |
| @qa (Quinn) | 78/100 | B | v1.2.0 | 2026-02-10 |
| @architect | 72/100 | C | v1.0.0 | 2026-02-05 |
| @pm (Morgan) | 68/100 | C | v1.0.0 | 2026-01-28 |
| ... | ... | ... | ... | ... |
```

## Report Template

Usar `evolution-report-tmpl.md`
