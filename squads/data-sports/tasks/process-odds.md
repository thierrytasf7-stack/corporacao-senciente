---
task: Process Odds Data
tipo: "data-processor"
responsavel: "@data-processor"
atomic_layer: task
Entrada: |
  - raw_odds: Odds brutas coletadas
  - market_info: Informações sobre mercados
  - bookmaker_data: Dados dos bookmakers
  - processing_rules: Regras de processamento
  - normalization_params: Parâmetros de normalização
Saida: |
  - processed_odds: Odds processadas
  - implied_probabilities: Probabilidades implícitas
  - odds_movements: Movimentações das odds
  - quality_metrics: Métricas de qualidade
  - processing_log: Log do processamento
---

# process-odds

Transforma odds brutas de apostas em dados estruturados, normalizados e analisados para tomada de decisão.

## Processo de Processamento

1. **Validação de Odds:** Verificar integridade e formato das odds brutas
2. **Normalização:** Converter odds para formato decimal padrão
3. **Cálculo de Probabilidades:** Determinar probabilidades implícitas
4. **Detecção de Movimento:** Identificar mudanças e tendências nas odds
5. **Análise de Valor:** Calcular margens e identificar oportunidades
6. **Agregação:** Combinar odds de múltiplas fontes quando aplicável
7. **Geração de Saída:** Produzir dados processados em formato consumível

## Etapas de Processamento

- **Normalização de Odds:** Converter American/Fractional para Decimal
- **Cálculo de Probabilidades Implícitas:** Determinar chances baseadas nas odds
- **Detecção de Movimento:** Identificar mudanças significativas nas odds
- **Análise de Margem:** Calcular overround e margem do bookmaker
- **Comparação entre Fontes:** Identificar discrepâncias e arbitragens
- **Temporal Alignment:** Sincronizar timestamps entre diferentes fontes

## Métricas Calculadas

- **Probabilidades Implícitas:** Chances baseadas nas odds oferecidas
- **Overround:** Margem do bookmaker (soma das probabilidades > 100%)
- **Valor Esperado:** Potencial de lucro baseado nas probabilidades reais
- **Taxa de Movimento:** Velocidade das mudanças nas odds
- **Consistência:** Nível de concordância entre diferentes bookmakers

## Análise de Movimento

- **Velocidade:** Quão rápido as odds estão mudando
- **Direção:** Tendência de alta ou baixa nas odds
- **Magnitude:** Tamanho da mudança nas odds
- **Padrões:** Identificação de padrões recorrentes de movimento
- **Catalisadores:** Eventos que desencadeiam mudanças significativas