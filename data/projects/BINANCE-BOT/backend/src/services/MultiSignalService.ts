/**
 * =============================================================================
 * CORPORACAO SENCIENTE - Multi-Signal Aggregator Service
 * Industry 7.0 Ready - Sistema de Multiplos Sinais Simultaneos
 * =============================================================================
 */

import { EventEmitter } from 'events';

// Signal types
export interface TradingSignal {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  strategy: string;
  strength: number; // 0-100
  confidence: number; // 0-1
  timestamp: Date;
  indicators: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface AggregatedSignal {
  id: string;
  symbol: string;
  signals: TradingSignal[];
  consensusType: 'LONG' | 'SHORT' | 'NEUTRAL';
  consensusStrength: number;
  consensusConfidence: number;
  agreementRatio: number;
  timestamp: Date;
  recommendation: 'EXECUTE' | 'WAIT' | 'SKIP';
}

export interface SignalConfig {
  minSignalsForConsensus: number;
  minAgreementRatio: number;
  minConfidence: number;
  signalWeights: Record<string, number>;
  cooldownMs: number;
}

const DEFAULT_CONFIG: SignalConfig = {
  minSignalsForConsensus: 2,
  minAgreementRatio: 0.6,
  minConfidence: 0.5,
  signalWeights: {
    RSI_DIVERGENCE: 1.2,
    MACD_CROSS: 1.0,
    BOLLINGER_BREAKOUT: 1.1,
    EMA_CROSS: 0.9,
    VOLUME_SPIKE: 0.8,
  },
  cooldownMs: 60000, // 1 minute
};

export class MultiSignalService extends EventEmitter {
  private signals: Map<string, TradingSignal[]> = new Map();
  private lastExecution: Map<string, Date> = new Map();
  private config: SignalConfig;

  constructor(config: Partial<SignalConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[MultiSignal] Service initialized with config:', this.config);
  }

  /**
   * Register a new signal from a strategy
   */
  registerSignal(signal: TradingSignal): void {
    const key = signal.symbol;
    
    if (!this.signals.has(key)) {
      this.signals.set(key, []);
    }

    const signals = this.signals.get(key)!;
    
    // Remove stale signals (older than 5 minutes)
    const cutoff = new Date(Date.now() - 5 * 60 * 1000);
    const freshSignals = signals.filter(s => s.timestamp > cutoff);
    
    // Add new signal
    freshSignals.push(signal);
    this.signals.set(key, freshSignals);

    console.log(`[MultiSignal] New ${signal.type} signal for ${signal.symbol} from ${signal.strategy}`);
    
    // Emit signal event
    this.emit('signal', signal);

    // Try to aggregate
    this.tryAggregate(key);
  }

  /**
   * Try to aggregate signals and generate consensus
   */
  private tryAggregate(symbol: string): void {
    const signals = this.signals.get(symbol);
    if (!signals || signals.length < this.config.minSignalsForConsensus) {
      return;
    }

    // Check cooldown
    const lastExec = this.lastExecution.get(symbol);
    if (lastExec && Date.now() - lastExec.getTime() < this.config.cooldownMs) {
      console.log(`[MultiSignal] ${symbol} in cooldown period`);
      return;
    }

    // Aggregate signals
    const aggregated = this.aggregateSignals(symbol, signals);

    // Check if consensus is strong enough
    if (
      aggregated.consensusType !== 'NEUTRAL' &&
      aggregated.agreementRatio >= this.config.minAgreementRatio &&
      aggregated.consensusConfidence >= this.config.minConfidence
    ) {
      aggregated.recommendation = 'EXECUTE';
      this.lastExecution.set(symbol, new Date());
      
      console.log(`[MultiSignal] CONSENSUS REACHED for ${symbol}:`, {
        type: aggregated.consensusType,
        strength: aggregated.consensusStrength,
        confidence: aggregated.consensusConfidence,
        agreement: aggregated.agreementRatio,
      });

      this.emit('consensus', aggregated);
    } else {
      aggregated.recommendation = aggregated.agreementRatio >= 0.4 ? 'WAIT' : 'SKIP';
      this.emit('noConsensus', aggregated);
    }
  }

  /**
   * Aggregate multiple signals into consensus
   */
  private aggregateSignals(symbol: string, signals: TradingSignal[]): AggregatedSignal {
    // Count votes with weights
    let longScore = 0;
    let shortScore = 0;
    let totalWeight = 0;
    let totalConfidence = 0;

    for (const signal of signals) {
      const weight = this.config.signalWeights[signal.strategy] || 1.0;
      totalWeight += weight;
      totalConfidence += signal.confidence * weight;

      if (signal.type === 'LONG') {
        longScore += signal.strength * weight;
      } else {
        shortScore += signal.strength * weight;
      }
    }

    // Determine consensus
    const normalizedLong = longScore / (totalWeight * 100);
    const normalizedShort = shortScore / (totalWeight * 100);
    
    let consensusType: 'LONG' | 'SHORT' | 'NEUTRAL';
    let consensusStrength: number;

    if (normalizedLong > normalizedShort && normalizedLong > 0.3) {
      consensusType = 'LONG';
      consensusStrength = normalizedLong * 100;
    } else if (normalizedShort > normalizedLong && normalizedShort > 0.3) {
      consensusType = 'SHORT';
      consensusStrength = normalizedShort * 100;
    } else {
      consensusType = 'NEUTRAL';
      consensusStrength = 0;
    }

    // Calculate agreement ratio
    const longVotes = signals.filter(s => s.type === 'LONG').length;
    const shortVotes = signals.filter(s => s.type === 'SHORT').length;
    const agreementRatio = Math.max(longVotes, shortVotes) / signals.length;

    return {
      id: `AGG-${symbol}-${Date.now()}`,
      symbol,
      signals,
      consensusType,
      consensusStrength,
      consensusConfidence: totalConfidence / totalWeight,
      agreementRatio,
      timestamp: new Date(),
      recommendation: 'WAIT',
    };
  }

  /**
   * Get current signal status for a symbol
   */
  getSignalStatus(symbol: string): {
    signalCount: number;
    signals: TradingSignal[];
    lastUpdate: Date | null;
  } {
    const signals = this.signals.get(symbol) || [];
    return {
      signalCount: signals.length,
      signals,
      lastUpdate: signals.length > 0 
        ? new Date(Math.max(...signals.map(s => s.timestamp.getTime())))
        : null,
    };
  }

  /**
   * Get all active signals
   */
  getAllSignals(): Map<string, TradingSignal[]> {
    return new Map(this.signals);
  }

  /**
   * Clear signals for a symbol
   */
  clearSignals(symbol: string): void {
    this.signals.delete(symbol);
    console.log(`[MultiSignal] Cleared signals for ${symbol}`);
  }

  /**
   * Clear all signals
   */
  clearAllSignals(): void {
    this.signals.clear();
    console.log('[MultiSignal] Cleared all signals');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SignalConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[MultiSignal] Config updated:', this.config);
  }
}

// Singleton instance
let instance: MultiSignalService | null = null;

export function getMultiSignalService(config?: Partial<SignalConfig>): MultiSignalService {
  if (!instance) {
    instance = new MultiSignalService(config);
  }
  return instance;
}

export default MultiSignalService;
