# CEO Portfolio Review

```yaml
task:
  name: ceo-portfolio-review
  agent: binance-ceo
  elicit: true
  description: Revisao completa do portfolio com metricas de performance e recomendacoes
```

## Elicitation

1. **Periodo de analise?** [7d / 30d / 90d / Custom]
2. **Incluir ativos em staking?** [Sim / Nao]
3. **Benchmark de comparacao?** [BTC / ETH / USDT (hold) / Custom]

## Workflow

### 1. Asset Breakdown
- Listar todos os ativos e seus pesos no portfolio
- Classificar por: Spot Hold, Spot Trading, Futures, Staking
- Calcular concentracao (Herfindahl Index)

### 2. Performance Metrics
- ROI total no periodo
- ROI por ativo
- Sharpe Ratio
- Sortino Ratio
- Max Drawdown
- Win Rate por estrategia
- Profit Factor
- Average Win vs Average Loss

### 3. Comparison vs Benchmark
- Portfolio vs BTC buy-and-hold
- Portfolio vs ETH buy-and-hold
- Alpha gerado

### 4. Risk Analysis
- Correlacao entre ativos do portfolio
- VaR (Value at Risk) 95%
- Stress test scenarios (crash -20%, -40%)
- Concentracao excessiva?

### 5. Recommendations
- Ativos para aumentar/reduzir exposicao
- Estrategias com melhor/pior performance
- Rebalanceamento sugerido
- Novas oportunidades identificadas

## Codebase References

- Portfolio: `modules/binance-bot/backend/src/controllers/PortfolioController.ts`
- Performance: `modules/binance-bot/backend/src/monitoring/PerformanceMonitor.ts`
- Strategies: `modules/binance-bot/backend/data/trading-strategies.json`
- History: `modules/binance-bot/frontend/src/components/history/`
