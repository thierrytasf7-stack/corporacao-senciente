# Quant Create Strategy

```yaml
task:
  name: quant-create-strategy
  agent: binance-quant
  elicit: true
  description: Criar nova estrategia de trading do zero com backtest integrado
```

## Elicitation

1. **Tipo?** [Scalping / Swing / Position / Math/Algo]
2. **Mercado?** [Spot / Futures / Ambos]
3. **Indicadores base?** [RSI / MACD / Bollinger / EMA / Custom]
4. **Timeframe?** [10s / 1m / 5m / 15m / 1h / 4h / 1d]
5. **Risk/Reward minimo?** [1:1.5 / 1:2 / 1:3]

## Workflow

### 1. Strategy Design
- Definir hipotese de mercado
- Selecionar indicadores e parametros iniciais
- Definir regras de entrada (conditions)
- Definir regras de saida (stop loss, take profit, trailing)
- Definir position sizing

### 2. Strategy JSON
- Gerar JSON no formato do codebase
- Incluir: name, type, timeframe, indicators, entry/exit rules, risk params
- Salvar em `trading-strategies.json` ou `math_strategies.json`

### 3. Initial Backtest
- Rodar backtest com parametros iniciais
- Verificar se atende criterios minimos:
  - Win Rate > 50%
  - Profit Factor > 1.5
  - Sharpe > 1.0
  - Max Drawdown < 15%

### 4. Optimization Round
- Otimizar parametros principais
- Validar com walk-forward

### 5. Deliverable
- Strategy JSON completo
- Backtest report
- Recomendacao de deploy para CEO

## Codebase References

- Strategy base: `modules/binance-bot/backend/src/trading/strategies/BaseStrategy.ts`
- Existing strategies: `modules/binance-bot/backend/data/trading-strategies.json`
- Math strategies: `modules/binance-bot/backend/data/math_strategies.json`
- Indicators: `modules/binance-bot/backend/src/trading/indicators/TechnicalIndicators.ts`
