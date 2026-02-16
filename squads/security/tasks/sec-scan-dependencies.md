---
task: Dependency Vulnerability Scan
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*deps"
Entrada: |
  - target: Diretorio com package.json (default: root + apps/*/)
  - fix: Auto-fix vulnerabilidades (default: false)
Saida: |
  - vulnerabilities: Lista de CVEs encontrados
  - summary: Contadores por severidade
  - fix_available: Quantas tem fix disponivel
Checklist:
  - "[ ] Localizar todos os package.json no projeto"
  - "[ ] Executar npm audit --json em cada um"
  - "[ ] Verificar status do dependabot"
  - "[ ] Verificar integridade do lock file"
  - "[ ] Identificar pacotes abandonados"
  - "[ ] Classificar e apresentar resultados"
---

# *deps - Dependency Vulnerability Scan

Scan completo de vulnerabilidades em dependencias npm.

## Flow

```
1. Discover package locations
   ├── Root package.json
   ├── apps/dashboard/package.json
   ├── apps/backend/package.json
   ├── modules/binance-bot/package.json
   └── Any other package.json found

2. For EACH package.json:
   ├── Run: npm audit --json
   ├── Parse JSON output
   ├── Extract: name, severity, CVE, fix_available, path
   └── Collect results

3. Check lock file integrity
   ├── Verify package-lock.json exists
   ├── Check for inconsistencies (npm ls --all)
   └── Flag any integrity issues

4. Check for abandoned packages
   ├── Packages with no updates > 2 years
   ├── Packages with known end-of-life
   └── Packages with < 10 weekly downloads

5. Aggregate and report
   ├── Deduplicate across workspaces
   ├── Group by severity
   ├── Indicate which have fixes available
   └── Recommend: npm audit fix (safe) vs manual upgrade

6. Auto-fix (if --fix flag)
   ├── Run: npm audit fix (non-breaking only)
   ├── Report what was fixed
   └── Report what needs manual intervention
```

## Severity Response

| Severity | Action | Timeline |
|----------|--------|----------|
| Critical | Block deployment | Fix immediately |
| High | Block deployment | Fix within 24h |
| Medium | Track in backlog | Fix within sprint |
| Low | Track in backlog | Fix when convenient |
