/**
 * Risk Management Service
 * Corporacao Senciente - BINANCE-BOT
 * 
 * Manages trading risk including position sizing, stop-loss, and drawdown control
 */

import { logger } from '../utils/logger';
import { FuturesTradingService, FuturesPosition, FuturesOrderParams } from './FuturesTradingService';

export interface RiskParameters {
  maxPositionSizePercent: number;  // Max % of portfolio per position
  stopLossPercent: number;          // Stop loss % per trade
  takeProfitPercent: number;        // Take profit % per trade
  maxDailyLossPercent: number;      // Max daily loss %
  maxDrawdownPercent: number;       // Max total drawdown %
  maxLeverage: number;              // Maximum leverage allowed
  minRiskRewardRatio: number;       // Minimum risk/reward ratio
}

export interface PositionSizeResult {
  quantity: number;
  leveragedValue: number;
  riskAmount: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  riskRewardRatio: number;
}

export interface RiskMetrics {
  currentDrawdown: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  totalExposure: number;
  exposurePercent: number;
  openPositionsCount: number;
  atRiskAmount: number;
  riskScore: number;  // 0-1 where 1 is max risk
}

export interface TradeValidation {
  valid: boolean;
  reasons: string[];
  warnings: string[];
  adjustedParams?: Partial<FuturesOrderParams>;
}

export class RiskManagementService {
  private params: RiskParameters;
  private tradingService: FuturesTradingService;
  private dailyStartBalance: number = 0;
  private dailyPnL: number = 0;
  private peakBalance: number = 0;

  constructor(
    tradingService: FuturesTradingService,
    params?: Partial<RiskParameters>
  ) {
    this.tradingService = tradingService;
    this.params = {
      maxPositionSizePercent: params?.maxPositionSizePercent ?? 5,
      stopLossPercent: params?.stopLossPercent ?? 2,
      takeProfitPercent: params?.takeProfitPercent ?? 6,
      maxDailyLossPercent: params?.maxDailyLossPercent ?? 10,
      maxDrawdownPercent: params?.maxDrawdownPercent ?? 20,
      maxLeverage: params?.maxLeverage ?? 20,
      minRiskRewardRatio: params?.minRiskRewardRatio ?? 2,
    };

    logger.info('RiskManagementService initialized', { params: this.params });
  }

  async initializeDailyTracking(): Promise<void> {
    try {
      const account = await this.tradingService.getAccountInfo();
      this.dailyStartBalance = account.totalWalletBalance;
      this.dailyPnL = 0;
      
      if (account.totalWalletBalance > this.peakBalance) {
        this.peakBalance = account.totalWalletBalance;
      }
      
      logger.info('Daily tracking initialized', {
        startBalance: this.dailyStartBalance,
        peakBalance: this.peakBalance,
      });
    } catch (error: any) {
      logger.error('Error initializing daily tracking:', error.message);
      throw error;
    }
  }

  async calculatePositionSize(
    symbol: string,
    entryPrice: number,
    side: 'LONG' | 'SHORT',
    leverage: number = 1
  ): Promise<PositionSizeResult> {
    try {
      const account = await this.tradingService.getAccountInfo();
      const availableBalance = account.availableBalance;
      
      // Validate leverage
      const effectiveLeverage = Math.min(leverage, this.params.maxLeverage);
      
      // Calculate max position value based on risk parameters
      const maxPositionValue = (availableBalance * this.params.maxPositionSizePercent) / 100;
      const leveragedValue = maxPositionValue * effectiveLeverage;
      
      // Calculate quantity
      const quantity = leveragedValue / entryPrice;
      
      // Calculate stop loss and take profit prices
      const stopLossMultiplier = side === 'LONG' 
        ? (1 - this.params.stopLossPercent / 100)
        : (1 + this.params.stopLossPercent / 100);
      
      const takeProfitMultiplier = side === 'LONG'
        ? (1 + this.params.takeProfitPercent / 100)
        : (1 - this.params.takeProfitPercent / 100);
      
      const stopLossPrice = entryPrice * stopLossMultiplier;
      const takeProfitPrice = entryPrice * takeProfitMultiplier;
      
      // Calculate risk amount
      const riskAmount = (this.params.stopLossPercent / 100) * leveragedValue;
      
      // Calculate risk/reward ratio
      const potentialProfit = (this.params.takeProfitPercent / 100) * leveragedValue;
      const riskRewardRatio = potentialProfit / riskAmount;
      
      return {
        quantity: parseFloat(quantity.toFixed(6)),
        leveragedValue,
        riskAmount,
        stopLossPrice: parseFloat(stopLossPrice.toFixed(2)),
        takeProfitPrice: parseFloat(takeProfitPrice.toFixed(2)),
        riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
      };
    } catch (error: any) {
      logger.error('Error calculating position size:', error.message);
      throw error;
    }
  }

