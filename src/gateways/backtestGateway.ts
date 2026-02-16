import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestClient } from '@/clients/backtestClient';

export class BacktestGateway {
  static async fetchBacktestResults(period: string): Promise<BacktestData> {
    return await BacktestClient.getBacktestResults(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestClient.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestClient.exportResults(data);
  }
}

// Usage example
// const data = await BacktestGateway.fetchBacktestResults('last-month');