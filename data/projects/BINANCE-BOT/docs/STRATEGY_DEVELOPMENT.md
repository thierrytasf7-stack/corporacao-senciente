# Strategy Development Guide
## Corporacao Senciente - BINANCE-BOT

This guide explains how to develop new trading strategies for BINANCE-BOT.

## Base Strategy

All strategies extend `BaseStrategy`:

```typescript
import { BaseStrategy, Candle, Signal, StrategyConfig } from './BaseStrategy';

export class MyStrategy extends BaseStrategy {
  constructor(config?: Partial<StrategyConfig>) {
    super({
      name: 'My Strategy',
      version: '1.0.0',
      enabled: true,
      parameters: {
        // Your parameters here
        ...config?.parameters,
      },
    });
  }

  async analyze(candles: Candle[]): Promise<Signal> {
    // Your analysis logic here
    
    return {
      type: 'BUY' | 'SELL' | 'HOLD',
      confidence: 0.75,
      reason: 'Signal explanation',
      price: currentPrice,
      timestamp: Date.now(),
      metadata: {},
    };
  }
}
```

## Available Technical Indicators

BaseStrategy provides these helper methods:

### Simple Moving Average (SMA)
```typescript
const sma20 = this.calculateSMA(closes, 20);
```

### Exponential Moving Average (EMA)
```typescript
const ema12 = this.calculateEMA(closes, 12);
```

### Relative Strength Index (RSI)
```typescript
const rsi = this.calculateRSI(closes, 14);
```

### MACD
```typescript
const { macd, signal, histogram } = this.calculateMACD(closes);
```

### Bollinger Bands
```typescript
const { upper, middle, lower } = this.calculateBollingerBands(closes, 20, 2);
```

### Average True Range (ATR)
```typescript
const atr = this.calculateATR(candles, 14);
```

## Included Strategies

### 1. RSI Divergence Strategy

Detects bullish and bearish divergences using RSI:

- **Buy Signal**: Price makes lower low, RSI makes higher low (bullish divergence)
- **Sell Signal**: Price makes higher high, RSI makes lower high (bearish divergence)

Parameters:
- `rsiPeriod`: RSI calculation period (default: 14)
- `overbought`: Overbought threshold (default: 70)
- `oversold`: Oversold threshold (default: 30)
- `divergenceLookback`: Bars to check for divergence (default: 5)

### 2. MACD Cross Strategy

Generates signals based on MACD crossovers:

- **Buy Signal**: MACD crosses above signal line
- **Sell Signal**: MACD crosses below signal line

Parameters:
- `fastPeriod`: Fast EMA period (default: 12)
- `slowPeriod`: Slow EMA period (default: 26)
- `signalPeriod`: Signal EMA period (default: 9)
- `trendConfirmation`: Require SMA50 confirmation (default: true)

### 3. Bollinger Breakout Strategy

Two modes: Breakout and Mean Reversion

**Breakout Mode**:
- Buy on price breaking above upper band
- Sell on price breaking below lower band

**Mean Reversion Mode** (default):
- Buy when price touches lower band
- Sell when price touches upper band

Parameters:
- `period`: Bollinger period (default: 20)
- `stdDev`: Standard deviation multiplier (default: 2)
- `breakoutMode`: Use breakout mode (default: false)
- `volumeConfirmation`: Require volume spike (default: true)

## Strategy Combination

Combine multiple strategies for better signals:

```typescript
async function analyzeMultipleStrategies(candles: Candle[]): Promise<Signal> {
  const rsiStrategy = new RSIDivergenceStrategy();
  const macdStrategy = new MACDCrossStrategy();
  const bollingerStrategy = new BollingerBreakoutStrategy();

  const signals = await Promise.all([
    rsiStrategy.analyze(candles),
    macdStrategy.analyze(candles),
    bollingerStrategy.analyze(candles),
  ]);

  // Count votes
  const buyVotes = signals.filter(s => s.type === 'BUY').length;
  const sellVotes = signals.filter(s => s.type === 'SELL').length;

  // Require 2/3 agreement
  if (buyVotes >= 2) {
    return {
      type: 'BUY',
      confidence: signals.filter(s => s.type === 'BUY')
        .reduce((sum, s) => sum + s.confidence, 0) / buyVotes,
      reason: 'Multiple strategy agreement: BUY',
      price: candles[candles.length - 1].close,
      timestamp: Date.now(),
    };
  }

  if (sellVotes >= 2) {
    return {
      type: 'SELL',
      confidence: signals.filter(s => s.type === 'SELL')
        .reduce((sum, s) => sum + s.confidence, 0) / sellVotes,
      reason: 'Multiple strategy agreement: SELL',
      price: candles[candles.length - 1].close,
      timestamp: Date.now(),
    };
  }

  return {
    type: 'HOLD',
    confidence: 0.5,
    reason: 'No strategy agreement',
    price: candles[candles.length - 1].close,
    timestamp: Date.now(),
  };
}
```

