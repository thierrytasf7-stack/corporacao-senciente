/**
 * Get Balance Tool
 * Corporacao Senciente - Trading MCP
 */

import { z } from 'zod';
import type { Balance } from '../types/binance';

export const getBalanceSchema = z.object({
  asset: z.string().optional().describe('Filter by asset (e.g., USDT, BTC)'),
  type: z.enum(['spot', 'futures']).default('futures').describe('Account type'),
});

export type GetBalanceInput = z.infer<typeof getBalanceSchema>;

export async function getBalance(
  input: GetBalanceInput,
  binanceClient: any
): Promise<Balance[] | { error: string }> {
  try {
    let balances: Balance[];
    
    if (input.type === 'futures') {
      const account = await binanceClient.futuresAccountBalance();
      balances = account.map((b: any) => ({
        asset: b.asset,
        free: parseFloat(b.availableBalance),
        locked: parseFloat(b.balance) - parseFloat(b.availableBalance),
        total: parseFloat(b.balance),
      }));
    } else {
      const account = await binanceClient.accountInfo();
      balances = account.balances.map((b: any) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked),
      }));
    }
    
    // Filter non-zero balances
    balances = balances.filter((b: Balance) => b.total > 0);
    
    if (input.asset) {
      balances = balances.filter((b: Balance) => b.asset === input.asset);
    }
    
    return balances;
  } catch (error: any) {
    return { error: `Failed to get balance: ${error.message}` };
  }
}
