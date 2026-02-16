# Quant Indicator Research

```yaml
task:
  name: quant-indicator-research
  agent: binance-quant
  elicit: true
  description: Pesquisar e avaliar novos indicadores tecnicos ou sinais para trading
```

## Elicitation

1. **Indicador?** [Nome especifico ou categoria]
2. **Objetivo?** [Trend / Momentum / Volatility / Volume / Reversal]
3. **Implementar no codebase?** [Sim / Apenas pesquisa]

## Workflow

### 1. Research
- Estudar teoria do indicador
- Parametros padrao e variacoes
- Casos de uso ideais
- Limitacoes conhecidas

### 2. Implementation
- Implementar calculo em TypeScript
- Integrar no TechnicalIndicators.ts
- Testes unitarios

### 3. Backtesting
- Testar isoladamente em multiplos pares
- Comparar com indicadores existentes
- Avaliar valor adicionado

### 4. Report
- Documentacao do indicador
- Resultados dos backtests
- Recomendacao de uso

## Codebase References

- Indicators engine: `modules/binance-bot/backend/src/trading/indicators/TechnicalIndicators.ts`
- Strategy base: `modules/binance-bot/backend/src/trading/strategies/BaseStrategy.ts`
