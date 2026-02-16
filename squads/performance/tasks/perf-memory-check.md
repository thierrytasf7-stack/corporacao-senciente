# Task: Memory Leak Detection

> Blaze (Performance Engineer) | Verificar memory leaks e heap usage

## Objetivo
Detectar memory leaks em processos Node.js. Capturar heap snapshots, analisar growth patterns e identificar objetos que nao sao coletados pelo GC.

## Steps

### Step 1: Baseline Measurement
```
- Identificar processo alvo (PM2 list)
- Capturar metricas iniciais:
  - process.memoryUsage() → rss, heapTotal, heapUsed, external, arrayBuffers
  - v8.getHeapStatistics() → total_heap_size, used_heap_size, heap_size_limit
  - Timestamp da medicao
```

### Step 2: Heap Snapshot Series
```
- Capturar snapshot T0 (inicio)
- Executar carga de trabalho por 5 minutos
  - Requests ao endpoint principal
  - Operacoes tipicas do sistema
- Capturar snapshot T1 (apos carga)
- Aguardar 1 minuto (GC opportunity)
- Capturar snapshot T2 (apos cooldown)
```

### Step 3: Growth Analysis
```
- Comparar T0 vs T1:
  - Heap growth normal durante carga? (< 50MB)
  - RSS growth proporcional?
- Comparar T1 vs T2:
  - Heap retornou proximo ao baseline? (leak indicator)
  - RSS reduziu? (RSS nunca reduz muito em Node.js - normal)
- Calcular leak rate:
  - (heapUsed_T2 - heapUsed_T0) / tempo_minutos = MB/min
  - Budget: < 10MB/hora
```

### Step 4: Object Retention Analysis
```
- Se leak detectado:
  - Identificar tipos de objeto com maior crescimento
  - Verificar closures retendo referencias
  - Event listeners nao removidos
  - Timers/intervals nao limpos
  - Cache sem eviction policy
  - Global variables acumulando dados
```

### Step 5: GC Analysis
```
- Verificar frequencia de GC (--trace-gc flag)
- GC pause duration (budget: < 100ms)
- Major vs Minor GC ratio
- Se GC frequente mas heap nao reduz → leak confirmado
```

### Step 6: Report & Recommendations
```
| Metrica | Valor | Budget | Status |
|---------|-------|--------|--------|
| Heap Used (baseline) | ? | < 512MB | ? |
| RSS (baseline) | ? | < 768MB | ? |
| Leak Rate | ?MB/hr | < 10MB/hr | ? |
| GC Pause Max | ? | < 100ms | ? |

Se leak encontrado:
- Localizacao provavel (file:line)
- Tipo de leak (closure, listener, cache, global)
- Fix sugerido
- Owner: @dev
```

## Output
- Memory health assessment
- Leak detection result (CLEAN / SUSPECT / CONFIRMED)
- Growth rate analysis
- GC health metrics
- Fix recommendations se leak encontrado

---
*Task — Blaze, Performance Engineer*
