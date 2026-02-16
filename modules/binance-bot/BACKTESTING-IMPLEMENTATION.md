# 🔧 IMPLEMENTAÇÃO TÉCNICA - BACKTESTING ENGINE

---

## 1. BACKTESTER BASE

```typescript
// BINANCE-BOT/backend/src/trading/backtester/BacktestEngine.ts

import { Strategy } from '../strategies/BaseStrategy';
import { HistoricalDataLoader } from './HistoricalDataLoader';
import { MetricsCalculator } from './MetricsCalculator';

export interface BacktestResult {
  strategy_id: string;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  profit_factor: number;
  recovery_factor: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  avg_win: number;
  avg_loss: number;
  trades: Trade[];
  equity_curve: EquityPoint[];
}

export class BacktestEngine {
  private dataLoader: HistoricalDataLoader;
  private metricsCalculator: MetricsCalculator;

  async runBacktest(
    strategy: Strategy,
    symbol: string,
    startDate: Date,
    endDate: Date,
    initialCapital: number = 10000
  ): Promise<BacktestResult> {
    // 1. Carregar dados históricos
    const historicalData = await this.dataLoader.load(
      symbol,
      startDate,
      endDate
    );

    // 2. Executar estratégia
    const trades = this.executeStrategy(
      strategy,
      historicalData,
      initialCapital
    );

    // 3. Calcular métricas
    const metrics = this.metricsCalculator.calculate(
      trades,
      historicalData,
      initialCapital
    );

    return {
      strategy_id: strategy.id,
      ...metrics,
      trades,
      equity_curve: this.calculateEquityCurve(trades, initialCapital)
    };
  }

  private executeStrategy(
    strategy: Strategy,
    data: Candle[],
    initialCapital: number
  ): Trade[] {
    const trades: Trade[] = [];
    let position: Position | null = null;
    let capital = initialCapital;

    for (let i = 0; i < data.length; i++) {
      const candle = data[i];
      const signal = strategy.analyze(data.slice(0, i + 1));

      if (signal === 'BUY' && !position) {
        // Abrir posição
        position = {
          entry_price: candle.close,
          entry_time: candle.time,
          quantity: capital / candle.close,
          type: 'LONG'
        };
      } else if (signal === 'SELL' && position) {
        // Fechar posição
        const trade: Trade = {
          entry_price: position.entry_price,
          exit_price: candle.close,
          entry_time: position.entry_time,
          exit_time: candle.time,
          quantity: position.quantity,
          profit: (candle.close - position.entry_price) * position.quantity,
          profit_pct: (candle.close - position.entry_price) / position.entry_price,
          type: position.type
        };

        trades.push(trade);
        capital += trade.profit;
        position = null;
      }
    }

    return trades;
  }

  private calculateEquityCurve(
    trades: Trade[],
    initialCapital: number
  ): EquityPoint[] {
    const curve: EquityPoint[] = [];
    let equity = initialCapital;

    for (const trade of trades) {
      equity += trade.profit;
      curve.push({
        time: trade.exit_time,
        equity,
        drawdown: this.calculateDrawdown(curve, equity)
      });
    }

    return curve;
  }

  private calculateDrawdown(curve: EquityPoint[], currentEquity: number): number {
    if (curve.length === 0) return 0;
    const peak = Math.max(...curve.map(p => p.equity));
    return (peak - currentEquity) / peak;
  }
}
```

---

## 2. METRICS CALCULATOR

