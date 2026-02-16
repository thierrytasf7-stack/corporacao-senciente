# Ops API Status

```yaml
task:
  name: ops-api-status
  agent: binance-ops
  elicit: false
  description: Status detalhado da conexao com a API da Binance
```

## Workflow

### 1. Connectivity
- Ping Binance API (REST)
- Ping Binance WebSocket
- Server time synchronization
- Testnet vs Production mode

### 2. Rate Limits
- Requests used in current window
- Weight used vs limit (1200/min)
- Order rate limit status
- Time until window reset

### 3. API Key Status
- Key permissions (read, trade, withdraw)
- IP whitelist status
- Key creation date
- Last trade via API

### 4. Latency
- REST API average latency (last 100 requests)
- WebSocket message delay
- Order execution latency
- Data feed freshness

### 5. Alerts
- Rate limit > 80%: WARNING
- Rate limit > 95%: CRITICAL - pausar requests
- Latency > 500ms: WARNING
- Connection lost: CRITICAL

## Codebase References

- Config loader: `modules/binance-bot/backend/src/config/ConfigLoader.ts`
- Rate limiter: `modules/binance-bot/backend/src/middleware/rateLimiter.ts`
- Binance service: `modules/binance-bot/backend/src/services/BinanceApiService.ts` (frontend)
- Connection test: `modules/binance-bot/backend/src/scripts/testBinanceConnection.ts`
