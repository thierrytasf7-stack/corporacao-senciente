# CEO Daily Briefing

```yaml
task:
  name: ceo-daily-briefing
  agent: binance-ceo
  elicit: false
  description: Briefing diario do CEO - visao geral do portfolio, mercado e operacoes
```

## Workflow

### 1. Portfolio Status
- Ler saldo total da conta Binance via API
- Listar posicoes abertas (spot + futures)
- Calcular PnL do dia anterior
- Calcular PnL acumulado do mes

### 2. Market Overview
- BTC dominance e tendencia
- Top 5 pares do watchlist - preco e variacao 24h
- Volume total do mercado
- Fear & Greed index (se disponivel)

### 3. Operations Status
- Trades executados nas ultimas 24h
- Estrategias ativas e sua performance
- Triggers disparados
- Alertas pendentes

### 4. Risk Dashboard
- Drawdown atual (diario, semanal, mensal)
- Exposicao por ativo
- Alavancagem total (se usando futures)
- Proximidade dos limites de risco

### 5. Action Items
- Decisoes pendentes para o CEO
- Sinais aguardando aprovacao
- Estrategias para revisar
- Rebalanceamento necessario?

## Output Format

```
📊 BRIEFING DIÁRIO - {data}
══════════════════════════════════

💰 PORTFOLIO
   Saldo Total: $X,XXX.XX
   PnL Dia: +/- X.XX% ($XX.XX)
   PnL Mês: +/- X.XX% ($XX.XX)
   Posições Abertas: X

📈 MERCADO
   BTC: $XX,XXX (+/- X.XX%)
   Dominância BTC: XX.X%
   Sentimento: [Medo/Neutro/Ganância]

⚡ OPERAÇÕES (24h)
   Trades: X (W:X / L:X)
   Win Rate: XX%
   Estratégias Ativas: X

🛡️ RISCO
   Drawdown Dia: X.XX%
   Exposição Máx: XX% ({ativo})
   Status: [OK/ALERTA/CRÍTICO]

📋 AÇÕES PENDENTES
   - [item 1]
   - [item 2]
```

## Codebase References

- Account info: `modules/binance-bot/backend/src/controllers/BinanceController.ts`
- Positions: `modules/binance-bot/backend/src/routes/positionMonitor.ts`
- Strategies: `modules/binance-bot/backend/data/trading-strategies.json`
- Monitoring: `modules/binance-bot/backend/src/monitoring/`
