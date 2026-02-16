# Trader Futures Operation

```yaml
task:
  name: trader-futures-operation
  agent: binance-trader
  elicit: true
  description: Operacao em mercado de futuros com alavancagem controlada
```

## Elicitation

1. **Par?** [ex: BTCUSDT]
2. **Direcao?** [LONG / SHORT]
3. **Alavancagem?** [1x / 2x / 3x / 5x]
4. **Tamanho?** [% do capital ou valor USDT]
5. **Stop Loss?** [% do preco de entrada]
6. **Take Profit?** [% do preco de entrada]

## Workflow

### 1. Pre-Flight Check
- [ ] Confirmar alavancagem <= 5x (limite do @risk-manager)
- [ ] Verificar funding rate atual
- [ ] Verificar liquidez no order book
- [ ] Calcular preco de liquidacao
- [ ] Validar margem disponivel

### 2. Risk Assessment
- Calcular loss maximo em USDT
- Verificar impacto no drawdown total
- Confirmar com @risk-manager

### 3. Execute
- Configurar alavancagem no par
- Abrir posicao (market ou limit)
- Configurar stop loss imediatamente
- Configurar take profit
- Registrar execucao

### 4. Monitoring
- Monitorar funding rates (a cada 8h)
- Acompanhar preco de liquidacao
- Ajustar stops conforme necessario

## Codebase References

- Futures analysis: `modules/binance-bot/frontend/src/components/analysis/FuturesAnalysisPanel.tsx`
- Futures positions: `modules/binance-bot/frontend/src/components/positions/FuturesPositionsPanel.tsx`
- Binance API: `modules/binance-bot/backend/src/controllers/BinanceController.ts`
