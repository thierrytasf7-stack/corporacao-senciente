import { HedgingService } from '../HedgingService';
import { BinanceTradingService } from '../BinanceTradingService';
import { RedisService } from '../RedisService';
import { jest } from '@jest/globals';

describe('HedgingService', () => {
  let hedgingService: HedgingService;
  let mockTradingService: jest.Mocked<BinanceTradingService>;
  let mockRedisService: jest.Mocked<RedisService>;

  beforeEach(() => {
    mockTradingService = {
      placeMarketOrder: jest.fn(),
      getAccountInfo: jest.fn(),
    } as any;

    mockRedisService = {
      hset: jest.fn(),
      hget: jest.fn(),
      hgetall: jest.fn(),
    } as any;

    hedgingService = HedgingService.getInstance(
      mockTradingService,
      mockRedisService,
      {
        enabled: true,
        defaultHedgeRatio: 1.0,
        minPositionSize: 0.01,
        maxPositionSize: 100,
        allowedSymbols: ['BTCUSDT'],
        rebalanceThreshold: 0.05,
        checkInterval: 1000
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createHedgePosition', () => {
    it('should create a hedge position successfully', async () => {
      const symbol = 'BTCUSDT';
      const mainPositionSize = '1.0';
      const mainPositionSide = 'LONG';

      mockRedisService.hset.mockResolvedValue(1);
      mockTradingService.placeMarketOrder.mockResolvedValue({
        symbol,
        orderId: 123,
        status: 'FILLED'
      });

      const result = await hedgingService.createHedgePosition(
        symbol,
        mainPositionSize,
        mainPositionSide as 'LONG' | 'SHORT'
      );

      expect(result).toBeDefined();
      expect(result.symbol).toBe(symbol);
      expect(result.mainPositionSize).toBe(mainPositionSize);
      expect(result.mainPositionSide).toBe(mainPositionSide);
      expect(mockRedisService.hset).toHaveBeenCalled();
      expect(mockTradingService.placeMarketOrder).toHaveBeenCalled();
    });

    it('should throw error for non-allowed symbol', async () => {
      const symbol = 'INVALIDUSDT';
      const mainPositionSize = '1.0';
      const mainPositionSide = 'LONG';

      await expect(
        hedgingService.createHedgePosition(
          symbol,
          mainPositionSize,
          mainPositionSide as 'LONG' | 'SHORT'
        )
      ).rejects.toThrow(`Symbol ${symbol} not allowed for hedging`);
    });
  });

  describe('closeHedgePosition', () => {
    it('should close hedge position successfully', async () => {
      const symbol = 'BTCUSDT';
      const mockPosition = {
        symbol,
        mainPositionSize: '1.0',
        hedgePositionSize: '1.0',
        mainPositionSide: 'LONG',
        hedgeRatio: 1.0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      mockRedisService.hget.mockResolvedValue(mockPosition);
      mockTradingService.placeMarketOrder.mockResolvedValue({
        symbol,
        orderId: 123,
        status: 'FILLED'
      });

      await hedgingService.closeHedgePosition(symbol);

      expect(mockRedisService.hget).toHaveBeenCalled();
      expect(mockTradingService.placeMarketOrder).toHaveBeenCalled();
      expect(mockRedisService.hset).toHaveBeenCalled();
    });

    it('should throw error when no position exists', async () => {
      const symbol = 'BTCUSDT';
      mockRedisService.hget.mockResolvedValue(null);

      await expect(
        hedgingService.closeHedgePosition(symbol)
      ).rejects.toThrow(`No hedge position found for ${symbol}`);
    });
  });
});
