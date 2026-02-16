# Task: Benchmark Execution

> Blaze (Performance Engineer) | Rodar benchmarks e comparar com baseline

## Objetivo
Executar benchmarks existentes em tests/performance/ e comparar resultados com baseline anterior. Detectar regressoes ou melhorias.

## Steps

### Step 1: Discover Existing Benchmarks
```
- Listar arquivos em tests/performance/
- Identificar benchmarks disponiveis
- Verificar se existe baseline anterior (tests/performance/baselines/)
```

### Step 2: Run Benchmarks
```
- npm test -- tests/performance/
- Para cada benchmark:
  - Executar 3x (minimo) para estabilidade
  - Registrar: mean, median, p95, p99, min, max
  - Registrar: ops/sec (throughput)
```

### Step 3: Compare with Baseline
```
Se baseline existe:
| Benchmark | Baseline | Atual | Delta | Status |
|-----------|----------|-------|-------|--------|
| {name}    | {old}    | {new} | {%}   | OK/REGRESSION/IMPROVED |

Thresholds:
- REGRESSION: > 10% mais lento que baseline
- IMPROVED: > 10% mais rapido que baseline
- OK: dentro de +-10%
```

### Step 4: Update Baseline
```
Se nenhuma regressao:
- Salvar resultados como novo baseline
- Registrar data e commit hash
```

### Step 5: Report
```
- Resultados de cada benchmark
- Comparacao com baseline (se existir)
- Regressoes detectadas (com severidade)
- Melhorias identificadas
```

## Output
- Benchmark results (mean, p95, p99, ops/sec)
- Baseline comparison
- Regression alerts (se houver)
- Updated baseline file

---
*Task — Blaze, Performance Engineer*
