# BINANCE-BOT Integration Guide
## Corporacao Senciente - Industry 7.0

This guide explains how BINANCE-BOT integrates with the Corporacao Senciente ecosystem for autonomous trading.

## Architecture Overview

```
                    ┌─────────────────────────────┐
                    │   Corporacao Senciente      │
                    │   (Main Orchestrator)       │
                    └─────────────┬───────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Corporate Will  │    │ Sensory Feedback │    │  L.L.B. Protocol │
│  (Decisions)     │    │ (Adaptation)     │    │  (Memory)        │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │   CorporacaoAdapter         │
                    │   (Integration Layer)       │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │      BINANCE-BOT            │
                    │   ┌─────────────────────┐   │
                    │   │  TradingAgent       │   │
                    │   ├─────────────────────┤   │
                    │   │  FuturesTradingService │
                    │   ├─────────────────────┤   │
                    │   │  RiskManagement     │   │
                    │   ├─────────────────────┤   │
                    │   │  Strategies         │   │
                    │   │  - RSI Divergence   │   │
                    │   │  - MACD Cross       │   │
                    │   │  - Bollinger        │   │
                    │   └─────────────────────┘   │
                    └─────────────────────────────┘
```

## Integration Components

### 1. Corporate Will Integration

All trades above the threshold require Corporate Will approval:

```typescript
const adapter = getCorporacaoAdapter();

const approval = await adapter.requestTradeApproval({
  symbol: 'BTCUSDT',
  side: 'BUY',
  quantity: 0.01,
  price: 45000,
  leverage: 5,
  strategyName: 'RSI Divergence',
  confidence: 0.75,
  stopLoss: 44100,
  takeProfit: 46350,
});

if (approval.approved) {
  // Execute trade
} else {
  console.log(`Trade rejected: ${approval.reason}`);
}
```

### 2. Sensory Feedback Integration

Market data and trade results are sent as sensory feedback:

```typescript
await adapter.sendSensoryFeedback({
  type: 'trade_result',
  content: {
    symbol: 'BTCUSDT',
    side: 'BUY',
    success: true,
    pnl: 150.00,
  },
  sentimentScore: 0.7,
  timestamp: Date.now(),
});
```

### 3. L.L.B. Protocol Integration

Trade memories are stored for learning:

```typescript
// Store trade memory
await adapter.storeMemory({
  content: 'BTC RSI divergence at 28 led to 5% gain',
  memoryType: 'lang',
  priority: 'high',
  metadata: {
    symbol: 'BTCUSDT',
    strategy: 'RSI Divergence',
    outcome: 'profit',
  },
});

// Retrieve wisdom
const wisdom = await adapter.getTradingWisdom('BTCUSDT');
```

## Configuration

### Environment Variables

```env
# Corporacao Integration
CORPORACAO_BASE_URL=http://localhost:8000
CORPORACAO_AGENT_ID=binance-bot-trading-agent

# Binance API
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
BINANCE_USE_TESTNET=true

# Risk Parameters
RISK_MAX_POSITION_SIZE_PERCENT=5
RISK_STOP_LOSS_PERCENT=2
RISK_TAKE_PROFIT_PERCENT=6
RISK_MAX_DAILY_LOSS_PERCENT=10
RISK_MAX_LEVERAGE=20
```

## Trade Flow

1. **Strategy Signal**: A strategy generates a BUY/SELL signal
2. **Risk Assessment**: RiskManagementService validates the trade
3. **Corporate Will**: Trade is submitted for approval
4. **Execution**: If approved, trade is executed
5. **Memory Storage**: Result is stored in L.L.B.
6. **Sensory Feedback**: System adapts based on outcome

## Safety Features

### Fail-Safe Mechanisms

- **Corporate Will unavailable**: Trades are denied
- **High threat level**: Trading is paused
- **Daily loss limit**: No new trades after limit
- **Emergency close**: All positions can be closed instantly

### Ethical Boundaries

Corporate Will enforces:
- No market manipulation
- No illegal activities
- Privacy protection
- Sustainable practices

## MCP Integration

Use the MCPs for Cursor IDE integration:

```json
{
  "trading-mcp": {
    "command": "node",
    "args": ["mcp/trading-mcp/dist/index.js"]
  },
  "corporate-will-mcp": {
    "command": "node",
    "args": ["mcp/corporate-will-mcp/dist/index.js"]
  }
}
```

## Testing

### Testnet Mode

Always test on Binance Testnet first:

```typescript
const tradingService = createFuturesTradingService(
  apiKey,
  secretKey,
  true // isTestnet
);
```

### Validation Script

```bash
python scripts/test_trading_integration.py
```

## Monitoring

### Performance Metrics

```typescript
const agent = createTradingAgent();
const stats = agent.getPerformanceStats();

console.log(`Win Rate: ${stats.win_rate}%`);
console.log(`Daily P&L: $${stats.daily_pnl}`);
console.log(`Active Positions: ${stats.active_positions}`);
```

### Risk Metrics

```typescript
const riskService = createRiskManagementService(tradingService);
const metrics = await riskService.calculateRiskMetrics();

console.log(`Drawdown: ${metrics.currentDrawdown}%`);
console.log(`Risk Score: ${metrics.riskScore}`);
```

## Troubleshooting

### Common Issues

1. **Trade rejected by Corporate Will**
   - Check risk level
   - Verify ethical compliance
   - Check preservation status

2. **Connection errors**
   - Verify Corporacao services are running
   - Check network connectivity
   - Verify API endpoints

3. **Memory storage fails**
   - Check L.L.B. service status
   - Verify agent ID configuration

## Support

For issues, check:
- `backend/logs/` for trading logs
- Corporate Will decision history
- L.L.B. memory store
