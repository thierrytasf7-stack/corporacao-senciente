/**
 * MACD Cross Strategy
 * Corporacao Senciente - BINANCE-BOT
 * 
 * Generates signals based on MACD line crossing signal line
 */

import { BaseStrategy, Candle, Signal, StrategyConfig } from './BaseStrategy';
import { logger } from '../utils/logger';

export interface MACDStrategyConfig extends StrategyConfig {
  parameters: {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
    minHistogramStrength: number;
    trendConfirmation: boolean;
  };
}

export class MACDCrossStrategy extends BaseStrategy {
  private macdHistory: { macd: number; signal: number; histogram: number }[] = [];

  constructor(config?: Partial<MACDStrategyConfig>) {
    super({
      name: 'MACD Cross',
      version: '1.0.0',
      enabled: true,
      parameters: {
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        minHistogramStrength: 0.001,
        trendConfirmation: true,
        ...config?.parameters,
      },
    });
  }

  async analyze(candles: Candle[]): Promise<Signal> {
    const params = this.config.parameters as MACDStrategyConfig['parameters'];
    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];
    
    // Calculate MACD
    const macd = this.calculateMACD(closes);
    this.macdHistory.push(macd);
    if (this.macdHistory.length > 50) this.macdHistory.shift();
    
    // Detect cross
    const crossover = this.detectCrossover(params);
    
    // Trend confirmation using 50 SMA
    let trendConfirmed = true;
    if (params.trendConfirmation) {
      const sma50 = this.calculateSMA(closes, 50);
      trendConfirmed = crossover.type === 'bullish' 
        ? currentPrice > sma50 
        : currentPrice < sma50;
    }
    
    // Calculate histogram strength
    const histogramStrength = Math.abs(macd.histogram);
    const strongSignal = histogramStrength > params.minHistogramStrength;
    
    // Generate signal
    let signal: Signal;
    
    if (crossover.occurred && crossover.type === 'bullish' && strongSignal) {
      const confidence = trendConfirmed 
        ? Math.min(0.9, 0.6 + histogramStrength * 100)
        : Math.min(0.7, 0.4 + histogramStrength * 100);
      
      signal = {
        type: 'BUY',
        confidence,
        reason: `MACD bullish crossover. Histogram: ${macd.histogram.toFixed(4)}${trendConfirmed ? ' (trend confirmed)' : ''}`,
        price: currentPrice,
        timestamp: Date.now(),
        metadata: {
          macd: macd.macd,
          signal: macd.signal,
          histogram: macd.histogram,
          crossoverType: 'bullish',
          trendConfirmed,
        },
      };
    } else if (crossover.occurred && crossover.type === 'bearish' && strongSignal) {
      const confidence = trendConfirmed
        ? Math.min(0.9, 0.6 + histogramStrength * 100)
        : Math.min(0.7, 0.4 + histogramStrength * 100);
      
      signal = {
        type: 'SELL',
        confidence,
        reason: `MACD bearish crossover. Histogram: ${macd.histogram.toFixed(4)}${trendConfirmed ? ' (trend confirmed)' : ''}`,
        price: currentPrice,
        timestamp: Date.now(),
        metadata: {
          macd: macd.macd,
          signal: macd.signal,
          histogram: macd.histogram,
          crossoverType: 'bearish',
          trendConfirmed,
        },
      };
    } else if (macd.histogram > 0) {
      signal = {
        type: 'HOLD',
        confidence: 0.5 + Math.min(0.3, histogramStrength * 50),
        reason: `MACD bullish momentum. Histogram: ${macd.histogram.toFixed(4)}`,
        price: currentPrice,
        timestamp: Date.now(),
        metadata: {
          macd: macd.macd,
          signal: macd.signal,
          histogram: macd.histogram,
          momentum: 'bullish',
        },
      };
    } else {
      signal = {
        type: 'HOLD',
        confidence: 0.5 + Math.min(0.3, histogramStrength * 50),
        reason: `MACD bearish momentum. Histogram: ${macd.histogram.toFixed(4)}`,
        price: currentPrice,
        timestamp: Date.now(),
        metadata: {
          macd: macd.macd,
          signal: macd.signal,
          histogram: macd.histogram,
          momentum: 'bearish',
        },
      };
    }
    
    this.addToHistory(signal);
    logger.debug(`MACD Strategy signal: ${signal.type} (${signal.confidence.toFixed(2)})`);
    
    return signal;
  }

  private detectCrossover(
    params: MACDStrategyConfig['parameters']
  ): { occurred: boolean; type: 'bullish' | 'bearish' | null } {
    if (this.macdHistory.length < 2) {
      return { occurred: false, type: null };
    }
    
    const current = this.macdHistory[this.macdHistory.length - 1];
    const previous = this.macdHistory[this.macdHistory.length - 2];
    
    // Bullish crossover: MACD crosses above signal
    if (previous.macd <= previous.signal && current.macd > current.signal) {
      return { occurred: true, type: 'bullish' };
    }
    
    // Bearish crossover: MACD crosses below signal
    if (previous.macd >= previous.signal && current.macd < current.signal) {
      return { occurred: true, type: 'bearish' };
    }
    
    return { occurred: false, type: null };
  }

  getMACDHistory(): { macd: number; signal: number; histogram: number }[] {
    return [...this.macdHistory];
  }
}
