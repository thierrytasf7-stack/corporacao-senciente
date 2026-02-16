---
task: Error Handling Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - path: Caminho do backend
  - stack: Stack detectada
Saida: |
  - findings: Issues de error handling
  - coverage: Cobertura de error handling por modulo
Checklist:
  - "[ ] Verificar global error handler existe"
  - "[ ] Verificar unhandled rejection handler"
  - "[ ] Detectar empty catch blocks"
  - "[ ] Verificar error propagation patterns"
  - "[ ] Verificar error types/classes customizados"
  - "[ ] Verificar retry logic para operacoes transientes"
  - "[ ] Verificar circuit breaker para deps externas"
  - "[ ] Verificar graceful shutdown"
  - "[ ] Verificar request timeouts"
  - "[ ] Verificar error correlation IDs"
  - "[ ] Verificar partial failure handling"
  - "[ ] Verificar stack traces nao expostos em prod"
---

# *audit-errors

Auditoria de error handling e resilience patterns.

## Global Error Handling

### Node.js/Express
```javascript
// NECESSARIO: Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  // Graceful shutdown
});

process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught Exception', { error });
  process.exit(1);
});

// NECESSARIO: Express error middleware (ULTIMO middleware)
app.use((err, req, res, next) => {
  logger.error('Request error', { err, requestId: req.id });
  const status = err.statusCode || 500;
  res.status(status).json({
    error: { code: err.code, message: err.message }
  });
});
```

## Anti-Patterns

### Empty Catch (SWALLOWED ERRORS)
```javascript
// CRITICO - Error engolido silenciosamente
try {
  await processPayment(order);
} catch (e) {
  // Nada aqui - pagamento falhou e ninguem sabe
}

// BOM - Log + re-throw ou handle
try {
  await processPayment(order);
} catch (error) {
  logger.error('Payment processing failed', { orderId: order.id, error });
  throw new PaymentError('Payment failed', { cause: error });
}
```

### Generic Error Messages
```javascript
// RUIM - Perde contexto
catch (error) {
  throw new Error('Something went wrong');
}

// BOM - Contexto preservado
catch (error) {
  throw new OrderProcessingError(
    `Failed to process order ${orderId}: ${error.message}`,
    { cause: error, orderId, step: 'payment' }
  );
}
```

### Stack Traces em Production
```javascript
// RUIM - Expoe internals
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

// BOM - Stack trace so em dev
app.use((err, req, res, next) => {
  const response = {
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
  };
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }
  res.status(err.statusCode || 500).json(response);
});
```

## Resilience Patterns

### Retry Logic
```javascript
// Para operacoes transientes (network, database connection)
async function withRetry(fn, { maxRetries = 3, backoff = 1000 } = {}) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !isTransientError(error)) throw error;
      await sleep(backoff * Math.pow(2, attempt - 1)); // Exponential backoff
    }
  }
}
```

### Circuit Breaker
```javascript
// Para dependencias externas que podem ficar indisponíveis
// States: CLOSED (normal) -> OPEN (failing) -> HALF-OPEN (testing)
// Verificar se pattern existe para: external APIs, databases, caches
```

### Graceful Shutdown
```javascript
// NECESSARIO em todo backend de producao
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown');
  server.close(); // Para de aceitar conexoes
  await drainConnections(); // Espera requests em andamento
  await pool.end(); // Fecha pool de database
  process.exit(0);
});
```

### Request Timeouts
```javascript
// Todo request externo DEVE ter timeout
const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

// Database queries tambem
const result = await pool.query({ text: sql, values, timeout: 10000 });
```

## Formato de Finding

```markdown
### [ERR-001] Empty catch block em processamento de pagamento
- **Severidade:** CRITICAL
- **Arquivo:** src/services/payment-service.js:78
- **Impacto:** Falhas de pagamento sao silenciadas, pedidos ficam em estado inconsistente
- **Fix:**
  ```javascript
  catch (error) {
    logger.error('Payment failed', { orderId, error });
    await orderService.markAsFailed(orderId, error.message);
    throw new PaymentError('Payment processing failed', { cause: error });
  }
  ```
```
