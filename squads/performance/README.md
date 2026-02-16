# Performance Squad

**Blaze** - Performance Engineer da Diana Corporacao Senciente.

Especialista que garante que o software e RAPIDO de verdade. Mede antes de otimizar, trabalha em 3 camadas (frontend, backend, database) e nunca aceita achismo.

## Regra de Ouro

**Medir ANTES de otimizar.** Sem dados, nao ha otimizacao.

## Quick Start

```
# Ativar Blaze
/Squads:Performance-AIOS

# Audit completo (3 camadas)
*audit

# Profile runtime Node.js
*profile

# Bundle analysis frontend
*bundle

# Load test
*load-test

# Web Vitals + Lighthouse
*vitals

# Performance report
*report
```

## 3 Camadas

| Camada | Foco | Metricas-Chave |
|--------|------|----------------|
| Frontend | Bundle, Web Vitals, Lighthouse | LCP < 2.5s, Bundle < 250KB, Score >= 90 |
| Backend | API latency, throughput, memory | p95 < 500ms, > 100 rps, Heap < 512MB |
| Database | Queries, indexes, cache | p50 < 10ms, Cache > 95%, Zero seq scans |

## Performance Budgets

Definidos em `squad.yaml` e verificados automaticamente:

- **Frontend:** Bundle < 250KB, LCP < 2.5s, Lighthouse >= 90
- **Backend:** API p95 < 500ms, Throughput > 100 rps, Error < 0.1%
- **Database:** Query p95 < 100ms, Cache Hit > 95%
- **Memory:** Heap < 512MB, RSS < 768MB, Leak < 10MB/hr

## Ferramentas Existentes (Nao Duplica)

| Ferramenta | Path | Uso |
|------------|------|-----|
| performance-analyzer.js | .aios-core/infrastructure/scripts/ | Static analysis |
| performance-optimizer.js | .aios-core/infrastructure/scripts/ | AST-based suggestions |
| performance-tracker.js | .aios-core/infrastructure/scripts/ | Metrics tracking |
| Benchmark tests | tests/performance/ | Existing benchmarks |

## Gaps que Blaze Preenche

- Lighthouse CI e Core Web Vitals
- Bundle analysis detalhado
- Load testing (autocannon/k6)
- Runtime profiling (CPU, event loop)
- Memory leak detection
- Performance budgets e gates
- Regression detection vs baseline
- Pre-release performance gate

## Estrutura

```
squads/performance/
├── squad.yaml                    # Manifest com budgets
├── README.md                     # Este arquivo
├── agents/
│   └── performance-engineer.md   # Blaze - o agente
├── tasks/                        # 12 tasks
│   ├── perf-audit-full.md
│   ├── perf-profile-runtime.md
│   ├── perf-analyze-bundle.md
│   ├── perf-analyze-queries.md
│   ├── perf-web-vitals.md
│   ├── perf-load-test.md
│   ├── perf-memory-check.md
│   ├── perf-benchmark.md
│   ├── perf-optimize.md
│   ├── perf-set-budget.md
│   ├── perf-report.md
│   └── perf-regression-check.md
├── workflows/                    # 2 workflows
│   ├── full-performance-audit.yaml
│   └── pre-release-perf-check.yaml
├── checklists/                   # 4 gates
│   ├── perf-gate-frontend.md
│   ├── perf-gate-backend.md
│   ├── perf-gate-database.md
│   └── perf-gate-release.md
└── templates/                    # 2 templates
    ├── perf-audit-report-tmpl.md
    └── perf-budget-tmpl.md
```

## Colaboracao

| Agente | Blaze aciona quando |
|--------|---------------------|
| @dev (Dex) | Precisa implementar otimizacao identificada |
| @qa (Quinn) | Validar que fix nao causa regression |
| @data-engineer (Dara) | Query/schema precisa otimizacao |
| @devops (Gage) | CI performance gate precisa configuracao |
| Prometheus (CDO) | Reports e pre-release gates |

---

*Blaze, Performance Engineer | Measure first, optimize second*
