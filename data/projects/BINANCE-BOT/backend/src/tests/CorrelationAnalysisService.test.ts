import { CorrelationAnalysisService } from '../services/CorrelationAnalysisService';
import BinanceApiService from '../services/BinanceApiService';

// Mock do BinanceApiService
jest.mock('../services/BinanceApiService');

describe('CorrelationAnalysisService', () => {
  let correlationService: CorrelationAnalysisService;
  let mockBinanceService: jest.Mocked<BinanceApiService>;

  beforeEach(() => {
    mockBinanceService = new BinanceApiService({
      apiKey: 'test',
      secretKey: 'test'
    }) as jest.Mocked<BinanceApiService>;

    correlationService = new CorrelationAnalysisService(mockBinanceService);
  });

  describe('analyzeCorrelation', () => {
    it('deve calcular correlação corretamente entre dois símbolos', async () => {
      // Mock dos dados históricos
      const mockKlines = [
        { close: '100' },
        { close: '110' },
        { close: '120' }
      ];

      mockBinanceService.getKlines = jest.fn()
        .mockResolvedValueOnce(mockKlines)
        .mockResolvedValueOnce(mockKlines);

      const result = await correlationService.analyzeCorrelation(
        'BTCUSDT',
        'ETHUSDT'
      );

      expect(result).toHaveProperty('correlation');
      expect(result.symbol1).toBe('BTCUSDT');
      expect(result.symbol2).toBe('ETHUSDT');
      expect(typeof result.correlation).toBe('number');
      expect(result.correlation).toBeLessThanOrEqual(1);
      expect(result.correlation).toBeGreaterThanOrEqual(-1);
    });

    it('deve lidar com erros na obtenção de dados', async () => {
      mockBinanceService.getKlines = jest.fn()
        .mockRejectedValue(new Error('API Error'));

      await expect(
        correlationService.analyzeCorrelation('BTCUSDT', 'ETHUSDT')
      ).rejects.toThrow('Falha ao analisar correlação');
    });
  });

  describe('findHighlyCorrelatedPairs', () => {
    it('deve encontrar pares altamente correlacionados', async () => {
      const mockKlines1 = [
        { close: '100' },
        { close: '110' },
        { close: '120' }
      ];
      const mockKlines2 = [
        { close: '200' },
        { close: '220' },
        { close: '240' }
      ];

      mockBinanceService.getKlines = jest.fn()
        .mockResolvedValueOnce(mockKlines1)
        .mockResolvedValueOnce(mockKlines2);

      const result = await correlationService.findHighlyCorrelatedPairs(
        ['BTCUSDT', 'ETHUSDT'],
        0.7
      );

      expect(Array.isArray(result)).toBe(true);
      result.forEach(correlation => {
        expect(correlation.correlation).toBeGreaterThanOrEqual(0.7);
      });
    });
  });
});
