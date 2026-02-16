---
task: Authentication & Authorization Audit
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*auth"
Entrada: |
  - target: Servico a auditar (default: todos os endpoints)
Saida: |
  - endpoints_audited: Lista de endpoints verificados
  - unprotected: Endpoints sem autenticacao
  - authz_issues: Problemas de autorizacao
Checklist:
  - "[ ] Mapear todos os endpoints (Express + Next.js API routes)"
  - "[ ] Verificar autenticacao em cada endpoint"
  - "[ ] Verificar autorizacao (RBAC) onde aplicavel"
  - "[ ] Verificar session management"
  - "[ ] Verificar password policies (se aplicavel)"
  - "[ ] Verificar token handling (JWT, API keys)"
  - "[ ] Classificar findings"
---

# *auth - Authentication & Authorization Audit

Auditar mecanismos de autenticacao e autorizacao.

## Flow

```
1. Discover all endpoints
   ├── Express routes: grep for app.get/post/put/delete/patch
   ├── Next.js API routes: scan apps/dashboard/src/app/api/
   ├── WebSocket endpoints
   └── Build endpoint inventory

2. For EACH endpoint, verify:
   ├── Authentication
   │   ├── Requires auth? (middleware check)
   │   ├── If public: is it intentionally public?
   │   ├── Auth method (JWT, session, API key, basic)
   │   └── Token validation (expiry, signature, issuer)
   ├── Authorization
   │   ├── RBAC implemented? (role checks)
   │   ├── Object-level access (IDOR prevention)
   │   ├── Function-level access (admin-only routes)
   │   └── Data-level access (RLS in queries)
   └── Session Management
       ├── Session timeout configured
       ├── Session regeneration on auth change
       ├── Secure cookie flags
       └── Logout invalidates session

3. Check password/credential handling
   ├── Password hashing algorithm (bcrypt/argon2 required)
   ├── No plaintext password storage
   ├── No password in logs
   └── Brute force protection (rate limiting)

4. Check token security
   ├── JWT secret strength (>256 bits)
   ├── JWT algorithm (RS256/ES256 preferred over HS256)
   ├── Token expiry reasonable (<24h access, <7d refresh)
   ├── Refresh token rotation
   └── Token stored securely (httpOnly cookie, not localStorage)

5. Report
   ├── Endpoint inventory with auth status
   ├── Unprotected endpoints (CRITICAL if should be protected)
   ├── AuthZ gaps
   └── Recommendations
```
