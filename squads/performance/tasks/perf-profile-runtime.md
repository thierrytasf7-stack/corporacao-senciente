# Task: Runtime Profiling

> Blaze (Performance Engineer) | Profile CPU, memory e event loop

## Objetivo
Profiling detalhado de aplicacao Node.js em runtime. Identifica hotpaths, CPU bottlenecks, memory patterns e event loop delays.

## Steps

### Step 1: Identify Target Process
```
- Listar processos Node.js rodando (PM2 status)
- Identificar PID do processo alvo
- Registrar baseline de memoria (RSS, heap)
```

### Step 2: CPU Profiling
```
- Usar perf_hooks para medir execution time de funcoes criticas
- Identificar hotpaths (funcoes que consomem mais CPU)
- Medir tempo de startup do processo
- Se disponivel, gerar flamegraph com:
  - node --prof {script}
  - node --prof-process isolate-*.log
```

### Step 3: Memory Profiling
```
- Capturar heap snapshot:
  - v8.getHeapStatistics()
  - process.memoryUsage()
- Analisar:
  - Heap used vs total vs external
  - RSS (Resident Set Size)
  - Array buffers size
- Comparar com budget: heap < 512MB, RSS < 768MB
```

### Step 4: Event Loop Analysis
```
- Medir event loop lag com perf_hooks.monitorEventLoopDelay()
- Identificar operacoes bloqueantes:
  - Sync file I/O (fs.readFileSync, etc)
  - CPU-intensive computations sem worker threads
  - Large JSON.parse/stringify
- Medir percentiles: p50, p95, p99
```

### Step 5: Generate Profile Report
```
- Top 10 hotpaths por CPU time
- Memory breakdown (heap objects por tipo)
- Event loop delay histogram
- Recomendacoes especificas para cada finding
```

## Output
- Profile report com metricas detalhadas
- Hotpaths identificados com tempo de execucao
- Memory breakdown
- Event loop health status
- Recomendacoes priorizadas

---
*Task — Blaze, Performance Engineer*
