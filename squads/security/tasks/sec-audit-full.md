---
task: Full Security Audit
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*audit"
Entrada: |
  - scope: Escopo do audit (full | code | deps | secrets | api)
  - target: Diretorio ou servico alvo (default: projeto inteiro)
Saida: |
  - findings: Lista de vulnerabilidades encontradas (severity + location + fix)
  - metrics: Contadores por severidade (critical/high/medium/low)
  - report: Relatorio markdown detalhado
  - gate_result: PASS | WARN | FAIL
Checklist:
  - "[ ] Coletar escopo e target"
  - "[ ] Executar SAST scan (security-checker.js)"
  - "[ ] Executar dependency scan (npm audit)"
  - "[ ] Executar secret scan (secretlint/grep patterns)"
  - "[ ] Verificar security headers (se API/frontend ativo)"
  - "[ ] Verificar auth/authz patterns"
  - "[ ] Classificar findings por severidade"
  - "[ ] Gerar relatorio com findings + recommendations"
  - "[ ] Determinar gate result (PASS/WARN/FAIL)"
---

# *audit - Full Security Audit

Audit completo de seguranca em 4 dominios: code, dependencies, secrets, API.

## Flow

```
1. Determine scope
   ├── If scope=full → run ALL 4 domains
   ├── If scope=code → only SAST
   ├── If scope=deps → only dependency scan
   ├── If scope=secrets → only secret scan
   └── If scope=api → only API security

2. DOMAIN 1: Code Security (SAST)
   ├── Run security-checker.js on target directories
   ├── Check for OWASP Top 10 patterns
   │   ├── eval() / new Function()
   │   ├── innerHTML / dangerouslySetInnerHTML
   │   ├── SQL string concatenation
   │   ├── child_process.exec() with user input
   │   ├── require() with dynamic paths
   │   ├── fs operations with unsanitized paths
   │   ├── Weak crypto (MD5, SHA1, Math.random)
   │   └── Path traversal patterns
   ├── Run ESLint with security plugin (if available)
   └── Collect findings with file:line references

3. DOMAIN 2: Dependency Security
   ├── Run: npm audit --json (in each package directory)
   ├── Check dependabot alerts status
   ├── Verify package-lock.json integrity
   ├── Flag abandoned/unmaintained packages (>2yr no update)
   └── Collect CVE references

4. DOMAIN 3: Secret Detection
   ├── Scan source files for credential patterns
   │   ├── API keys (AWS_*, BINANCE_*, etc.)
   │   ├── Database connection strings
   │   ├── JWT secrets / OAuth tokens
   │   ├── Private keys (BEGIN RSA/SSH)
   │   └── Hardcoded passwords
   ├── Verify .env files are in .gitignore
   ├── Check for secrets in committed .env files
   └── Flag any credentials in config files

5. DOMAIN 4: API Security
   ├── Identify all API endpoints (Express routes, Next.js API routes)
   ├── Check authentication on each endpoint
   ├── Check rate limiting configuration
   ├── Check input validation
   ├── Check CORS configuration
   ├── Check security headers
   └── Check error handling (no stack traces exposed)

6. Classify and Report
   ├── Classify each finding: CRITICAL / HIGH / MEDIUM / LOW
   ├── Generate markdown report (using sec-audit-report-tmpl.md)
   ├── Determine gate:
   │   ├── ANY critical or high → FAIL
   │   ├── Only medium/low → WARN
   │   └── No findings → PASS
   └── Display summary + actionable recommendations
```

## Gate Decision

| Condition | Result | Action |
|-----------|--------|--------|
| 0 critical, 0 high | PASS | Safe to proceed |
| 0 critical, >0 high | FAIL | Fix high before release |
| >0 critical | FAIL | Fix immediately, block deployment |
| Only medium/low | WARN | Track, fix within sprint |

## Existing Tools Used

- `security-checker.js` → SAST patterns
- `security-utils.js` → validation helpers
- `security-validation.md` → comprehensive checklist
- `npm audit` → dependency vulnerabilities
- `secretlint` → secret detection (if installed)
- `dependabot.yml` → GitHub dependency scanning
