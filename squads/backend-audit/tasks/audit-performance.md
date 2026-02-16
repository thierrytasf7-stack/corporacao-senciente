---
task: Performance Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - path: Caminho do backend
  - stack: Stack detectada
Saida: |
  - findings: Issues de performance encontrados
  - metrics: Metricas de performance
Checklist:
  - "[ ] Identificar entry points (routes, handlers, controllers)"
  - "[ ] Analisar N+1 queries (loops com queries dentro)"
  - "[ ] Verificar connection pooling (db, redis, http)"
  - "[ ] Detectar memory leaks potenciais"
  - "[ ] Analisar caching strategy"
  - "[ ] Verificar async/await patterns"
  - "[ ] Detectar blocking operations em contexto async"
  - "[ ] Analisar payload sizes"
  - "[ ] Verificar compression (gzip/brotli)"
  - "[ ] Verificar pagination em queries grandes"
  - "[ ] Analisar serialization overhead"
  - "[ ] Verificar connection reuse"
---

# *audit-perf

Auditoria de performance do backend.

## O Que Procurar

### N+1 Queries (CRITICAL pattern)
```
// RUIM - N+1
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  user.orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [user.id]);
}

// BOM - JOIN ou subquery
const users = await db.query(`
  SELECT u.*, json_agg(o.*) as orders
  FROM users u LEFT JOIN orders o ON o.user_id = u.id
  GROUP BY u.id
`);
```

### Memory Leaks
Procurar por:
- Event listeners adicionados sem remoção (`.on()` sem `.off()`)
- Arrays/Maps globais que crescem sem limite
- Closures que capturam referências grandes
- Timers sem clearInterval/clearTimeout
- Cache sem TTL ou eviction policy
- Streams não fechados (file, db cursors)

### Connection Pool
Verificar:
- Pool configurado com min/max apropriados
- Connections retornadas ao pool após uso (try/finally)
- Timeouts configurados (acquire, idle, connection)
- Pool monitoring/metrics existem

### Async/Sync
Detectar:
- `fs.readFileSync` em handlers HTTP
- `JSON.parse` de payloads muito grandes sem streaming
- CPU-bound em event loop (crypto, compression, sort de arrays grandes)
- Missing `Promise.all` para operações paralelas independentes
- Sequential awaits que poderiam ser paralelos

### Caching
Avaliar:
- Queries repetidas sem cache
- Cache invalidation strategy
- Cache TTL configurado
- Cache hit/miss ratio (se metricas existem)
- Over-caching (dados que mudam frequentemente)

### Compression & Payload
Verificar:
- Middleware de compression habilitado
- Responses grandes sem streaming
- JSON responses com campos desnecessarios
- Missing projection em queries (SELECT *)
- Binary data sem encoding apropriado

## Formato de Finding

```markdown
### [PERF-001] N+1 Query em listagem de usuarios
- **Severidade:** HIGH
- **Arquivo:** src/controllers/users.js:45
- **Impacto:** Latencia O(n) - 1 query por usuario, ~500ms para 100 usuarios
- **Fix:**
  ```javascript
  // Usar JOIN ou eager loading
  const users = await User.findAll({ include: [Order] });
  ```
- **Estimativa:** 30min para fix
```

## Metricas

| Metrica | Alvo | Aceitavel | Ruim |
|---------|------|-----------|------|
| N+1 queries | 0 | 0 | >= 1 |
| Sync I/O em handlers | 0 | 0 | >= 1 |
| Endpoints sem pagination | 0 | 1-2 | >= 3 |
| Memory leak patterns | 0 | 0 | >= 1 |
| Missing compression | Nao | - | Sim |
| Avg handler complexity | < 5 | 5-10 | > 10 |
