---
task: CORS & Headers Audit
responsavel: "@harmony-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - backend_path: Caminho do backend
  - frontend_origin: Origin do frontend (ex. http://localhost:21300)
Saida: |
  - cors_config: Configuracao CORS encontrada
  - issues: Problemas de CORS
Checklist:
  - "[ ] Encontrar configuracao CORS no backend"
  - "[ ] Verificar Allow-Origin inclui frontend origin"
  - "[ ] Verificar Allow-Methods inclui todos os methods usados"
  - "[ ] Verificar Allow-Headers inclui Authorization e Content-Type"
  - "[ ] Verificar Allow-Credentials se usa cookies"
  - "[ ] Verificar que NAO tem wildcard (*) com credentials"
  - "[ ] Verificar preflight OPTIONS handling"
  - "[ ] Verificar security headers (HSTS, CSP, X-Frame-Options)"
  - "[ ] Verificar que dev e prod configs sao diferentes"
---

# *audit-cors

Auditoria de CORS e headers de seguranca.

## CORS Configuration

### Express
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:21300',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

### Problemas Comuns

**Wildcard com Credentials (BLOQUEANTE):**
```javascript
// QUEBRADO - Browser rejeita
app.use(cors({ origin: '*', credentials: true }));

// CORRETO - Origin explicito
app.use(cors({ origin: 'http://localhost:21300', credentials: true }));
```

**Missing Authorization Header:**
```javascript
// Frontend envia Authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Backend precisa permitir
cors({ allowedHeaders: ['Content-Type', 'Authorization'] })
```

**Missing Preflight:**
```javascript
// PUT/DELETE/PATCH triggers preflight OPTIONS request
// Backend DEVE responder OPTIONS com headers CORS
app.options('*', cors()); // Ou handler especifico
```

## Headers de Seguranca

| Header | Valor Recomendado | Impacto |
|--------|-------------------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` ou `SAMEORIGIN` | Prevent clickjacking |
| `Content-Security-Policy` | Configurar por projeto | Prevent XSS/injection |
| `X-XSS-Protection` | `0` (rely on CSP) | Legacy XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer |

## Formato de Finding

```markdown
### [CORS-001] CORS wildcard (*) com credentials - browser bloqueia
- **Severidade:** CRITICAL
- **Arquivo:** src/server.js:12
  ```javascript
  app.use(cors({ origin: '*', credentials: true }));
  ```
- **Impacto:** TODAS as requests do frontend com cookies/auth sao bloqueadas
- **Fix:**
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:21300',
    credentials: true
  }));
  ```
```
