---
task: Observability Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - path: Caminho do backend
  - stack: Stack detectada
Saida: |
  - findings: Issues de observabilidade
  - coverage: Cobertura de logging/metrics/tracing
Checklist:
  - "[ ] Verificar structured logging (JSON)"
  - "[ ] Verificar log levels (debug, info, warn, error)"
  - "[ ] Verificar request/response logging"
  - "[ ] Verificar correlation IDs / trace IDs"
  - "[ ] Verificar PII em logs (CRITICO se encontrar)"
  - "[ ] Verificar health check endpoint"
  - "[ ] Verificar readiness probe"
  - "[ ] Verificar liveness probe"
  - "[ ] Verificar metricas de negocio"
  - "[ ] Verificar error rate tracking"
  - "[ ] Verificar latency tracking (p50, p95, p99)"
  - "[ ] Verificar alerting rules"
---

# *audit-obs

Auditoria de observabilidade - logging, metrics, tracing, health checks.

## The Three Pillars

### 1. Logging

**Structured Logging (JSON):**
```javascript
// RUIM - Texto livre, impossivel de parsear
console.log('User ' + userId + ' created order ' + orderId);

// BOM - JSON estruturado
logger.info('Order created', {
  userId,
  orderId,
  amount: order.total,
  items: order.items.length,
  requestId: req.id
});
```

**Log Levels:**
| Level | Quando Usar |
|-------|-------------|
| `debug` | Detalhes para desenvolvimento (desligar em prod) |
| `info` | Eventos normais de negocio (order created, user login) |
| `warn` | Situacoes anomalas mas nao falhas (retry, fallback usado) |
| `error` | Erros que precisam atencao (request failed, query failed) |
| `fatal` | Sistema vai desligar (unrecoverable) |

**Request Logging:**
```javascript
// Middleware de request logging
app.use((req, res, next) => {
  const start = Date.now();
  req.id = crypto.randomUUID(); // Correlation ID

  res.on('finish', () => {
    logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });
  next();
});
```

**PII em Logs (CRITICAL):**
```javascript
// NUNCA logar:
// - Passwords (mesmo hashed)
// - Tokens (JWT, API keys, session tokens)
// - Credit card numbers
// - SSN, CPF
// - Full email addresses (mascarar: u***@domain.com)
// - IP addresses (considerar GDPR)

// RUIM
logger.info('Login attempt', { email: user.email, password: req.body.password });

// BOM
logger.info('Login attempt', { email: maskEmail(user.email), success: true });
```

### 2. Metrics

**Metricas Essenciais:**
| Metrica | Tipo | Descricao |
|---------|------|-----------|
| `http_requests_total` | Counter | Total de requests por method/status |
| `http_request_duration_ms` | Histogram | Latencia (p50, p95, p99) |
| `http_requests_in_flight` | Gauge | Requests em andamento |
| `db_query_duration_ms` | Histogram | Latencia de queries |
| `db_pool_active` | Gauge | Conexoes ativas no pool |
| `errors_total` | Counter | Total de errors por tipo |
| `business_orders_total` | Counter | Pedidos (metrica de negocio) |

### 3. Tracing

**Correlation/Trace IDs:**
- Todo request deve ter um ID unico
- ID propagado para todos os logs, queries, chamadas externas
- Permite rastrear um request end-to-end

## Health Checks

```javascript
// NECESSARIO: Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// RECOMENDADO: Readiness (pronto para receber trafego)
app.get('/ready', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
  };
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ready' : 'not_ready', checks });
});
```

## Formato de Finding

```markdown
### [OBS-001] console.log usado em vez de structured logging
- **Severidade:** MEDIUM
- **Arquivo:** Multiplos (45 ocorrencias)
- **Impacto:** Logs impossíveis de agregar, parsear e alertar
- **Fix:** Substituir por logger estruturado (winston, pino, bunyan)
  ```javascript
  import { logger } from './lib/logger';
  logger.info('Event description', { key: value });
  ```
- **Estimativa:** 2h (setup logger + replace console.log)
```
