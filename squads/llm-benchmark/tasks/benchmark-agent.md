---
task: Benchmark Agent
responsavel: "@benchmark-analyst"
responsavel_type: agent
atomic_layer: task
elicit: false
Entrada: |
  - agent_path: Caminho para o arquivo .md do agente
  - model: Modelo que roda o agente (default: opus)
Saida: |
  - token_analysis: Contagem de tokens do agente (system prompt total)
  - fixed_cost: Custo fixo por ativação
  - waste_map: Mapa de desperdício identificado
  - optimization_suggestions: Lista de otimizações com impacto estimado
  - pareto_summary: Top 20% de mudanças que reduzem 80% do custo
Checklist:
  - "[ ] Ler arquivo do agente completo"
  - "[ ] Estimar token count do system prompt"
  - "[ ] Calcular custo fixo por ativação"
  - "[ ] Identificar redundâncias no prompt"
  - "[ ] Identificar contexto não utilizado"
  - "[ ] Identificar over-engineering"
  - "[ ] Gerar mapa de desperdício"
  - "[ ] Calcular impacto de cada otimização"
  - "[ ] Ranquear por Pareto (maior impacto primeiro)"
---

# *benchmark-agent

Lê um agente, calcula custo fixo, identifica desperdício e sugere otimizações Pareto.

## Flow

```
1. Ler arquivo do agente
   ├── Extrair YAML block (configuração)
   ├── Extrair texto livre (instruções adicionais)
   └── Extrair Quick Commands section

2. Análise de tokens
   ├── Estimar tokens totais do arquivo (~4 chars = 1 token)
   ├── Separar: YAML config vs instruções vs commands
   └── Calcular custo fixo (tokens × preço input do modelo)

3. Detecção de desperdício
   ├── Instruções repetidas (duplicatas ou paráfrases)
   ├── Exemplos excessivos (1-2 bastam na maioria dos casos)
   ├── Vocabulário/vocabulary lists longas (tokens baixo valor)
   ├── Seções que poderiam ser lazy-loaded (guide, collaboration)
   ├── Greeting levels não usados (3 levels vs 1 necessário)
   ├── Metadata que não afeta comportamento
   └── Over-specification (instruções óbvias para o modelo)

4. Análise de qualidade
   ├── Instruções core estão claras e sem ambiguidade?
   ├── Commands estão bem mapeados a tasks?
   ├── Persona agrega valor ou é overhead?
   └── Core principles são actionable?

5. Gerar recomendações Pareto
   ├── Ranquear otimizações por (tokens_saved × facilidade)
   ├── Top 20% que cortam 80% do desperdício
   └── Estimar economia em USD/mês
```

## Output Format

```
📊 Benchmark Agent: {agent_name} ({agent_id})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📏 Tamanho: ~{total_tokens} tokens ({total_chars} chars)
  YAML config:  ~{yaml_tokens} tokens ({yaml_pct}%)
  Instruções:   ~{text_tokens} tokens ({text_pct}%)
  Commands:     ~{cmd_tokens} tokens ({cmd_pct}%)

💰 Custo fixo por ativação ({model}):
  Input: ${fixed_cost} (system prompt)
  Com cache: ${cached_cost} ({savings}% economia)

🔍 Desperdício identificado:
{waste_items}

🎯 Top Otimizações (Pareto 80/20):
{optimization_list}

💰 Economia estimada: ~{tokens_saved} tokens/ativação = ${monthly_savings}/mês
```

## Waste Categories

| Categoria | Impacto | Exemplo |
|-----------|---------|---------|
| Redundância | Alto | Mesma instrução repetida 2-3x |
| Over-specification | Médio | "Sempre use TypeScript" (modelo já sabe do contexto) |
| Exemplos excessivos | Médio | 5 exemplos onde 2 bastam |
| Metadata decorativa | Baixo | Zodiac, archetype (não afeta output) |
| Greeting verboso | Baixo | Greeting de 20 linhas vs 5 |
| Vocabulary lists | Baixo | Lista de palavras raramente usadas |
