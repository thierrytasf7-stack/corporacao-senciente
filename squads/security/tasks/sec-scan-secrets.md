---
task: Secret Detection Scan
responsavel: "@security-engineer"
responsavel_type: agent
atomic_layer: task
trigger: "*secrets"
Entrada: |
  - scope: Escopo (files | git-history | both) default: files
  - target: Diretorio alvo (default: root)
Saida: |
  - secrets_found: Lista de segredos detectados (file:line, tipo, masked_value)
  - git_leaks: Segredos encontrados em git history
  - env_audit: Status dos arquivos .env
Checklist:
  - "[ ] Verificar .env files estao no .gitignore"
  - "[ ] Scan de patterns de credenciais no codigo"
  - "[ ] Verificar .env.example nao tem valores reais"
  - "[ ] Verificar configs (*.json, *.yaml) por segredos"
  - "[ ] Scan git history (se scope=both ou git-history)"
  - "[ ] Classificar e reportar findings"
---

# *secrets - Secret Detection Scan

Detectar segredos, credenciais e tokens no codigo e git history.

## Patterns Detectados

| Tipo | Pattern | Exemplo |
|------|---------|---------|
| AWS Keys | `AKIA[0-9A-Z]{16}` | AKIAIOSFODNN7EXAMPLE |
| Binance Keys | `BINANCE_(API\|SECRET)_KEY=.+` | BINANCE_API_KEY=abc123 |
| Generic API Key | `(api[_-]?key\|apikey)\s*[=:]\s*.{8,}` | api_key=sk_live_xxx |
| JWT Secret | `(jwt[_-]?secret\|JWT_SECRET)\s*[=:]\s*.+` | JWT_SECRET=mysecret |
| Database URL | `(postgres\|mysql\|mongodb):\/\/[^\\s]+` | postgres://user:pass@host |
| Private Key | `BEGIN (RSA\|DSA\|EC\|OPENSSH) PRIVATE KEY` | -----BEGIN RSA PRIVATE... |
| OAuth Token | `(oauth[_-]?token\|access[_-]?token)\s*[=:]\s*.+` | oauth_token=ya29.xxx |
| Password | `(password\|passwd\|pwd)\s*[=:]\s*['"].{4,}['"]` | password="hunter2" |
| Webhook URL | `https:\/\/hooks\.(slack\|discord)\.com\/\S+` | hooks.slack.com/xxx |
| Generic Secret | `(secret\|token)\s*[=:]\s*['"][^'"]{8,}['"]` | secret="longvalue" |

## Flow

```
1. Audit .env configuration
   ├── Check .gitignore includes .env patterns
   ├── Check .env files are NOT committed (git ls-files)
   ├── Verify .env.example has only placeholder values
   └── Check current .env has no empty required vars

2. Scan source files
   ├── Target: *.js, *.ts, *.json, *.yaml, *.yml, *.md, *.env*
   ├── Exclude: node_modules/, .git/, *.test.*, package-lock.json
   ├── Match against secret patterns
   ├── Verify matches are NOT:
   │   ├── In comments / documentation
   │   ├── Environment variable REFERENCES (process.env.X)
   │   ├── Example/placeholder values
   │   └── Test fixtures with fake values
   └── Collect real findings only

3. Scan git history (if scope includes git-history)
   ├── Use: git log --all -p --diff-filter=A
   ├── Search added lines for secret patterns
   ├── Flag files that WERE committed with secrets
   └── Note: even if removed, secrets in history are exposed

4. Report findings
   ├── Each finding: file, line, type, masked_value (first/last 4 chars)
   ├── NEVER display full secret values in report
   ├── Recommend rotation for any exposed secrets
   └── Suggest git history cleanup if needed (BFG/filter-branch)
```

## CRITICAL: Never Display Secrets

Ao reportar findings, SEMPRE mascarar valores:
- `BINANCE_API_KEY=abcd...wxyz` (primeiros e ultimos 4 chars)
- NUNCA mostrar o valor completo de um segredo
- Se encontrar em git history, recomendar rotacao IMEDIATA
