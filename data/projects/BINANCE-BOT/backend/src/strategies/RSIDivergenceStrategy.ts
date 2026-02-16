/**
 * RSI Divergence Strategy
 * Corporacao Senciente - BINANCE-BOT
 * 
 * Detects bullish and bearish divergences using RSI
 */

import { BaseStrategy, Candle, Signal, StrategyConfig } from './BaseStrategy';
import { logger } from '../utils/logger';

export interface RSIStrategyConfig extends StrategyConfig {
  parameters: {
    rsiPeriod: number;
    overbought: number;
    oversold: number;
    divergenceLookback: number;
    minDivergenceStrength: number;
  };
}

export class RSIDivergenceStrategy extends BaseStrategy {
  private rsiHistory: number[] = [];

  constructor(config?: Partial<RSIStrategyConfig>) {
    super({
      name: 'RSI Divergence',
      version: '1.0.0',
      enabled: true,
      parameters: {
        rsiPeriod: 14,
        overbought: 70,
        oversold: 30,
        divergenceLookback: 5,
        minDivergenceStrength: 0.5,
        ...config?.parameters,
      },
    });
  }

  async analyze(candles: Candle[]): Promise<Signal> {
    const params = this.config.parameters as RSIStrategyConfig['parameters'];
    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];
    
    // Calculate RSI
    const rsi = this.calculateRSI(closes, params.rsiPeriod);
    this.rsiHistory.push(rsi);
    if (this.rsiHistory.length > 50) this.rsiHistory.shift();
    
    // Detect divergences
    const bullishDivergence = this.detectBullishDivergence(closes, params);
    const bearishDivergence = this.detectBearishDivergence(closes, params);
    
    // Generate signal
    let signal: Signal;
    
    if (bullishDivergence.detected && rsi <= params.oversold) {
      signal = {
        type: 'BUY',
        confidence: bullishDivergence.strength,
        reason: `Bullish RSI divergence detected. RSI: ${rsi.toFixed(2)} (oversold)`,
        price: currentPrice,
        timestamp: Date.now(),
        metadata: {
          rsi,
          divergenceType: 'bullish',
          divergenceStrength: bullishDivergence.strength,
        },
      };
    } else if (bearishDivergence.detected && rsi >= params.overbought) {
      signal = {
        type: 'SELL',
        confidence: bearishDivergence.strength,
        reason: `Bearish RSI divergence detected. RSI: ${rsi.toFixed(2)} (overbought)`,
        price: currentPrice,
        timestamp: Date.now(),
        metadata: {
          rsi,
          divergenceType: 'bearish',
          divergenceStrength: bearishDivergence.strength,
        },
      };
    } else if (rsi <= params.oversold) {
      signal = {
        type: 'BUY',
        confidence: 0.4 + (params.oversold - rsi) / 100,
        reason: `RSI oversold: ${rsi.toFixed(2)}`,
        price: currentPrice,
        timestamp: Date.now(),
        metadata: { rsi },
      };
    } else if (rsi >= params.overbought) {
      signal = {
        type: 'SELL',
        confidence: 0.4 + (rsi - params.overbought) / 100,
        reason: `RSI overbought: ${rsi.toFixed(2)}`,
        price: currentPrice,
        timestamp: Date.now(),
        metadata: { rsi },
      };
    } else {
      signal = {
        type: 'HOLD',
        confidence: 0.5,
        reason: `RSI neutral: ${rsi.toFixed(2)}`,
        price: currentPrice,
        timestamp: Date.now(),
        metadata: { rsi },
      };
    }
    
    this.addToHistory(signal);
    logger.debug(`RSI Strategy signal: ${signal.type} (${signal.confidence.toFixed(2)})`);
    
    return signal;
  }

  private detectBullishDivergence(
    closes: number[],
    params: RSIStrategyConfig['parameters']
  ): { detected: boolean; strength: number } {
    if (this.rsiHistory.length < params.divergenceLookback) {
      return { detected: false, strength: 0 };
    }
    
    const priceWindow = closes.slice(-params.divergenceLookback);
    const rsiWindow = this.rsiHistory.slice(-params.divergenceLookback);
    
    // Find price lows
    const priceLow1 = Math.min(...priceWindow.slice(0, Math.floor(params.divergenceLookback / 2)));
    const priceLow2 = Math.min(...priceWindow.slice(Math.floor(params.divergenceLookback / 2)));
    
    // Find RSI lows
    const rsiLow1 = Math.min(...rsiWindow.slice(0, Math.floor(params.divergenceLookback / 2)));
    const rsiLow2 = Math.min(...rsiWindow.slice(Math.floor(params.divergenceLookback / 2)));
    
    // Bullish divergence: price makes lower low, RSI makes higher low
    if (priceLow2 < priceLow1 && rsiLow2 > rsiLow1) {
      const priceChange = (priceLow1 - priceLow2) / priceLow1;
      const rsiChange = (rsiLow2 - rsiLow1) / 100;
      const strength = Math.min(1, (priceChange + rsiChange) / 2 + 0.3);
      
      if (strength >= params.minDivergenceStrength) {
        return { detected: true, strength };
      }
    }
    
    return { detected: false, strength: 0 };
  }

  private detectBearishDivergence(
    closes: number[],
    params: RSIStrategyConfig['parameters']
  ): { detected: boolean; strength: number } {
    if (this.rsiHistory.length < params.divergenceLookback) {
      return { detected: false, strength: 0 };
    }
    
    const priceWindow = closes.slice(-params.divergenceLookback);
    const rsiWindow = this.rsiHistory.slice(-params.divergenceLookback);
    
    // Find price highs
    const priceHigh1 = Math.max(...priceWindow.slice(0, Math.floor(params.divergenceLookback / 2)));
    const priceHigh2 = Math.max(...priceWindow.slice(Math.floor(params.divergenceLookback / 2)));
    
    // Find RSI highs
    const rsiHigh1 = Math.max(...rsiWindow.slice(0, Math.floor(params.divergenceLookback / 2)));
    const rsiHigh2 = Math.max(...rsiWindow.slice(Math.floor(params.divergenceLookback / 2)));
    
    // Bearish divergence: price makes higher high, RSI makes lower high
    if (priceHigh2 > priceHigh1 && rsiHigh2 < rsiHigh1) {
      const priceChange = (priceHigh2 - priceHigh1) / priceHigh1;
      const rsiChange = (rsiHigh1 - rsiHigh2) / 100;
      const strength = Math.min(1, (priceChange + rsiChange) / 2 + 0.3);
      
      if (strength >= params.minDivergenceStrength) {
        return { detected: true, strength };
      }
    }
    
    return { detected: false, strength: 0 };
  }
}
