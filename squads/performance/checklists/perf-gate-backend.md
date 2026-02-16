# Performance Gate: Backend

> Blaze (Performance Engineer) | Checklist de quality gate backend

## API Response Times

- [ ] **p50 Latency**: < 100ms para endpoints principais
- [ ] **p95 Latency**: < 500ms sob carga normal
- [ ] **p99 Latency**: < 1000ms (sem outliers extremos)
- [ ] **Error Rate**: < 0.1% sob carga normal

## Throughput

- [ ] **Requests/sec**: > 100 req/s com 10 conexoes simultaneas
- [ ] **No Degradation Under Load**: p95 nao mais que 3x p50 com 50 conexoes
- [ ] **Graceful Degradation**: Error rate < 5% mesmo sob stress

## Memory

- [ ] **Heap Used**: < 512MB em operacao normal
- [ ] **RSS**: < 768MB em operacao normal
- [ ] **No Memory Leaks**: Growth rate < 10MB/hora
- [ ] **GC Pauses**: < 100ms (max pause)

## Code Quality

- [ ] **No Sync I/O**: Nenhum fs.*Sync em hot paths
- [ ] **No Blocking Operations**: Event loop lag < 50ms
- [ ] **Proper Caching**: Endpoints frequentes usam cache
- [ ] **Connection Pooling**: Database connections pooled

## Gate Decision

| Result | Action |
|--------|--------|
| All PASS | Gate APPROVED |
| Memory WARNING only | Gate APPROVED with monitoring |
| p95 > 2000ms | Gate BLOCKED - latency critical |
| Memory leak detected | Gate BLOCKED - fix leak |
| Error rate > 1% | Gate BLOCKED - stability issue |

---
*Checklist — Blaze, Performance Engineer*
