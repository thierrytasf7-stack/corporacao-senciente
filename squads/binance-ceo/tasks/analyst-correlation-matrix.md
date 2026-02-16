# Analyst Correlation Matrix

```yaml
task:
  name: analyst-correlation-matrix
  agent: binance-analyst
  elicit: true
  description: Matriz de correlacao entre ativos para diversificacao e gestao de risco
```

## Elicitation

1. **Ativos?** [Portfolio atual / Watchlist / Custom list]
2. **Periodo?** [30d / 90d / 180d / 1y]
3. **Timeframe?** [1h / 4h / 1d]

## Workflow

### 1. Data Collection
- Coletar precos de fechamento dos ativos selecionados
- Calcular retornos logaritmicos

### 2. Correlation Matrix
- Calcular correlacao de Pearson entre todos os pares
- Identificar pares altamente correlacionados (>0.7)
- Identificar pares negativamente correlacionados (<-0.3)
- Identificar ativos descorrelacionados (±0.3)

### 3. Risk Implications
- Concentracao de risco por correlacao
- Sugestoes de diversificacao
- Pares para hedge

### 4. Output
- Matriz visual de correlacao
- Alertas de concentracao
- Recomendacoes

## Codebase References

- Market data: `modules/binance-bot/backend/src/controllers/BinanceMarketsController.ts`
- Analysis: `modules/binance-bot/backend/src/controllers/RealRotativeAnalysisController.ts`
