---
task: Benchmark Model
responsavel: "@benchmark-analyst"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - model: Nome do modelo (ex: opus, sonnet, haiku, gpt-4o)
  - usecase: Caso de uso específico (opcional)
  - volume: Estimativa de execuções/mês (opcional, default: 100)
Saida: |
  - cost_card: Ficha de custos do modelo (input/output/cache/batch)
  - quality_score: Score de qualidade para o caso de uso (1-10)
  - monthly_estimate: Estimativa de custo mensal
  - recommendation: Recomendação com justificativa
Checklist:
  - "[ ] Identificar modelo e resolver pricing"
  - "[ ] Estimar tokens por execução (input + output)"
  - "[ ] Calcular custo por execução"
  - "[ ] Calcular custo com cache (se aplicável)"
  - "[ ] Projetar custo mensal"
  - "[ ] Avaliar qualidade para o caso de uso"
  - "[ ] Gerar recomendação custo-benefício"
---

# *benchmark-model

Analisa custo e qualidade de um modelo LLM específico para um caso de uso.

## Flow

```
1. Resolver modelo
   ├── Mapear nome curto → modelo completo (ex: "opus" → "claude-opus-4")
   └── Carregar pricing da tabela do agente

2. Se usecase fornecido:
   ├── Estimar tokens típicos de input para esse caso
   ├── Estimar tokens típicos de output para esse caso
   └── Avaliar qualidade do modelo para esse caso (1-10)

3. Se usecase NÃO fornecido:
   └── Elicitar: "Para qual caso de uso? (code review, architecture, simple task, etc.)"

4. Calcular custos:
   ├── Custo por execução (sem cache)
   ├── Custo por execução (com cache)
   ├── Custo por execução (batch API)
   └── Projeção mensal (volume × custo)

5. Gerar output:
   ├── Cost Card (tabela formatada)
   ├── Quality Score com justificativa
   └── Recomendação final
```

## Output Format

```
📊 Benchmark: {model_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Caso de uso: {usecase}
Tokens estimados: ~{input_tokens} input / ~{output_tokens} output

💰 Custo por execução:
  Standard:  ${cost_standard}
  Cached:    ${cost_cached} ({cache_savings}% economia)
  Batch:     ${cost_batch} (50% off, async)

📅 Projeção mensal ({volume} execuções):
  Standard:  ${monthly_standard}/mês
  Cached:    ${monthly_cached}/mês
  Batch:     ${monthly_batch}/mês

⭐ Qualidade: {quality_score}/10
  {quality_justification}

💡 Recomendação:
  {recommendation}
```
