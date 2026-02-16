# Ops Monitor Triggers

```yaml
task:
  name: ops-monitor-triggers
  agent: binance-ops
  elicit: false
  description: Monitorar status dos triggers ativos e historico de disparos
```

## Workflow

### 1. Active Triggers
- Listar triggers ativos de `triggers.json`
- Para cada trigger: par, condicao, status, ultimo check

### 2. Recent Fires
- Triggers disparados nas ultimas 24h
- Resultado: executado / falhou / cancelado
- Sinais emitidos (`emitted-signals.json`)

### 3. Trigger Monitor Health
- Processo rodando (PM2 status)
- Ultimo heartbeat
- Intervalo de check (default 5s)
- Erros recentes

### 4. Performance
- Tempo medio de deteccao (sinal → trigger)
- Tempo medio de execucao (trigger → ordem)
- Taxa de sucesso
- False positives

## Codebase References

- Trigger monitor: `modules/binance-bot/backend/src/trigger-monitor.ts`
- Trigger service: `modules/binance-bot/backend/src/trigger-binance-service.ts`
- Trigger storage: `modules/binance-bot/backend/src/trigger-storage.ts`
- Trigger logger: `modules/binance-bot/backend/src/trigger-logger.ts`
- Triggers data: `modules/binance-bot/backend/data/triggers.json`
- Signals: `modules/binance-bot/backend/data/emitted-signals.json`