  async validateTrade(
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    price: number,
    leverage: number = 1
  ): Promise<TradeValidation> {
    const reasons: string[] = [];
    const warnings: string[] = [];
    const adjustedParams: Partial<FuturesOrderParams> = {};

    try {
      const account = await this.tradingService.getAccountInfo();
      const metrics = await this.calculateRiskMetrics();
      
      // Check leverage limit
      if (leverage > this.params.maxLeverage) {
        reasons.push(`Leverage ${leverage}x exceeds maximum ${this.params.maxLeverage}x`);
        adjustedParams.quantity = quantity * (this.params.maxLeverage / leverage);
      }
      
      // Check daily loss limit
      if (metrics.dailyPnLPercent <= -this.params.maxDailyLossPercent) {
        reasons.push(`Daily loss limit reached: ${metrics.dailyPnLPercent.toFixed(2)}%`);
      }
      
      // Check drawdown limit
      if (metrics.currentDrawdown >= this.params.maxDrawdownPercent) {
        reasons.push(`Max drawdown reached: ${metrics.currentDrawdown.toFixed(2)}%`);
      }
      
      // Check position size
      const positionValue = quantity * price;
      const positionPercent = (positionValue / account.totalWalletBalance) * 100;
      
      if (positionPercent > this.params.maxPositionSizePercent * leverage) {
        warnings.push(`Position size ${positionPercent.toFixed(2)}% exceeds recommended ${this.params.maxPositionSizePercent}%`);
        
        const recommendedQty = (account.totalWalletBalance * this.params.maxPositionSizePercent / 100 * leverage) / price;
        adjustedParams.quantity = parseFloat(recommendedQty.toFixed(6));
      }
      
      // Check total exposure
      if (metrics.exposurePercent + positionPercent > 100) {
        warnings.push(`Total exposure would exceed 100% of balance`);
      }
      
      // Check risk score
      if (metrics.riskScore > 0.8) {
        warnings.push(`High risk score: ${(metrics.riskScore * 100).toFixed(0)}%`);
      }
      
      return {
        valid: reasons.length === 0,
        reasons,
        warnings,
        adjustedParams: Object.keys(adjustedParams).length > 0 ? adjustedParams : undefined,
      };
    } catch (error: any) {
      logger.error('Error validating trade:', error.message);
      return {
        valid: false,
        reasons: [`Validation error: ${error.message}`],
        warnings: [],
      };
    }
  }

