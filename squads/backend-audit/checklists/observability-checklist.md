# Observability Checklist

## Logging
- [ ] Structured logging (JSON format)
- [ ] Log levels corretos (debug, info, warn, error, fatal)
- [ ] Request/response logging com timing
- [ ] Zero PII em logs (passwords, tokens, emails, CPFs)
- [ ] Correlation IDs em todos os logs
- [ ] Log rotation configurado
- [ ] Sem console.log em producao (usar logger)

## Metrics
- [ ] Request count por endpoint/method/status
- [ ] Latency histograms (p50, p95, p99)
- [ ] Error rate tracking
- [ ] Database query duration
- [ ] Connection pool usage
- [ ] Business metrics relevantes
- [ ] System metrics (CPU, memory, event loop lag)

## Tracing
- [ ] Trace/correlation ID gerado por request
- [ ] ID propagado para chamadas downstream
- [ ] Spans para operacoes significativas
- [ ] Distributed tracing entre servicos

## Health Checks
- [ ] Health endpoint (/health)
- [ ] Readiness probe (/ready)
- [ ] Liveness probe (/live)
- [ ] Dependency checks (db, cache, external APIs)
- [ ] Uptime tracking

## Alerting
- [ ] Alertas para error rate > threshold
- [ ] Alertas para latency p99 > threshold
- [ ] Alertas para health check failures
- [ ] Alertas para disk/memory usage
- [ ] On-call rotation definida
