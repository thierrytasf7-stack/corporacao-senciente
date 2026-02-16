# Task: Load Testing

> Blaze (Performance Engineer) | Load test em endpoints (autocannon style)

## Objetivo
Executar load test em endpoints da API para medir throughput, latencia sob carga e identificar breaking points.

## Parameters
- `endpoint` - URL do endpoint a testar (default: http://localhost:21301)
- `duration` - Duracao do teste em segundos (default: 30)
- `connections` - Conexoes simultaneas (default: 10)
- `pipelining` - Requests por conexao (default: 1)

## Steps

### Step 1: Verify Target
```
- Confirmar endpoint acessivel
- Executar request de aquecimento (warmup)
- Registrar baseline de single request
```

### Step 2: Ramping Load Test
```
- Fase 1 (Warmup): 1 conexao, 10s
  - Medir baseline p50/p95/p99
- Fase 2 (Normal): 10 conexoes, 30s
  - Medir throughput e latencia
- Fase 3 (Stress): 50 conexoes, 30s
  - Identificar degradacao
- Fase 4 (Break): 100+ conexoes, 15s
  - Encontrar breaking point
```

### Step 3: Measure Metrics
```
Para cada fase capturar:
- Requests/segundo (throughput)
- Latencia p50, p95, p99
- Error rate (%)
- Bytes transferidos
- Timeouts
- Status code distribution
```

### Step 4: Memory Under Load
```
- RSS do processo antes/durante/depois
- Heap usage trend durante carga
- GC pauses durante teste
- Verificar se memoria volta ao baseline pos-teste
```

### Step 5: Analyze Results
```
- Throughput vs budget (> 100 req/s)
- p50 vs budget (< 100ms)
- p95 vs budget (< 500ms)
- p99 vs budget (< 1000ms)
- Error rate vs budget (< 0.1%)
- Identificar bottleneck (CPU, memory, I/O, DB)
```

### Step 6: Generate Report
```
| Fase | Conn | RPS | p50 | p95 | p99 | Errors |
|------|------|-----|-----|-----|-----|--------|
| Warmup | 1 | ? | ? | ? | ? | ? |
| Normal | 10 | ? | ? | ? | ? | ? |
| Stress | 50 | ? | ? | ? | ? | ? |
| Break | 100 | ? | ? | ? | ? | ? |

- Identificar ponto de inflexao
- Recomendacoes de scaling
```

## Output
- Load test results por fase
- Latencia percentiles comparados com budgets
- Breaking point identificado
- Bottleneck analysis
- Scaling recommendations

## Tools
- Preferencia: autocannon (Node.js native)
- Alternativa: custom script com fetch + perf_hooks
- Alternativa: k6 (se instalado)

---
*Task — Blaze, Performance Engineer*
