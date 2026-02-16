import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestAPI } from '@/api/backtestAPI';

export class BacktestServiceLayer {
  static async fetchBacktestResults(period: string): Promise<BacktestData> {
    return await BacktestAPI.getBacktestResults(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestAPI.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestAPI.exportResults(data);
  }
}

// Usage example
// const data = await BacktestServiceLayer.fetchBacktestResults('last-month');