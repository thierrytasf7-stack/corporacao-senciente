---
task: Database Audit
responsavel: "@backend-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - path: Caminho do backend
  - stack: Stack detectada
  - db_type: Tipo de database (auto-detect)
Saida: |
  - findings: Issues de database
  - schema_issues: Problemas de schema design
Checklist:
  - "[ ] Identificar database(s) utilizado(s)"
  - "[ ] Analisar schema/modelos"
  - "[ ] Verificar indexes existentes"
  - "[ ] Identificar queries sem index"
  - "[ ] Detectar N+1 patterns"
  - "[ ] Verificar SELECT * usage"
  - "[ ] Verificar connection pooling"
  - "[ ] Verificar parameterized queries"
  - "[ ] Verificar migrations existem"
  - "[ ] Verificar foreign keys / constraints"
  - "[ ] Verificar transaction management"
  - "[ ] Verificar soft delete patterns"
---

# *audit-db

Auditoria de database e data access patterns.

## Schema Design

### Verificar
- **Tipos corretos:** VARCHAR com length, INT vs BIGINT, timestamps com timezone
- **Constraints:** NOT NULL onde necessario, UNIQUE, CHECK
- **Foreign keys:** Integridade referencial
- **Indexes:** Em colunas de WHERE, JOIN, ORDER BY, UNIQUE
- **Naming:** Consistente (snake_case para SQL, camelCase para NoSQL)

### Anti-Patterns de Schema
```sql
-- RUIM: Coluna que armazena JSON como string
ALTER TABLE users ADD COLUMN settings TEXT;

-- BOM: JSONB com validacao
ALTER TABLE users ADD COLUMN settings JSONB DEFAULT '{}';

-- RUIM: Status como string livre
ALTER TABLE orders ADD COLUMN status VARCHAR(255);

-- BOM: ENUM ou CHECK
ALTER TABLE orders ADD COLUMN status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'));
```

## Query Patterns

### Over-Fetching
```javascript
// RUIM - SELECT * quando so precisa de nome
const users = await db.query('SELECT * FROM users');
const names = users.map(u => u.name);

// BOM - Projection
const users = await db.query('SELECT id, name FROM users');
```

### Missing Indexes
```sql
-- Se esta query e frequente, precisa de index
SELECT * FROM orders WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC;

-- Index necessario:
CREATE INDEX idx_orders_user_status_created ON orders(user_id, status, created_at DESC);
```

### Transaction Management
```javascript
// RUIM - Operacoes relacionadas sem transacao
await db.query('INSERT INTO orders ...');
await db.query('UPDATE inventory SET qty = qty - 1 ...');
await db.query('INSERT INTO order_items ...');
// Se falhar no meio, dados inconsistentes!

// BOM - Transacao
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO orders ...');
  await client.query('UPDATE inventory SET qty = qty - 1 ...');
  await client.query('INSERT INTO order_items ...');
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

### Connection Pooling
Verificar:
- Pool size configurado (min: 2, max: 10-20 tipico)
- Idle timeout configurado
- Connection timeout configurado
- Pool monitoring/metrics

```javascript
// BOM - Pool configurado
const pool = new Pool({
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

### Parameterized Queries
```javascript
// CRITICO: SQL INJECTION
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// SEGURO: Parameterized
db.query('SELECT * FROM users WHERE email = $1', [email]);
```

## NoSQL Specific

### MongoDB
- Missing indexes em campos de query frequentes
- Missing schema validation (mongoose schema ou JSON Schema)
- Unbounded array fields que crescem infinitamente
- Missing compound indexes para queries multi-field

### Redis
- Missing key expiration (TTL)
- Keys sem namespace prefix
- Large values (> 1MB)
- Missing connection pooling

## Formato de Finding

```markdown
### [DB-001] Query sem index em tabela orders (500k rows)
- **Severidade:** HIGH
- **Arquivo:** src/repositories/order-repo.js:34
- **Query:** `SELECT * FROM orders WHERE status = 'pending' AND created_at > NOW() - INTERVAL '7 days'`
- **Impacto:** Full table scan, ~800ms por query
- **Fix:**
  ```sql
  CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
  ```
- **Estimativa:** 5min (migration)
```
