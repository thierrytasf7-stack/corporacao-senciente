---
task: Optimize Quality
responsavel: "@benchmark-analyst"
responsavel_type: agent
atomic_layer: task
elicit: false
Entrada: |
  - target: Squad name, agent path, ou workflow path
  - quality_goal: O que precisa melhorar (opcional)
Saida: |
  - current_quality: Score atual estimado (1-10)
  - quality_issues: Problemas identificados
  - improvement_plan: Lista de melhorias ordenada por impacto
  - cost_impact: Quanto cada melhoria custa a mais
Checklist:
  - "[ ] Ler e analisar o target completo"
  - "[ ] Avaliar qualidade atual por dimensão"
  - "[ ] Identificar gaps de qualidade"
  - "[ ] Gerar melhorias concretas"
  - "[ ] Calcular custo adicional de cada melhoria"
  - "[ ] Ranquear por (impacto_qualidade / custo_adicional)"
---

# *optimize-quality

Gera recomendações para melhorar qualidade de resposta LLM de um agente ou workflow.

## Dimensões de Qualidade

| Dimensão | Peso | Como Medir |
|----------|------|------------|
| Accuracy | 30% | Output correto e factual |
| Instruction Following | 25% | Segue system prompt fielmente |
| Completeness | 20% | Cobre todos os requisitos |
| Consistency | 15% | Resultados estáveis entre runs |
| Format | 10% | Output bem estruturado |

## Estratégias de Melhoria (por custo)

### Custo Zero (melhor prompt)
- Clarificar instruções ambíguas
- Adicionar exemplos de output esperado (few-shot)
- Separar instruções em seções claras (não misturar contexto com comandos)
- Usar formato estruturado (YAML > texto livre para config)

### Custo Baixo (mais contexto)
- Adicionar 1-2 exemplos de qualidade (few-shot)
- Incluir edge cases no prompt
- Adicionar constraints explícitos

### Custo Médio (mais tokens)
- Usar chain-of-thought (pedir raciocínio antes da resposta)
- Adicionar verificação (pedir auto-review)
- Aumentar contexto relevante

### Custo Alto (modelo melhor)
- Upgrade de modelo (Haiku→Sonnet→Opus)
- Multi-pass (rodar 2x e comparar)

## Output Format

```
📊 Otimização de Qualidade: {target}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ Qualidade atual: {score}/10
{dimension_breakdown}

🔍 Problemas identificados:
{issues_list}

🎯 Melhorias (melhor ROI primeiro):

1. {improvement_1} [Custo: {cost_impact}]
   Impacto: +{quality_gain} pontos
   {description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ Qualidade projetada: {new_score}/10
💰 Custo adicional: ${extra_cost}/exec
```
