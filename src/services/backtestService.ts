import { type BacktestData, Trade } from '@/stores/backtestStore';
import { type BacktestResponse } from '@/types/backtest';
import { mockBacktestData, transformToBacktestData } from '@/utils/backtestUtils';

export class BacktestService {
  static async fetchBacktestResults(period: string): Promise<BacktestData> {
    try {
      // Simulate API call
      const response: BacktestResponse = mockBacktestData();
      return transformToBacktestData(response);
    } catch (error) {
      console.error('Failed to fetch backtest results', error);
      throw error;
    }
  }

  static calculateCumulativeReturns(trades: Trade[]): number[] {
    const returns: number[] = [];
    let cumulative = 0;
    
    trades.forEach((trade) => {
      cumulative += trade.pnl;
      returns.push(cumulative);
    });
    
    return returns;
  }

  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  static formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }
}