---
task: Validate Data Quality
tipo: "data-validator"
responsavel: "@data-validator"
atomic_layer: task
Entrada: |
  - processed_data: Dados processados
  - validation_rules: Regras de validação
  - quality_thresholds: Thresholds de qualidade
Saida: |
  - validation_results: Resultados da validação
  - quality_score: Score geral de qualidade
  - issues_detected: Problemas identificados
---

# validate-data

Valida a qualidade geral dos dados esportivos processados, aplicando regras e thresholds para garantir confiabilidade.

## Processo de Validação

1. **Aplicação de Regras:** Verificar conformidade com regras de validação
2. **Cálculo de Métricas:** Determinar scores de qualidade
3. **Comparação Histórica:** Avaliar dados atuais vs. padrões históricos
4. **Detecção de Anomalias:** Identificar valores fora da faixa esperada
5. **Geração de Relatório:** Documentar resultados e problemas

## Critérios de Validação

- **Precisão:** Dados dentro da faixa esperada
- **Consistência:** Coerência entre diferentes fontes
- **Completude:** Percentual de dados obrigatórios presentes
- **Atualidade:** Dados frescos dentro do threshold
- **Formato:** Conformidade com o formato esperado
