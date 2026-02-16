# Fullstack Harmony Squad

Auditoria de harmonia Backend-Frontend. Valida que toda comunicacao entre camadas esta funcional, consistente e resiliente. Stack-agnostic.

## Agent

**Bridge** - Fullstack Integration Auditor & Harmony Specialist

## 10 Dimensoes de Auditoria

| Dimensao | Comando | O Que Cobre |
|----------|---------|-------------|
| API Contracts | `*audit-contracts` | Endpoints vs chamadas, methods, payloads, responses |
| Data Flow | `*audit-data` | CRUD E2E, pagination, sort, filter |
| Auth Flow | `*audit-auth` | Login, token, refresh, logout, route guards |
| Error Propagation | `*audit-errors` | Status codes, field errors, network errors |
| Real-time | `*audit-realtime` | WebSocket, SSE, polling, events |
| CORS & Headers | `*audit-cors` | Cross-origin, security headers, preflight |
| State Sync | `*audit-state` | Cache invalidation, optimistic updates, revalidation |
| Loading States | `*audit-loading` | Loading, error, empty, skeleton, timeout |
| Type Consistency | `*audit-types` | Interfaces, enums, dates, IDs, nullables |
| Env & Config | `*audit-env` | URLs, ports, env vars, feature flags |

## Quick Start

```
# Ativar o agente
/Squads:FullstackHarmony-AIOS

# Auditoria completa
*audit-full apps/dashboard apps/backend

# Auditorias especificas
*audit-contracts apps/dashboard apps/backend
*audit-auth apps/dashboard apps/backend

# Gerar relatorio
*report
```

## Harmony Score

| Score | Rating | Status |
|-------|--------|--------|
| 90-100 | Harmonia Perfeita | Comunicacao impecavel |
| 80-89 | Boa Harmonia | Dessintonias menores |
| 60-79 | Harmonia Parcial | Dessintonias significativas |
| 40-59 | Dessintonia | Fluxos quebrados |
| 0-39 | Comunicacao Quebrada | Camadas nao conversam |

## Workflow Completo (3 Squads)

```
@backend-auditor  -> audita backend isolado
@frontend-auditor -> audita frontend isolado
@harmony-auditor  -> valida integracao entre ambos
```

---

*Fullstack Harmony Squad v1.0.0 - Bridge, conectando camadas*
