import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestAdapter } from '@/adapters/backtestAdapter';

export class BacktestClient {
  static async getBacktestResults(period: string): Promise<BacktestData> {
    return await BacktestAdapter.loadBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestAdapter.changePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestAdapter.exportData(data);
  }
}

// Usage example
// const data = await BacktestClient.getBacktestResults('last-month');