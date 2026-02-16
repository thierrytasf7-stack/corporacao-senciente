/**
 * Get Positions Tool
 * Corporacao Senciente - Trading MCP
 */

import { z } from 'zod';
import type { Position } from '../types/binance';

export const getPositionsSchema = z.object({
  symbol: z.string().optional().describe('Filter by symbol'),
  includeEmpty: z.boolean().default(false).describe('Include positions with zero quantity'),
});

export type GetPositionsInput = z.infer<typeof getPositionsSchema>;

export async function getPositions(
  input: GetPositionsInput,
  binanceClient: any
): Promise<Position[] | { error: string }> {
  try {
    const positions = await binanceClient.futuresPositionRisk();
    
    let filtered = positions
      .filter((p: any) => parseFloat(p.positionAmt) !== 0 || input.includeEmpty)
      .map((p: any) => ({
        symbol: p.symbol,
        side: parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT',
        entryPrice: parseFloat(p.entryPrice),
        markPrice: parseFloat(p.markPrice),
        quantity: Math.abs(parseFloat(p.positionAmt)),
        leverage: parseInt(p.leverage),
        unrealizedPnl: parseFloat(p.unRealizedProfit),
        marginType: p.marginType,
        liquidationPrice: parseFloat(p.liquidationPrice),
      }));
    
    if (input.symbol) {
      filtered = filtered.filter((p: Position) => p.symbol === input.symbol);
    }
    
    return filtered;
  } catch (error: any) {
    return { error: `Failed to get positions: ${error.message}` };
  }
}
