/**
 * Futures Trading Service
 * Corporacao Senciente - BINANCE-BOT
 * 
 * Service for executing Binance Futures operations with risk management
 */

import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { logger } from '../utils/logger';

export interface FuturesPosition {
  symbol: string;
  positionSide: 'LONG' | 'SHORT' | 'BOTH';
  positionAmt: number;
  entryPrice: number;
  markPrice: number;
  unrealizedProfit: number;
  liquidationPrice: number;
  leverage: number;
  marginType: 'isolated' | 'cross';
  isolatedMargin: number;
  isAutoAddMargin: boolean;
}

export interface FuturesOrder {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: number;
  avgPrice: number;
  origQty: number;
  executedQty: number;
  cumQuote: number;
  timeInForce: string;
  type: string;
  reduceOnly: boolean;
  closePosition: boolean;
  side: 'BUY' | 'SELL';
  positionSide: 'LONG' | 'SHORT' | 'BOTH';
  stopPrice: number;
  workingType: string;
  origType: string;
  updateTime: number;
}

export interface FuturesAccountInfo {
  totalWalletBalance: number;
  totalUnrealizedProfit: number;
  totalMarginBalance: number;
  availableBalance: number;
  maxWithdrawAmount: number;
  positions: FuturesPosition[];
}

