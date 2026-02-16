---
task: Env & Config Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - frontend_path: Caminho do frontend
  - backend_path: Caminho do backend
Saida: |
  - config_map: Mapa de configuracoes entre camadas
  - misalignments: Configs desalinhadas
Checklist:
  - "[ ] Verificar API_URL do frontend aponta para backend correto"
  - "[ ] Verificar porta do backend bate com porta que frontend chama"
  - "[ ] Verificar WebSocket URL alignment"
  - "[ ] Verificar env vars de ambiente (dev/staging/prod)"
  - "[ ] Verificar .env files existem com valores corretos"
  - "[ ] Verificar .env.example documenta todas as vars necessarias"
  - "[ ] Verificar feature flags consistentes"
  - "[ ] Verificar timeout values alinhados"
  - "[ ] Verificar base paths / prefixes consistentes"
---

# *audit-env

Auditoria de configuracao e environment variables.

## O Que Verificar

### API URL Alignment
```bash
# Frontend .env
NEXT_PUBLIC_API_URL=http://localhost:21301
NEXT_PUBLIC_WS_URL=ws://localhost:21302

# Backend .env
PORT=21301
WS_PORT=21302

# VERIFICAR: Portas batem? URLs corretas?
```

### Missing Env Vars
```bash
# Frontend usa mas .env nao tem:
process.env.NEXT_PUBLIC_API_URL  # undefined -> requests vao para /api relativo

# Backend usa mas .env nao tem:
process.env.JWT_SECRET           # undefined -> auth crashaprocess.env.DATABASE_URL         # undefined -> DB nao conecta
```

### Dev vs Prod Config
```bash
# Dev
NEXT_PUBLIC_API_URL=http://localhost:21301

# Prod (deve existir config separada)
NEXT_PUBLIC_API_URL=https://api.production.com

# VERIFICAR: Configs de prod existem e estao corretas?
```

### Common Misalignments

| Frontend Config | Backend Config | Status |
|----------------|---------------|--------|
| API_URL=:21301 | PORT=21301 | ✅ Match |
| API_URL=:3000 | PORT=21301 | ❌ Mismatch! |
| WS_URL=:21302 | WS_PORT=21302 | ✅ Match |
| API_PREFIX=/api | routes: /api/* | ✅ Match |
| API_PREFIX=/v1 | routes: /api/* | ❌ Mismatch! |

### Feature Flags
```bash
# Se frontend tem feature flags:
NEXT_PUBLIC_FEATURE_DARK_MODE=true
NEXT_PUBLIC_FEATURE_NOTIFICATIONS=false

# Backend deve respeitar os mesmos flags:
FEATURE_NOTIFICATIONS=false  # Endpoint nao deve processar se disabled
```

## Formato de Finding

```markdown
### [ENV-001] Frontend API_URL aponta para porta errada
- **Severidade:** CRITICAL
- **Frontend .env:** `NEXT_PUBLIC_API_URL=http://localhost:3000`
- **Backend .env:** `PORT=21301`
- **Impacto:** ZERO requests do frontend chegam ao backend
- **Fix:** `NEXT_PUBLIC_API_URL=http://localhost:21301`
```

```markdown
### [ENV-002] WebSocket URL nao configurada no frontend
- **Severidade:** HIGH
- **Frontend:** src/hooks/useWebSocket.ts:5
  ```typescript
  const ws = new WebSocket('ws://localhost:3000/stream'); // Hardcoded porta errada!
  ```
- **Backend .env:** `DIANA_MONITOR_PORT=21302`
- **Fix:** Usar env var: `new WebSocket(process.env.NEXT_PUBLIC_WS_URL + '/stream')`
```
