/**
 * Set Stop Loss Tool
 * Corporacao Senciente - Trading MCP
 */

import { z } from 'zod';
import type { TradeResult } from '../types/binance';

export const setStopLossSchema = z.object({
  symbol: z.string().describe('Trading pair symbol'),
  side: z.enum(['BUY', 'SELL']).describe('Stop loss trigger side (opposite of position)'),
  quantity: z.number().positive().describe('Quantity to close'),
  stopPrice: z.number().positive().describe('Stop loss trigger price'),
  price: z.number().positive().optional().describe('Limit price (optional, for STOP_LOSS_LIMIT)'),
  reduceOnly: z.boolean().default(true).describe('Reduce only order'),
});

export type SetStopLossInput = z.infer<typeof setStopLossSchema>;

export async function setStopLoss(
  input: SetStopLossInput,
  binanceClient: any
): Promise<TradeResult | { error: string }> {
  try {
    const orderParams: any = {
      symbol: input.symbol,
      side: input.side,
      type: input.price ? 'STOP_LOSS_LIMIT' : 'STOP_MARKET',
      stopPrice: input.stopPrice,
      quantity: input.quantity,
      reduceOnly: input.reduceOnly,
    };
    
    if (input.price) {
      orderParams.price = input.price;
      orderParams.timeInForce = 'GTC';
    }
    
    const result = await binanceClient.futuresOrder(orderParams);
    
    return {
      orderId: result.orderId.toString(),
      symbol: result.symbol,
      side: result.side,
      type: result.type,
      price: parseFloat(result.stopPrice),
      quantity: parseFloat(result.origQty),
      status: result.status,
      executedQty: parseFloat(result.executedQty),
      timestamp: result.updateTime || Date.now(),
    };
  } catch (error: any) {
    return { error: `Failed to set stop loss: ${error.message}` };
  }
}
