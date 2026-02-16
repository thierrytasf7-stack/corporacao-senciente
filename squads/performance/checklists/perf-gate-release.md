# Performance Gate: Release

> Blaze (Performance Engineer) | Gate final antes de release para producao

## Pre-Release Checks

- [ ] **No Regressions**: Nenhuma regressao > 10% vs baseline
- [ ] **Budget Compliance**: Todos performance budgets dentro do limite
- [ ] **No Critical Findings**: Zero findings de severidade CRITICAL
- [ ] **No Memory Leaks**: Teste de memory leak passou (< 10MB/hr)

## Frontend Release Gate

- [ ] **Bundle Size OK**: < 250KB gzipped
- [ ] **Lighthouse >= 90**: Performance score aceitavel
- [ ] **Core Web Vitals OK**: LCP < 2.5s, FID < 100ms, CLS < 0.1

## Backend Release Gate

- [ ] **API p95 OK**: < 500ms sob carga normal
- [ ] **Throughput OK**: > 100 req/s
- [ ] **Error Rate OK**: < 0.1%
- [ ] **Memory OK**: Heap < 512MB, RSS < 768MB

## Database Release Gate

- [ ] **Queries OK**: p95 < 100ms
- [ ] **Cache Hit OK**: > 95%
- [ ] **No Pending Migrations Issues**: Migrations executam < 30s

## Overall Decision

| Scenario | Decision |
|----------|----------|
| All gates PASS | **RELEASE APPROVED** |
| Warnings only (no FAIL) | **RELEASE APPROVED** com monitoring recomendado |
| Any gate FAIL (non-critical) | **RELEASE CONDITIONAL** - fix within 24h |
| Any CRITICAL finding | **RELEASE BLOCKED** - fix before ship |
| Regression detected | **RELEASE BLOCKED** - revert or fix |

## Sign-off

- [ ] Performance Engineer (Blaze): ___
- [ ] Prometheus (CEO-Dev) notificado: ___

---
*Checklist — Blaze, Performance Engineer*
