---
task: Security Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - path: Caminho do backend
  - stack: Stack detectada
Saida: |
  - findings: Vulnerabilidades encontradas
  - owasp_coverage: Cobertura dos OWASP Top 10
Checklist:
  - "[ ] A01: Broken Access Control - IDOR, privilege escalation, path traversal"
  - "[ ] A02: Cryptographic Failures - hashing, secrets, random"
  - "[ ] A03: Injection - SQL, NoSQL, command, XSS"
  - "[ ] A04: Insecure Design - rate limiting, abuse prevention"
  - "[ ] A05: Security Misconfiguration - debug, defaults, verbose errors"
  - "[ ] A06: Vulnerable Components - CVEs em deps"
  - "[ ] A07: Auth Failures - sessions, passwords, MFA"
  - "[ ] A08: Data Integrity - deserialization, updates"
  - "[ ] A09: Logging Failures - audit trail, PII"
  - "[ ] A10: SSRF - URL validation"
  - "[ ] Verificar secrets hardcoded no codigo"
  - "[ ] Verificar CORS configuration"
  - "[ ] Verificar headers de seguranca (HSTS, CSP, etc)"
  - "[ ] Verificar rate limiting"
  - "[ ] Verificar input sanitization"
---

# *audit-sec

Auditoria de seguranca baseada no OWASP Top 10 (2021).

## OWASP Top 10 - Procedimento Detalhado

### A01: Broken Access Control

**Procurar:**
- Endpoints sem verificacao de autorizacao
- IDOR (Insecure Direct Object Reference): `GET /users/:id` sem verificar ownership
- Missing role checks em endpoints admin
- Path traversal: `../../../etc/passwd`
- Force browsing: URLs previsíveis para recursos protegidos
- CORS wildcard (`Access-Control-Allow-Origin: *`) com credentials

**Patterns perigosos:**
```javascript
// RUIM - IDOR
app.get('/api/orders/:id', async (req, res) => {
  const order = await Order.findById(req.params.id); // Qualquer user acessa qualquer order
  res.json(order);
});

// BOM - Ownership check
app.get('/api/orders/:id', auth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});
```

### A02: Cryptographic Failures

**Procurar:**
- Passwords sem hashing ou com MD5/SHA1 (usar bcrypt/argon2)
- Secrets em plaintext no codigo ou env sem protecao
- `Math.random()` para tokens/IDs (usar crypto.randomUUID)
- HTTP sem TLS para dados sensiveis
- JWT sem expiracao ou com secret fraco
- Missing encryption at rest para dados sensiveis

### A03: Injection

**Procurar:**
- SQL: String concatenation em queries
- NoSQL: Object injection em MongoDB queries
- Command: `exec()`, `spawn()` com input do usuario
- XSS: Input refletido sem sanitizacao
- Template: Server-side template injection
- LDAP/XML/XPATH injection

**Patterns perigosos:**
```javascript
// SQL INJECTION
db.query(`SELECT * FROM users WHERE email = '${req.body.email}'`);

// COMMAND INJECTION
exec(`convert ${req.query.file} output.pdf`);

// NoSQL INJECTION
User.findOne({ email: req.body.email, password: req.body.password });
```

### A04: Insecure Design

**Procurar:**
- Missing rate limiting em login, signup, password reset
- No CAPTCHA em formularios publicos
- Missing account lockout apos tentativas falhas
- Fluxos de negocio que podem ser abusados
- Missing abuse prevention (bulk operations sem limites)

### A05: Security Misconfiguration

**Procurar:**
- Debug mode habilitado (`DEBUG=true`, stack traces em responses)
- Default credentials (admin/admin, root/root)
- Directory listing habilitado
- Verbose error messages com detalhes internos
- Headers de seguranca missing (X-Frame-Options, X-Content-Type-Options, CSP)
- CORS overly permissivo

### A06: Vulnerable Components

**Procurar:**
- Rodar `npm audit` / `pip audit` / `go vet` / equivalente
- Dependencias 3+ major versions atrasadas
- Dependencias sem manutencao (archived repos)
- CVEs conhecidos nao patcheados

### A07: Authentication Failures

**Procurar:**
- Password requirements fracos (< 8 chars, no complexity)
- Missing brute force protection
- Session tokens em URL (query params)
- Missing session invalidation no logout
- JWT sem expiracao ou com tempo muito longo
- Refresh tokens sem rotacao

### A08: Data Integrity Failures

**Procurar:**
- Deserialization de dados nao confiaveis (pickle, eval, JSON.parse sem schema)
- Updates sem verificacao de integridade
- Missing checksums em downloads/uploads
- Insecure CI/CD pipeline

### A09: Logging & Monitoring Failures

**Procurar:**
- Missing logging em login attempts
- PII em logs (passwords, tokens, emails em plaintext)
- Missing audit trail para operacoes criticas
- Log injection (user input direto em logs)
- Logs sem timestamp ou correlation ID

### A10: SSRF

**Procurar:**
- URLs de input do usuario usadas em requests server-side
- Webhooks sem validacao de URL
- Image/file fetch de URLs arbitrarias
- Missing allowlist/blocklist para URLs internas

## Formato de Finding

```markdown
### [SEC-001] SQL Injection em endpoint de busca
- **Severidade:** CRITICAL
- **OWASP:** A03 - Injection
- **Arquivo:** src/routes/search.js:23
- **Vetor:** `GET /api/search?q='; DROP TABLE users; --`
- **Impacto:** Acesso total ao database, data exfiltration, data destruction
- **Fix:**
  ```javascript
  // Usar parametrized queries
  const results = await db.query('SELECT * FROM products WHERE name ILIKE $1', [`%${q}%`]);
  ```
- **Referencia:** https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
```

## Severidade

| Tipo | Severidade Default |
|------|-------------------|
| Injection (SQL, Command) | CRITICAL |
| Auth bypass | CRITICAL |
| Data exposure (PII, credentials) | CRITICAL |
| IDOR sem ownership check | HIGH |
| Missing rate limiting | HIGH |
| XSS (reflected/stored) | HIGH |
| Secrets hardcoded | HIGH |
| Missing security headers | MEDIUM |
| Weak password policy | MEDIUM |
| Verbose error messages | MEDIUM |
| Missing CORS restriction | MEDIUM |
| Log injection | LOW |
| Missing audit trail | LOW |
