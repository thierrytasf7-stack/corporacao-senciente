# Analyst Sentiment Analysis

```yaml
task:
  name: analyst-sentiment-analysis
  agent: binance-analyst
  elicit: false
  description: Analise de sentimento do mercado crypto usando multiplas fontes de dados
```

## Workflow

### 1. On-Chain Metrics
- Funding rates (positivo/negativo)
- Long/Short ratio
- Open Interest (crescendo/diminuindo)
- Liquidacoes recentes (longs vs shorts)

### 2. Market Sentiment Indicators
- Fear & Greed Index
- BTC dominance trend
- Altcoin Season Index
- Stablecoin market cap trend

### 3. Volume Analysis
- Volume vs media historica
- Buy volume vs sell volume
- Volume em breakouts/breakdowns
- Whale transactions (se disponivel)

### 4. Sentiment Score
- Compilar score de 0-100
- 0-20: Extreme Fear (oportunidade de compra?)
- 20-40: Fear
- 40-60: Neutral
- 60-80: Greed
- 80-100: Extreme Greed (oportunidade de venda?)

### 5. Recommendation
- Alinhamento sentimento vs tendencia tecnica
- Contrarian signals (extreme readings)
- Impacto na estrategia atual

## Codebase References

- Analysis service: `modules/binance-bot/frontend/src/services/realAnalysisService.ts`
- Market data: `modules/binance-bot/backend/src/routes/binanceMarkets.ts`
