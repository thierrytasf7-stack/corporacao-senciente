# Trader Manage Positions

```yaml
task:
  name: trader-manage-positions
  agent: binance-trader
  elicit: false
  description: Revisar e gerenciar todas as posicoes abertas - ajustar stops, TPs e fechar posicoes
```

## Workflow

### 1. List Open Positions
- Consultar posicoes abertas na Binance (spot + futures)
- Para cada posicao mostrar: par, lado, tamanho, preco entrada, PnL atual, stop loss, take profit

### 2. Position Analysis
- Identificar posicoes em lucro vs prejuizo
- Verificar se stops estao adequados ao movimento atual
- Calcular R-Multiple de cada posicao
- Verificar tempo aberto vs estrategia (scalping nao deve ficar dias)

### 3. Actions Available
- **Trailing Stop**: Ajustar stop para proteger lucro
- **Partial Close**: Fechar parte da posicao (lock profit)
- **Move TP**: Ajustar take profit baseado em nova analise
- **Close**: Fechar posicao inteira
- **Scale In**: Adicionar a posicao (com validacao de risco)

### 4. Report
- Resumo das acoes tomadas
- PnL realizado
- Posicoes mantidas e motivo

## Codebase References

- Positions: `modules/binance-bot/backend/src/services/PositionStorageService.ts`
- Position monitor: `modules/binance-bot/backend/src/routes/positionMonitor.ts`
- Frontend: `modules/binance-bot/frontend/src/components/positions/`
