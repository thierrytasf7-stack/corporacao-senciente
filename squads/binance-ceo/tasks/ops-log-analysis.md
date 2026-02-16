# Ops Log Analysis

```yaml
task:
  name: ops-log-analysis
  agent: binance-ops
  elicit: true
  description: Analise de logs do sistema para deteccao de problemas e anomalias
```

## Elicitation

1. **Periodo?** [1h / 6h / 24h / 7d]
2. **Foco?** [Erros / Trades / Triggers / Todos]
3. **Componente?** [Backend / Frontend / Trigger / PM2 / Todos]

## Workflow

### 1. Error Analysis
- Contar erros por tipo
- Erros repetidos (padrao)
- Stack traces relevantes
- Erros criticos vs warnings

### 2. Trade Logs
- Trades executados no periodo
- Trades falhados e motivo
- Latencia de execucao
- Slippage observado

### 3. Trigger Logs
- Triggers disparados
- False positives
- Missed signals
- Tempo de resposta

### 4. System Logs
- PM2 restarts
- Memory warnings
- Connection drops
- Rate limit hits

### 5. Report
- Resumo de saude
- Issues encontrados (prioritizados)
- Acoes recomendadas

## Codebase References

- Logs route: `modules/binance-bot/backend/src/routes/logs.ts`
- Log viewer: `modules/binance-bot/frontend/src/components/common/LogViewer.tsx`
- Spot cycle logs: `modules/binance-bot/backend/data/LOGS-CICLOS-SPOT/`
- Execution logs: `modules/binance-bot/backend/data/LOGS-EXECUCOES-SPOT/`
- Trigger logger: `modules/binance-bot/backend/src/trigger-logger.ts`