```typescript
// BINANCE-BOT/backend/src/trading/backtester/MetricsCalculator.ts

export class MetricsCalculator {
  calculate(
    trades: Trade[],
    historicalData: Candle[],
    initialCapital: number
  ): BacktestMetrics {
    const finalCapital = this.calculateFinalCapital(trades, initialCapital);
    const returns = this.calculateReturns(trades, initialCapital);
    const drawdowns = this.calculateDrawdowns(trades, initialCapital);

    return {
      total_return: (finalCapital - initialCapital) / initialCapital,
      sharpe_ratio: this.calculateSharpeRatio(returns),
      max_drawdown: Math.max(...drawdowns),
      win_rate: this.calculateWinRate(trades),
      profit_factor: this.calculateProfitFactor(trades),
      recovery_factor: this.calculateRecoveryFactor(trades, drawdowns),
      total_trades: trades.length,
      winning_trades: trades.filter(t => t.profit > 0).length,
      losing_trades: trades.filter(t => t.profit < 0).length,
      avg_win: this.calculateAverageWin(trades),
      avg_loss: this.calculateAverageLoss(trades)
    };
  }

  private calculateSharpeRatio(returns: number[]): number {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const riskFreeRate = 0.02 / 252; // 2% anual, 252 dias de trading

    return (mean - riskFreeRate) / stdDev * Math.sqrt(252);
  }

  private calculateWinRate(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    const winners = trades.filter(t => t.profit > 0).length;
    return winners / trades.length;
  }

  private calculateProfitFactor(trades: Trade[]): number {
    const totalWins = trades
      .filter(t => t.profit > 0)
      .reduce((sum, t) => sum + t.profit, 0);
    const totalLosses = Math.abs(
      trades
        .filter(t => t.profit < 0)
        .reduce((sum, t) => sum + t.profit, 0)
    );

    return totalLosses === 0 ? 0 : totalWins / totalLosses;
  }

  private calculateRecoveryFactor(trades: Trade[], drawdowns: number[]): number {
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
    const maxDrawdown = Math.max(...drawdowns);
    return maxDrawdown === 0 ? 0 : totalProfit / maxDrawdown;
  }

  private calculateAverageWin(trades: Trade[]): number {
    const wins = trades.filter(t => t.profit > 0);
    if (wins.length === 0) return 0;
    return wins.reduce((sum, t) => sum + t.profit, 0) / wins.length;
  }

  private calculateAverageLoss(trades: Trade[]): number {
    const losses = trades.filter(t => t.profit < 0);
    if (losses.length === 0) return 0;
    return losses.reduce((sum, t) => sum + t.profit, 0) / losses.length;
  }
}
```

---

## 3. APPROVAL ENGINE

```typescript
// BINANCE-BOT/backend/src/trading/approval/ApprovalEngine.ts

export interface ApprovalCriteria {
  backtest: {
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    profit_factor: number;
    recovery_factor: number;
    min_trades: number;
  };
  testnet: {
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    profit_factor: number;
    duration_days: number;
  };
  consistency: {
    backtest_vs_testnet_variance: number;
    monthly_consistency: number;
  };
}

export class ApprovalEngine {
  private criteria: ApprovalCriteria = {
    backtest: {
      sharpe_ratio: 1.5,
      max_drawdown: 0.10,
      win_rate: 0.55,
      profit_factor: 1.5,
      recovery_factor: 2.0,
      min_trades: 100
    },
    testnet: {
      sharpe_ratio: 1.2,
      max_drawdown: 0.15,
      win_rate: 0.52,
      profit_factor: 1.3,
      duration_days: 30
    },
    consistency: {
      backtest_vs_testnet_variance: 0.2,
      monthly_consistency: 0.8
    }
  };

  approveForTestnet(backtest: BacktestResult): ApprovalDecision {
    const checks = {
      sharpe: backtest.sharpe_ratio >= this.criteria.backtest.sharpe_ratio,
      drawdown: backtest.max_drawdown <= this.criteria.backtest.max_drawdown,
      win_rate: backtest.win_rate >= this.criteria.backtest.win_rate,
      profit_factor: backtest.profit_factor >= this.criteria.backtest.profit_factor,
      recovery: backtest.recovery_factor >= this.criteria.backtest.recovery_factor,
      min_trades: backtest.total_trades >= this.criteria.backtest.min_trades
    };

    const approved = Object.values(checks).every(v => v);

    return {
      approved,
      checks,
      reason: approved
        ? 'Estratégia aprovada para testnet'
        : `Falhou em: ${Object.entries(checks)
            .filter(([_, v]) => !v)
            .map(([k]) => k)
            .join(', ')}`
    };
  }

  approveForRealMoney(
    backtest: BacktestResult,
    testnet: BacktestResult
  ): ApprovalDecision {
    const checks = {
      testnet_sharpe: testnet.sharpe_ratio >= this.criteria.testnet.sharpe_ratio,
      testnet_drawdown: testnet.max_drawdown <= this.criteria.testnet.max_drawdown,
      testnet_win_rate: testnet.win_rate >= this.criteria.testnet.win_rate,
      testnet_profit_factor: testnet.profit_factor >= this.criteria.testnet.profit_factor,
      consistency: this.checkConsistency(backtest, testnet)
    };

    const approved = Object.values(checks).every(v => v);

    return {
      approved,
      checks,
      reason: approved
        ? 'Estratégia aprovada para real money'
        : `Falhou em: ${Object.entries(checks)
            .filter(([_, v]) => !v)
            .map(([k]) => k)
            .join(', ')}`
    };
  }

  private checkConsistency(backtest: BacktestResult, testnet: BacktestResult): boolean {
    const variance = Math.abs(backtest.sharpe_ratio - testnet.sharpe_ratio) / backtest.sharpe_ratio;
    return variance <= this.criteria.consistency.backtest_vs_testnet_variance;
  }
}
```

