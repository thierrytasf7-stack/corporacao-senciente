# Analyst Market Scan

```yaml
task:
  name: analyst-market-scan
  agent: binance-analyst
  elicit: false
  description: Scan completo do mercado crypto - top movers, volume, tendencias e oportunidades
```

## Workflow

### 1. Market Overview
- BTC preco, variacao 24h, volume
- ETH preco, variacao 24h, volume
- BTC dominance
- Total market cap
- Altcoin season index

### 2. Top Movers (24h)
- Top 5 gainers (com volume significativo)
- Top 5 losers
- Top 5 volume

### 3. Watchlist Analysis
Para cada par no watchlist:
- Preco atual e variacao
- Tendencia (EMA 20 vs EMA 50)
- RSI (14) - oversold/overbought
- Volume vs media 20 periodos
- Suporte/resistencia mais proximo

### 4. Opportunity Detection
- Pares com RSI < 30 (oversold)
- Pares com breakout de volume
- Pares testando suporte/resistencia chave
- Divergencias bullish/bearish

### 5. Signals
- Gerar sinais com nivel de confianca
- Classificar: STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL
- Incluir timeframe recomendado

## Output Format

```
🔍 MARKET SCAN - {data} {hora}
══════════════════════════════

📊 OVERVIEW
   BTC: $XX,XXX (+X.X%) | Dom: XX.X%
   ETH: $X,XXX (+X.X%)
   MCap: $X.XXT

🚀 TOP MOVERS 24h
   ↑ {PAR}: +XX.X% (Vol: $XXM)
   ↓ {PAR}: -XX.X% (Vol: $XXM)

📋 WATCHLIST
   {PAR} | $XX.XX | RSI: XX | Trend: ↑/↓/→

💡 OPORTUNIDADES
   ⚡ {PAR}: {motivo} | Confiança: XX%
```

## Codebase References

- Technical indicators: `modules/binance-bot/backend/src/trading/indicators/TechnicalIndicators.ts`
- Analysis controllers: `modules/binance-bot/backend/src/controllers/RealRotativeAnalysisController.ts`
- Market data: `modules/binance-bot/backend/src/controllers/BinanceMarketsController.ts`
- Frontend analysis: `modules/binance-bot/frontend/src/components/analysis/`
