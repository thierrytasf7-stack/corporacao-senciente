import { BinanceTradingService } from './BinanceTradingService';
import { RedisService } from './RedisService';
import { logger } from '../utils/logger';

export interface HedgePosition {
  symbol: string;
  mainPositionSize: string;
  hedgePositionSize: string;
  mainPositionSide: 'LONG' | 'SHORT';
  hedgeRatio: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface HedgingConfig {
  enabled: boolean;
  defaultHedgeRatio: number;
  minPositionSize: number;
  maxPositionSize: number;
  allowedSymbols: string[];
  rebalanceThreshold: number;
  checkInterval: number;
}

export class HedgingService {
  private static instance: HedgingService;
  private tradingService: BinanceTradingService;
  private redisService: RedisService;
  private config: HedgingConfig;
  private checkIntervalId?: NodeJS.Timeout;

  private constructor(
    tradingService: BinanceTradingService,
    redisService: RedisService,
    config: Partial<HedgingConfig> = {}
  ) {
    this.tradingService = tradingService;
    this.redisService = redisService;
    this.config = {
      enabled: config.enabled ?? true,
      defaultHedgeRatio: config.defaultHedgeRatio ?? 1.0,
      minPositionSize: config.minPositionSize ?? 0.01,
      maxPositionSize: config.maxPositionSize ?? 100,
      allowedSymbols: config.allowedSymbols ?? ['BTCUSDT', 'ETHUSDT'],
      rebalanceThreshold: config.rebalanceThreshold ?? 0.05,
      checkInterval: config.checkInterval ?? 60000
    };
  }

  public static getInstance(
    tradingService: BinanceTradingService,
    redisService: RedisService,
    config?: Partial<HedgingConfig>
  ): HedgingService {
    if (!HedgingService.instance) {
      HedgingService.instance = new HedgingService(tradingService, redisService, config);
    }
    return HedgingService.instance;
  }

  public async start(): Promise<void> {
    if (!this.config.enabled) {
      logger.info('Hedging service is disabled');
      return;
    }

    logger.info('Starting hedging service...', this.config);
    await this.checkAndUpdateHedges();
    this.checkIntervalId = setInterval(
      () => this.checkAndUpdateHedges(),
      this.config.checkInterval
    );
  }

  public async stop(): Promise<void> {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = undefined;
    }
    logger.info('Hedging service stopped');
  }

  private async checkAndUpdateHedges(): Promise<void> {
    try {
      const positions = await this.getAllHedgePositions();
      
      for (const position of positions) {
        if (!position.isActive) continue;
        
        await this.rebalanceHedgeIfNeeded(position);
      }
    } catch (error) {
      logger.error('Error checking and updating hedges:', error);
    }
  }

  private async rebalanceHedgeIfNeeded(position: HedgePosition): Promise<void> {
    try {
      const currentMainSize = await this.getCurrentPositionSize(position.symbol);
      const targetHedgeSize = this.calculateTargetHedgeSize(currentMainSize, position.hedgeRatio);
      const currentHedgeSize = parseFloat(position.hedgePositionSize);
      
      const deviation = Math.abs(currentHedgeSize - targetHedgeSize) / targetHedgeSize;
      
      if (deviation > this.config.rebalanceThreshold) {
        await this.adjustHedgePosition(position, targetHedgeSize);
      }
    } catch (error) {
      logger.error('Error rebalancing hedge:', error);
    }
  }

