# Quant Optimize Parameters

```yaml
task:
  name: quant-optimize-params
  agent: binance-quant
  elicit: true
  description: Otimizacao de parametros de uma estrategia existente
```

## Elicitation

1. **Estrategia?** [Nome/ID]
2. **Parametros a otimizar?** [Todos / Especificos]
3. **Metodo?** [Grid Search / Random / Walk-Forward]
4. **Metrica objetivo?** [Sharpe / Return / Win Rate / Profit Factor]

## Workflow

### 1. Parameter Space
- Identificar parametros otimizaveis
- Definir ranges para cada parametro
- Calcular total de combinacoes

### 2. Optimization Run
- Executar grid/random search
- Para cada combinacao: rodar backtest completo
- Registrar metricas de cada combinacao

### 3. Results Analysis
- Top 10 combinacoes por metrica objetivo
- Heatmap de parametros vs performance
- Identificar regioes estaveis vs instacoes (overfitting)

### 4. Overfitting Check
- Comparar in-sample vs out-of-sample
- Parameter sensitivity analysis
- Se performance cai >30% out-of-sample = overfitting

### 5. Recommendation
- Parametros otimos sugeridos
- Confianca no resultado
- Sugestoes de monitoramento pos-deploy

## Codebase References

- Strategy validator: `modules/binance-bot/backend/src/trading/strategies/StrategyValidator.ts`
- Backtest: `modules/binance-bot/backend/src/controllers/BacktestController.ts`
- Strategy configs: `modules/binance-bot/backend/data/trading-strategies.json`
