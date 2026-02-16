/**
 * Base Strategy
 * Corporacao Senciente - BINANCE-BOT
 * 
 * Abstract base class for all trading strategies
 */

import { logger } from '../utils/logger';

export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface Signal {
  type: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;  // 0-1
  reason: string;
  price: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface StrategyConfig {
  name: string;
  version: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

export abstract class BaseStrategy {
  protected config: StrategyConfig;
  protected lastSignal: Signal | null = null;
  protected signalHistory: Signal[] = [];
  protected maxHistorySize: number = 100;

  constructor(config: StrategyConfig) {
    this.config = config;
    logger.info(`Strategy initialized: ${config.name} v${config.version}`);
  }

  abstract analyze(candles: Candle[]): Promise<Signal>;

  protected addToHistory(signal: Signal): void {
    this.signalHistory.push(signal);
    if (this.signalHistory.length > this.maxHistorySize) {
      this.signalHistory.shift();
    }
    this.lastSignal = signal;
  }

  getLastSignal(): Signal | null {
    return this.lastSignal;
  }

  getSignalHistory(): Signal[] {
    return [...this.signalHistory];
  }

  getConfig(): StrategyConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<StrategyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info(`Strategy config updated: ${this.config.name}`);
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  // Technical Analysis Helpers
  protected calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  protected calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(prices.slice(0, period), period);
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  protected calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  protected calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    
    // For signal line, we need MACD history
    // Simplified: use 9-period EMA of MACD values
    const macdValues: number[] = [];
    for (let i = 26; i <= prices.length; i++) {
      const e12 = this.calculateEMA(prices.slice(0, i), 12);
      const e26 = this.calculateEMA(prices.slice(0, i), 26);
      macdValues.push(e12 - e26);
    }
    
    const signalLine = this.calculateEMA(macdValues, 9);
    const histogram = macdLine - signalLine;
    
    return { macd: macdLine, signal: signalLine, histogram };
  }

  protected calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
    upper: number;
    middle: number;
    lower: number;
  } {
    const middle = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    
    const variance = slice.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    return {
      upper: middle + (std * stdDev),
      middle,
      lower: middle - (std * stdDev),
    };
  }

  protected calculateATR(candles: Candle[], period: number = 14): number {
    if (candles.length < period + 1) return 0;
    
    const trueRanges: number[] = [];
    
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }
    
    return this.calculateSMA(trueRanges, period);
  }
}
