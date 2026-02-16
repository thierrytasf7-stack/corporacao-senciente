import { type BacktestData, Trade } from '@/stores/backtestStore';
import { type BacktestResponse } from '@/types/backtest';
import { BacktestService } from '@/services/backtestService';

export class BacktestRepository {
  static async getBacktestResults(period: string): Promise<BacktestResponse> {
    // In a real implementation, this would call the actual API
    // return await fetch(`/api/backtest?period=${period}`).then(r => r.json());
    
    // Mock response for now
    return {
      period,
      performance: [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 102 },
        { date: '2024-01-03', value: 105 },
        { date: '2024-01-04', value: 103 },
        { date: '2024-01-05', value: 108 },
      ],
      metrics: {
        totalReturn: 8.5,
        sharpeRatio: 1.2,
        maxDrawdown: -3.2,
      },
      trades: [
        {
          date: '2024-01-01',
          symbol: 'AAPL',
          type: 'long',
          entry: 150,
          exit: 155,
          pnl: 5,
        },
        {
          date: '2024-01-03',
          symbol: 'GOOGL',
          type: 'short',
          entry: 2800,
          exit: 2750,
          pnl: 50,
        },
      ],
    };
  }

  static async getBacktestSummary(period: string): Promise<{
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
  }> {
    const data = await this.getBacktestResults(period);
    
    const winningTrades = data.trades.filter(t => t.pnl > 0).length;
    const losingTrades = data.trades.filter(t => t.pnl <= 0).length;
    const winRate = data.trades.length > 0 ? (winningTrades / data.trades.length) * 100 : 0;
    
    const avgWin = winningTrades > 0 
      ? data.trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades
      : 0;
    
    const avgLoss = losingTrades > 0 
      ? data.trades.filter(t => t.pnl <= 0).reduce((sum, t) => sum + t.pnl, 0) / losingTrades
      : 0;

    return {
      totalTrades: data.trades.length,
      winningTrades,
      losingTrades,
      winRate,
      avgWin,
      avgLoss,
    };
  }
}