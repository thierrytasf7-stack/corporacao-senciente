import { logger } from '../utils/logger';
import axios from 'axios';

export interface MarketMetrics {
  volume24h: number;
  priceChangePercent24h: number;
  volatility24h: number;
  averageVolume24h: number;
  volumeSpike: number;  // Volume atual em relação à média (1 = normal)
  isHighVolatility: boolean;
  isHighVolume: boolean;
  momentum: number;     // Indicador de força do momentum (-1 a 1)
  priceAcceleration: number; // Taxa de mudança do momentum
  isStrongMomentum: boolean;
}

export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export class MarketAnalysisService {
  private readonly VOLATILITY_THRESHOLD = 2.5;  // % acima da média para considerar alta volatilidade
  private readonly VOLUME_THRESHOLD = 2.0;      // multiplicador acima da média para considerar alto volume

  /**
   * Calcula métricas de mercado baseadas em dados históricos
   */
  async analyzeMarket(symbol: string, interval = '1h'): Promise<MarketMetrics> {
    try {
      // Buscar dados das últimas 24 horas (24 períodos de 1h)
      const klines = await this.fetchKlines(symbol, interval, 24);
      
      // Calcular métricas
      const volumes = klines.map(k => parseFloat(k.volume));
      const prices = klines.map(k => parseFloat(k.close));
      
      const volume24h = volumes.reduce((sum, vol) => sum + vol, 0);
      const averageVolume24h = volume24h / volumes.length;
      const currentVolume = volumes[volumes.length - 1];
      const volumeSpike = currentVolume / averageVolume24h;

      // Calcular volatilidade (desvio padrão dos retornos percentuais)
      const returns = this.calculateReturns(prices);
      const volatility24h = this.calculateVolatility(returns);

      // Calcular variação percentual de preço
      const firstPrice = prices[0];
      const lastPrice = prices[prices.length - 1];
      const priceChangePercent24h = ((lastPrice - firstPrice) / firstPrice) * 100;

      return {
        volume24h,
        priceChangePercent24h,
        volatility24h,
        averageVolume24h,
        volumeSpike,
        isHighVolatility: volatility24h > this.VOLATILITY_THRESHOLD,
        isHighVolume: volumeSpike > this.VOLUME_THRESHOLD
      };
    } catch (error) {
      logger.error('Erro ao analisar mercado:', error);
      throw new Error(`Falha ao analisar mercado: ${error.message}`);
    }
  }

  /**
   * Avalia se é um bom momento para entrada baseado nas métricas
   */
  evaluateEntryPoint(metrics: MarketMetrics): {
    shouldEnter: boolean;
    confidence: number;
    reason: string;
  } {
    let confidence = 0;
    let reasons: string[] = [];

    // Volume acima da média indica maior liquidez
    if (metrics.volumeSpike > 1.5) {
      confidence += 0.3;
      reasons.push('Volume acima da média');
    }

    // Volatilidade moderada é preferível para entradas
    if (metrics.volatility24h > 1.0 && metrics.volatility24h < 2.0) {
      confidence += 0.4;
      reasons.push('Volatilidade moderada');
    } else if (metrics.volatility24h >= 2.0) {
      confidence -= 0.2;
      reasons.push('Alta volatilidade - risco aumentado');
    }

    // Movimento de preço significativo
    if (Math.abs(metrics.priceChangePercent24h) > 5) {
      confidence -= 0.2;
      reasons.push('Movimento de preço significativo - possível reversão');
    }

    const shouldEnter = confidence > 0.5;
    
    return {
      shouldEnter,
      confidence: parseFloat(confidence.toFixed(2)),
      reason: reasons.join(', ')
    };
  }

  /**
   * Avalia se é um bom momento para saída baseado nas métricas
   */
  evaluateExitPoint(metrics: MarketMetrics): {
    shouldExit: boolean;
    confidence: number;
    reason: string;
  } {
    let confidence = 0;
    let reasons: string[] = [];

    // Volume muito alto pode indicar exaustão do movimento
    if (metrics.volumeSpike > 2.5) {
      confidence += 0.4;
      reasons.push('Volume muito elevado');
    }

    // Alta volatilidade aumenta risco
    if (metrics.volatility24h > this.VOLATILITY_THRESHOLD) {
      confidence += 0.3;
      reasons.push('Alta volatilidade');
    }

    // Movimento de preço extremo
    if (Math.abs(metrics.priceChangePercent24h) > 10) {
      confidence += 0.3;
      reasons.push('Movimento de preço extremo');
    }

    const shouldExit = confidence > 0.6;

    return {
      shouldExit,
      confidence: parseFloat(confidence.toFixed(2)),
      reason: reasons.join(', ')
    };
  }

  private async fetchKlines(symbol: string, interval: string, limit: number): Promise<KlineData[]> {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/klines', {
        params: { symbol, interval, limit }
      });

      return response.data.map((k: any[]) => ({
        openTime: k[0],
        open: k[1],
        high: k[2],
        low: k[3],
        close: k[4],
        volume: k[5],
        closeTime: k[6]
      }));
    } catch (error) {
      logger.error('Erro ao buscar dados de klines:', error);
      throw error;
    }
  }

  private calculateReturns(prices: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1] * 100);
    }
    return returns;
  }

  private calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateMomentum(prices: number[], period: number = 14): number {
    if (prices.length < period) return 0;
    
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - period];
    const momentum = (currentPrice - previousPrice) / previousPrice;
    
    // Normalizar para o intervalo [-1, 1]
    return Math.tanh(momentum);
  }

  private calculatePriceAcceleration(prices: number[], period: number = 14): number {
    if (prices.length < period * 2) return 0;
    
    const momentum1 = this.calculateMomentum(prices.slice(-period), period);
    const momentum2 = this.calculateMomentum(prices.slice(-period * 2, -period), period);
    
    // Calcular a taxa de mudança do momentum
    return momentum1 - momentum2;
  }

  async analyzeMarket(symbol: string, interval = '1h'): Promise<MarketMetrics> {
    try {
      // Buscar dados das últimas 24 horas (24 períodos de 1h)
      const klines = await this.fetchKlines(symbol, interval, 48); // Aumentado para 48 períodos para cálculo de aceleração
      
      // Calcular métricas
      const volumes = klines.map(k => parseFloat(k.volume));
      const prices = klines.map(k => parseFloat(k.close));
      
      const volume24h = volumes.slice(-24).reduce((sum, vol) => sum + vol, 0);
      const averageVolume24h = volume24h / 24;
      const currentVolume = volumes[volumes.length - 1];
      const volumeSpike = currentVolume / averageVolume24h;

      // Calcular volatilidade
      const returns = this.calculateReturns(prices);
      const volatility24h = this.calculateVolatility(returns);

      // Calcular variação percentual de preço
      const firstPrice = prices[prices.length - 24];
      const lastPrice = prices[prices.length - 1];
      const priceChangePercent24h = ((lastPrice - firstPrice) / firstPrice) * 100;

      // Calcular momentum e aceleração
      const momentum = this.calculateMomentum(prices);
      const priceAcceleration = this.calculatePriceAcceleration(prices);

      return {
        volume24h,
        priceChangePercent24h,
        volatility24h,
        averageVolume24h,
        volumeSpike,
        isHighVolatility: volatility24h > this.VOLATILITY_THRESHOLD,
        isHighVolume: volumeSpike > this.VOLUME_THRESHOLD,
        momentum,
        priceAcceleration,
        isStrongMomentum: Math.abs(momentum) > 0.7
      };
    } catch (error) {
      logger.error('Erro ao analisar mercado:', error);
      throw new Error(`Falha ao analisar mercado: ${error.message}`);
    }
  }
}

export default MarketAnalysisService;
