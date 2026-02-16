import { MomentumStrategy } from '../../src/strategies/MomentumStrategy';
import { MarketAnalysisService } from '../../src/services/MarketAnalysisService';

jest.mock('../../src/services/MarketAnalysisService');

describe('MomentumStrategy', () => {
  let strategy: MomentumStrategy;
  let marketAnalysis: jest.Mocked<MarketAnalysisService>;

  beforeEach(() => {
    marketAnalysis = new MarketAnalysisService() as jest.Mocked<MarketAnalysisService>;
    strategy = new MomentumStrategy(marketAnalysis);
  });

  describe('analyze', () => {
    it('deve gerar sinal de compra com momentum forte positivo', async () => {
      marketAnalysis.analyzeMarket.mockResolvedValue({
        momentum: 0.8,
        priceAcceleration: 0.4,
        volumeSpike: 2.0,
        isHighVolatility: false,
        volume24h: 1000,
        priceChangePercent24h: 5,
        volatility24h: 1.5,
        averageVolume24h: 500,
        isHighVolume: true,
        isStrongMomentum: true
      });

      const result = await strategy.analyze('BTCUSDT');

      expect(result.shouldTrade).toBe(true);
      expect(result.direction).toBe('BUY');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('deve gerar sinal de venda com momentum forte negativo', async () => {
      marketAnalysis.analyzeMarket.mockResolvedValue({
        momentum: -0.8,
        priceAcceleration: -0.4,
        volumeSpike: 2.0,
        isHighVolatility: false,
        volume24h: 1000,
        priceChangePercent24h: -5,
        volatility24h: 1.5,
        averageVolume24h: 500,
        isHighVolume: true,
        isStrongMomentum: true
      });

      const result = await strategy.analyze('BTCUSDT');

      expect(result.shouldTrade).toBe(true);
      expect(result.direction).toBe('SELL');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('não deve gerar sinal com momentum fraco', async () => {
      marketAnalysis.analyzeMarket.mockResolvedValue({
        momentum: 0.3,
        priceAcceleration: 0.1,
        volumeSpike: 1.2,
        isHighVolatility: false,
        volume24h: 1000,
        priceChangePercent24h: 2,
        volatility24h: 1.0,
        averageVolume24h: 500,
        isHighVolume: false,
        isStrongMomentum: false
      });

      const result = await strategy.analyze('BTCUSDT');

      expect(result.shouldTrade).toBe(false);
      expect(result.confidence).toBeLessThan(0.6);
    });

    it('deve reduzir confiança com alta volatilidade', async () => {
      marketAnalysis.analyzeMarket.mockResolvedValue({
        momentum: 0.8,
        priceAcceleration: 0.4,
        volumeSpike: 2.0,
        isHighVolatility: true,
        volume24h: 1000,
        priceChangePercent24h: 5,
        volatility24h: 3.0,
        averageVolume24h: 500,
        isHighVolume: true,
        isStrongMomentum: true
      });

      const result = await strategy.analyze('BTCUSDT');

      expect(result.confidence).toBeLessThan(0.8);
    });
  });

  describe('getStopLossPrice', () => {
    it('deve calcular stop loss correto para posição comprada', () => {
      const entryPrice = 100;
      const stopLoss = strategy.getStopLossPrice(entryPrice, 'BUY');
      expect(stopLoss).toBe(98); // 2% abaixo do preço de entrada
    });

    it('deve calcular stop loss correto para posição vendida', () => {
      const entryPrice = 100;
      const stopLoss = strategy.getStopLossPrice(entryPrice, 'SELL');
      expect(stopLoss).toBe(102); // 2% acima do preço de entrada
    });
  });

  describe('getTakeProfitPrice', () => {
    it('deve calcular take profit correto para posição comprada', () => {
      const entryPrice = 100;
      const takeProfit = strategy.getTakeProfitPrice(entryPrice, 'BUY');
      expect(takeProfit).toBe(103); // 3% acima do preço de entrada
    });

    it('deve calcular take profit correto para posição vendida', () => {
      const entryPrice = 100;
      const takeProfit = strategy.getTakeProfitPrice(entryPrice, 'SELL');
      expect(takeProfit).toBe(97); // 3% abaixo do preço de entrada
    });
  });
});
