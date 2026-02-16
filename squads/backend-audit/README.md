# Backend Audit Squad

Auditoria profissional de backends - nivel CTO Senior. Stack-agnostic, cobre qualquer linguagem e framework.

## Agent

**Sentinel** - Senior Backend Quality & Security Auditor

## 9 Dimensoes de Auditoria

| Dimensao | Comando | O Que Cobre |
|----------|---------|-------------|
| Performance | `*audit-perf` | N+1, memory leaks, pooling, caching, async patterns |
| Security | `*audit-sec` | OWASP Top 10, injection, auth, data exposure, CORS |
| Code Quality | `*audit-code` | Complexity, dead code, smells, typing, DRY |
| API | `*audit-api` | REST practices, status codes, pagination, validation |
| Database | `*audit-db` | Schema, indexes, queries, transactions, connections |
| Architecture | `*audit-arch` | Coupling, cohesion, SOLID, layers, patterns |
| Error Handling | `*audit-errors` | Global handlers, retry, circuit breakers, shutdown |
| Observability | `*audit-obs` | Logging, metrics, tracing, health checks, alerting |
| Dependencies | `*audit-deps` | CVEs, outdated, unused, licenses, maintenance |

## Quick Start

```
# Ativar o agente
/BackendAudit:backend-auditor

# Auditoria completa
*audit-full ./path/to/backend

# Auditorias especificas
*audit-sec ./path/to/backend
*audit-perf ./path/to/backend

# Gerar relatorio
*report
```

## Health Score

| Score | Rating | Status |
|-------|--------|--------|
| 90-100 | A | Pronto para producao |
| 80-89 | B | Melhorias menores |
| 70-79 | C | Issues significativos |
| 60-69 | D | Acao necessaria |
| 0-59 | F | Nao deve ir para producao |

## Stacks Suportadas

Node.js, Python, Go, Rust, Java, .NET, PHP, Ruby - qualquer backend.

---

*Backend Audit Squad v1.0.0 - Sentinel, protegendo seu backend*
