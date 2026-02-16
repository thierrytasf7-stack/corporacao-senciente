---
task: API Security Audit
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*api"
Entrada: |
  - target: Servico(s) a auditar (default: backend + dashboard API)
Saida: |
  - endpoint_inventory: Todos os endpoints com security status
  - findings: Vulnerabilidades encontradas
  - score: Security score (0-100)
Checklist:
  - "[ ] Mapear todos os endpoints"
  - "[ ] Verificar autenticacao"
  - "[ ] Verificar rate limiting"
  - "[ ] Verificar input validation"
  - "[ ] Verificar CORS"
  - "[ ] Verificar security headers"
  - "[ ] Verificar error handling"
  - "[ ] Verificar request size limits"
  - "[ ] Calcular security score"
---

# *api - API Security Audit

Audit completo de seguranca de API cobrindo todos os aspectos.

## Security Checklist por Endpoint

| Check | Peso | Verificacao |
|-------|------|-------------|
| Authentication | 20 | Endpoint requer auth (exceto public whitelist) |
| Authorization | 15 | RBAC/ABAC enforced corretamente |
| Rate Limiting | 15 | RateLimiter configurado (de security-utils) |
| Input Validation | 15 | Todos os inputs validados/sanitizados |
| CORS | 10 | Whitelist-only, sem wildcard |
| Security Headers | 10 | CSP, HSTS, X-Frame-Options presentes |
| Error Handling | 10 | Sem stack traces, mensagens genericas |
| Request Size | 5 | Body size limit enforced |

## Flow

```
1. Discover API endpoints
   ├── Backend (Express): apps/backend/server.js + routes
   ├── Dashboard API (Next.js): apps/dashboard/src/app/api/**/route.ts
   ├── WhatsApp Bridge: apps/backend/integrations/whatsapp/
   ├── Binance Bot: modules/binance-bot/ endpoints
   └── Build inventory table

2. For EACH endpoint, check:
   ├── AUTH: middleware/wrapper que verifica identidade
   ├── AUTHZ: verificacao de role/permission
   ├── RATE LIMIT: RateLimiter ou middleware equivalente
   ├── INPUT: sanitizeInput() ou validacao de schema
   ├── CORS: configuracao de origins
   ├── HEADERS: helmet ou headers manuais
   ├── ERRORS: try/catch sem expose de internals
   └── SIZE: body-parser limit ou equivalente

3. Calculate security score
   ├── Each check has a weight (total = 100)
   ├── Score per endpoint = sum of passed checks * weight
   ├── Overall score = average of all endpoints
   └── Grade: A(90+), B(80+), C(70+), D(60+), F(<60)

4. Report
   ├── Endpoint inventory with per-check status
   ├── Overall security score and grade
   ├── Top vulnerabilities to fix
   └── Quick wins vs deep fixes
```

## Score Thresholds

| Grade | Score | Status |
|-------|-------|--------|
| A | 90-100 | Excellent - safe to deploy |
| B | 80-89 | Good - minor improvements needed |
| C | 70-79 | Fair - fix before next release |
| D | 60-69 | Poor - fix before any deployment |
| F | <60 | Critical - stop and fix now |