  async calculateRiskMetrics(): Promise<RiskMetrics> {
    try {
      const account = await this.tradingService.getAccountInfo();
      const positions = await this.tradingService.getPositions();
      
      // Calculate drawdown
      if (account.totalWalletBalance > this.peakBalance) {
        this.peakBalance = account.totalWalletBalance;
      }
      const currentDrawdown = ((this.peakBalance - account.totalWalletBalance) / this.peakBalance) * 100;
      
      // Calculate daily P&L
      const dailyPnL = account.totalWalletBalance - this.dailyStartBalance + account.totalUnrealizedProfit;
      const dailyPnLPercent = this.dailyStartBalance > 0 
        ? (dailyPnL / this.dailyStartBalance) * 100 
        : 0;
      
      // Calculate exposure
      const totalExposure = positions.reduce((sum, p) => {
        return sum + Math.abs(p.positionAmt * p.markPrice);
      }, 0);
      const exposurePercent = (totalExposure / account.totalWalletBalance) * 100;
      
      // Calculate at-risk amount
      const atRiskAmount = positions.reduce((sum, p) => {
        const riskPerPosition = Math.abs(p.positionAmt * p.entryPrice) * (this.params.stopLossPercent / 100);
        return sum + riskPerPosition;
      }, 0);
      
      // Calculate risk score (0-1)
      const drawdownScore = currentDrawdown / this.params.maxDrawdownPercent;
      const exposureScore = exposurePercent / 100;
      const dailyLossScore = Math.abs(Math.min(0, dailyPnLPercent)) / this.params.maxDailyLossPercent;
      const riskScore = Math.min(1, (drawdownScore * 0.4) + (exposureScore * 0.3) + (dailyLossScore * 0.3));
      
      return {
        currentDrawdown,
        dailyPnL,
        dailyPnLPercent,
        totalExposure,
        exposurePercent,
        openPositionsCount: positions.length,
        atRiskAmount,
        riskScore,
      };
    } catch (error: any) {
      logger.error('Error calculating risk metrics:', error.message);
      throw error;
    }
  }

  async setProtectiveOrders(
    symbol: string,
    position: FuturesPosition
  ): Promise<{ stopLoss?: any; takeProfit?: any }> {
    const result: { stopLoss?: any; takeProfit?: any } = {};
    
    try {
      const side = position.positionAmt > 0 ? 'LONG' : 'SHORT';
      const closeSide = side === 'LONG' ? 'SELL' : 'BUY';
      const quantity = Math.abs(position.positionAmt);
      
      // Calculate stop loss price
      const slMultiplier = side === 'LONG' 
        ? (1 - this.params.stopLossPercent / 100)
        : (1 + this.params.stopLossPercent / 100);
      const stopLossPrice = position.entryPrice * slMultiplier;
      
      // Calculate take profit price
      const tpMultiplier = side === 'LONG'
        ? (1 + this.params.takeProfitPercent / 100)
        : (1 - this.params.takeProfitPercent / 100);
      const takeProfitPrice = position.entryPrice * tpMultiplier;
      
      // Place stop loss
      result.stopLoss = await this.tradingService.placeOrder({
        symbol,
        side: closeSide as 'BUY' | 'SELL',
        type: 'STOP_MARKET',
        quantity,
        stopPrice: parseFloat(stopLossPrice.toFixed(2)),
        reduceOnly: true,
        positionSide: position.positionSide,
      });
      
      logger.info(`Stop loss set for ${symbol} at ${stopLossPrice.toFixed(2)}`);
      
      // Place take profit
      result.takeProfit = await this.tradingService.placeOrder({
        symbol,
        side: closeSide as 'BUY' | 'SELL',
        type: 'TAKE_PROFIT_MARKET',
        quantity,
        stopPrice: parseFloat(takeProfitPrice.toFixed(2)),
        reduceOnly: true,
        positionSide: position.positionSide,
      });
      
      logger.info(`Take profit set for ${symbol} at ${takeProfitPrice.toFixed(2)}`);
      
      return result;
    } catch (error: any) {
      logger.error('Error setting protective orders:', error.message);
      throw error;
    }
  }

  async emergencyCloseAll(): Promise<void> {
    try {
      logger.warn('EMERGENCY: Closing all positions');
      
      const positions = await this.tradingService.getPositions();
      
      for (const position of positions) {
        if (position.positionAmt !== 0) {
          await this.tradingService.closePosition(position.symbol, position.positionSide);
          logger.info(`Emergency closed position: ${position.symbol}`);
        }
      }
      
      logger.warn('EMERGENCY: All positions closed');
    } catch (error: any) {
      logger.error('Error in emergency close:', error.message);
      throw error;
    }
  }

  updateParams(newParams: Partial<RiskParameters>): void {
    this.params = { ...this.params, ...newParams };
    logger.info('Risk parameters updated', { params: this.params });
  }

  getParams(): RiskParameters {
    return { ...this.params };
  }
}

// Factory function
export function createRiskManagementService(
  tradingService: FuturesTradingService,
  params?: Partial<RiskParameters>
): RiskManagementService {
  return new RiskManagementService(tradingService, params);
}
