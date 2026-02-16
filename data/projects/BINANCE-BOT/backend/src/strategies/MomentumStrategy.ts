import { MarketAnalysisService, MarketMetrics } from '../services/MarketAnalysisService';
import { logger } from '../utils/logger';

export interface MomentumStrategyConfig {
  momentumThreshold: number;     // Limite para considerar momentum forte (0.6 - 0.9)
  accelerationThreshold: number; // Limite para aceleração de preço (0.2 - 0.5)
  volumeConfirmation: number;    // Multiplicador de volume para confirmação (1.5 - 2.5)
  stopLossPercent: number;       // Stop loss em percentagem
  takeProfitPercent: number;     // Take profit em percentagem
}

export class MomentumStrategy {
  private readonly defaultConfig: MomentumStrategyConfig = {
    momentumThreshold: 0.7,
    accelerationThreshold: 0.3,
    volumeConfirmation: 1.8,
    stopLossPercent: 2,
    takeProfitPercent: 3
  };

  constructor(
    private readonly marketAnalysis: MarketAnalysisService,
    private readonly config: Partial<MomentumStrategyConfig> = {}
  ) {
    this.config = { ...this.defaultConfig, ...config };
  }

  async analyze(symbol: string): Promise<{
    shouldTrade: boolean;
    direction: 'BUY' | 'SELL' | null;
    confidence: number;
    reason: string;
  }> {
    try {
      const metrics = await this.marketAnalysis.analyzeMarket(symbol);
      return this.evaluateSignal(metrics);
    } catch (error) {
      logger.error('Erro na análise de momentum:', error);
      throw new Error(`Falha na análise de momentum: ${error.message}`);
    }
  }

  private evaluateSignal(metrics: MarketMetrics) {
    const { 
      momentum, 
      priceAcceleration, 
      volumeSpike,
      isHighVolatility 
    } = metrics;

    let confidence = 0;
    const reasons: string[] = [];

    // Avaliar força do momentum
    if (Math.abs(momentum) > this.config.momentumThreshold) {
      confidence += 0.4;
      reasons.push(`Momentum forte (${momentum.toFixed(2)})`);
    }

    // Avaliar aceleração de preço
    if (Math.abs(priceAcceleration) > this.config.accelerationThreshold) {
      confidence += 0.3;
      reasons.push(`Aceleração significativa (${priceAcceleration.toFixed(2)})`);
    }

    // Confirmação por volume
    if (volumeSpike > this.config.volumeConfirmation) {
      confidence += 0.3;
      reasons.push(`Volume confirmatório (${volumeSpike.toFixed(2)}x)`);
    }

    // Penalização por alta volatilidade
    if (isHighVolatility) {
      confidence -= 0.2;
      reasons.push('Alta volatilidade - risco aumentado');
    }

    // Determinar direção
    let direction: 'BUY' | 'SELL' | null = null;
    if (confidence > 0.6) {
      direction = momentum > 0 ? 'BUY' : 'SELL';
    }

    return {
      shouldTrade: confidence > 0.6,
      direction,
      confidence: parseFloat(confidence.toFixed(2)),
      reason: reasons.join(', ')
    };
  }

  getStopLossPrice(entryPrice: number, direction: 'BUY' | 'SELL'): number {
    const multiplier = direction === 'BUY' ? (1 - this.config.stopLossPercent/100) 
                                         : (1 + this.config.stopLossPercent/100);
    return entryPrice * multiplier;
  }

  getTakeProfitPrice(entryPrice: number, direction: 'BUY' | 'SELL'): number {
    const multiplier = direction === 'BUY' ? (1 + this.config.takeProfitPercent/100) 
                                         : (1 - this.config.takeProfitPercent/100);
    return entryPrice * multiplier;
  }
}
