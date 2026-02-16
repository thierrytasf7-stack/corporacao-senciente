# Security Checklist (OWASP Top 10)

## A01: Access Control
- [ ] Toda rota protegida tem auth middleware
- [ ] Ownership check em acesso a recursos (anti-IDOR)
- [ ] Role-based access control (RBAC) implementado
- [ ] Sem path traversal possivel
- [ ] CORS restritivo (sem wildcard com credentials)

## A02: Cryptography
- [ ] Passwords com bcrypt/argon2 (nunca MD5/SHA1)
- [ ] Secrets em env vars (nunca hardcoded)
- [ ] crypto.randomUUID para tokens (nunca Math.random)
- [ ] JWT com expiracao e secret forte

## A03: Injection
- [ ] Todas queries parametrizadas (nunca string concat)
- [ ] Input sanitizado antes de uso
- [ ] Sem exec/spawn com input do usuario
- [ ] Output encoded para prevenir XSS

## A04: Insecure Design
- [ ] Rate limiting em login/signup/password-reset
- [ ] Account lockout apos tentativas falhas
- [ ] Abuse prevention em operacoes de bulk

## A05: Configuration
- [ ] Debug mode desligado em producao
- [ ] Sem default credentials
- [ ] Error messages sem detalhes internos em prod
- [ ] Security headers configurados (HSTS, CSP, X-Frame-Options)

## A06: Vulnerable Components
- [ ] Zero CVEs criticos em dependencias
- [ ] Dependencias atualizadas (< 2 major behind)
- [ ] Audit de seguranca rodado regularmente

## A07: Authentication
- [ ] Password policy forte (8+ chars, complexity)
- [ ] Session invalidation no logout
- [ ] Refresh token com rotacao
- [ ] Brute force protection

## A08: Data Integrity
- [ ] Deserialization segura (schema validation)
- [ ] Updates com verificacao de integridade

## A09: Logging
- [ ] Login attempts logados
- [ ] Zero PII em logs
- [ ] Audit trail para operacoes criticas
- [ ] Sem log injection

## A10: SSRF
- [ ] URLs de usuario validadas antes de fetch server-side
- [ ] Allowlist para URLs internas
- [ ] Webhooks com validacao de destino
