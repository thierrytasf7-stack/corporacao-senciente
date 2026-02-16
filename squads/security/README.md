# Security Squad

**Sentinel** - Security Engineer da Diana Corporacao Senciente.

Especialista que garante que o software e SEGURO de verdade. Assume breach, verifica tudo, zero tolerance para vulnerabilidades critical/high.

## Principio Fundamental

**Assume Breach.** Agir como se o atacante ja estivesse dentro. Defense in depth, sempre.

## Quick Start

```
# Ativar Sentinel
/Desenvolvimento:Security-AIOS

# Audit completo (4 dominios)
*audit

# SAST scan
*sast

# Dependency scan
*deps

# Secret detection
*secrets

# API security audit
*api

# Security report
*report
```

## 4 Dominios

| Dominio | Foco | Ferramenta Base |
|---------|------|-----------------|
| Code | SAST, OWASP Top 10, injection patterns | security-checker.js |
| Dependencies | CVEs, npm audit, supply chain | npm audit + dependabot |
| Secrets | Credenciais, tokens, keys no codigo | secretlint + grep patterns |
| API | Auth, rate limiting, headers, CORS | Manual + automated checks |

## Security Thresholds

Definidos em `squad.yaml` e verificados automaticamente:

- **Dependencies:** 0 critical, 0 high, <= 5 medium
- **Secrets:** 0 tolerance (zero secrets no codigo)
- **Code:** 0 eval, 0 innerHTML, 0 SQL concat, 0 command injection
- **API:** Score >= 80 (Grade B+), auth em todos endpoints

## Ferramentas Existentes (Nao Duplica)

| Ferramenta | Path | Uso |
|------------|------|-----|
| security-utils.js | .aios-core/core/utils/ | validatePath, sanitizeInput, RateLimiter |
| security-checker.js | .aios-core/infrastructure/scripts/ | SAST patterns |
| security-validation.md | .aios-core/checklists/ | 15-point checklist |
| security-scan.md | .aios-core/development/tasks/ | Automated scan pipeline |
| qa-security-checklist.md | .aios-core/development/tasks/ | 8 critical checks |
| eslintrc-security.json | .aios-core/product/templates/ | ESLint security config |
| rls-security-patterns.md | .aios-core/data/ | PostgreSQL RLS |
| core-security.test.js | tests/security/ | Existing security tests |

## Gaps que Sentinel Preenche

- OWASP Top 10 coverage sistematico
- Threat modeling (STRIDE) para features novas
- API security audit completo (score + grade)
- Security headers validation
- Auth/AuthZ audit por endpoint
- Secret scanning com patterns especificos
- Security regression detection vs baseline
- Pre-release security gate
- Security report generation

## Estrutura

```
squads/security/
├── squad.yaml                    # Manifest com thresholds
├── README.md                     # Este arquivo
├── agents/
│   └── security-engineer.md      # Sentinel - o agente
├── tasks/                        # 12 tasks
│   ├── sec-audit-full.md
│   ├── sec-scan-sast.md
│   ├── sec-scan-dependencies.md
│   ├── sec-scan-secrets.md
│   ├── sec-check-headers.md
│   ├── sec-check-auth.md
│   ├── sec-check-injection.md
│   ├── sec-check-api.md
│   ├── sec-fix-vulnerability.md
│   ├── sec-threat-model.md
│   ├── sec-report.md
│   └── sec-regression-check.md
├── workflows/                    # 2 workflows
│   ├── full-security-audit.yaml
│   └── pre-release-security-check.yaml
├── checklists/                   # 4 gates
│   ├── sec-gate-code.md
│   ├── sec-gate-dependencies.md
│   ├── sec-gate-api.md
│   └── sec-gate-release.md
└── templates/                    # 2 templates
    ├── sec-audit-report-tmpl.md
    └── sec-threat-model-tmpl.md
```

## Colaboracao

| Agente | Sentinel aciona quando |
|--------|----------------------|
| @dev (Dex) | Precisa implementar fix de vulnerabilidade |
| @qa (Quinn) | Validar que fix nao causa regression |
| @data-engineer (Dara) | DB precisa RLS ou hardening |
| @devops (Gage) | CI security gate precisa configuracao |
| @performance (Blaze) | Rate limiting ou DoS protection |
| Prometheus (CDO) | Reports e pre-release gates |

---

*Sentinel, Security Engineer | Trust nothing, verify everything*
