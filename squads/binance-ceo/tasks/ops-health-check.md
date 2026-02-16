# Ops Health Check

```yaml
task:
  name: ops-health-check
  agent: binance-ops
  elicit: false
  description: Health check completo de todos os componentes do sistema de trading
```

## Workflow

### 1. Backend API (port 21341)
- [ ] HTTP ping: GET /api/health
- [ ] Response time < 200ms
- [ ] Error rate < 1%

### 2. Frontend (port 21340)
- [ ] HTTP ping: GET /
- [ ] Build status OK
- [ ] WebSocket connected

### 3. Binance API
- [ ] Ping: GET /api/v3/ping
- [ ] Server time sync (diff < 1000ms)
- [ ] Rate limits: requests used / total
- [ ] API key valid

### 4. Database (PostgreSQL)
- [ ] Connection active
- [ ] Query response < 100ms
- [ ] Tables exist (User, Strategy, Trade)
- [ ] Disk usage OK

### 5. Trigger Monitor
- [ ] Process running (PM2 status)
- [ ] Last heartbeat < 30s ago
- [ ] Active triggers count
- [ ] Error count in last 1h

### 6. WebSocket
- [ ] Connection to Binance streams
- [ ] Messages received in last 60s
- [ ] Reconnection count

### 7. PM2 Processes
- [ ] All expected processes running
- [ ] Memory usage within limits
- [ ] No restart loops

## Output Format

```
📡 HEALTH CHECK - {data} {hora}
══════════════════════════════

Component          Status    Latency    Details
─────────────────────────────────────────────
Backend API        ✅ OK     45ms       21341
Frontend           ✅ OK     120ms      21340
Binance API        ✅ OK     89ms       Rate: 45/1200
PostgreSQL         ✅ OK     12ms       Connected
Trigger Monitor    ✅ OK     -          5 active
WebSocket          ✅ OK     -          3 streams
PM2 Processes      ✅ OK     -          5/5 running

Overall: ✅ ALL SYSTEMS OPERATIONAL
```

## Codebase References

- Health checker: `modules/binance-bot/backend/src/monitoring/HealthChecker.ts`
- System monitor: `modules/binance-bot/backend/src/monitoring/SystemMonitor.ts`
- Metrics: `modules/binance-bot/backend/src/monitoring/MetricsCollector.ts`
- Monitoring routes: `modules/binance-bot/backend/src/routes/monitoring.ts`
