import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestRepository } from '@/repositories/backtestRepository';

export class BacktestManager {
  static async initializeBacktest(period: string): Promise<BacktestData> {
    try {
      const response = await BacktestRepository.getBacktestResults(period);
      return {
        period: response.period,
        performance: response.performance,
        metrics: response.metrics,
        trades: response.trades,
      };
    } catch (error) {
      console.error('Failed to initialize backtest', error);
      throw error;
    }
  }

  static async refreshBacktest(period: string): Promise<BacktestData> {
    return await this.initializeBacktest(period);
  }

  static exportBacktestResults(data: BacktestData): string {
    const csv = [
      'Date,Symbol,Type,Entry,Exit,P&L',
      ...data.trades.map(trade => `
        ${trade.date},
        ${trade.symbol},
        ${trade.type},
        ${trade.entry},
        ${trade.exit},
        ${trade.pnl}
      `),
    ].join('\n');

    return csv;
  }

  static async saveBacktestResults(data: BacktestData): Promise<void> {
    // Implementation for saving backtest results
    // This could be to localStorage, database, or file
    console.log('Saving backtest results...', data);
  }
}