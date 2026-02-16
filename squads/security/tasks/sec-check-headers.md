---
task: Security Headers Check
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*headers"
Entrada: |
  - url: URL do servico a verificar (default: localhost:21300, localhost:21301)
  - config_only: Verificar apenas config, sem request (default: false)
Saida: |
  - headers_present: Headers encontrados
  - headers_missing: Headers faltando
  - misconfigurations: Configuracoes inseguras
Checklist:
  - "[ ] Verificar CSP (Content-Security-Policy)"
  - "[ ] Verificar HSTS (Strict-Transport-Security)"
  - "[ ] Verificar X-Frame-Options"
  - "[ ] Verificar X-Content-Type-Options"
  - "[ ] Verificar CORS configuration"
  - "[ ] Verificar cookie security flags"
  - "[ ] Verificar Referrer-Policy"
  - "[ ] Verificar Permissions-Policy"
---

# *headers - Security Headers Check

Verificar headers HTTP de seguranca nos servicos.

## Headers Obrigatorios

| Header | Valor Recomendado | Risco se Ausente |
|--------|-------------------|------------------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'` | XSS, data injection |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | MITM, downgrade attacks |
| `X-Frame-Options` | `DENY` ou `SAMEORIGIN` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME type confusion |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Information leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Feature abuse |
| `X-XSS-Protection` | `0` (deprecated, CSP preferred) | Legacy XSS filter |

## CORS Configuration

| Config | Secure | Insecure |
|--------|--------|----------|
| Origin | Whitelist especifico | `*` (wildcard) |
| Credentials | Apenas com origin especifico | `true` com `*` |
| Methods | Apenas necessarios | `*` (todos) |
| Headers | Apenas necessarios | `*` (todos) |

## Flow

```
1. Identify services to check
   ├── Dashboard: localhost:21300
   ├── Backend API: localhost:21301
   ├── Monitor: localhost:21302
   └── Custom targets from input

2. For each service (if running):
   ├── Send HEAD request
   ├── Collect response headers
   ├── Check each required header
   └── Flag missing/misconfigured

3. Check source code config (always)
   ├── Search for helmet/cors middleware config
   ├── Verify Next.js security headers (next.config.js)
   ├── Verify Express security middleware
   └── Check for hardcoded CORS origins

4. Report
   ├── Traffic light per header (present/missing/misconfigured)
   ├── Severity per finding
   └── Fix recommendations with code examples
```
