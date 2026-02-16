# Quant Backtest Strategy

```yaml
task:
  name: quant-backtest-strategy
  agent: binance-quant
  elicit: true
  description: Executar backtest rigoroso de uma estrategia de trading
```

## Elicitation

1. **Estrategia?** [Nome/ID ou descricao]
2. **Par(es)?** [ex: BTCUSDT, ETHUSDT]
3. **Periodo?** [30d / 90d / 180d / 1y / 2y]
4. **Capital inicial?** [$1000 / $5000 / $10000 / Custom]
5. **Incluir custos?** [Sim (0.1% fee) / Custom fee]

## Workflow

### 1. Strategy Setup
- Carregar parametros da estrategia
- Configurar indicadores e sinais
- Definir regras de entrada e saida
- Configurar position sizing

### 2. Backtest Execution
- Rodar backtest no periodo selecionado
- Aplicar custos de transacao e slippage
- Registrar todas as trades (entry, exit, PnL)

### 3. Performance Metrics
- Total Return (%)
- CAGR (Compound Annual Growth Rate)
- Sharpe Ratio
- Sortino Ratio
- Calmar Ratio
- Max Drawdown (% e duracao)
- Win Rate
- Profit Factor
- Average Win / Average Loss
- Expectancy per trade
- Total trades / Trades per month

### 4. Statistical Validation
- Minimo 200 trades para significancia
- Equity curve smoothness
- Drawdown distribution
- Monthly returns distribution
- Consecutive wins/losses max

### 5. Robustness Tests
- Walk-forward analysis (train/test split)
- Parameter sensitivity (±10% variation)
- Different market regimes performance
- Overfitting score (in-sample vs out-of-sample)

### 6. Report
- Metricas completas
- Equity curve
- Drawdown chart
- Monthly returns heatmap
- Recomendacao: APROVADO / PRECISA AJUSTE / REJEITADO

## Codebase References

- Backtest controller: `modules/binance-bot/backend/src/controllers/BacktestController.ts`
- Backtest routes: `modules/binance-bot/backend/src/routes/backtest.ts`
- Strategies: `modules/binance-bot/backend/src/trading/strategies/`
- Indicators: `modules/binance-bot/backend/src/trading/indicators/TechnicalIndicators.ts`
- Frontend: `modules/binance-bot/frontend/src/components/backtest/`
