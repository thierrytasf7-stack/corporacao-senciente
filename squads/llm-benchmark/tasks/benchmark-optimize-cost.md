---
task: Optimize Cost
responsavel: "@benchmark-analyst"
responsavel_type: agent
atomic_layer: task
elicit: false
Entrada: |
  - target: Squad name, agent path, ou workflow path
Saida: |
  - current_cost: Custo atual estimado
  - optimized_cost: Custo após otimizações
  - savings: Economia em tokens e USD
  - action_plan: Lista de ações ordenada por impacto (Pareto)
Checklist:
  - "[ ] Ler e analisar o target completo"
  - "[ ] Calcular custo atual (baseline)"
  - "[ ] Identificar todas as oportunidades de economia"
  - "[ ] Ranquear por impacto (Pareto)"
  - "[ ] Calcular economia de cada otimização"
  - "[ ] Gerar action plan ordenado"
---

# *optimize-cost

Gera recomendações Pareto para reduzir custo de um agente, squad ou workflow.

## Estratégias de Otimização (ordenadas por impacto típico)

### Tier 1 - Alto Impacto (>30% economia)
1. **Model downgrade seletivo** - Usar Haiku/Sonnet para tasks simples, Opus só para complexas
2. **Prompt compression** - Reduzir system prompt sem perder instruções essenciais
3. **Batch API** - Mover tasks não-urgentes para batch (50% off)

### Tier 2 - Médio Impacto (10-30% economia)
4. **Prompt caching** - Estruturar prompts para maximizar cache hits
5. **Context pruning** - Remover contexto que não é usado pelo modelo
6. **Task splitting** - Separar raciocínio (modelo caro) de formatação (modelo barato)

### Tier 3 - Baixo Impacto (<10% economia)
7. **Output compression** - Instruir modelo a ser mais conciso
8. **Eliminar metadata decorativa** - Remover campos que não afetam comportamento
9. **Consolidar exemplos** - Reduzir de N exemplos para 1-2 representativos

## Output Format

```
📊 Otimização de Custo: {target}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📏 Baseline: ~{current_tokens} tokens/exec = ${current_cost}/exec

🎯 Action Plan (Pareto - maior impacto primeiro):

1. {action_1}
   Economia: ~{tokens_1} tokens ({pct_1}%)
   Esforço: {effort_1}

2. {action_2}
   ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Total economia: ~{total_tokens_saved} tokens = ${total_savings}/exec
📅 Mensal: ${monthly_savings}/mês ({total_pct}% redução)
```
