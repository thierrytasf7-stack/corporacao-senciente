# Task: SQL Query Performance Analysis

> Blaze (Performance Engineer) | EXPLAIN ANALYZE, indexes, hotpaths

## Objetivo
Analisar performance de queries SQL no PostgreSQL. Identificar queries lentas, missing indexes, sequential scans em tabelas grandes e oportunidades de otimizacao.

## Steps

### Step 1: Database Health Check
```sql
-- Cache hit ratio (target: > 95%)
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))::float as ratio
FROM pg_statio_user_tables;

-- Connection pool status
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### Step 2: Identify Slow Queries
```sql
-- Se pg_stat_statements habilitado:
SELECT query, calls, total_exec_time/calls as avg_time_ms, rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Sequential scans em tabelas grandes
SELECT schemaname, relname, seq_scan, seq_tup_read,
       idx_scan, idx_tup_fetch, n_live_tup
FROM pg_stat_user_tables
WHERE seq_scan > 0 AND n_live_tup > 1000
ORDER BY seq_tup_read DESC;
```

### Step 3: Index Analysis
```sql
-- Indexes nao utilizados
SELECT schemaname, relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public';

-- Missing indexes (tabelas com muitos seq scans)
SELECT relname, seq_scan, idx_scan,
       CASE WHEN seq_scan + idx_scan > 0
            THEN round(100.0 * idx_scan / (seq_scan + idx_scan), 1)
            ELSE 0 END as idx_usage_pct
FROM pg_stat_user_tables
WHERE seq_scan > 100
ORDER BY seq_scan DESC;
```

### Step 4: Table Health
```sql
-- Dead tuples (precisa VACUUM?)
SELECT relname, n_live_tup, n_dead_tup,
       round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 1) as dead_pct,
       last_vacuum, last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 100
ORDER BY n_dead_tup DESC;

-- Bloat estimation
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;
```

### Step 5: EXPLAIN ANALYZE Critical Queries
```
- Para cada query lenta identificada:
  - EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) {query}
  - Verificar: Seq Scan vs Index Scan
  - Verificar: Nested Loops vs Hash Join
  - Verificar: Sort method (quicksort vs external merge)
  - Estimar custo de adicionar index
```

### Step 6: Generate Recommendations
```
- Missing indexes → CREATE INDEX sugerido
- Sequential scans → Index ou query rewrite
- Dead tuples → VACUUM ANALYZE
- Connection pool → Ajustar max_connections / PgBouncer
- Cache hit ratio → Ajustar shared_buffers
```

## Output
- Database health scorecard
- Top queries lentas com EXPLAIN
- Missing indexes com CREATE INDEX sugerido
- Maintenance recommendations (VACUUM, etc)
- Action items para @data-engineer

## Delegation
- Schema changes → @data-engineer (*analyze-performance)
- Application query optimization → @dev (*optimize-performance)

---
*Task — Blaze, Performance Engineer*