  private async adjustHedgePosition(
    position: HedgePosition,
    targetSize: number
  ): Promise<void> {
    const currentSize = parseFloat(position.hedgePositionSize);
    const adjustmentSize = Math.abs(targetSize - currentSize);
    
    if (adjustmentSize < this.config.minPositionSize) {
      return;
    }

    try {
      if (targetSize > currentSize) {
        await this.tradingService.placeMarketOrder({
          symbol: position.symbol,
          side: position.mainPositionSide === 'LONG' ? 'SELL' : 'BUY',
          type: 'MARKET',
          quantity: adjustmentSize.toFixed(8)
        });
      } else {
        await this.tradingService.placeMarketOrder({
          symbol: position.symbol,
          side: position.mainPositionSide === 'LONG' ? 'BUY' : 'SELL',
          type: 'MARKET',
          quantity: adjustmentSize.toFixed(8)
        });
      }

      await this.updateHedgePosition({
        ...position,
        hedgePositionSize: targetSize.toFixed(8),
        updatedAt: Date.now()
      });

      logger.info('Hedge position adjusted', {
        symbol: position.symbol,
        newSize: targetSize,
        oldSize: currentSize
      });
    } catch (error) {
      logger.error('Error adjusting hedge position:', error);
      throw error;
    }
  }

  public async createHedgePosition(
    symbol: string,
    mainPositionSize: string,
    mainPositionSide: 'LONG' | 'SHORT',
    hedgeRatio: number = this.config.defaultHedgeRatio
  ): Promise<HedgePosition> {
    if (!this.config.allowedSymbols.includes(symbol)) {
      throw new Error(`Symbol ${symbol} not allowed for hedging`);
    }

    const position: HedgePosition = {
      symbol,
      mainPositionSize,
      hedgePositionSize: '0',
      mainPositionSide,
      hedgeRatio,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.redisService.hset(
      'hedge_positions',
      symbol,
      JSON.stringify(position)
    );

    const targetHedgeSize = this.calculateTargetHedgeSize(
      parseFloat(mainPositionSize),
      hedgeRatio
    );

    await this.tradingService.placeMarketOrder({
      symbol,
      side: mainPositionSide === 'LONG' ? 'SELL' : 'BUY',
      type: 'MARKET',
      quantity: targetHedgeSize.toFixed(8)
    });

    position.hedgePositionSize = targetHedgeSize.toFixed(8);
    await this.updateHedgePosition(position);

    return position;
  }

  public async closeHedgePosition(symbol: string): Promise<void> {
    const position = await this.getHedgePosition(symbol);
    if (!position) {
      throw new Error(`No hedge position found for ${symbol}`);
    }

    if (parseFloat(position.hedgePositionSize) > 0) {
      await this.tradingService.placeMarketOrder({
        symbol,
        side: position.mainPositionSide === 'LONG' ? 'BUY' : 'SELL',
        type: 'MARKET',
        quantity: position.hedgePositionSize
      });
    }

    position.isActive = false;
    position.updatedAt = Date.now();
    await this.updateHedgePosition(position);
  }

  private async getHedgePosition(symbol: string): Promise<HedgePosition | null> {
    const position = await this.redisService.hget<HedgePosition>(
      'hedge_positions',
      symbol,
      true
    );
    return position;
  }

  private async getAllHedgePositions(): Promise<HedgePosition[]> {
    const positions = await this.redisService.hgetall<Record<string, HedgePosition>>(
      'hedge_positions',
      true
    );
    return positions ? Object.values(positions) : [];
  }

  private async updateHedgePosition(position: HedgePosition): Promise<void> {
    await this.redisService.hset(
      'hedge_positions',
      position.symbol,
      position
    );
  }

  private async getCurrentPositionSize(symbol: string): Promise<number> {
    try {
      const accountInfo = await this.tradingService.getAccountInfo();
      const asset = symbol.replace('USDT', '');
      const balance = accountInfo.balances.find(b => b.asset === asset);
      return balance ? parseFloat(balance.free) + parseFloat(balance.locked) : 0;
    } catch (error) {
      logger.error('Error getting current position size:', error);
      throw error;
    }
  }

  private calculateTargetHedgeSize(
    mainPositionSize: number,
    hedgeRatio: number
  ): number {
    const targetSize = mainPositionSize * hedgeRatio;
    return Math.min(
      Math.max(targetSize, this.config.minPositionSize),
      this.config.maxPositionSize
    );
  }
}
