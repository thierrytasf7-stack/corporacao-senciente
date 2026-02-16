---
task: Dependency Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - path: Caminho do backend
  - stack: Stack detectada
Saida: |
  - findings: Issues de dependencias
  - cve_list: CVEs encontrados
  - outdated: Lista de deps outdated
Checklist:
  - "[ ] Verificar lockfile existe"
  - "[ ] Rodar audit de seguranca (npm audit, pip audit, etc)"
  - "[ ] Identificar deps com CVEs criticos/altos"
  - "[ ] Identificar deps 2+ major versions atrasadas"
  - "[ ] Detectar deps nao utilizadas"
  - "[ ] Verificar licencas compatíveis"
  - "[ ] Verificar deps com repos archived/unmaintained"
  - "[ ] Contar total de deps (dependency bloat)"
  - "[ ] Verificar duplicatas (mesma lib, versoes diferentes)"
  - "[ ] Verificar pinning strategy (exact vs range)"
---

# *audit-deps

Auditoria de dependencias - seguranca, atualizacao, licencas.

## Procedimento

### 1. Lockfile
Verificar que existe:
- `package-lock.json` ou `yarn.lock` ou `pnpm-lock.yaml` (Node.js)
- `Pipfile.lock` ou `poetry.lock` (Python)
- `go.sum` (Go)
- `Cargo.lock` (Rust)
- `Gemfile.lock` (Ruby)
- `composer.lock` (PHP)

**Missing lockfile = MEDIUM finding** (builds nao reproduzíveis)

### 2. Security Audit
Executar o audit nativo da linguagem:
```bash
# Node.js
npm audit --json

# Python
pip audit --format json
safety check

# Go
govulncheck ./...

# Rust
cargo audit

# Ruby
bundle audit check

# PHP
composer audit
```

### 3. CVE Classification
| CVSS Score | Severidade | Acao |
|------------|-----------|------|
| 9.0 - 10.0 | CRITICAL | Patch IMEDIATO |
| 7.0 - 8.9 | HIGH | Patch em 48h |
| 4.0 - 6.9 | MEDIUM | Patch em sprint |
| 0.1 - 3.9 | LOW | Backlog |

### 4. Outdated Analysis
Verificar versoes atuais vs latest:
```bash
npm outdated --json
pip list --outdated --format json
go list -u -m all
```

**Classificacao:**
- Patch behind (1.0.0 -> 1.0.5): LOW
- Minor behind (1.0.0 -> 1.3.0): LOW
- 1 Major behind (1.0.0 -> 2.0.0): MEDIUM
- 2+ Major behind (1.0.0 -> 3.0.0): HIGH

### 5. Unused Dependencies
Verificar deps instaladas mas nao importadas no codigo:
```bash
# Node.js - depcheck
npx depcheck

# Python - pode ser manual (grep imports)
```

### 6. License Check
Licencas a observar:
- **Safe:** MIT, Apache-2.0, BSD-2/3, ISC, Unlicense
- **Copyleft (cuidado):** GPL-2.0, GPL-3.0, AGPL-3.0, LGPL
- **Restrictive:** SSPL, BSL, proprietary

### 7. Maintenance Status
Verificar para deps criticas:
- Ultimo commit (> 2 anos = warning)
- Open issues sem resposta
- Repo archived
- Maintainer status

## Formato de Finding

```markdown
### [DEP-001] CVE-2024-xxxxx em express@4.17.1 (CVSS 9.1)
- **Severidade:** CRITICAL
- **Tipo:** Remote Code Execution
- **Versao Atual:** 4.17.1
- **Versao Fix:** 4.18.2+
- **Fix:** `npm install express@latest`
- **Referencia:** https://nvd.nist.gov/vuln/detail/CVE-2024-xxxxx
```
