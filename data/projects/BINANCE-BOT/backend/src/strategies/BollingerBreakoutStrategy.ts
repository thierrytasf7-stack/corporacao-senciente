/**
 * Bollinger Bands Breakout Strategy
 * Corporacao Senciente - BINANCE-BOT
 * 
 * Generates signals based on Bollinger Bands breakouts and mean reversion
 */

import { BaseStrategy, Candle, Signal, StrategyConfig } from './BaseStrategy';
import { logger } from '../utils/logger';

export interface BollingerStrategyConfig extends StrategyConfig {
  parameters: {
    period: number;
    stdDev: number;
    breakoutMode: boolean;  // true = breakout, false = mean reversion
    volumeConfirmation: boolean;
    minBandwidth: number;
  };
}

export class BollingerBreakoutStrategy extends BaseStrategy {
  private bandHistory: { upper: number; middle: number; lower: number; bandwidth: number }[] = [];

  constructor(config?: Partial<BollingerStrategyConfig>) {
    super({
      name: 'Bollinger Breakout',
      version: '1.0.0',
      enabled: true,
      parameters: {
        period: 20,
        stdDev: 2,
        breakoutMode: false,  // Mean reversion by default (safer)
        volumeConfirmation: true,
        minBandwidth: 0.02,
        ...config?.parameters,
      },
    });
  }

  async analyze(candles: Candle[]): Promise<Signal> {
    const params = this.config.parameters as BollingerStrategyConfig['parameters'];
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);
    const currentPrice = closes[closes.length - 1];
    const currentVolume = volumes[volumes.length - 1];
    
    // Calculate Bollinger Bands
    const bands = this.calculateBollingerBands(closes, params.period, params.stdDev);
    const bandwidth = (bands.upper - bands.lower) / bands.middle;
    
    this.bandHistory.push({ ...bands, bandwidth });
    if (this.bandHistory.length > 50) this.bandHistory.shift();
    
    // Calculate position within bands
    const bandPosition = (currentPrice - bands.lower) / (bands.upper - bands.lower);
    
    // Volume analysis
    const avgVolume = this.calculateSMA(volumes, 20);
    const volumeSpike = currentVolume > avgVolume * 1.5;
    
    // Squeeze detection (low volatility)
    const isSqueeze = bandwidth < params.minBandwidth;
    
    // Generate signal based on mode
    let signal: Signal;
    
    if (params.breakoutMode) {
      signal = this.generateBreakoutSignal(
        currentPrice, bands, bandPosition, volumeSpike, isSqueeze, params
      );
    } else {
      signal = this.generateMeanReversionSignal(
        currentPrice, bands, bandPosition, volumeSpike, params
      );
    }
    
    this.addToHistory(signal);
    logger.debug(`Bollinger Strategy signal: ${signal.type} (${signal.confidence.toFixed(2)})`);
    
    return signal;
  }

  private generateBreakoutSignal(
    price: number,
    bands: { upper: number; middle: number; lower: number },
    bandPosition: number,
    volumeSpike: boolean,
    isSqueeze: boolean,
    params: BollingerStrategyConfig['parameters']
  ): Signal {
    const timestamp = Date.now();
    
    // Bullish breakout: price breaks above upper band
    if (price > bands.upper) {
      const breakoutStrength = (price - bands.upper) / bands.upper;
      let confidence = 0.5 + Math.min(0.3, breakoutStrength * 10);
      
      if (volumeSpike) confidence += 0.1;
      if (isSqueeze) confidence += 0.1; // Breakout after squeeze is stronger
      
      return {
        type: 'BUY',
        confidence: Math.min(0.9, confidence),
        reason: `Bullish breakout above upper band${volumeSpike ? ' with volume' : ''}${isSqueeze ? ' (squeeze breakout)' : ''}`,
        price,
        timestamp,
        metadata: {
          upper: bands.upper,
          middle: bands.middle,
          lower: bands.lower,
          bandPosition,
          breakoutStrength,
          volumeSpike,
          isSqueeze,
        },
      };
    }
    
    // Bearish breakout: price breaks below lower band
    if (price < bands.lower) {
      const breakoutStrength = (bands.lower - price) / bands.lower;
      let confidence = 0.5 + Math.min(0.3, breakoutStrength * 10);
      
      if (volumeSpike) confidence += 0.1;
      if (isSqueeze) confidence += 0.1;
      
      return {
        type: 'SELL',
        confidence: Math.min(0.9, confidence),
        reason: `Bearish breakout below lower band${volumeSpike ? ' with volume' : ''}${isSqueeze ? ' (squeeze breakout)' : ''}`,
        price,
        timestamp,
        metadata: {
          upper: bands.upper,
          middle: bands.middle,
          lower: bands.lower,
          bandPosition,
          breakoutStrength,
          volumeSpike,
          isSqueeze,
        },
      };
    }
    
    return {
      type: 'HOLD',
      confidence: 0.5,
      reason: `Price within bands. Position: ${(bandPosition * 100).toFixed(1)}%`,
      price,
      timestamp,
      metadata: {
        upper: bands.upper,
        middle: bands.middle,
        lower: bands.lower,
        bandPosition,
        isSqueeze,
      },
    };
  }

  private generateMeanReversionSignal(
    price: number,
    bands: { upper: number; middle: number; lower: number },
    bandPosition: number,
    volumeSpike: boolean,
    params: BollingerStrategyConfig['parameters']
  ): Signal {
    const timestamp = Date.now();
    
    // Buy signal: price touches/crosses lower band (expect reversion to mean)
    if (bandPosition <= 0.1) {
      const distanceFromLower = (price - bands.lower) / bands.lower;
      let confidence = 0.6 + Math.min(0.25, Math.abs(distanceFromLower) * 5);
      
      if (!volumeSpike) confidence += 0.05; // Low volume suggests reversal
      
      return {
        type: 'BUY',
        confidence: Math.min(0.85, confidence),
        reason: `Price near lower band - expecting mean reversion. Position: ${(bandPosition * 100).toFixed(1)}%`,
        price,
        timestamp,
        metadata: {
          upper: bands.upper,
          middle: bands.middle,
          lower: bands.lower,
          bandPosition,
          targetPrice: bands.middle,
          volumeSpike,
        },
      };
    }
    
    // Sell signal: price touches/crosses upper band (expect reversion to mean)
    if (bandPosition >= 0.9) {
      const distanceFromUpper = (bands.upper - price) / bands.upper;
      let confidence = 0.6 + Math.min(0.25, Math.abs(distanceFromUpper) * 5);
      
      if (!volumeSpike) confidence += 0.05;
      
      return {
        type: 'SELL',
        confidence: Math.min(0.85, confidence),
        reason: `Price near upper band - expecting mean reversion. Position: ${(bandPosition * 100).toFixed(1)}%`,
        price,
        timestamp,
        metadata: {
          upper: bands.upper,
          middle: bands.middle,
          lower: bands.lower,
          bandPosition,
          targetPrice: bands.middle,
          volumeSpike,
        },
      };
    }
    
    return {
      type: 'HOLD',
      confidence: 0.5,
      reason: `Price in neutral zone. Position: ${(bandPosition * 100).toFixed(1)}%`,
      price,
      timestamp,
      metadata: {
        upper: bands.upper,
        middle: bands.middle,
        lower: bands.lower,
        bandPosition,
      },
    };
  }

  getBandHistory(): { upper: number; middle: number; lower: number; bandwidth: number }[] {
    return [...this.bandHistory];
  }
}
