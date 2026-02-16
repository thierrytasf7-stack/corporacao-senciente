# Trader Execute Order

```yaml
task:
  name: trader-execute-order
  agent: binance-trader
  elicit: true
  description: Executar ordem de compra ou venda na Binance com validacao de risco
```

## Elicitation

1. **Par?** [ex: BTCUSDT]
2. **Lado?** [BUY / SELL]
3. **Tipo de ordem?** [MARKET / LIMIT / STOP-LIMIT]
4. **Quantidade?** [Valor em USDT ou quantidade do ativo]
5. **Preco?** [Se LIMIT - preco desejado]
6. **Stop Loss?** [% ou preco absoluto]
7. **Take Profit?** [% ou preco absoluto]

## Workflow

### 1. Pre-Trade Validation
- [ ] Verificar saldo disponivel
- [ ] Confirmar par existe e esta ativo na Binance
- [ ] Verificar spread atual (rejeitar se > 0.5%)
- [ ] Validar com @risk-manager (limites de posicao)
- [ ] Confirmar stop loss definido

### 2. Order Execution
- Construir payload da ordem
- Enviar para Binance API
- Aguardar confirmacao (fill)
- Logar execucao com timestamp

### 3. Post-Trade
- Confirmar fill completo ou parcial
- Registrar preco medio de execucao
- Calcular slippage vs preco esperado
- Configurar stop loss e take profit
- Notificar CEO do resultado

## Codebase References

- BinanceController: `modules/binance-bot/backend/src/controllers/BinanceController.ts`
- ExecutionEngine: `modules/binance-bot/backend/src/services/ExecutionEngineService.ts`
- Routes: `modules/binance-bot/backend/src/routes/binance.ts`
- Sell routes: `modules/binance-bot/backend/src/routes/sell.ts`
