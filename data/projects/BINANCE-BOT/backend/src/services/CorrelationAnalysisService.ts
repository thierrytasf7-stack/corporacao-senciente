import { logger } from '../utils/logger';
import BinanceApiService from './BinanceApiService';

export interface CorrelationResult {
  symbol1: string;
  symbol2: string;
  correlation: number;
  period: string;
  timestamp: number;
}

export class CorrelationAnalysisService {
  private binanceService: BinanceApiService;

  constructor(binanceService: BinanceApiService) {
    this.binanceService = binanceService;
  }

  /**
   * Calcula o coeficiente de correlação de Pearson entre dois arrays
   */
  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Arrays devem ter o mesmo tamanho');
    }

    const n = x.length;
    
    // Calcular médias
    const xMean = x.reduce((a, b) => a + b) / n;
    const yMean = y.reduce((a, b) => a + b) / n;
    
    // Calcular covariância e desvios padrão
    let covariance = 0;
    let xVariance = 0;
    let yVariance = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      covariance += xDiff * yDiff;
      xVariance += xDiff * xDiff;
      yVariance += yDiff * yDiff;
    }
    
    // Calcular correlação
    const correlation = covariance / Math.sqrt(xVariance * yVariance);
    
    return correlation;
  }

  /**
   * Analisa a correlação entre dois símbolos
   */
  public async analyzeCorrelation(
    symbol1: string,
    symbol2: string,
    interval: string = '1d',
    limit: number = 30
  ): Promise<CorrelationResult> {
    try {
      logger.info(`📊 Analisando correlação entre ${symbol1} e ${symbol2}`);

      // Obter dados históricos dos dois símbolos
      const [klines1, klines2] = await Promise.all([
        this.binanceService.getKlines(symbol1, interval, limit),
        this.binanceService.getKlines(symbol2, interval, limit)
      ]);

      // Extrair preços de fechamento
      const prices1 = klines1.map(k => parseFloat(k.close));
      const prices2 = klines2.map(k => parseFloat(k.close));

      // Calcular correlação
      const correlation = this.calculatePearsonCorrelation(prices1, prices2);

      logger.info(`✅ Correlação calculada: ${correlation}`);

      return {
        symbol1,
        symbol2,
        correlation,
        period: interval,
        timestamp: Date.now()
      };
    } catch (error: any) {
      logger.error('❌ Erro ao analisar correlação:', error);
      throw new Error(`Falha ao analisar correlação: ${error.message}`);
    }
  }

  /**
   * Analisa correlações entre múltiplos pares
   */
  public async analyzeMultipleCorrelations(
    symbols: string[],
    interval: string = '1d',
    limit: number = 30
  ): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        try {
          const result = await this.analyzeCorrelation(
            symbols[i],
            symbols[j],
            interval,
            limit
          );
          results.push(result);
        } catch (error) {
          logger.warn(`⚠️ Erro ao analisar correlação entre ${symbols[i]} e ${symbols[j]}:`, error);
          continue;
        }
      }
    }

    return results;
  }

  /**
   * Encontra pares altamente correlacionados
   */
  public async findHighlyCorrelatedPairs(
    symbols: string[],
    threshold: number = 0.7,
    interval: string = '1d',
    limit: number = 30
  ): Promise<CorrelationResult[]> {
    const correlations = await this.analyzeMultipleCorrelations(symbols, interval, limit);
    return correlations.filter(c => Math.abs(c.correlation) >= threshold);
  }
}

export default CorrelationAnalysisService;
