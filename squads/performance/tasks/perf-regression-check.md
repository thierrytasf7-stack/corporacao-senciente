# Task: Regression Detection

> Blaze (Performance Engineer) | Verificar regressoes vs baseline

## Objetivo
Comparar metricas atuais com baseline para detectar regressoes de performance introduzidas por mudancas recentes.

## Steps

### Step 1: Load Baseline
```
- Verificar baseline existente em tests/performance/baselines/
- Se nao existe: estabelecer baseline com *benchmark
- Registrar commit hash e data do baseline
```

### Step 2: Run Current Measurements
```
- Executar mesmos benchmarks do baseline
- Medir metricas equivalentes:
  - Bundle size (se frontend mudou)
  - API response times (se backend mudou)
  - Query performance (se DB mudou)
  - Memory usage
```

### Step 3: Compare
```
Para cada metrica:
- Calcular delta percentual
- Classificar:
  - REGRESSION: > 10% pior que baseline
  - WARNING: 5-10% pior
  - OK: dentro de +-5%
  - IMPROVED: > 5% melhor

| Metric | Baseline | Current | Delta | Status |
|--------|----------|---------|-------|--------|
```

### Step 4: Root Cause (se regressao)
```
Para cada regressao detectada:
- git log --oneline baseline_commit..HEAD → commits recentes
- Identificar commit mais provavel
- Analisar diff do commit suspeito
- Correlacionar mudanca com regressao
```

### Step 5: Report
```
REGRESSION CHECK RESULT: PASS / FAIL

Se FAIL:
- Lista de regressoes com severidade
- Commit provavel causador
- Sugestao de fix
- Bloquear release? (se critical)

Se PASS:
- Todas metricas dentro do aceitavel
- Melhorias encontradas (se houver)
- Atualizar baseline? (se melhorias significativas)
```

## Output
- Regression check result (PASS/FAIL)
- Detailed comparison table
- Root cause analysis (se regressao)
- Gate recommendation (block/allow release)

## Integration
- Pre-release gate: chamado por Prometheus antes de *ship
- CI integration: pode ser parte do pre-push check

---
*Task — Blaze, Performance Engineer*
