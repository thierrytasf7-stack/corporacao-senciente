# Risk Evaluate Exposure

```yaml
task:
  name: risk-evaluate-exposure
  agent: binance-risk-manager
  elicit: true
  description: Avaliar risco e exposicao de uma operacao proposta ou do portfolio atual
```

## Elicitation

1. **Avaliar o que?** [Nova operacao / Portfolio atual / Cenario hipotetico]
2. **Se nova operacao:** Par, Lado, Tamanho, Alavancagem

## Workflow

### 1. Current State
- Portfolio total em USDT
- Posicoes abertas e seus tamanhos
- Exposicao por ativo (%)
- Exposicao direcional (long vs short)

### 2. Impact Analysis (se nova operacao)
- Impacto na concentracao por ativo
- Impacto na exposicao direcional
- Alavancagem resultante
- Max loss cenario (stop loss hit)
- Impacto no drawdown se loss

### 3. Risk Metrics
- Position size vs limite (max 10% per trade)
- Portfolio concentration (Herfindahl Index)
- Correlation risk
- Liquidity risk (volume vs position size)
- VaR 95% estimado

### 4. Decision
- APROVADO: Dentro dos limites
- APROVADO COM AJUSTE: Reduzir tamanho/alavancagem
- REJEITADO: Viola limites, motivo especifico

## Codebase References

- Risk configs: `modules/binance-bot/backend/data/strategy-risk-configs.json`
- Alert manager: `modules/binance-bot/backend/src/monitoring/AlertManager.ts`
- Performance monitor: `modules/binance-bot/backend/src/monitoring/PerformanceMonitor.ts`
