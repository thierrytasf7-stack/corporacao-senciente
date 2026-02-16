# Task: Performance Budget Management

> Blaze (Performance Engineer) | Definir ou verificar performance budgets

## Objetivo
Definir, ajustar e verificar compliance com performance budgets. Budgets sao limites quantitativos que nunca devem ser excedidos.

## Steps

### Step 1: Load Current Budgets
```
- Ler budgets do squad.yaml (config.budgets)
- Mostrar budgets atuais:

FRONTEND:
  Bundle Size: < 250KB gzipped
  Initial JS: < 150KB
  LCP: < 2500ms
  FID: < 100ms
  CLS: < 0.1
  TTI: < 3500ms
  Lighthouse: >= 90

BACKEND:
  API p50: < 100ms
  API p95: < 500ms
  API p99: < 1000ms
  Throughput: > 100 req/s
  Error Rate: < 0.1%

DATABASE:
  Query p50: < 10ms
  Query p95: < 100ms
  Query p99: < 500ms
  Cache Hit Ratio: > 95%
  Connection Pool: < 20

MEMORY:
  Heap Max: < 512MB
  RSS Max: < 768MB
  Leak Rate: < 10MB/hour
  GC Pause: < 100ms
```

### Step 2: Verify Compliance (se solicitado)
```
- Executar medicoes rapidas para cada budget
- Comparar atual vs budget
- Gerar scorecard:

| Category | Metric | Budget | Actual | Status |
|----------|--------|--------|--------|--------|
| Frontend | Bundle | <250KB | ? | PASS/FAIL |
| Backend  | p95    | <500ms | ? | PASS/FAIL |
| Database | Cache  | >95%   | ? | PASS/FAIL |
| Memory   | Heap   | <512MB | ? | PASS/FAIL |
```

### Step 3: Adjust Budgets (se solicitado)
```
- Aceitar novo valor do usuario
- Validar que valor e razoavel (nao muito frouxo nem impossivel)
- Atualizar squad.yaml com novo budget
- Registrar mudanca com justificativa
```

### Step 4: CI Gate Config (se solicitado)
```
- Gerar configuracao para CI performance gate
- Formato: script que verifica budgets e falha se excedido
- Integrar com pre-push workflow
```

## Output
- Budgets atuais listados
- Compliance scorecard (se verificacao solicitada)
- Budgets atualizados (se ajuste solicitado)
- CI gate config (se solicitado)

---
*Task — Blaze, Performance Engineer*