---

## 4. TESTNET TRADER

```typescript
// BINANCE-BOT/backend/src/trading/testnet/TestnetTrader.ts

export class TestnetTrader {
  private binanceClient: BinanceClient;
  private metricsCollector: LiveMetricsCollector;

  async runTestnet(
    strategy: Strategy,
    symbol: string,
    durationDays: number = 30,
    paperCapital: number = 10000
  ): Promise<TestnetResult> {
    const startTime = Date.now();
    const endTime = startTime + durationDays * 24 * 60 * 60 * 1000;
    const trades: Trade[] = [];
    let position: Position | null = null;
    let capital = paperCapital;

    // Executar por 30 dias
    while (Date.now() < endTime) {
      const candles = await this.binanceClient.getLatestCandles(symbol, 100);
      const signal = strategy.analyze(candles);

      if (signal === 'BUY' && !position) {
        position = {
          entry_price: candles[candles.length - 1].close,
          entry_time: new Date(),
          quantity: capital / candles[candles.length - 1].close,
          type: 'LONG'
        };
      } else if (signal === 'SELL' && position) {
        const trade: Trade = {
          entry_price: position.entry_price,
          exit_price: candles[candles.length - 1].close,
          entry_time: position.entry_time,
          exit_time: new Date(),
          quantity: position.quantity,
          profit: (candles[candles.length - 1].close - position.entry_price) * position.quantity,
          profit_pct: (candles[candles.length - 1].close - position.entry_price) / position.entry_price,
          type: position.type
        };

        trades.push(trade);
        capital += trade.profit;
        position = null;

        // Coletar métricas
        await this.metricsCollector.record(trade);
      }

      // Aguardar próximo candle
      await this.sleep(60000); // 1 minuto
    }

    // Calcular métricas finais
    const metrics = this.metricsCollector.getMetrics();

    return {
      strategy_id: strategy.id,
      duration_days: durationDays,
      total_trades: trades.length,
      final_capital: capital,
      total_return: (capital - paperCapital) / paperCapital,
      ...metrics,
      trades
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 5. RISK MANAGER

```typescript
// BINANCE-BOT/backend/src/trading/risk/RiskManager.ts

export class RiskManager {
  calculatePositionSize(
    accountBalance: number,
    strategyMetrics: BacktestResult,
    riskPercentage: number = 0.01
  ): PositionSizing {
    // Kelly Criterion
    const winRate = strategyMetrics.win_rate;
    const avgWin = strategyMetrics.avg_win;
    const avgLoss = Math.abs(strategyMetrics.avg_loss);

    const kellyFraction = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;

    // Aplicar fração de Kelly (mais conservador)
    const conservativeKelly = kellyFraction * 0.25; // 25% do Kelly

    // Calcular tamanho da posição
    const maxRiskPerTrade = accountBalance * riskPercentage;
    const positionSize = maxRiskPerTrade / avgLoss;

    return {
      position_size: positionSize,
      kelly_fraction: kellyFraction,
      conservative_kelly: conservativeKelly,
      max_risk_per_trade: maxRiskPerTrade,
      max_daily_loss: maxRiskPerTrade * 5,
      max_account_drawdown: accountBalance * 0.20
    };
  }

  validateRisk(
    position: Position,
    currentPrice: number,
    accountBalance: number,
    maxDrawdown: number = 0.20
  ): RiskValidation {
    const unrealizedLoss = (currentPrice - position.entry_price) * position.quantity;
    const drawdownPercent = Math.abs(unrealizedLoss) / accountBalance;

    return {
      is_safe: drawdownPercent <= maxDrawdown,
      current_drawdown: drawdownPercent,
      max_allowed_drawdown: maxDrawdown,
      unrealized_loss: unrealizedLoss,
      should_close: drawdownPercent > maxDrawdown
    };
  }
}
```

---

## 6. INTEGRAÇÃO COM GENESIS

```typescript
// BINANCE-BOT/backend/src/trading/genesis/GenesisIntegration.ts