export interface FuturesOrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET' | 'TAKE_PROFIT' | 'TAKE_PROFIT_MARKET';
  quantity: number;
  price?: number;
  stopPrice?: number;
  positionSide?: 'LONG' | 'SHORT' | 'BOTH';
  reduceOnly?: boolean;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export class FuturesTradingService {
  private apiKey: string;
  private secretKey: string;
  private baseURL: string;
  private httpClient: AxiosInstance;

  constructor(apiKey: string, secretKey: string, isTestnet: boolean = true) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseURL = isTestnet
      ? 'https://testnet.binancefuture.com'
      : 'https://fapi.binance.com';

    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    logger.info(`FuturesTradingService initialized - ${isTestnet ? 'TESTNET' : 'MAINNET'}`);
  }

  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  private buildQueryString(params: Record<string, any>): string {
    const timestamp = Date.now();
    const paramsWithTimestamp = { ...params, timestamp };
    
    const queryString = Object.entries(paramsWithTimestamp)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const signature = this.generateSignature(queryString);
    return `${queryString}&signature=${signature}`;
  }

  async getAccountInfo(): Promise<FuturesAccountInfo> {
    try {
      const queryString = this.buildQueryString({});
      const response = await this.httpClient.get(`/fapi/v2/account?${queryString}`);
      
      return {
        totalWalletBalance: parseFloat(response.data.totalWalletBalance),
        totalUnrealizedProfit: parseFloat(response.data.totalUnrealizedProfit),
        totalMarginBalance: parseFloat(response.data.totalMarginBalance),
        availableBalance: parseFloat(response.data.availableBalance),
        maxWithdrawAmount: parseFloat(response.data.maxWithdrawAmount),
        positions: response.data.positions
          .filter((p: any) => parseFloat(p.positionAmt) !== 0)
          .map((p: any) => ({
            symbol: p.symbol,
            positionSide: p.positionSide,
            positionAmt: parseFloat(p.positionAmt),
            entryPrice: parseFloat(p.entryPrice),
            markPrice: parseFloat(p.markPrice),
            unrealizedProfit: parseFloat(p.unrealizedProfit),
            liquidationPrice: parseFloat(p.liquidationPrice),
            leverage: parseInt(p.leverage),
            marginType: p.marginType,
            isolatedMargin: parseFloat(p.isolatedMargin),
            isAutoAddMargin: p.isAutoAddMargin === 'true',
          })),
      };
    } catch (error: any) {
      logger.error('Error getting futures account info:', error.message);
      throw error;
    }
  }

  async getPositions(symbol?: string): Promise<FuturesPosition[]> {
    try {
      const params: Record<string, any> = {};
      if (symbol) params.symbol = symbol;
      
      const queryString = this.buildQueryString(params);
      const response = await this.httpClient.get(`/fapi/v2/positionRisk?${queryString}`);
      
      return response.data
        .filter((p: any) => parseFloat(p.positionAmt) !== 0)
        .map((p: any) => ({
          symbol: p.symbol,
          positionSide: p.positionSide,
          positionAmt: parseFloat(p.positionAmt),
          entryPrice: parseFloat(p.entryPrice),
          markPrice: parseFloat(p.markPrice),
          unrealizedProfit: parseFloat(p.unRealizedProfit),
          liquidationPrice: parseFloat(p.liquidationPrice),
          leverage: parseInt(p.leverage),
          marginType: p.marginType,
          isolatedMargin: parseFloat(p.isolatedMargin),
          isAutoAddMargin: p.isAutoAddMargin === 'true',
        }));
    } catch (error: any) {
      logger.error('Error getting futures positions:', error.message);
      throw error;
    }
  }

  async setLeverage(symbol: string, leverage: number): Promise<{ symbol: string; leverage: number }> {
    try {
      const queryString = this.buildQueryString({ symbol, leverage });
      const response = await this.httpClient.post(`/fapi/v1/leverage?${queryString}`);
      
      logger.info(`Leverage set for ${symbol}: ${leverage}x`);
      return {
        symbol: response.data.symbol,
        leverage: response.data.leverage,
      };
    } catch (error: any) {
      logger.error(`Error setting leverage for ${symbol}:`, error.message);
      throw error;
    }
  }

  async setMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSSED'): Promise<boolean> {
    try {
      const queryString = this.buildQueryString({ symbol, marginType });
      await this.httpClient.post(`/fapi/v1/marginType?${queryString}`);
      
      logger.info(`Margin type set for ${symbol}: ${marginType}`);
      return true;
    } catch (error: any) {
      // Error -4046 means margin type is already set
      if (error.response?.data?.code === -4046) {
        logger.info(`Margin type already ${marginType} for ${symbol}`);
        return true;
      }
      logger.error(`Error setting margin type for ${symbol}:`, error.message);
      throw error;
    }
  }

  async placeOrder(params: FuturesOrderParams): Promise<FuturesOrder> {
    try {
      const orderParams: Record<string, any> = {
        symbol: params.symbol,
        side: params.side,
        type: params.type,
        quantity: params.quantity,
      };

      if (params.price) orderParams.price = params.price;
      if (params.stopPrice) orderParams.stopPrice = params.stopPrice;
      if (params.positionSide) orderParams.positionSide = params.positionSide;
      if (params.reduceOnly !== undefined) orderParams.reduceOnly = params.reduceOnly;
      if (params.timeInForce) orderParams.timeInForce = params.timeInForce;

      // LIMIT orders require timeInForce
      if (params.type === 'LIMIT' && !params.timeInForce) {
        orderParams.timeInForce = 'GTC';
      }

      const queryString = this.buildQueryString(orderParams);
      const response = await this.httpClient.post(`/fapi/v1/order?${queryString}`);

      logger.info(`Futures order placed: ${params.side} ${params.quantity} ${params.symbol}`);
      
      return {
        orderId: response.data.orderId,
        symbol: response.data.symbol,
        status: response.data.status,
        clientOrderId: response.data.clientOrderId,
        price: parseFloat(response.data.price),
        avgPrice: parseFloat(response.data.avgPrice),
        origQty: parseFloat(response.data.origQty),
        executedQty: parseFloat(response.data.executedQty),
        cumQuote: parseFloat(response.data.cumQuote),
        timeInForce: response.data.timeInForce,
        type: response.data.type,
        reduceOnly: response.data.reduceOnly,
        closePosition: response.data.closePosition,
        side: response.data.side,
        positionSide: response.data.positionSide,
        stopPrice: parseFloat(response.data.stopPrice || '0'),
        workingType: response.data.workingType,
        origType: response.data.origType,
        updateTime: response.data.updateTime,
      };
    } catch (error: any) {
      logger.error('Error placing futures order:', error.message);
      throw error;
    }
  }

  async cancelOrder(symbol: string, orderId: number): Promise<FuturesOrder> {
    try {
      const queryString = this.buildQueryString({ symbol, orderId });
      const response = await this.httpClient.delete(`/fapi/v1/order?${queryString}`);

      logger.info(`Futures order cancelled: ${orderId} ${symbol}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Error cancelling order ${orderId}:`, error.message);
      throw error;
    }
  }

  async cancelAllOrders(symbol: string): Promise<boolean> {
    try {
      const queryString = this.buildQueryString({ symbol });
      await this.httpClient.delete(`/fapi/v1/allOpenOrders?${queryString}`);

      logger.info(`All orders cancelled for ${symbol}`);
      return true;
    } catch (error: any) {
      logger.error(`Error cancelling all orders for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getOpenOrders(symbol?: string): Promise<FuturesOrder[]> {
    try {
      const params: Record<string, any> = {};
      if (symbol) params.symbol = symbol;
      
      const queryString = this.buildQueryString(params);
      const response = await this.httpClient.get(`/fapi/v1/openOrders?${queryString}`);
      
      return response.data;
    } catch (error: any) {
      logger.error('Error getting open orders:', error.message);
      throw error;
    }
  }

  async getMarkPrice(symbol: string): Promise<{ symbol: string; markPrice: number; indexPrice: number }> {
    try {
      const response = await this.httpClient.get(`/fapi/v1/premiumIndex?symbol=${symbol}`);
      
      return {
        symbol: response.data.symbol,
        markPrice: parseFloat(response.data.markPrice),
        indexPrice: parseFloat(response.data.indexPrice),
      };
    } catch (error: any) {
      logger.error(`Error getting mark price for ${symbol}:`, error.message);
      throw error;
    }
  }

  async closePosition(symbol: string, positionSide?: 'LONG' | 'SHORT'): Promise<FuturesOrder | null> {
    try {
      const positions = await this.getPositions(symbol);
      const position = positions.find(p => 
        !positionSide || p.positionSide === positionSide
      );

      if (!position || position.positionAmt === 0) {
        logger.info(`No position to close for ${symbol}`);
        return null;
      }

      const side = position.positionAmt > 0 ? 'SELL' : 'BUY';
      const quantity = Math.abs(position.positionAmt);

      return await this.placeOrder({
        symbol,
        side,
        type: 'MARKET',
        quantity,
        reduceOnly: true,
        positionSide: position.positionSide,
      });
    } catch (error: any) {
      logger.error(`Error closing position for ${symbol}:`, error.message);
      throw error;
    }
  }
}

// Factory function
export function createFuturesTradingService(
  apiKey?: string,
  secretKey?: string,
  isTestnet: boolean = true
): FuturesTradingService {
  const key = apiKey || process.env.BINANCE_API_KEY || '';
  const secret = secretKey || process.env.BINANCE_SECRET_KEY || '';
  
  if (!key || !secret) {
    throw new Error('Binance API credentials are required');
  }
  
  return new FuturesTradingService(key, secret, isTestnet);
}