## Corporate Will Integration

All strategies should respect Corporate Will:

```typescript
async function executeStrategySignal(
  signal: Signal,
  adapter: CorporacaoAdapter
): Promise<void> {
  if (signal.type === 'HOLD') return;

  // Request approval
  const approval = await adapter.requestTradeApproval({
    symbol: 'BTCUSDT',
    side: signal.type,
    quantity: calculateQuantity(signal),
    price: signal.price,
    leverage: 5,
    strategyName: signal.metadata?.strategyName || 'Unknown',
    confidence: signal.confidence,
    stopLoss: calculateStopLoss(signal),
    takeProfit: calculateTakeProfit(signal),
  });

  if (!approval.approved) {
    // Store rejection for learning
    await adapter.storeMemory({
      content: `Signal rejected: ${signal.type} - ${approval.reason}`,
      memoryType: 'letta',
      priority: 'medium',
      metadata: { signal, approval },
    });
    return;
  }

  // Execute trade...
}
```

## Backtesting

Test your strategy before live trading:

```typescript
async function backtest(
  strategy: BaseStrategy,
  historicalCandles: Candle[],
  initialBalance: number = 10000
): Promise<{
  trades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
}> {
  let balance = initialBalance;
  let peakBalance = initialBalance;
  let maxDrawdown = 0;
  let trades = 0;
  let wins = 0;
  let position: { side: 'BUY' | 'SELL'; price: number } | null = null;

  for (let i = 50; i < historicalCandles.length; i++) {
    const windowCandles = historicalCandles.slice(0, i + 1);
    const signal = await strategy.analyze(windowCandles);
    const currentPrice = windowCandles[windowCandles.length - 1].close;

    // Close position on opposite signal
    if (position && signal.type !== 'HOLD' && signal.type !== position.side) {
      const pnl = position.side === 'BUY'
        ? currentPrice - position.price
        : position.price - currentPrice;
      
      balance += pnl;
      trades++;
      if (pnl > 0) wins++;
      
      position = null;
    }

    // Open new position
    if (!position && signal.type !== 'HOLD' && signal.confidence >= 0.6) {
      position = { side: signal.type, price: currentPrice };
    }

    // Track drawdown
    if (balance > peakBalance) peakBalance = balance;
    const drawdown = (peakBalance - balance) / peakBalance * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  return {
    trades,
    winRate: trades > 0 ? (wins / trades) * 100 : 0,
    totalPnL: balance - initialBalance,
    maxDrawdown,
  };
}
```

## Best Practices

1. **Always use stop-loss and take-profit**
2. **Test on testnet before mainnet**
3. **Start with conservative parameters**
4. **Monitor strategy performance continuously**
5. **Respect Corporate Will decisions**
6. **Store trade memories for learning**
7. **Combine multiple indicators for confirmation**
8. **Consider market conditions (trending vs ranging)**

## Risk Management Integration

Always validate through RiskManagementService:

```typescript
const riskService = createRiskManagementService(tradingService);

const validation = await riskService.validateTrade(
  'BTCUSDT',
  signal.type,
  quantity,
  price,
  leverage
);

if (!validation.valid) {
  console.log('Trade rejected:', validation.reasons);
  return;
}

if (validation.warnings.length > 0) {
  console.log('Warnings:', validation.warnings);
}

// Use adjusted parameters if provided
const finalQuantity = validation.adjustedParams?.quantity || quantity;
```

## Creating New Strategies

1. Extend `BaseStrategy`
2. Implement `analyze()` method
3. Return proper `Signal` object
4. Add to `strategies/index.ts`
5. Write tests
6. Backtest with historical data
7. Test on testnet
8. Deploy to production with monitoring
