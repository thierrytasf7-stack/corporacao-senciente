---
task: Benchmark Report
responsavel: "@benchmark-analyst"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - scope: "all" (todas as squads) ou squad específica
Saida: |
  - report: Relatório completo de benchmark em markdown
Checklist:
  - "[ ] Definir escopo (all ou squad específica)"
  - "[ ] Listar todos os agentes no escopo"
  - "[ ] Calcular custo fixo de cada agente"
  - "[ ] Identificar top consumers (agentes mais caros)"
  - "[ ] Gerar recomendações gerais"
  - "[ ] Formatar relatório"
---

# *report

Gera relatório completo de benchmark com métricas de custo e qualidade.

## Flow

```
1. Definir escopo
   ├── Se "all" → listar squads/ + .aios-core/development/agents/
   └── Se squad específica → listar agents/ da squad

2. Para cada agente:
   ├── Contar tokens do arquivo (chars/4)
   ├── Calcular custo fixo por ativação (Opus pricing)
   └── Classificar: small (<2K tokens), medium (2-5K), large (5-10K), xlarge (>10K)

3. Agregar
   ├── Total tokens de system prompts
   ├── Total custo fixo por ativação de todos
   ├── Ranking por tamanho
   └── Identificar outliers

4. Gerar relatório markdown
```

## Output Format

```
# 📊 LLM Benchmark Report
Generated: {date}
Scope: {scope}

## Overview
- Agentes analisados: {count}
- Total tokens (system prompts): ~{total_tokens}
- Custo fixo total (1 ativação de cada): ${total_cost}

## Ranking por Custo (maior primeiro)

| # | Agente | Tokens | Custo/ativ | Classificação |
|---|--------|--------|-----------|---------------|
| 1 | {name} | {tokens} | ${cost} | {class} |
...

## Distribuição
- Small (<2K): {small_count} agentes
- Medium (2-5K): {medium_count} agentes
- Large (5-10K): {large_count} agentes
- XLarge (>10K): {xlarge_count} agentes

## Top 5 Recomendações (Pareto)
1. {rec_1}
2. {rec_2}
...

---
📊 Report by Metric (Benchmark Analyst)
```
