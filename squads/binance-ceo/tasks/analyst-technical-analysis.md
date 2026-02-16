# Analyst Technical Analysis

```yaml
task:
  name: analyst-technical-analysis
  agent: binance-analyst
  elicit: true
  description: Analise tecnica detalhada de um par especifico com multiplos timeframes
```

## Elicitation

1. **Qual par?** [ex: BTCUSDT]
2. **Timeframe principal?** [1m / 5m / 15m / 1h / 4h / 1d]
3. **Objetivo?** [Entry signal / Exit signal / Overview]

## Workflow

### 1. Multi-Timeframe Analysis
- Analisar 3 timeframes: superior, principal, inferior
- Determinar tendencia em cada timeframe
- Identificar confluencia entre timeframes

### 2. Trend Analysis
- EMA 9, 21, 50, 200 - posicao relativa
- MACD - histograma, cruzamentos, divergencias
- ADX - forca da tendencia

### 3. Momentum
- RSI (14) - niveis, divergencias
- Stochastic (14,3,3) - cruzamentos
- Volume vs media - confirmacao

### 4. Volatility
- Bollinger Bands - squeeze, expansao, walks
- ATR - volatilidade absoluta

### 5. Key Levels
- Suportes: 3 niveis mais relevantes
- Resistencias: 3 niveis mais relevantes
- Fibonacci retracements
- Pivot points

### 6. Signal Generation
- Confluencia de indicadores (minimo 3)
- Nivel de confianca (0-100%)
- Direcao: LONG / SHORT / NEUTRAL
- Entry zone, Stop Loss, Take Profit (3 niveis)
- Risk/Reward ratio

## Codebase References

- Indicators: `modules/binance-bot/backend/src/trading/indicators/TechnicalIndicators.ts`
- Analysis: `modules/binance-bot/frontend/src/components/analysis/RealAnalysisPanel.tsx`
- Signals: `modules/binance-bot/backend/data/emitted-signals.json`
