---
task: Benchmark Compare
responsavel: "@benchmark-analyst"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - model_a: Primeiro modelo
  - model_b: Segundo modelo (ou mais)
  - task_type: Tipo de tarefa para comparação
  - volume: Execuções estimadas/mês (default: 100)
Saida: |
  - comparison_table: Tabela comparativa custo vs qualidade
  - winner_cost: Modelo mais barato
  - winner_quality: Modelo melhor qualidade
  - winner_balanced: Melhor custo-benefício
  - recommendation: Recomendação final
Checklist:
  - "[ ] Resolver pricing de ambos os modelos"
  - "[ ] Definir caso de uso para comparação"
  - "[ ] Estimar tokens por execução para cada modelo"
  - "[ ] Calcular custo por execução (standard/cached/batch)"
  - "[ ] Avaliar qualidade de cada modelo para o caso"
  - "[ ] Calcular custo-benefício (quality/cost ratio)"
  - "[ ] Gerar tabela comparativa"
  - "[ ] Recomendação com justificativa"
---

# *compare

Compara modelos ou abordagens em custo vs qualidade para um caso de uso específico.

## Flow

```
1. Resolver modelos
   ├── Mapear nomes curtos → completos
   └── Carregar pricing de cada um

2. Se task_type não fornecido:
   └── Elicitar: "Para qual tarefa? (code gen, review, planning, simple, etc.)"

3. Para cada modelo:
   ├── Estimar tokens típicos (input/output) para essa tarefa
   ├── Calcular custo (standard / cached / batch)
   ├── Avaliar qualidade (1-10) com justificativa
   └── Calcular ratio quality/cost

4. Gerar comparação
   ├── Tabela side-by-side
   ├── Winner por dimensão (custo, qualidade, balanced)
   └── Recomendação final
```

## Output Format

```
📊 Comparação: {model_a} vs {model_b}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tarefa: {task_type}

| Dimensão        | {model_a}    | {model_b}    |
|-----------------|-------------|-------------|
| Input $/1M      | ${a_input}  | ${b_input}  |
| Output $/1M     | ${a_output} | ${b_output} |
| Custo/execução  | ${a_exec}   | ${b_exec}   |
| Mensal ({vol}x) | ${a_month}  | ${b_month}  |
| Qualidade       | {a_qual}/10 | {b_qual}/10 |
| Custo-benefício | {a_ratio}   | {b_ratio}   |

🏆 Vencedores:
  Menor custo:       {winner_cost}
  Melhor qualidade:  {winner_quality}
  Melhor balanço:    {winner_balanced}

💡 Recomendação: {recommendation}
```
