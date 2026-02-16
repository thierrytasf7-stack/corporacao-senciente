/**
 * Binance API Types
 * Corporacao Senciente - Trading MCP
 */

export interface OrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  leverage?: number;
  reduceOnly?: boolean;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  markPrice: number;
  quantity: number;
  leverage: number;
  unrealizedPnl: number;
  marginType: 'isolated' | 'cross';
  liquidationPrice: number;
}

export interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface TradeResult {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: string;
  price: number;
  quantity: number;
  status: 'NEW' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELED' | 'REJECTED';
  executedQty: number;
  timestamp: number;
}

export interface RiskParameters {
  maxPositionSizePercent: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  maxDailyLossPercent: number;
  maxDrawdownPercent: number;
  maxLeverage: number;
}

export interface CorporateWillApproval {
  approved: boolean;
  reason?: string;
  riskScore: number;
  ethicalCheck: boolean;
  timestamp: number;
}
