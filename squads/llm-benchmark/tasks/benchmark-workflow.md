---
task: Benchmark Workflow
responsavel: "@benchmark-analyst"
responsavel_type: agent
atomic_layer: task
elicit: false
Entrada: |
  - workflow_path: Caminho para workflow ou squad inteira
  - model: Modelo padrão (default: opus)
Saida: |
  - flow_cost: Custo total do workflow (soma de todos os steps)
  - bottlenecks: Gargalos de custo (steps mais caros)
  - waste_map: Desperdício entre steps (redundância, handoff overhead)
  - optimization_plan: Plano de otimização ordenado por impacto
Checklist:
  - "[ ] Mapear todos os steps do workflow"
  - "[ ] Calcular custo de cada step individualmente"
  - "[ ] Identificar handoff overhead (contexto passado entre agentes)"
  - "[ ] Identificar steps que poderiam usar modelo mais barato"
  - "[ ] Identificar steps redundantes ou elimináveis"
  - "[ ] Calcular custo total e projeção mensal"
  - "[ ] Gerar plano de otimização Pareto"
---

# *benchmark-workflow

Analisa workflow ou squad completa: custo total, gargalos, token waste entre steps.

## Flow

```
1. Identificar tipo de input
   ├── Se .yaml → workflow file, parse steps
   ├── Se squad path → ler squad.yaml, mapear agents+tasks
   └── Se agent chain (A→B→C) → mapear sequência

2. Para cada step/agent:
   ├── Estimar tokens de system prompt (custo fixo)
   ├── Estimar tokens de input variável (contexto do step anterior)
   ├── Estimar tokens de output
   └── Identificar modelo usado

3. Analisar handoffs
   ├── Quanto contexto é passado entre steps?
   ├── Há duplicação de contexto? (mesmo dado em 2+ steps)
   ├── Há steps que poderiam rodar em paralelo?
   └── Há steps que poderiam ser eliminados?

4. Calcular totais
   ├── Custo por execução do workflow completo
   ├── Custo com cache otimizado
   ├── Projeção mensal
   └── Comparar: workflow atual vs otimizado

5. Gerar plano Pareto
   ├── Ranquear steps por custo
   ├── Identificar 20% dos steps que custam 80%
   └── Sugerir otimizações concretas
```

## Output Format

```
📊 Benchmark Workflow: {workflow_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Steps: {step_count} | Agentes: {agent_count}

Step-by-step:
{step_table}

🏷️ Custo total por execução: ${total_cost}
  Com cache:  ${cached_cost} ({savings}%)
  Mensal ({volume}x): ${monthly}

🔴 Gargalos (80% do custo):
{bottleneck_list}

🎯 Otimizações Pareto:
{optimization_list}

💰 Economia potencial: ${savings_amount}/mês ({savings_pct}%)
```
