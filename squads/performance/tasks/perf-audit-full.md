# Task: Full Performance Audit

> Blaze (Performance Engineer) | Audit completo em 3 camadas

## Objetivo
Executar audit abrangente de performance cobrindo frontend, backend e database. Gera relatorio com findings, severidade e recomendacoes priorizadas.

## Pre-requisitos
- Aplicacao rodando localmente (ou URLs de staging)
- PostgreSQL acessivel para queries de diagnostico
- Node.js disponivel para profiling

## Steps

### Step 1: Collect Environment Info
```
- Node.js version, OS, memory disponivel
- Listar servicos rodando (PM2 status)
- Verificar portas ativas na faixa 21300-21399
- Registrar timestamp do audit
```

### Step 2: Frontend Audit
```
- Analisar bundle size (apps/dashboard/)
  - npm run build → verificar output size
  - Identificar chunks > 100KB
  - Verificar tree-shaking effectiveness
- Lighthouse audit (se endpoint disponivel)
  - Performance score
  - LCP, FID, CLS, TTI
  - Opportunities e diagnostics
- Verificar:
  - Code splitting implementado?
  - Lazy loading de rotas?
  - Image optimization?
  - Font loading strategy?
```

### Step 3: Backend Audit
```
- Usar performance-analyzer.js existente:
  - node .aios-core/infrastructure/scripts/performance-analyzer.js
  - Analisar arquivos criticos (server.js, rotas principais)
- Runtime profiling:
  - process.memoryUsage() snapshot
  - Event loop lag estimation
  - Active handles/requests count
- Identificar:
  - Sync operations em hot paths
  - N+1 query patterns
  - Missing caching opportunities
  - Unoptimized loops
```

### Step 4: Database Audit
```
- Conectar ao PostgreSQL (porta 5432)
- Executar diagnosticos:
  - SELECT * FROM pg_stat_user_tables → sequential scans
  - SELECT * FROM pg_stat_user_indexes → index usage
  - Cache hit ratio: pg_stat_database
  - Connection count: pg_stat_activity
  - Dead tuples: pg_stat_user_tables (n_dead_tup)
- EXPLAIN ANALYZE nas queries mais frequentes (se identificadas)
- Verificar missing indexes
```

### Step 5: Memory Analysis
```
- Heap snapshot do processo principal
- RSS vs Heap Used vs Heap Total
- Verificar growth trend (se possivel)
- Identificar potenciais memory leaks
```

### Step 6: Generate Report
```
- Compilar findings em relatorio usando perf-audit-report-tmpl.md
- Classificar por severidade (critical/high/medium/low)
- Priorizar por impacto no usuario
- Incluir metricas coletadas vs budgets definidos
- Gerar action items com owner sugerido
```

## Output
- Relatorio completo de performance audit
- Lista de findings priorizados com severidade
- Action items com owner sugerido (@dev, @data-engineer, @devops)
- Comparacao com performance budgets do squad.yaml

## Severity Classification
| Severidade | Criterio |
|------------|----------|
| CRITICAL | Impacto direto em UX - LCP > 4s, API > 2s, memory leak |
| HIGH | Degradacao perceptivel - LCP > 2.5s, API > 500ms, bundle > 300KB |
| MEDIUM | Sub-otimo mas funcional - LCP > 1.5s, API > 200ms |
| LOW | Oportunidade de melhoria - micro-optimizations |

## Integration
- Usa: performance-analyzer.js, performance-tracker.js
- Delega otimizacao para: @dev (*optimize-performance)
- Delega DB fixes para: @data-engineer (*analyze-performance)

---
*Task — Blaze, Performance Engineer*
