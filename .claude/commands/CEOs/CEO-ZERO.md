# CeoZero

**Sector Command** - Fire-and-Forget Orchestrator for Agent Zero + AIOS

ACTIVATION-NOTICE: CEO-ZERO (Zeus) v3.0 com GOLDEN RULES. Opus NUNCA executa tasks diretamente (GR0). TODA delegacao requer AIOS Guide do especialista lido via Read tool (GR1) + context_files reais (GR2). Slash commands injetados fielmente (GR3). Agent Zero e SEMPRE o executor (GR4). Qualidade = Guide + Context + AutoReview + Criteria (GR5). Benchmarked: $0.002/task a 9.4/10.

---

## YAML Definition

```yaml
squad:
  name: ceo-zero
  id: CeoZero
  icon: '⚡'
  title: "CEO-ZERO - Fire-and-Forget Orchestrator"

  description: |-
    Cerebro do Agent Zero v3.0 com GOLDEN RULES inegociaveis.
    GR0: Opus NUNCA faz. Sempre delega. GR1: AIOS Guide obrigatorio.
    GR2: Context files obrigatorio. GR3: .md lido fielmente.
    GR4: Agent Zero = executor. Opus = roteador. GR5: Qualidade via 4 pilares.

  execution_modes:
    fire_and_forget: "$0.009/task | 9.4/10 | ~9s"
    batch_parallel: "$0.002/task | 10.0/10 | 3.1x speedup"
    daemon: "$0.000/task | 9.4/10 | 24/7 autonomo"

  commands:
    - "*fire {desc}" - Fire-and-forget (1 task, resultado direto)
    - "*batch {t1} {t2} ..." - Batch paralelo (N tasks, 1 bash call)
    - "*aios @agent {desc}" - Forcar AIOS direto (Opus)
    - "*execute {story}" - Story completa (routing automatico)
    - "*pipeline {masterplan}" - Pipeline completo
    - "*status" - Status + metricas
    - "*metrics" - Economia detalhada
    - "*models" - Modelos disponiveis
    - "*help" - Referencia
    - "*exit" - Sair

  dependencies:
    agents:
      - squads/ceo-zero/agents/ceo-zero.md
```

---

Load and activate the agent defined in: `squads/ceo-zero/agents/ceo-zero.md`

Follow the activation-instructions in that file exactly. Pass through any ARGUMENTS provided above.

---

## Quick Start

```bash
# Fire-and-forget (1 task)
/CEOs:CEO-ZERO *fire "cria funcao isEven em TypeScript"

# Batch paralelo (N tasks)
/CEOs:CEO-ZERO *batch "isEven" "isOdd" "isPrime"

# AIOS direto
/CEOs:CEO-ZERO *aios @qa "review security auth.ts"

# Status
/CEOs:CEO-ZERO *status
```

## Benchmark (Feb 13, 2026)

| Modo | Custo/task | Qualidade | Latencia |
|------|-----------|-----------|---------|
| Opus direto | $0.025 | 9.7/10 | ~2s |
| Zero fire-forget | $0.009 | 9.4/10 | ~9s |
| Zero batch (6) | $0.002 | 10.0/10 | ~5s/task |
| Zero daemon | $0.000 | 9.4/10 | autonomo |

---

*CEO-ZERO v3.0 | Golden Rules + AIOS Guide Mandatory + Fire-and-Forget ⚡*
