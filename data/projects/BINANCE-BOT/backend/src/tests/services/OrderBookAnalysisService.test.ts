import { OrderBookAnalysisService } from '../../services/OrderBookAnalysisService';
import BinanceApiService from '../../services/BinanceApiService';

// Mock do BinanceApiService
jest.mock('../../services/BinanceApiService');

describe('OrderBookAnalysisService', () => {
  let service: OrderBookAnalysisService;
  let mockBinanceApi: jest.Mocked<BinanceApiService>;

  beforeEach(() => {
    mockBinanceApi = new BinanceApiService({
      apiKey: 'test',
      secretKey: 'test'
    }) as jest.Mocked<BinanceApiService>;

    service = new OrderBookAnalysisService(mockBinanceApi);
  });

  describe('startMonitoring', () => {
    it('should initialize monitoring for a symbol', async () => {
      const mockOrderBook = {
        lastUpdateId: 1,
        bids: [['100', '1'], ['99', '2']],
        asks: [['101', '1'], ['102', '2']]
      };

      mockBinanceApi.getOrderBook.mockResolvedValue(mockOrderBook);
      mockBinanceApi.subscribeToOrderBook.mockImplementation(() => {
        return {} as any;
      });

      await service.startMonitoring('BTCUSDT');
      
      expect(mockBinanceApi.getOrderBook).toHaveBeenCalledWith('BTCUSDT');
      expect(mockBinanceApi.subscribeToOrderBook).toHaveBeenCalledWith(
        'BTCUSDT',
        expect.any(Function)
      );
    });
  });

  describe('analyzeMarketDepth', () => {
    it('should analyze market depth correctly', async () => {
      const mockOrderBook = {
        lastUpdateId: 1,
        bids: [['100', '1'], ['99', '2']],
        asks: [['101', '1'], ['102', '2']]
      };

      mockBinanceApi.getOrderBook.mockResolvedValue(mockOrderBook);
      await service.startMonitoring('BTCUSDT');

      const analysis = service.analyzeMarketDepth('BTCUSDT');

      expect(analysis).toMatchObject({
        symbol: 'BTCUSDT',
        buyPressure: expect.any(Number),
        sellPressure: expect.any(Number),
        spread: expect.any(Number),
        volumeImbalance: expect.any(Number),
        priceLevel: {
          support: expect.any(Number),
          resistance: expect.any(Number)
        }
      });
    });

    it('should throw error if no snapshots available', () => {
      expect(() => {
        service.analyzeMarketDepth('NONEXISTENT');
      }).toThrow('No snapshots available for NONEXISTENT');
    });
  });

  describe('calculateVolumeImbalance', () => {
    it('should calculate volume imbalance correctly', async () => {
      const mockOrderBook = {
        lastUpdateId: 1,
        bids: [['100', '2'], ['99', '2']], // Total bid volume = 4
        asks: [['101', '1'], ['102', '1']]  // Total ask volume = 2
      };

      mockBinanceApi.getOrderBook.mockResolvedValue(mockOrderBook);
      await service.startMonitoring('BTCUSDT');

      const analysis = service.analyzeMarketDepth('BTCUSDT');
      
      // Com volume de compra = 4 e venda = 2, o desequilíbrio deve ser positivo
      expect(analysis.volumeImbalance).toBeGreaterThan(0);
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring and clear snapshots', async () => {
      const mockOrderBook = {
        lastUpdateId: 1,
        bids: [['100', '1']],
        asks: [['101', '1']]
      };

      mockBinanceApi.getOrderBook.mockResolvedValue(mockOrderBook);
      await service.startMonitoring('BTCUSDT');

      service.stopMonitoring('BTCUSDT');

      expect(() => {
        service.analyzeMarketDepth('BTCUSDT');
      }).toThrow('No snapshots available for BTCUSDT');
    });
  });
});
