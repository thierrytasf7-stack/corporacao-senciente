# Trader Spot Rotation

```yaml
task:
  name: trader-spot-rotation
  agent: binance-trader
  elicit: true
  description: Executar rotacao de carteira spot - vender ativos fracos e comprar ativos fortes
```

## Elicitation

1. **Criterio de rotacao?** [Momentum / RSI / Volume / Custom]
2. **Universo de ativos?** [Top 20 / Watchlist / Custom]
3. **% do portfolio para rotacionar?** [10% / 25% / 50%]

## Workflow

### 1. Rank Assets
- Solicitar ranking do @analyst (momentum, RSI, volume)
- Identificar bottom 3 (candidatos a venda)
- Identificar top 3 (candidatos a compra)

### 2. Validate with Risk
- Consultar @risk-manager sobre impacto no portfolio
- Verificar concentracao pos-rotacao
- Confirmar limites de exposicao

### 3. Execute Rotation
- Vender ativos bottom (market orders)
- Calcular capital liberado
- Comprar ativos top (limit orders ou market)
- Registrar todas as execucoes

### 4. Report
- Ativos vendidos e precos
- Ativos comprados e precos
- Custo total de transacao
- Composicao pos-rotacao

## Codebase References

- Spot strategies: `modules/binance-bot/backend/src/controllers/SpotStrategyController.ts`
- Spot storage: `modules/binance-bot/backend/src/services/SpotStrategyStorageService.ts`
- Spot data: `modules/binance-bot/backend/data/spot-strategies/`
- Logs: `modules/binance-bot/backend/data/LOGS-CICLOS-SPOT/`
