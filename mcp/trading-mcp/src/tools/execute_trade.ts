/**
 * Execute Trade Tool
 * Corporacao Senciente - Trading MCP
 * 
 * Executes trades on Binance with Corporate Will approval
 */

import { z } from 'zod';
import type { OrderParams, TradeResult, CorporateWillApproval } from '../types/binance';

export const executeTradeSchema = z.object({
  symbol: z.string().min(1).describe('Trading pair symbol (e.g., BTCUSDT)'),
  side: z.enum(['BUY', 'SELL']).describe('Trade side'),
  type: z.enum(['MARKET', 'LIMIT', 'STOP_LOSS_LIMIT']).describe('Order type'),
  quantity: z.number().positive().describe('Trade quantity'),
  price: z.number().positive().optional().describe('Limit price (required for LIMIT orders)'),
  stopPrice: z.number().positive().optional().describe('Stop price (required for STOP orders)'),
  leverage: z.number().min(1).max(20).default(1).describe('Leverage multiplier (1-20)'),
  requireApproval: z.boolean().default(true).describe('Require Corporate Will approval'),
});

export type ExecuteTradeInput = z.infer<typeof executeTradeSchema>;

export async function executeTrade(
  input: ExecuteTradeInput,
  binanceClient: any,
  corporateWillEndpoint?: string
): Promise<TradeResult | { error: string; approval?: CorporateWillApproval }> {
  
  // Check Corporate Will approval if required
  if (input.requireApproval && corporateWillEndpoint) {
    const approval = await checkCorporateWillApproval(input, corporateWillEndpoint);
    
    if (!approval.approved) {
      return {
        error: `Trade rejected by Corporate Will: ${approval.reason}`,
        approval
      };
    }
  }
  
  // Validate risk parameters
  const riskCheck = validateRiskParameters(input);
  if (!riskCheck.valid) {
    return { error: `Risk validation failed: ${riskCheck.reason}` };
  }
  
  try {
    // Set leverage if trading futures
    if (input.leverage > 1) {
      await binanceClient.futuresLeverage({
        symbol: input.symbol,
        leverage: input.leverage,
      });
    }
    
    // Build order parameters
    const orderParams: any = {
      symbol: input.symbol,
      side: input.side,
      type: input.type,
      quantity: input.quantity,
    };
    
    if (input.type === 'LIMIT' && input.price) {
      orderParams.price = input.price;
      orderParams.timeInForce = 'GTC';
    }
    
    if (input.type === 'STOP_LOSS_LIMIT' && input.stopPrice) {
      orderParams.stopPrice = input.stopPrice;
      orderParams.price = input.price;
      orderParams.timeInForce = 'GTC';
    }
    
    // Execute order
    const result = input.leverage > 1
      ? await binanceClient.futuresOrder(orderParams)
      : await binanceClient.order(orderParams);
    
    return {
      orderId: result.orderId.toString(),
      symbol: result.symbol,
      side: result.side,
      type: result.type,
      price: parseFloat(result.price || result.avgPrice || '0'),
      quantity: parseFloat(result.origQty),
      status: result.status,
      executedQty: parseFloat(result.executedQty),
      timestamp: result.transactTime || Date.now(),
    };
    
  } catch (error: any) {
    return { error: `Trade execution failed: ${error.message}` };
  }
}

async function checkCorporateWillApproval(
  input: ExecuteTradeInput,
  endpoint: string
): Promise<CorporateWillApproval> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'trade_execution',
        details: input,
        timestamp: Date.now(),
      }),
    });
    
    return await response.json();
  } catch (error) {
    // If Corporate Will is unavailable, deny by default (fail-safe)
    return {
      approved: false,
      reason: 'Corporate Will service unavailable - fail-safe denial',
      riskScore: 1.0,
      ethicalCheck: false,
      timestamp: Date.now(),
    };
  }
}

function validateRiskParameters(input: ExecuteTradeInput): { valid: boolean; reason?: string } {
  // Max leverage check
  if (input.leverage > 20) {
    return { valid: false, reason: 'Leverage exceeds maximum (20x)' };
  }
  
  // Basic validation passed
  return { valid: true };
}
