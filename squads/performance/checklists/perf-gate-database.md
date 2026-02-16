# Performance Gate: Database

> Blaze (Performance Engineer) | Checklist de quality gate database

## Query Performance

- [ ] **Query p50**: < 10ms para queries frequentes
- [ ] **Query p95**: < 100ms
- [ ] **Query p99**: < 500ms
- [ ] **No Seq Scans on Large Tables**: Zero sequential scans em tabelas > 1000 rows

## Index Health

- [ ] **Index Usage**: Todas tabelas grandes usam indexes adequados
- [ ] **No Unused Indexes**: Sem indexes nunca utilizados (desperdicio)
- [ ] **Missing Indexes**: Sem tabelas com alto seq_scan e baixo idx_scan

## Cache & Connections

- [ ] **Cache Hit Ratio**: > 95% (shared_buffers effective)
- [ ] **Connection Pool**: < 80% de utilizacao
- [ ] **No Connection Leaks**: Connections idle < 5 minutos sao recicladas

## Maintenance

- [ ] **Dead Tuples**: < 10% de dead tuples em qualquer tabela
- [ ] **Autovacuum Active**: Autovacuum rodando regularmente
- [ ] **Table Bloat**: Nenhuma tabela com bloat excessivo (> 20%)

## Gate Decision

| Result | Action |
|--------|--------|
| All PASS | Gate APPROVED |
| Missing index only | Gate APPROVED with TODO |
| Cache hit < 80% | Gate BLOCKED - tune shared_buffers |
| Seq scan on large table | Gate BLOCKED - add index |
| Dead tuples > 30% | Gate WARNING - schedule VACUUM |

---
*Checklist — Blaze, Performance Engineer*