export class GenesisIntegration {
  async processStrategyStory(story: Story): Promise<void> {
    // 1. Extrair estratégia do story
    const strategy = this.extractStrategy(story);

    // 2. Executar backtesting
    const backtest = await this.backtestEngine.runBacktest(
      strategy,
      'BTCUSDT',
      new Date('2023-01-01'),
      new Date('2024-12-31')
    );

    // 3. Validar com approval engine
    const approval = this.approvalEngine.approveForTestnet(backtest);

    if (approval.approved) {
      // 4. Gerar story para testnet
      await this.genesisClient.createStory({
        title: `Executar testnet para ${strategy.name}`,
        description: `Estratégia aprovada no backtest. Sharpe: ${backtest.sharpe_ratio.toFixed(2)}`,
        intention: 'binance-scalping-evolution',
        priority: 'high'
      });

      // 5. Executar testnet
      const testnet = await this.testnetTrader.runTestnet(strategy, 'BTCUSDT', 30);

      // 6. Validar testnet
      const realApproval = this.approvalEngine.approveForRealMoney(backtest, testnet);

      if (realApproval.approved) {
        // 7. Gerar story para real money
        await this.genesisClient.createStory({
          title: `Estratégia ${strategy.name} aprovada para real money`,
          description: `Testnet OK. Sharpe: ${testnet.sharpe_ratio.toFixed(2)}`,
          intention: 'binance-scalping-evolution',
          priority: 'critical'
        });

        // 8. Iniciar trading com proteções
        await this.startLiveTrading(strategy, backtest, testnet);
      } else {
        // Gerar story de otimização
        await this.genesisClient.createStory({
          title: `Otimizar ${strategy.name} - Testnet falhou`,
          description: `Razão: ${realApproval.reason}`,
          intention: 'binance-scalping-evolution',
          priority: 'high'
        });
      }
    } else {
      // Gerar story de otimização
      await this.genesisClient.createStory({
        title: `Otimizar ${strategy.name} - Backtest falhou`,
        description: `Razão: ${approval.reason}`,
        intention: 'binance-scalping-evolution',
        priority: 'high'
      });
    }
  }

  private async startLiveTrading(
    strategy: Strategy,
    backtest: BacktestResult,
    testnet: BacktestResult
  ): Promise<void> {
    const positionSizing = this.riskManager.calculatePositionSize(
      10000, // Capital inicial
      backtest,
      0.01 // 1% risco por trade
    );

    // Iniciar trading com proteções
    await this.liveTrader.start(strategy, positionSizing);
  }
}
```

---

## 7. TIPOS

```typescript
// BINANCE-BOT/backend/src/trading/types/index.ts

export interface Trade {
  entry_price: number;
  exit_price: number;
  entry_time: Date;
  exit_time: Date;
  quantity: number;
  profit: number;
  profit_pct: number;
  type: 'LONG' | 'SHORT';
}

export interface Position {
  entry_price: number;
  entry_time: Date;
  quantity: number;
  type: 'LONG' | 'SHORT';
}

export interface BacktestResult {
  strategy_id: string;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  profit_factor: number;
  recovery_factor: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  avg_win: number;
  avg_loss: number;
  trades: Trade[];
  equity_curve: EquityPoint[];
}

export interface ApprovalDecision {
  approved: boolean;
  checks: Record<string, boolean>;
  reason: string;
}

export interface PositionSizing {
  position_size: number;
  kelly_fraction: number;
  conservative_kelly: number;
  max_risk_per_trade: number;
  max_daily_loss: number;
  max_account_drawdown: number;
}

export interface RiskValidation {
  is_safe: boolean;
  current_drawdown: number;
  max_allowed_drawdown: number;
  unrealized_loss: number;
  should_close: boolean;
}
```

---

## 🎯 PRÓXIMOS PASSOS

1. Implementar BacktestEngine
2. Implementar MetricsCalculator
3. Implementar ApprovalEngine
4. Implementar TestnetTrader
5. Implementar RiskManager
6. Integrar com Genesis
7. Testar com estratégias reais

